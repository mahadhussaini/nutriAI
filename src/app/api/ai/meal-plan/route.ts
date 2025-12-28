import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'
import type { UserProfile } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { userProfile, days, preferences } = await request.json()

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile is required' },
        { status: 400 }
      )
    }

    const mealPlan = await aiService.generateMealPlan(
      userProfile as UserProfile,
      days as number || 7,
      preferences as string[] | undefined
    )

    return NextResponse.json({ mealPlan })
  } catch (error) {
    console.error('AI Meal Plan API Error:', error)

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
      { error: 'Failed to generate meal plan. Please try again.' },
      { status: 500 }
    )
  }
}
