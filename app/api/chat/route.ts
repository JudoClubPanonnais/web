import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from '@/lib/ai'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  const { messages, aiConfig, lang } = await req.json()

  const systemPrompt = buildSystemPrompt({
    gender: aiConfig.gender,
    personality: aiConfig.personality,
    hair: aiConfig.hair,
    eyes: aiConfig.eyes,
    build: aiConfig.build,
    style: aiConfig.style,
    lang,
  })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: systemPrompt,
    messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
  })

  const reply = (response.content[0] as any).text

  // Decide to generate photo: every ~7 messages if plan allows
  const generatePhoto = messages.length > 0 && messages.length % 7 === 0

  return NextResponse.json({ reply, generatePhoto })
}
