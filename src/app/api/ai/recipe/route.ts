import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'
import type { DietaryPreference } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { ingredients, dietaryPreferences, servings } = await request.json()

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Ingredients array is required and must not be empty' },
        { status: 400 }
      )
    }

    const recipe = await aiService.generateRecipeFromIngredients(
      ingredients as string[],
      dietaryPreferences as DietaryPreference[] | undefined,
      servings as number || 4
    )

    return NextResponse.json({ recipe })
  } catch (error) {
    console.error('AI Recipe API Error:', error)

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
      { error: 'Failed to generate recipe. Please try again.' },
      { status: 500 }
    )
  }
}
