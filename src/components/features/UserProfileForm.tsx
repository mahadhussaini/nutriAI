'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useUserStore } from '@/store/userStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { generateId, calculateBMI } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import type { UserProfile, ActivityLevel, DietaryPreference, HealthGoal } from '@/types'

const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  age: z.number().min(16, 'Age must be at least 16').max(120, 'Age must be less than 120'),
  weight: z.number().min(30, 'Weight must be at least 30kg').max(300, 'Weight must be less than 300kg'),
  height: z.number().min(100, 'Height must be at least 100cm').max(250, 'Height must be less than 250cm'),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  dietaryPreferences: z.array(z.string()),
  healthGoals: z.array(z.string()),
  allergies: z.array(z.string())
})

type UserProfileFormData = z.infer<typeof userProfileSchema>

const steps = [
  { id: 'basic', title: 'Basic Information', description: 'Tell us about yourself', icon: '👋' },
  { id: 'physical', title: 'Physical Stats', description: 'Your current measurements', icon: '📏' },
  { id: 'lifestyle', title: 'Lifestyle', description: 'Activity and preferences', icon: '🏃‍♂️' },
  { id: 'goals', title: 'Health Goals', description: 'What you want to achieve', icon: '🎯' }
]

const activityLevels: { value: ActivityLevel; label: string; description: string; icon: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise', icon: '🛋️' },
  { value: 'light', label: 'Light', description: 'Light exercise 1-3 days/week', icon: '🚶‍♂️' },
  { value: 'moderate', label: 'Moderate', description: 'Moderate exercise 3-5 days/week', icon: '🏃‍♂️' },
  { value: 'active', label: 'Active', description: 'Heavy exercise 6-7 days/week', icon: '💪' },
  { value: 'very_active', label: 'Very Active', description: 'Very heavy exercise, physical job', icon: '🔥' }
]

const dietaryOptions: { value: DietaryPreference; label: string; icon: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'keto', label: 'Keto', icon: '🥑' },
  { value: 'paleo', label: 'Paleo', icon: '🥩' },
  { value: 'mediterranean', label: 'Mediterranean', icon: '🐟' },
  { value: 'halal', label: 'Halal', icon: '☪️' },
  { value: 'kosher', label: 'Kosher', icon: '✡️' },
  { value: 'gluten_free', label: 'Gluten-Free', icon: '🌾' },
  { value: 'dairy_free', label: 'Dairy-Free', icon: '🥛' }
]

