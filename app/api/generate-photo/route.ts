import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { buildReplicatePrompt } from '@/lib/ai'

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })

export async function POST(req: NextRequest) {
  const { aiConfig } = await req.json()
  const { prompt, negative_prompt } = buildReplicatePrompt({
    gender: aiConfig.gender,
    hair: aiConfig.hair,
    eyes: aiConfig.eyes,
    build: aiConfig.build,
    style: aiConfig.style,
  })

  try {
    const output = await replicate.run('stability-ai/sdxl:39ed52f2319f9c7c1cbbcca2e73f6c2749b5a19b0a7d78fb5d3dc80a1cb5bcbf', {
      input: { prompt, negative_prompt, width: 1024, height: 1024, num_outputs: 1 },
    }) as string[]

    return NextResponse.json({ url: output[0] || null })
  } catch {
    return NextResponse.json({ url: null })
  }
}
