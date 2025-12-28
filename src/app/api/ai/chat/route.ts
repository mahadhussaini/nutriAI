import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'
import type { UserProfile } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { message, userProfile, context } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    const response = await aiService.getChatResponse(
      message,
      userProfile as UserProfile | undefined,
      context as string[] | undefined
    )

    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI Chat API Error:', error)

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
      { error: 'Failed to get AI response. Please try again.' },
      { status: 500 }
    )
  }
}
