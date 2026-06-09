'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  type?: 'text' | 'image'
  image_url?: string
  created_at?: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [aiConfig, setAiConfig] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [secondsUsed, setSecondsUsed] = useState(0)
  const [lang, setLang] = useState('fr')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    setLang(localStorage.getItem('lang') || 'fr')
    init()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setUser(user)

    const { data: sub } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').single()
    if (!sub) { router.push('/'); return }
    setSubscription(sub)

    const { data: config } = await supabase.from('ai_config').select('*').eq('user_id', user.id).single()
    if (!config) { router.push('/onboarding'); return }
    setAiConfig(config)

    // Load or create conversation
    let conv = null
    if (sub.plan_id !== 'premium' && sub.plan_id !== 'elite') {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .single()
      conv = existingConv
    }

    if (!conv) {
      const { data: newConv } = await supabase.from('conversations').insert({
        user_id: user.id,
        ai_config_id: config.id,
        started_at: new Date().toISOString(),
      }).select().single()
      conv = newConv
    }

    if (conv) {
      setConversationId(conv.id)
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true })
      setMessages(msgs || [])
    }

    // Timer for limited plans
    if (sub.plan_id === 'essentiel' || sub.plan_id === 'premium') {
      const today = new Date().toISOString().split('T')[0]
      const { data: usage } = await supabase
        .from('daily_usage')
        .select('seconds_used')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()
      setSecondsUsed(usage?.seconds_used || 0)
      timerRef.current = setInterval(() => setSecondsUsed(s => s + 1), 1000)
    }
  }

  async function saveUsage() {
    if (!user || !subscription) return
    if (subscription.plan_id !== 'essentiel' && subscription.plan_id !== 'premium') return
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('daily_usage').upsert({
      user_id: user.id,
      date: today,
      seconds_used: secondsUsed,
    })
  }

  async function sendMessage() {
    if (!input.trim() || loading || !conversationId) return
    const limit = 3600
    if ((subscription?.plan_id === 'essentiel' || subscription?.plan_id === 'premium') && secondsUsed >= limit) return

    const userMsg: Message = { role: 'user', content: input.trim(), type: 'text' }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    await supabase.from('messages').insert({ conversation_id: conversationId, role: 'user', content: userMsg.content, type: 'text' })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          aiConfig,
          lang,
        }),
      })
      const { reply, generatePhoto } = await res.json()

      const aiMsg: Message = { role: 'assistant', content: reply, type: 'text' }
      setMessages(prev => [...prev, aiMsg])
      await supabase.from('messages').insert({ conversation_id: conversationId, role: 'assistant', content: reply, type: 'text' })

      // Generate photo if triggered and plan allows
      if (generatePhoto && (subscription?.plan_id === 'premium' || subscription?.plan_id === 'elite')) {
        const placeholder: Message = { role: 'assistant', content: '📸', type: 'image' }
        setMessages(prev => [...prev, placeholder])
        const photoRes = await fetch('/api/generate-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aiConfig }),
        })
        const { url } = await photoRes.json()
        if (url) {
          setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, image_url: url } : m))
          await supabase.from('messages').insert({ conversation_id: conversationId, role: 'assistant', content: '', type: 'image', image_url: url })
        } else {
          setMessages(prev => prev.slice(0, -1))
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'fr' ? 'Désolée, une erreur est survenue...' : 'Sorry, an error occurred...', type: 'text' }])
    }

    setLoading(false)
    await saveUsage()
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const aiName = aiConfig?.gender === 'woman' ? 'Luna' : 'Axel'
  const aiEmoji = aiConfig?.gender === 'woman' ? '🌙' : '🌊'
  const fr = lang === 'fr'
  const timeLimit = 3600
  const timeLeft = Math.max(0, timeLimit - secondsUsed)
  const hasTimer = subscription?.plan_id === 'essentiel' || subscription?.plan_id === 'premium'
  const h = Math.floor(timeLeft / 3600)
  const m = Math.floor((timeLeft % 3600) / 60)
  const s = timeLeft % 60
  const timerStr = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      {/* Chat Header */}
      <div style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>{aiEmoji}</div>
            <div style={{
              position: 'absolute', bottom: 1, right: 1, width: 10, height: 10,
              borderRadius: '50%', background: '#22C55E',
              border: '2px solid var(--surface)',
            }} />
          </div>
          <div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15 }}>{aiName}</div>
            <div style={{ fontSize: 12, color: '#22C55E' }}>{fr ? 'En ligne' : 'Online'}</div>
          </div>
        </div>
        {hasTimer && (
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: 14,
            background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 100, padding: '6px 14px', color: timeLeft < 300 ? 'var(--accent3)' : 'var(--text)',
          }}>
            {timerStr}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="chat-scroll" style={{
        flex: 1, overflowY: 'auto', padding: '20px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text3)', marginTop: 40, fontSize: 14 }}>
            {fr ? `Dites bonjour à ${aiName}...` : `Say hello to ${aiName}...`}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="fade-up" style={{
            display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            alignItems: 'flex-end', gap: 8,
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>{aiEmoji}</div>
            )}
            <div>
              {msg.type === 'image' ? (
                msg.image_url ? (
                  <img src={msg.image_url} alt="" style={{ width: 300, height: 300, objectFit: 'cover', borderRadius: 12 }} />
                ) : (
                  <div style={{
                    width: 300, height: 300, borderRadius: 12, background: 'var(--surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div className="spinner" style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
                  </div>
                )
              ) : (
                <div style={{
                  maxWidth: 320, padding: '12px 16px',
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface2)',
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  color: '#fff', fontSize: 14, lineHeight: 1.5,
                }}>
                  {msg.content}
                </div>
              )}
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>{aiEmoji}</div>
            <div style={{
              padding: '12px 16px', background: 'var(--surface2)',
              border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px',
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} className={`typing-dot`} style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)', display: 'block',
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        padding: '16px 20px', display: 'flex', gap: 10, alignItems: 'flex-end',
        flexShrink: 0, paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || (hasTimer && timeLeft === 0)}
          placeholder={hasTimer && timeLeft === 0 ? (fr ? 'Temps écoulé pour aujourd\'hui' : 'Time limit reached') : (fr ? 'Écrivez un message...' : 'Write a message...')}
          style={{
            flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '10px 14px', color: 'var(--text)',
            fontSize: 14, fontFamily: 'DM Sans, sans-serif', resize: 'none',
            minHeight: 44, maxHeight: 120, outline: 'none',
            transition: 'border-color 0.2s',
          }}
          rows={1}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim() || (hasTimer && timeLeft === 0)} style={{
          width: 44, height: 44, background: 'var(--accent)', border: 'none',
          borderRadius: 12, color: '#fff', fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease', flexShrink: 0,
          opacity: (loading || !input.trim()) ? 0.5 : 1,
        }}>➤</button>
      </div>
      <BottomNav lang={lang} />
    </div>
  )
}
