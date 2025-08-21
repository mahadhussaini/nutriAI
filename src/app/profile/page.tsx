'use client'

import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import AppLayout from '@/components/layout/AppLayout'
import UserProfileForm from '@/components/features/UserProfileForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  User, 
  Calendar, 
  Activity, 
  Target, 
  Edit3,
  Heart,
  Scale,
  Ruler,
  Mail
} from 'lucide-react'
import { calculateBMI, getBMICategory, formatWeight } from '@/lib/utils'

export default function ProfilePage() {
  const { profile } = useUserStore()
  const [isEditing, setIsEditing] = useState(false)

  if (!profile) {
    return (
      <UserProfileForm onComplete={() => setIsEditing(false)} />
    )
  }

  if (isEditing) {
    return (
      <UserProfileForm onComplete={() => setIsEditing(false)} />
    )
  }

  const bmi = calculateBMI(profile.weight, profile.height)
  const bmiCategory = getBMICategory(bmi)

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and preferences</p>
          </div>
          <Button onClick={() => setIsEditing(true)} className="flex items-center">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{profile.age} years old</p>
                  <p className="text-sm text-muted-foreground">Age</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium capitalize">{profile.activityLevel.replace('_', ' ')}</p>
                  <p className="text-sm text-muted-foreground">Activity Level</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="w-5 h-5 mr-2" />
                Physical Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Scale className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{formatWeight(profile.weight)}</p>
                  <p className="text-sm text-muted-foreground">Weight</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Ruler className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{profile.height} cm</p>
                  <p className="text-sm text-muted-foreground">Height</p>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">BMI</span>
                  <span className="font-bold">{bmi.toFixed(1)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{bmiCategory}</p>
                <Progress 
                  value={Math.min((bmi / 30) * 100, 100)} 
                  className="h-1 mt-2" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Health Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Health Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.healthGoals.map((goal, index) => (
                  <div key={index} className="flex items-center p-2 bg-muted rounded-lg">
                    <Heart className="w-4 h-4 mr-2 text-primary" />
                    <span className="capitalize">{goal.replace('_', ' ')}</span>
                  </div>
                ))}
                {profile.healthGoals.length === 0 && (
                  <p className="text-muted-foreground text-sm">No health goals set</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dietary Preferences & Allergies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dietary Preferences</CardTitle>
              <CardDescription>
                Your selected dietary preferences and restrictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.dietaryPreferences.map((pref, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm capitalize"
                  >
                    {pref.replace('_', ' ')}
                  </span>
                ))}
                {profile.dietaryPreferences.length === 0 && (
                  <p className="text-muted-foreground text-sm">No dietary preferences set</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Food Allergies</CardTitle>
              <CardDescription>
                Foods and ingredients to avoid in meal recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map((allergy, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-destructive text-destructive-foreground rounded-full text-sm"
                  >
                    {allergy}
                  </span>
                ))}
                {profile.allergies.length === 0 && (
                  <p className="text-muted-foreground text-sm">No allergies specified</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Account creation and last updated dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Account Created</p>
                <p className="text-muted-foreground">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-muted-foreground">
                  {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}