const healthGoalOptions: { value: HealthGoal; label: string; icon: string }[] = [
  { value: 'weight_loss', label: 'Weight Loss', icon: '⚖️' },
  { value: 'weight_gain', label: 'Weight Gain', icon: '📈' },
  { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
  { value: 'maintain_weight', label: 'Maintain Weight', icon: '⚖️' },
  { value: 'improve_health', label: 'Improve Health', icon: '❤️' },
  { value: 'increase_energy', label: 'Increase Energy', icon: '⚡' }
]

interface UserProfileFormProps {
  onComplete: () => void
}

export default function UserProfileForm({ onComplete }: UserProfileFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const { setProfile } = useUserStore()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    mode: 'onChange',
    defaultValues: {
      dietaryPreferences: [],
      healthGoals: [],
      allergies: []
    }
  })

  const watchedValues = watch()
  const progress = ((currentStep + 1) / steps.length) * 100

  const onSubmit = (data: UserProfileFormData) => {
    const profile: UserProfile = {
      id: generateId(),
      name: data.name,
      email: data.email,
      age: data.age,
      weight: data.weight,
      height: data.height,
      activityLevel: data.activityLevel,
      dietaryPreferences: data.dietaryPreferences as DietaryPreference[],
      healthGoals: data.healthGoals as HealthGoal[],
      allergies: data.allergies,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setProfile(profile)
    onComplete()
    router.push('/')
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleArrayValue = (array: string[], value: string, field: 'dietaryPreferences' | 'healthGoals' | 'allergies') => {
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value]
    setValue(field, newArray)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-foreground">Full Name</label>
              <input
                {...register('name')}
                type="text"
                className="w-full p-4 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background hover:bg-muted/50"
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-destructive text-sm mt-2 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.name.message}
              </p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-foreground">Email Address</label>
              <input
                {...register('email')}
                type="email"
                className="w-full p-4 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background hover:bg-muted/50"
                placeholder="Enter your email address"
              />
              {errors.email && <p className="text-destructive text-sm mt-2 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.email.message}
              </p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-foreground">Age</label>
              <input
                {...register('age', { valueAsNumber: true })}
                type="number"
                className="w-full p-4 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background hover:bg-muted/50"
                placeholder="Enter your age"
                min="16"
                max="120"
              />
              {errors.age && <p className="text-destructive text-sm mt-2 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.age.message}
              </p>}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-foreground">Weight (kg)</label>
              <input
                {...register('weight', { valueAsNumber: true })}
                type="number"
                step="0.1"
                className="w-full p-4 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background hover:bg-muted/50"
                placeholder="Enter your weight in kg"
                min="30"
                max="300"
              />
              {errors.weight && <p className="text-destructive text-sm mt-2 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.weight.message}
              </p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-foreground">Height (cm)</label>
              <input
                {...register('height', { valueAsNumber: true })}
                type="number"
                className="w-full p-4 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background hover:bg-muted/50"
                placeholder="Enter your height in cm"
                min="100"
                max="250"
              />
              {errors.height && <p className="text-destructive text-sm mt-2 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.height.message}
              </p>}
            </div>

            {watchedValues.weight && watchedValues.height && (
              <div className="p-6 bg-gradient-secondary rounded-xl border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-foreground">Your BMI: {calculateBMI(watchedValues.weight, watchedValues.height).toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This helps us provide better nutrition recommendations
                    </p>
                  </div>
                  <div className="text-3xl">📊</div>
                </div>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-4 text-foreground">Activity Level</label>
              <div className="space-y-3">
                {activityLevels.map((level) => (
                  <label key={level.value} className="flex items-center p-4 border border-input rounded-xl cursor-pointer hover:bg-muted/50 transition-all duration-200 hover-lift">
                    <input
                      {...register('activityLevel')}
                      type="radio"
                      value={level.value}
                      className="mr-4 w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div className="flex items-center flex-1">
                      <span className="text-2xl mr-3">{level.icon}</span>
                      <div>
                        <div className="font-medium text-foreground">{level.label}</div>
                        <div className="text-sm text-muted-foreground">{level.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.activityLevel && <p className="text-destructive text-sm mt-2 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.activityLevel.message}
              </p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-4 text-foreground">Dietary Preferences (optional)</label>
              <div className="grid grid-cols-2 gap-3">
                {dietaryOptions.map((option) => (
                  <label key={option.value} className="flex items-center p-3 border border-input rounded-xl cursor-pointer hover:bg-muted/50 transition-all duration-200 hover-lift">
                    <input
                      type="checkbox"
                      checked={watchedValues.dietaryPreferences?.includes(option.value) || false}
                      onChange={() => toggleArrayValue(watchedValues.dietaryPreferences || [], option.value, 'dietaryPreferences')}
                      className="mr-3 w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-lg mr-2">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-4 text-foreground">Health Goals</label>
              <div className="grid grid-cols-2 gap-3">
                {healthGoalOptions.map((goal) => (
                  <label key={goal.value} className="flex items-center p-4 border border-input rounded-xl cursor-pointer hover:bg-muted/50 transition-all duration-200 hover-lift">
                    <input
                      type="checkbox"
                      checked={watchedValues.healthGoals?.includes(goal.value) || false}
                      onChange={() => toggleArrayValue(watchedValues.healthGoals || [], goal.value, 'healthGoals')}
                      className="mr-3 w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-xl mr-3">{goal.icon}</span>
                    <span className="font-medium">{goal.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-foreground">Food Allergies (optional)</label>
              <input
                type="text"
                className="w-full p-4 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background hover:bg-muted/50"
                placeholder="Enter allergies separated by commas (e.g., nuts, shellfish)"
                onChange={(e) => {
                  const allergies = e.target.value.split(',').map(a => a.trim()).filter(a => a)
                  setValue('allergies', allergies)
                }}
              />
              <p className="text-xs text-muted-foreground mt-2 flex items-center">
                <span className="mr-1">💡</span>
                This helps us avoid recommending foods that might cause reactions
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl card-hover">
        <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <CardTitle className="text-3xl flex items-center">
                <Logo size="lg" className="mr-3 text-primary-foreground" />
                Welcome to NutriAI
              </CardTitle>
              <CardDescription className="text-primary-foreground/80 mt-2">
                Let&apos;s create your personalized nutrition profile
              </CardDescription>
            </div>
            <div className="text-sm text-primary-foreground/80 bg-primary-foreground/10 px-3 py-1 rounded-full">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          <Progress value={progress} className="w-full progress-animate" />
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-3 text-foreground flex items-center">
                <span className="mr-3 text-3xl">{steps[currentStep].icon}</span>
                {steps[currentStep].title}
              </h3>
              <p className="text-muted-foreground text-lg mb-8">{steps[currentStep].description}</p>
              
              <div className="slide-in-up">
                {renderStepContent()}
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-input">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="button-hover hover-lift px-8 py-3"
              >
                ← Previous
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button 
                  type="submit" 
                  disabled={!isValid}
                  className="button-hover gradient-primary hover-lift px-8 py-3"
                >
                  Complete Setup →
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="button-hover gradient-primary hover-lift px-8 py-3"
                >
                  Next →
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}