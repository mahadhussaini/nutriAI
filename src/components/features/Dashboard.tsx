'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/store/userStore'
import { 
  Calendar, 
  Target,
  TrendingUp, 
  Droplets, 
  Zap, 
  Award,
  ChefHat,
  BarChart3,
  MessageCircle,
  BookOpen
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { formatCalories, formatDate } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import type { DailyLog } from '@/types'

// Mock data for demo purposes
const mockDailyLog: DailyLog = {
  date: new Date(),
  logs: [],
  totalNutrition: {
    calories: 1450,
    protein: 85,
    carbs: 180,
    fat: 45,
    fiber: 28,
    sugar: 35,
    sodium: 1200
  },
  waterIntake: 1800,
  targetCalories: 2000,
  targetWater: 2500
}

const mockUpcomingMeals = [
  {
    id: '1',
    name: 'Grilled Salmon with Quinoa',
    type: 'lunch' as const,
    time: '12:30 PM',
    calories: 520
  },
  {
    id: '2', 
    name: 'Greek Yogurt with Berries',
    type: 'snack' as const,
    time: '3:00 PM',
    calories: 180
  },
  {
    id: '3',
    name: 'Chicken Stir Fry',
    type: 'dinner' as const,
    time: '7:00 PM',
    calories: 420
  }
]

export default function Dashboard() {
  const { profile, todayLog, setTodayLog } = useUserStore()
  const [currentLog, setCurrentLog] = useState<DailyLog>(mockDailyLog)

  useEffect(() => {
    if (todayLog) {
      setCurrentLog(todayLog)
    } else {
      setTodayLog(mockDailyLog)
      setCurrentLog(mockDailyLog)
    }
  }, [todayLog, setTodayLog])

  const calorieProgress = (currentLog.totalNutrition.calories / currentLog.targetCalories) * 100
  const waterProgress = (currentLog.waterIntake / currentLog.targetWater) * 100
  
  const macroTargets = {
    protein: Math.round(currentLog.targetCalories * 0.25 / 4), // 25% of calories, 4 cal/g
    carbs: Math.round(currentLog.targetCalories * 0.45 / 4), // 45% of calories, 4 cal/g  
    fat: Math.round(currentLog.targetCalories * 0.30 / 9) // 30% of calories, 9 cal/g
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}{profile?.name ? `, ${profile.name}` : ''}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {formatDate(new Date())} • Let&apos;s make today healthy and delicious
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="button-hover hover-lift" asChild>
            <Link href="/meal-plan">
              <Calendar className="w-4 h-4 mr-2" />
              View Plan
            </Link>
          </Button>
          <Button className="button-hover hover-lift" asChild>
            <Link href="/food-log">
              <ChefHat className="w-4 h-4 mr-2" />
              Log Meal
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today&apos;s Calories</p>
                <p className="text-2xl font-bold text-primary">{formatCalories(currentLog.totalNutrition.calories)}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCalories(currentLog.targetCalories - currentLog.totalNutrition.calories)} remaining
                </p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
            <Progress value={calorieProgress} className="mt-4 progress-animate" />
          </CardContent>
        </Card>

        <Card className="card-hover hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Water Intake</p>
                <p className="text-2xl font-bold text-primary">{(currentLog.waterIntake / 1000).toFixed(1)}L</p>
                <p className="text-sm text-muted-foreground">
                  {((currentLog.targetWater - currentLog.waterIntake) / 1000).toFixed(1)}L to go
                </p>
              </div>
              <Droplets className="w-8 h-8 text-primary" />
            </div>
            <Progress value={waterProgress} className="mt-4 progress-animate" />
          </CardContent>
        </Card>

        <Card className="card-hover hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-primary">7 days</p>
                <p className="text-sm text-muted-foreground">Logging meals consistently</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Energy Level</p>
                <p className="text-2xl font-bold text-primary">Good</p>
                <p className="text-sm text-muted-foreground">Based on your nutrition</p>
              </div>
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Macros */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary" />
            Today&apos;s Macros
          </CardTitle>
          <CardDescription>
            Your macronutrient breakdown for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{currentLog.totalNutrition.protein}g</div>
              <div className="text-sm text-muted-foreground">Protein</div>
              <Progress 
                value={(currentLog.totalNutrition.protein / macroTargets.protein) * 100} 
                className="mt-2 progress-animate" 
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{currentLog.totalNutrition.carbs}g</div>
              <div className="text-sm text-muted-foreground">Carbs</div>
              <Progress 
                value={(currentLog.totalNutrition.carbs / macroTargets.carbs) * 100} 
                className="mt-2 progress-animate" 
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{currentLog.totalNutrition.fat}g</div>
              <div className="text-sm text-muted-foreground">Fat</div>
              <Progress 
                value={(currentLog.totalNutrition.fat / macroTargets.fat) * 100} 
                className="mt-2 progress-animate" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Meals */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            Upcoming Meals
          </CardTitle>
          <CardDescription>
            Your planned meals for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockUpcomingMeals.map((meal) => (
              <div 
                key={meal.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-all duration-200 hover-lift cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="font-medium text-foreground">{meal.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{meal.type} • {meal.time}</p>
                  </div>
                </div>
                <div className="text-sm font-medium text-primary">{formatCalories(meal.calories)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Access */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-primary" />
            Quick Access
          </CardTitle>
          <CardDescription>
            Access all your nutrition tools in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2 button-hover hover-lift" asChild>
              <Link href="/coach">
                <MessageCircle className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">AI Coach</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2 button-hover hover-lift" asChild>
              <Link href="/recipes">
                <BookOpen className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">Recipes</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2 button-hover hover-lift" asChild>
              <Link href="/insights">
                <BarChart3 className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">Insights</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2 button-hover hover-lift" asChild>
              <Link href="/achievements">
                <Award className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">Achievements</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}