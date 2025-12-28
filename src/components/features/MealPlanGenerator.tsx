'use client'

import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { useMealStore } from '@/store/mealStore'
// Removed direct AI service import - now using API routes
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  ChefHat, 
  Sparkles,
  RefreshCw,
  Settings
} from 'lucide-react'
import { formatCalories } from '@/lib/utils'
import type { MealPlan } from '@/types'
    
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

      // Call AI meal plan API route
      const apiResponse = await fetch('/api/ai/meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile: profile,
          days: selectedDuration,
          preferences: preferences,
        }),
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(errorData.error || 'Failed to generate meal plan')
      }

      const data = await apiResponse.json()
      const mealPlan = data.mealPlan

      // Store the generated meal plan
      setCurrentMealPlan(mealPlan)

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