import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { input, isImageDescription } = await request.json()

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Input is required and must be a string' },
        { status: 400 }
      )
    }

    const result = await aiService.analyzeFoodInput(
      input as string,
      isImageDescription as boolean || false
    )

    return NextResponse.json({ result })
  } catch (error) {
    console.error('AI Food Analysis API Error:', error)

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service is not configured. Please check your OpenAI API key.' },
          { status: 500 }
        )
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'AI service is currently rate limited. Please try again later.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to analyze food. Please try again.' },
      { status: 500 }
    )
  }
}
