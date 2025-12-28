import OpenAI from 'openai'
import type { UserProfile, Recipe, MealPlan, DietaryPreference, HealthGoal } from '@/types'
import { config, isOpenAIConfigured, getSafeApiKeyDisplay } from './config'

// OpenAI client instance
let openaiClient: OpenAI | null = null

/**
 * Initialize OpenAI client with validated configuration
 * Throws an error if configuration is invalid
 */
function initializeOpenAIClient(): OpenAI {
  if (!isOpenAIConfigured()) {
    throw new Error(
      'OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.\n' +
      'See README.md for setup instructions.'
    )
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: config.openai.apiKey,
      baseURL: config.openai.baseURL,
      dangerouslyAllowBrowser: false, // Ensure we never run in browser
    })

    if (config.isDevelopment) {
      console.log(`OpenAI client initialized with key: ${getSafeApiKeyDisplay()}`)
    }
  }

  return openaiClient
}

// AI Service class for handling all AI-related operations
export class AIService {
  private client: OpenAI

  constructor() {
    try {
      this.client = initializeOpenAIClient()
    } catch (error) {
      console.error('Failed to initialize AI service:', error)
      throw error
    }
  }

  // Generate personalized meal plan
  async generateMealPlan(
    userProfile: UserProfile,
    days: number = 7,
    preferences?: string[]
  ): Promise<MealPlan> {
    try {
      const prompt = this.buildMealPlanPrompt(userProfile, days, preferences)

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4.1-nano',
        messages: [
          {
            role: 'system',
            content: 'You are a professional nutritionist and meal planning expert. Generate detailed, healthy meal plans with accurate nutritional information. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response content received from OpenAI')
      }

      return this.parseMealPlanResponse(content, userProfile)
    } catch (error) {
      console.error('Error generating meal plan:', error)

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          console.error('OpenAI API key configuration error')
        } else if (error.message.includes('rate limit')) {
          console.error('OpenAI API rate limit exceeded')
        } else if (error.message.includes('insufficient_quota')) {
          console.error('OpenAI API quota exceeded')
        }
      }

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

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4.1-nano',
        messages: [
          {
            role: 'system',
            content: 'You are a creative chef and nutritionist. Create healthy, delicious recipes using available ingredients with accurate nutritional information and clear instructions. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response content received from OpenAI')
      }

      return this.parseRecipeResponse(content, ingredients)
    } catch (error) {
      console.error('Error generating recipe:', error)

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('OpenAI API key is not configured. Please check your environment variables.')
        } else if (error.message.includes('rate limit')) {
          throw new Error('OpenAI API rate limit exceeded. Please try again later.')
        } else if (error.message.includes('insufficient_quota')) {
          throw new Error('OpenAI API quota exceeded. Please check your billing settings.')
        }
      }

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

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...(context?.map(msg => ({ role: 'assistant' as const, content: msg })) || []),
        {
          role: 'user',
          content: message
        }
      ]

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4.1-nano',
        messages,
        temperature: 0.7,
        max_tokens: 800
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response content received from OpenAI')
      }

      return content
    } catch (error) {
      console.error('Error getting chat response:', error)

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          return "I'm having trouble connecting to my knowledge base. Please check the application configuration."
        } else if (error.message.includes('rate limit')) {
          return "I'm receiving too many requests right now. Please try again in a moment."
        } else if (error.message.includes('insufficient_quota')) {
          return "I'm temporarily unavailable due to service limits. Please try again later."
        }
      }

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

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4.1-nano',
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition expert. Analyze food items and provide accurate nutritional information. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nReturn as JSON: { "foodName": "", "estimatedCalories": 0, "nutrition": {"protein": 0, "carbs": 0, "fat": 0, "fiber": 0}, "servingSize": "" }`
          }
        ],
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response content received from OpenAI')
      }

      const result = JSON.parse(content)
      return result
    } catch (error) {
      console.error('Error analyzing food:', error)

      // Provide more specific error messages in logs
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          console.error('OpenAI API key configuration error during food analysis')
        } else if (error.message.includes('JSON')) {
          console.error('Invalid JSON response from OpenAI during food analysis')
        }
      }

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

// Export singleton instance with lazy initialization and error handling
let aiServiceInstance: AIService | null = null
let initializationError: Error | null = null

/**
 * Get the AI service instance with lazy initialization
 * Throws an error if the service cannot be initialized
 */
export function getAIService(): AIService {
  if (initializationError) {
    throw initializationError
  }

  if (!aiServiceInstance) {
    try {
      aiServiceInstance = new AIService()
    } catch (error) {
      initializationError = error instanceof Error ? error : new Error('Failed to initialize AI service')
      throw initializationError
    }
  }

  return aiServiceInstance
}

/**
 * Check if the AI service is available and properly configured
 */
export function isAIServiceAvailable(): boolean {
  try {
    getAIService()
    return true
  } catch {
    return false
  }
}

/**
 * Get the AI service instance if available, or null if not configured
 * This is a safe way to access the service without throwing errors
 */
export function getAIServiceSafe(): AIService | null {
  try {
    return getAIService()
  } catch {
    return null
  }
}

// Create a lazy-initialized AI service instance (server-side only)
export const aiService = {
  async generateMealPlan(userProfile: UserProfile, days: number = 7, preferences?: string[]) {
    if (typeof window !== 'undefined') {
      throw new Error('AI service must be called from server-side API routes')
    }
    return getAIService().generateMealPlan(userProfile, days, preferences)
  },

  async generateRecipeFromIngredients(ingredients: string[], dietaryPreferences: DietaryPreference[] = [], servings: number = 4) {
    if (typeof window !== 'undefined') {
      throw new Error('AI service must be called from server-side API routes')
    }
    return getAIService().generateRecipeFromIngredients(ingredients, dietaryPreferences, servings)
  },

  async getChatResponse(message: string, userProfile?: UserProfile, context?: string[]) {
    if (typeof window !== 'undefined') {
      throw new Error('AI service must be called from server-side API routes')
    }
    return getAIService().getChatResponse(message, userProfile, context)
  },

  async analyzeFoodInput(input: string, isImageDescription: boolean = false) {
    if (typeof window !== 'undefined') {
      throw new Error('AI service must be called from server-side API routes')
    }
    return getAIService().analyzeFoodInput(input, isImageDescription)
  }
} as const

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