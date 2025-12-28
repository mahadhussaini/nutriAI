'use client'

import { useState, useRef } from 'react'
import { useUserStore } from '@/store/userStore'
import { useMealStore } from '@/store/mealStore'
// Removed direct AI service import - now using API routes
import { generateId } from '@/lib/utils'
import { Camera, Search, Plus, Loader2, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { FoodLog, MealType, Food, NutritionInfo } from '@/types'

interface FoodLoggerProps {
  onClose?: () => void
}

export default function FoodLogger({ onClose }: FoodLoggerProps) {
  const { profile } = useUserStore()
  const { addFoodLog } = useMealStore()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [foodInput, setFoodInput] = useState('')
  const [analyzedFood, setAnalyzedFood] = useState<{
    foodName: string
    estimatedCalories: number
    nutrition: { protein: number; carbs: number; fat: number; fiber: number }
    servingSize: string
  } | null>(null)
  const [quantity, setQuantity] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTextInput = async () => {
    if (!foodInput.trim()) return

    setIsAnalyzing(true)
    try {
      // Call AI food analysis API route
      const apiResponse = await fetch('/api/ai/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: foodInput,
          isImageDescription: false,
        }),
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(errorData.error || 'Failed to analyze food')
      }

      const data = await apiResponse.json()
      const result = data.result
      setAnalyzedFood(result)
    } catch (error) {
      console.error('Error analyzing food:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsAnalyzing(true)
    try {
      // In a real implementation, you would:
      // 1. Upload the image to a service
      // 2. Use AI vision to analyze the image
      // 3. Extract food information

      // For now, we'll simulate with a placeholder
      const mockDescription = `Image of food: ${file.name}`

      // Call AI food analysis API route
      const apiResponse = await fetch('/api/ai/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: mockDescription,
          isImageDescription: true,
        }),
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(errorData.error || 'Failed to analyze food image')
      }

      const data = await apiResponse.json()
      const result = data.result
      setAnalyzedFood(result)
      setFoodInput(result.foodName)
    } catch (error) {
      console.error('Error analyzing image:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleLogFood = async () => {
    if (!analyzedFood || !profile) return

    const nutrition: NutritionInfo = {
      calories: analyzedFood.estimatedCalories * quantity,
      protein: analyzedFood.nutrition.protein * quantity,
      carbs: analyzedFood.nutrition.carbs * quantity,
      fat: analyzedFood.nutrition.fat * quantity,
      fiber: analyzedFood.nutrition.fiber * quantity,
      sugar: 0, // Would be calculated by AI
      sodium: 0 // Would be calculated by AI
    }

    const food: Food = {
      id: generateId(),
      name: analyzedFood.foodName,
      nutrition: {
        calories: analyzedFood.estimatedCalories,
        protein: analyzedFood.nutrition.protein,
        carbs: analyzedFood.nutrition.carbs,
        fat: analyzedFood.nutrition.fat,
        fiber: analyzedFood.nutrition.fiber,
        sugar: 0,
        sodium: 0
      },
      servingSize: analyzedFood.servingSize,
      servingWeight: 100, // Default weight
      category: 'other' // Would be determined by AI
    }

    const foodLog: FoodLog = {
      id: generateId(),
      userId: profile.id,
      date: new Date(),
      mealType,
      food,
      quantity,
      nutrition,
      loggedAt: new Date()
    }

    addFoodLog(foodLog)
    
    // Reset form
    setFoodInput('')
    setAnalyzedFood(null)
    setQuantity(1)
    
    onClose?.()
  }

  return (
    <Card className="w-full max-w-md mx-auto card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-primary">Log Food</CardTitle>
            <CardDescription>
              Add food to your daily log with AI assistance
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="button-hover hover-lift">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meal Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Meal Type</label>
          <Select value={mealType} onValueChange={(value: MealType) => setMealType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Food Input Methods */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Add Food</label>
          
          {/* Text Input */}
          <div className="flex gap-2">
            <Input
              placeholder="e.g., 1 cup cooked rice, grilled chicken breast..."
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTextInput()}
            />
            <Button 
              variant="outline" 
              onClick={handleTextInput}
              disabled={isAnalyzing || !foodInput.trim()}
              className="button-hover hover-lift"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 spinner" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Image Upload */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full button-hover hover-lift"
              disabled={isAnalyzing}
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo / Upload Image
            </Button>
          </div>
        </div>

        {/* Analysis Results */}
        {analyzedFood && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{analyzedFood.foodName}</h4>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">servings</span>
              </div>
            </div>
            
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Serving Size:</span> {analyzedFood.servingSize}</p>
              <p><span className="font-medium">Calories:</span> {Math.round(analyzedFood.estimatedCalories * quantity)}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <p>Protein: {Math.round(analyzedFood.nutrition.protein * quantity)}g</p>
                <p>Carbs: {Math.round(analyzedFood.nutrition.carbs * quantity)}g</p>
                <p>Fat: {Math.round(analyzedFood.nutrition.fat * quantity)}g</p>
                <p>Fiber: {Math.round(analyzedFood.nutrition.fiber * quantity)}g</p>
              </div>
            </div>

            <Button onClick={handleLogFood} className="w-full button-hover gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Log Food
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Analyzing food...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}