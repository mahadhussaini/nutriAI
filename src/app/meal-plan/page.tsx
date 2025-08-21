'use client'

import { useState } from 'react'
import { useMealStore } from '@/store/mealStore'
import AppLayout from '@/components/layout/AppLayout'
import OnboardingCheck from '@/components/layout/OnboardingCheck'
import MealPlanGenerator from '@/components/features/MealPlanGenerator'
import MealPlanViewer from '@/components/features/MealPlanViewer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Sparkles, 
  Clock,
  Target
} from 'lucide-react'


export default function MealPlanPage() {
  const { currentMealPlan } = useMealStore()
  const [showGenerator, setShowGenerator] = useState(!currentMealPlan)

  const handlePlanGenerated = () => {
    setShowGenerator(false)
  }

  const handleEditPlan = () => {
    setShowGenerator(true)
  }

  const handleRegeneratePlan = () => {
    setShowGenerator(true)
  }

  if (showGenerator || !currentMealPlan) {
    return (
      <OnboardingCheck>
        <AppLayout>
          <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">AI Meal Planner</h1>
                <p className="text-muted-foreground">
                  Generate personalized meal plans based on your preferences and goals
                </p>
              </div>
              {currentMealPlan && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowGenerator(false)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Current Plan
                </Button>
              )}
            </div>

            {/* Features Info */}
            {!currentMealPlan && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <Sparkles className="w-5 h-5 mr-2 text-primary" />
                      AI-Powered
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Advanced AI considers your dietary preferences, health goals, and restrictions to create optimal meal plans.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <Target className="w-5 h-5 mr-2 text-primary" />
                      Goal-Oriented
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Every meal is designed to help you achieve your specific health and nutrition goals.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <Clock className="w-5 h-5 mr-2 text-primary" />
                      Time-Efficient
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Plans include preparation times and can be filtered by available cooking time.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            <MealPlanGenerator onPlanGenerated={handlePlanGenerated} />
          </div>
        </AppLayout>
      </OnboardingCheck>
    )
  }

  return (
    <OnboardingCheck>
      <AppLayout>
        <div className="p-6">
          <MealPlanViewer 
            mealPlan={currentMealPlan}
            onEdit={handleEditPlan}
            onRegenerate={handleRegeneratePlan}
          />
        </div>
      </AppLayout>
    </OnboardingCheck>
  )
}