import type { UserProfile, Recipe, MealPlan, DietaryPreference, HealthGoal } from '@/types'

// AI API configuration
const AI_API_BASE = process.env.NEXT_PUBLIC_AI_API_BASE || 'https://api.openai.com/v1'
const AI_API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY || ''

// AI Service class for handling all AI-related operations
export class AIService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string = AI_API_KEY, baseUrl: string = AI_API_BASE) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  // Generate personalized meal plan
  async generateMealPlan(
    userProfile: UserProfile,
    days: number = 7,
    preferences?: string[]
  ): Promise<MealPlan> {
    try {
      const prompt = this.buildMealPlanPrompt(userProfile, days, preferences)
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a professional nutritionist and meal planning expert. Generate detailed, healthy meal plans with accurate nutritional information.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate meal plan')
      }

      const data = await response.json()
      return this.parseMealPlanResponse(data.choices[0].message.content, userProfile)
    } catch (error) {
      console.error('Error generating meal plan:', error)
      // Return fallback meal plan
      return this.getFallbackMealPlan(userProfile)
    }
  }

  // Generate recipes based on available ingredients
  async generateRecipeFromIngredients(
    ingredients: string[],
    dietaryPreferences: DietaryPreference[] = [],
    servings: number = 4
  ): Promise<Recipe> {
    try {
      const prompt = this.buildRecipePrompt(ingredients, dietaryPreferences, servings)
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a creative chef and nutritionist. Create healthy, delicious recipes using available ingredients with accurate nutritional information and clear instructions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1500
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate recipe')
      }

      const data = await response.json()
      return this.parseRecipeResponse(data.choices[0].message.content, ingredients)
    } catch (error) {
      console.error('Error generating recipe:', error)
      throw error
    }
  }

  // AI Coach chat responses
  async getChatResponse(
    message: string,
    userProfile?: UserProfile,
    context?: string[]
  ): Promise<string> {
    try {
      const systemPrompt = this.buildChatSystemPrompt(userProfile)
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            ...(context?.map(msg => ({ role: 'assistant', content: msg })) || []),
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get chat response')
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Error getting chat response:', error)
      return "I'm sorry, I'm having trouble connecting right now. Please try again later."
    }
  }

  // Analyze food from image description or text
  async analyzeFoodInput(input: string, isImageDescription: boolean = false): Promise<{
    foodName: string
    estimatedCalories: number
    nutrition: {
      protein: number
      carbs: number
      fat: number
      fiber: number
    }
    servingSize: string
  }> {
    try {
      const prompt = isImageDescription 
        ? `Analyze this food image description and provide nutritional information: "${input}"`
        : `Analyze this food item and provide nutritional information: "${input}"`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a nutrition expert. Analyze food items and provide accurate nutritional information. Return data in JSON format.'
            },
            {
              role: 'user',
              content: `${prompt}\n\nReturn as JSON: { "foodName": "", "estimatedCalories": 0, "nutrition": {"protein": 0, "carbs": 0, "fat": 0, "fiber": 0}, "servingSize": "" }`
            }
          ],
          temperature: 0.3,
          max_tokens: 300
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze food')
      }

      const data = await response.json()
      const result = JSON.parse(data.choices[0].message.content)
      return result
    } catch (error) {
      console.error('Error analyzing food:', error)
      // Return default values
      return {
        foodName: input,
        estimatedCalories: 200,
        nutrition: { protein: 10, carbs: 20, fat: 5, fiber: 2 },
        servingSize: '1 serving'
      }
    }
  }

  // Helper methods
  private buildMealPlanPrompt(userProfile: UserProfile, days: number, preferences?: string[]): string {
    const { age, weight, height, activityLevel, dietaryPreferences, healthGoals } = userProfile
    
    return `Create a ${days}-day meal plan for:
    - Age: ${age}, Weight: ${weight}kg, Height: ${height}cm
    - Activity Level: ${activityLevel}
    - Dietary Preferences: ${dietaryPreferences.join(', ')}
    - Health Goals: ${healthGoals.join(', ')}
    ${preferences ? `- Additional Preferences: ${preferences.join(', ')}` : ''}

    Include breakfast, lunch, dinner, and 1-2 snacks per day. 
    Provide estimated calories and macros for each meal.
    Focus on whole foods, balanced nutrition, and variety.
    
    Format as structured data with meal names, ingredients, and nutritional info.`
  }

  private buildRecipePrompt(ingredients: string[], dietaryPreferences: DietaryPreference[], servings: number): string {
    return `Create a healthy recipe using these ingredients: ${ingredients.join(', ')}
    
    Requirements:
    - Serves ${servings} people
    - Dietary preferences: ${dietaryPreferences.join(', ') || 'None specified'}
    - Include prep time, cook time, and difficulty level
    - Provide step-by-step instructions
    - Calculate nutritional information per serving
    - Suggest cooking tips
    
    Make it delicious and nutritious!`
  }

  private buildChatSystemPrompt(userProfile?: UserProfile): string {
    const basePrompt = `You are a friendly, knowledgeable AI nutrition coach. Provide helpful, evidence-based advice about healthy eating, nutrition, and wellness. Keep responses concise but informative. Always be encouraging and supportive.`
    
    if (userProfile) {
      const { dietaryPreferences, healthGoals, allergies } = userProfile
      return `${basePrompt}
      
      User context:
      - Dietary preferences: ${dietaryPreferences.join(', ')}
      - Health goals: ${healthGoals.join(', ')}
      - Allergies: ${allergies.join(', ') || 'None'}
      
      Tailor your advice to their specific needs and restrictions.`
    }
    
    return basePrompt
  }

  private parseMealPlanResponse(response: string, userProfile: UserProfile): MealPlan {
    // This would parse the AI response and convert it to a proper MealPlan object
    // For now, return a mock structure
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)

    return {
      id: `plan_${Date.now()}`,
      userId: userProfile.id,
      name: 'AI Generated Weekly Plan',
      startDate,
      endDate,
      meals: [], // Would be populated from AI response
      targetNutrition: {
        calories: 2000,
        protein: 125,
        carbs: 225,
        fat: 67,
        fiber: 25,
        sugar: 50,
        sodium: 2300
      },
      createdAt: new Date()
    }
  }

  private parseRecipeResponse(response: string, ingredients: string[]): Recipe {
    // This would parse the AI response and convert it to a proper Recipe object
    // For now, return a mock structure
    return {
      id: `recipe_${Date.now()}`,
      name: 'AI Generated Recipe',
      description: 'A delicious recipe created from your available ingredients',
      ingredients: ingredients.map(ingredient => ({
        name: ingredient,
        amount: 1,
        unit: 'cup',
        optional: false
      })),
      instructions: [
        'Prepare ingredients',
        'Follow cooking steps',
        'Serve and enjoy'
      ],
      preparationTime: 15,
      cookingTime: 30,
      servings: 4,
      difficulty: 'medium',
      nutrition: {
        calories: 350,
        protein: 25,
        carbs: 30,
        fat: 15,
        fiber: 5,
        sugar: 8,
        sodium: 600
      },
      tags: ['healthy', 'ai-generated']
    }
  }

  private getFallbackMealPlan(userProfile: UserProfile): MealPlan {
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)

    return {
      id: `fallback_plan_${Date.now()}`,
      userId: userProfile.id,
      name: 'Basic Healthy Plan',
      startDate,
      endDate,
      meals: [],
      targetNutrition: {
        calories: 2000,
        protein: 125,
        carbs: 225,
        fat: 67,
        fiber: 25,
        sugar: 50,
        sodium: 2300
      },
      createdAt: new Date()
    }
  }
}

// Export singleton instance
export const aiService = new AIService()

// Utility functions
export const calculateDailyCalories = (profile: UserProfile): number => {
  const { age, weight, height, activityLevel } = profile
  
  // Basic BMR calculation (Mifflin-St Jeor Equation for average between male/female)
  const bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
  
  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  }
  
  return Math.round(bmr * activityMultipliers[activityLevel])
}

export const calculateMacroTargets = (calories: number, healthGoals: HealthGoal[]) => {
  // Adjust macro ratios based on health goals
  let proteinRatio = 0.25 // 25% default
  let carbRatio = 0.45 // 45% default
  let fatRatio = 0.30 // 30% default
  
  if (healthGoals.includes('muscle_gain')) {
    proteinRatio = 0.30
    carbRatio = 0.40
    fatRatio = 0.30
  } else if (healthGoals.includes('weight_loss')) {
    proteinRatio = 0.30
    carbRatio = 0.35
    fatRatio = 0.35
  }
  
  return {
    protein: Math.round(calories * proteinRatio / 4), // 4 calories per gram
    carbs: Math.round(calories * carbRatio / 4), // 4 calories per gram
    fat: Math.round(calories * fatRatio / 9) // 9 calories per gram
  }
}