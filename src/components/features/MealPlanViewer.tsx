'use client'

import { useState } from 'react'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  ShoppingCart,
  Utensils,
  Coffee,
  Apple,
  MessageCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { MealPlan, Meal, NutritionInfo, DailyMeals } from '@/types'

interface MealPlanViewerProps {
  mealPlan: MealPlan
  onEdit?: () => void
  onRegenerate?: () => void
}

export default function MealPlanViewer({ mealPlan, onEdit, onRegenerate }: MealPlanViewerProps) {
  const [selectedDay, setSelectedDay] = useState(0)

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const selectedDayData = mealPlan.meals[selectedDay]

  const getMealTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast': return <Coffee className="w-4 h-4" />
      case 'lunch': return <Utensils className="w-4 h-4" />
      case 'dinner': return <Utensils className="w-4 h-4" />
      case 'snack': return <Apple className="w-4 h-4" />
      default: return <Utensils className="w-4 h-4" />
    }
  }

  const getMealTypeEmoji = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast': return '🌅'
      case 'lunch': return '🌞'
      case 'dinner': return '🌙'
      case 'snack': return '🍎'
      default: return '🍽️'
    }
  }

  const getMacroColor = (macro: string) => {
    switch (macro.toLowerCase()) {
      case 'protein': return 'bg-blue-500'
      case 'carbs': return 'bg-green-500'
      case 'fat': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const EmptyMealSlot = ({ mealType }: { mealType: string }) => (
    <Card className="card-hover hover-lift border-dashed border-2 border-muted-foreground/30">
      <CardContent className="p-6 text-center">
        <div className="text-4xl mb-2">{getMealTypeEmoji(mealType)}</div>
        <p className="text-muted-foreground font-medium">No {mealType} planned</p>
        <p className="text-sm text-muted-foreground mt-1">Add a meal to complete your day</p>
      </CardContent>
    </Card>
  )

  const MealCard = ({ meal, mealType }: { meal: Meal; mealType: string }) => (
    <Card className="card-hover hover-lift">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getMealTypeEmoji(mealType)}</span>
            <CardTitle className="text-lg">{meal.name}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {meal.preparationTime || 0} min
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          {meal.instructions ? meal.instructions.join(' ') : 'No description available'}
        </p>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Macros:</p>
          <div className="flex gap-2">
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", getMacroColor('protein'))} />
              <span className="text-xs">{meal.totalNutrition.protein}g Protein</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", getMacroColor('carbs'))} />
              <span className="text-xs">{meal.totalNutrition.carbs}g Carbs</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", getMacroColor('fat'))} />
              <span className="text-xs">{meal.totalNutrition.fat}g Fat</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="button-hover hover-lift flex-1">
            View Recipe
          </Button>
          <Button size="sm" variant="outline" className="button-hover hover-lift">
            Swap
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // Calculate total nutrition for the selected day
  const getDayNutrition = (dayMeals: DailyMeals): NutritionInfo => {
    const meals = [dayMeals.breakfast, dayMeals.lunch, dayMeals.dinner, ...dayMeals.snacks].filter(Boolean) as Meal[]
    
    return meals.reduce((total, meal) => ({
      calories: total.calories + meal.totalNutrition.calories,
      protein: total.protein + meal.totalNutrition.protein,
      carbs: total.carbs + meal.totalNutrition.carbs,
      fat: total.fat + meal.totalNutrition.fat,
      fiber: total.fiber + meal.totalNutrition.fiber,
      sugar: total.sugar + meal.totalNutrition.sugar,
      sodium: total.sodium + meal.totalNutrition.sodium
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    })
  }

  const dayNutrition = selectedDayData ? getDayNutrition(selectedDayData) : {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">📋 Your Meal Plan</h1>
          <p className="text-muted-foreground mt-1">
            Personalized nutrition plan for {mealPlan.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit} className="button-hover hover-lift">
            Edit Plan
          </Button>
          <Button onClick={onRegenerate} className="button-hover gradient-primary hover-lift">
            Regenerate
          </Button>
        </div>
      </div>

      {/* Day Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
          className="button-hover hover-lift"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {days.map((day, index) => (
            <button
              key={day}
              onClick={() => setSelectedDay(index)}
              className={cn(
                'px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover-lift',
                selectedDay === index
                  ? 'bg-gradient-primary text-primary-foreground shadow-lg'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSelectedDay(Math.min(days.length - 1, selectedDay + 1))}
          className="button-hover hover-lift"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Daily Nutrition Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-secondary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Calories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dayNutrition.calories} cal</p>
            <Progress 
              value={(dayNutrition.calories / mealPlan.targetNutrition.calories) * 100} 
              className="mt-2 progress-animate"
            />
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-secondary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Protein
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dayNutrition.protein}g</p>
            <Progress 
              value={(dayNutrition.protein / mealPlan.targetNutrition.protein) * 100} 
              className="mt-2 progress-animate"
            />
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-secondary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Apple className="w-4 h-4" />
              Carbs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dayNutrition.carbs}g</p>
            <Progress 
              value={(dayNutrition.carbs / mealPlan.targetNutrition.carbs) * 100} 
              className="mt-2 progress-animate"
            />
          </CardContent>
        </Card>
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((mealType) => {
          let meal: Meal | undefined
          if (mealType === 'Breakfast') meal = selectedDayData?.breakfast
          else if (mealType === 'Lunch') meal = selectedDayData?.lunch
          else if (mealType === 'Dinner') meal = selectedDayData?.dinner
          else if (mealType === 'Snack') meal = selectedDayData?.snacks[0] // Show first snack
          
          return (
            <div key={mealType}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                {getMealTypeIcon(mealType)}
                {mealType}
              </h3>
              {meal ? (
                <MealCard meal={meal} mealType={mealType} />
              ) : (
                <EmptyMealSlot mealType={mealType} />
              )}
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button className="button-hover hover-lift" variant="outline">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Shopping List
            </Button>
            <Button className="button-hover hover-lift" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Export Plan
            </Button>
            <Button className="button-hover hover-lift" variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              Share Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}