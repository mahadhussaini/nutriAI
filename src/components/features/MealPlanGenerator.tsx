'use client'

import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { useMealStore } from '@/store/mealStore'
import { aiService } from '@/lib/ai'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  ChefHat, 
  Sparkles,
  RefreshCw,
  Settings
} from 'lucide-react'
import { generateId, formatCalories } from '@/lib/utils'
import type { MealPlan, DailyMeals, Meal, NutritionInfo } from '@/types'

// Mock meal data for demo purposes
const mockMeals: Meal[] = [
  {
    id: '1',
    name: 'Greek Yogurt Parfait',
    type: 'breakfast',
    foods: [],
    totalNutrition: { calories: 280, protein: 20, carbs: 35, fat: 8, fiber: 6, sugar: 25, sodium: 120 },
    preparationTime: 5,
    instructions: ['Layer yogurt with berries', 'Add granola on top', 'Drizzle with honey'],
    image: '/meal-images/yogurt-parfait.jpg'
  },
  {
    id: '2',
    name: 'Grilled Chicken Salad',
    type: 'lunch',
    foods: [],
    totalNutrition: { calories: 420, protein: 35, carbs: 20, fat: 22, fiber: 8, sugar: 12, sodium: 580 },
    preparationTime: 20,
    instructions: ['Grill chicken breast', 'Prepare mixed greens', 'Add vegetables and dressing'],
    image: '/meal-images/chicken-salad.jpg'
  },
  {
    id: '3',
    name: 'Salmon with Quinoa',
    type: 'dinner',
    foods: [],
    totalNutrition: { calories: 520, protein: 40, carbs: 45, fat: 18, fiber: 6, sugar: 8, sodium: 420 },
    preparationTime: 30,
    instructions: ['Cook quinoa', 'Season and bake salmon', 'Steam vegetables'],
    image: '/meal-images/salmon-quinoa.jpg'
  },
  {
    id: '4',
    name: 'Apple with Almond Butter',
    type: 'snack',
    foods: [],
    totalNutrition: { calories: 180, protein: 6, carbs: 20, fat: 12, fiber: 5, sugar: 15, sodium: 80 },
    preparationTime: 2,
    instructions: ['Slice apple', 'Serve with almond butter'],
    image: '/meal-images/apple-almond.jpg'
  }
]

interface MealPlanGeneratorProps {
  onPlanGenerated: (plan: MealPlan) => void
}

export default function MealPlanGenerator({ onPlanGenerated }: MealPlanGeneratorProps) {
  const { profile } = useUserStore()
  const { setCurrentMealPlan } = useMealStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(7) // days
  const [selectedCalorieTarget, setSelectedCalorieTarget] = useState(2000)
  const [includedMealTypes, setIncludedMealTypes] = useState({
    breakfast: true,
    lunch: true,
    dinner: true,
    snack: true
  })

  const generateMealPlan = async () => {
    if (!profile) return

    setIsGenerating(true)

    try {
      // Build preferences array for AI
      const preferences = []
      
      // Add meal type preferences
      const includedTypes = Object.entries(includedMealTypes)
        .filter(([, included]) => included)
        .map(([type]) => type)
      
      if (includedTypes.length > 0) {
        preferences.push(`Include: ${includedTypes.join(', ')}`)
      }
      
      if (selectedCalorieTarget !== 2000) {
        preferences.push(`Target ${selectedCalorieTarget} calories per day`)
      }

      // Use AI service to generate meal plan
      await aiService.generateMealPlan(
        profile,
        selectedDuration,
        preferences
      )

      // Enhance the AI plan with our local data structure
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + selectedDuration - 1)

      const dailyMeals: DailyMeals[] = []

      // Generate meals for each day (using mock data for demo, AI would provide real meals)
      for (let i = 0; i < selectedDuration; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + i)

        const dayMeals: DailyMeals = {
          date: currentDate,
          breakfast: includedMealTypes.breakfast ? mockMeals.find(m => m.type === 'breakfast') : undefined,
          lunch: includedMealTypes.lunch ? mockMeals.find(m => m.type === 'lunch') : undefined,
          dinner: includedMealTypes.dinner ? mockMeals.find(m => m.type === 'dinner') : undefined,
          snacks: includedMealTypes.snack ? [mockMeals.find(m => m.type === 'snack')!] : []
        }

        dailyMeals.push(dayMeals)
      }

      // Calculate target nutrition based on user profile and calorie target
      const targetNutrition: NutritionInfo = {
        calories: selectedCalorieTarget,
        protein: Math.round(selectedCalorieTarget * 0.25 / 4), // 25% of calories
        carbs: Math.round(selectedCalorieTarget * 0.45 / 4), // 45% of calories
        fat: Math.round(selectedCalorieTarget * 0.30 / 9), // 30% of calories
        fiber: 25,
        sugar: Math.round(selectedCalorieTarget * 0.10 / 4), // 10% of calories
        sodium: 2300
      }

      const mealPlan: MealPlan = {
        id: generateId(),
        userId: profile.id,
        name: `AI-Generated ${selectedDuration}-Day Plan`,
        startDate,
        endDate,
        meals: dailyMeals,
        targetNutrition,
        createdAt: new Date()
      }

      setCurrentMealPlan(mealPlan)
      onPlanGenerated(mealPlan)
    } catch (error) {
      console.error('Error generating meal plan:', error)
      // Handle error - could show a toast notification
    } finally {
      setIsGenerating(false)
    }
  }

  const calculateEstimatedCalories = () => {
    let total = 0
    if (includedMealTypes.breakfast) total += 280
    if (includedMealTypes.lunch) total += 420
    if (includedMealTypes.dinner) total += 520
    if (includedMealTypes.snack) total += 180
    return total
  }

  return (
    <div className="space-y-6">
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            AI Meal Plan Generator
          </CardTitle>
          <CardDescription>
            Generate a personalized meal plan based on your preferences and goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Plan Duration</label>
            <div className="grid grid-cols-3 gap-3">
              {[3, 7, 14].map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedDuration(days)}
                  className={`p-3 border rounded-lg text-center transition-all duration-200 hover-lift ${
                    selectedDuration === days
                      ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                      : 'border-input hover:bg-muted hover:shadow-md'
                  }`}
                >
                  <div className="font-medium">{days} Days</div>
                  <div className="text-xs opacity-80">
                    {days === 3 ? 'Quick start' : days === 7 ? 'Recommended' : 'Extended'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Calorie Target */}
          <div>
            <label className="block text-sm font-medium mb-3">Daily Calorie Target</label>
            <div className="space-y-2">
              <input
                type="range"
                min="1200"
                max="3000"
                step="50"
                value={selectedCalorieTarget}
                onChange={(e) => setSelectedCalorieTarget(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1,200 cal</span>
                <span className="font-medium text-foreground">
                  {formatCalories(selectedCalorieTarget)}
                </span>
                <span>3,000 cal</span>
              </div>
            </div>
          </div>

          {/* Meal Types */}
          <div>
            <label className="block text-sm font-medium mb-3">Include Meal Types</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(includedMealTypes).map(([mealType, included]) => (
                <label
                  key={mealType}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-muted transition-all duration-200 hover-lift"
                >
                  <input
                    type="checkbox"
                    checked={included}
                    onChange={(e) =>
                      setIncludedMealTypes(prev => ({
                        ...prev,
                        [mealType]: e.target.checked
                      }))
                    }
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium capitalize">{mealType}</div>
                    <div className="text-sm text-muted-foreground">
                      {mealType === 'breakfast' && '~280 cal'}
                      {mealType === 'lunch' && '~420 cal'}
                      {mealType === 'dinner' && '~520 cal'}
                      {mealType === 'snack' && '~180 cal'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Plan Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className="ml-2 font-medium">{selectedDuration} days</span>
              </div>
              <div>
                <span className="text-muted-foreground">Daily Target:</span>
                <span className="ml-2 font-medium">{formatCalories(selectedCalorieTarget)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Estimated Daily:</span>
                <span className="ml-2 font-medium">{formatCalories(calculateEstimatedCalories())}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Meals:</span>
                <span className="ml-2 font-medium">
                  {selectedDuration * Object.values(includedMealTypes).filter(Boolean).length}
                </span>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateMealPlan}
            disabled={isGenerating || Object.values(includedMealTypes).every(v => !v)}
            className="w-full h-12 button-hover gradient-primary"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 spinner" />
                Generating Your Meal Plan...
              </>
            ) : (
              <>
                <ChefHat className="w-4 h-4 mr-2" />
                Generate AI Meal Plan
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={66} className="w-full progress-animate" />
              <p className="text-sm text-muted-foreground text-center">
                AI is creating your personalized meal plan...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Preferences Info */}
      {profile && (
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-primary" />
              Your Preferences
            </CardTitle>
            <CardDescription>
              The AI will consider these preferences when generating your meal plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Dietary Preferences</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.dietaryPreferences.length > 0 ? (
                    profile.dietaryPreferences.map((pref, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs capitalize"
                      >
                        {pref.replace('_', ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">None specified</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Health Goals</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.healthGoals.length > 0 ? (
                    profile.healthGoals.map((goal, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs capitalize"
                      >
                        {goal.replace('_', ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">None specified</span>
                  )}
                </div>
              </div>

              {profile.allergies.length > 0 && (
                <div className="md:col-span-2">
                  <h4 className="font-medium mb-2">Allergies to Avoid</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-destructive text-destructive-foreground rounded text-xs"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}