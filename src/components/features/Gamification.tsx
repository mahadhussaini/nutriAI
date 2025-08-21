'use client'

import { useState, useMemo } from 'react'
import { useUserStore } from '@/store/userStore'
import { useMealStore } from '@/store/mealStore'

import { 
  Award, 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Calendar, 
  Droplets,
  Heart,
  TrendingUp,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge as UIBadge } from '@/components/ui/badge'
import type { Badge, BadgeCategory } from '@/types'

// Predefined badges system
const availableBadges: Badge[] = [
  {
    id: 'hydration_hero',
    name: 'Hydration Hero',
    description: 'Drink your daily water goal for 7 days straight',
    icon: '💧',
    category: 'hydration',
    criteria: { type: 'streak', value: 7, metric: 'water_goal' }
  },
  {
    id: 'meal_planner',
    name: 'Meal Planner',
    description: 'Log all meals for 5 consecutive days',
    icon: '📋',
    category: 'consistency',
    criteria: { type: 'streak', value: 5, metric: 'complete_logging' }
  },
  {
    id: 'protein_power',
    name: 'Protein Power',
    description: 'Meet your protein goals for 10 days',
    icon: '💪',
    category: 'nutrition',
    criteria: { type: 'total', value: 10, metric: 'protein_goal' }
  },
  {
    id: 'calorie_conscious',
    name: 'Calorie Conscious',
    description: 'Stay within 100 calories of your target for 7 days',
    icon: '🎯',
    category: 'nutrition',
    criteria: { type: 'streak', value: 7, metric: 'calorie_accuracy' }
  },
  {
    id: 'veggie_lover',
    name: 'Veggie Lover',
    description: 'Log vegetables in 15 different meals',
    icon: '🥗',
    category: 'nutrition',
    criteria: { type: 'total', value: 15, metric: 'vegetable_meals' }
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Log meals for 30 consecutive days',
    icon: '🔥',
    category: 'consistency',
    criteria: { type: 'streak', value: 30, metric: 'daily_logging' }
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Log breakfast before 9 AM for 7 days',
    icon: '🌅',
    category: 'consistency',
    criteria: { type: 'streak', value: 7, metric: 'early_breakfast' }
  },
  {
    id: 'balanced_diet',
    name: 'Balanced Diet',
    description: 'Hit all macro targets in a single day',
    icon: '⚖️',
    category: 'nutrition',
    criteria: { type: 'achievement', value: 1, metric: 'macro_balance' }
  },
  {
    id: 'recipe_explorer',
    name: 'Recipe Explorer',
    description: 'Try 10 different AI-generated recipes',
    icon: '👨‍🍳',
    category: 'goals',
    criteria: { type: 'total', value: 10, metric: 'recipes_tried' }
  },
  {
    id: 'goal_crusher',
    name: 'Goal Crusher',
    description: 'Achieve your weekly nutrition goal',
    icon: '🏆',
    category: 'goals',
    criteria: { type: 'achievement', value: 1, metric: 'weekly_goal' }
  }
]

export default function Gamification() {
  const { badges: userBadges, currentStreak } = useUserStore()
  const { foodLogs } = useMealStore()
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all')

  // Mock progress data - in real app this would be calculated from actual user data
  const mockProgress = useMemo(() => {
    return availableBadges.map(badge => {
      const userBadge = userBadges.find(ub => ub.badge.id === badge.id)
      if (userBadge) {
        return { badge, progress: 100, earned: true, earnedAt: userBadge.earnedAt }
      }

      // Simulate progress based on badge type
      let progress = 0
      switch (badge.id) {
        case 'hydration_hero':
          progress = Math.min((currentStreak * 14), 100) // Simulate hydration streak
          break
        case 'meal_planner':
          progress = Math.min((foodLogs.length * 20), 100)
          break
        case 'protein_power':
          progress = Math.min((currentStreak * 10), 100)
          break
        case 'calorie_conscious':
          progress = Math.min((currentStreak * 15), 100)
          break
        case 'veggie_lover':
          progress = Math.min((foodLogs.length * 6.67), 100) // 15 meals needed
          break
        case 'streak_master':
          progress = Math.min((currentStreak * 3.33), 100) // 30 days needed
          break
        case 'early_bird':
          progress = Math.min((currentStreak * 14), 100)
          break
        case 'balanced_diet':
          progress = Math.random() * 80 // Random progress for demo
          break
        case 'recipe_explorer':
          progress = Math.min((foodLogs.length * 10), 100) // 10 recipes needed
          break
        case 'goal_crusher':
          progress = Math.random() * 90 // Random progress for demo
          break
        default:
          progress = Math.random() * 60
      }

      return { badge, progress, earned: false }
    })
  }, [userBadges, currentStreak, foodLogs])

  const categories: { key: BadgeCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', icon: <Star className="w-4 h-4" /> },
    { key: 'nutrition', label: 'Nutrition', icon: <Heart className="w-4 h-4" /> },
    { key: 'hydration', label: 'Hydration', icon: <Droplets className="w-4 h-4" /> },
    { key: 'consistency', label: 'Consistency', icon: <Calendar className="w-4 h-4" /> },
    { key: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> }
  ]

  const filteredBadges = mockProgress.filter(item => 
    selectedCategory === 'all' || item.badge.category === selectedCategory
  )

  const earnedBadges = mockProgress.filter(item => item.earned)
  const totalPoints = earnedBadges.length * 100 + mockProgress.reduce((sum, item) => 
    sum + (item.earned ? 0 : item.progress), 0
  )

  const getBadgeIcon = (iconString: string) => {
    // For demo, return the emoji. In a real app, you might map to actual icon components
    return <span className="text-2xl">{iconString}</span>
  }

  const getCategoryColor = (category: BadgeCategory) => {
    switch (category) {
      case 'nutrition': return 'bg-green-100 text-green-800'
      case 'hydration': return 'bg-blue-100 text-blue-800'
      case 'consistency': return 'bg-purple-100 text-purple-800'
      case 'goals': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{Math.round(totalPoints)}</div>
            <p className="text-xs text-muted-foreground">
              Keep logging to earn more!
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{earnedBadges.length}</div>
            <p className="text-xs text-muted-foreground">
              of {availableBadges.length} total badges
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              days of consistent logging
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Gallery</CardTitle>
          <CardDescription>
            Track your progress and earn badges for healthy habits
          </CardDescription>
        </CardHeader>
        <CardContent>
                      <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.key)}
                  className="flex items-center gap-2 button-hover hover-lift"
                >
                  {category.icon}
                  {category.label}
                </Button>
              ))}
            </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((item) => (
                             <Card 
                 key={item.badge.id} 
                 className={`relative transition-all duration-200 card-hover ${
                   item.earned 
                     ? 'ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 hover-lift' 
                     : 'hover:shadow-md hover-lift'
                 }`}
               >
                {item.earned && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="text-center space-y-3">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                      item.earned ? 'bg-yellow-200' : 'bg-muted'
                    }`}>
                      {getBadgeIcon(item.badge.icon)}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">{item.badge.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.badge.description}</p>
                    </div>

                    <UIBadge className={getCategoryColor(item.badge.category)}>
                      {item.badge.category}
                    </UIBadge>

                                         {!item.earned && (
                       <div className="space-y-2">
                         <Progress value={item.progress} className="h-2 progress-animate" />
                         <p className="text-xs text-muted-foreground">
                           {Math.round(item.progress)}% complete
                         </p>
                       </div>
                     )}

                    {item.earned && item.earnedAt && (
                      <p className="text-xs text-muted-foreground">
                        Earned on {new Date(item.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {earnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Recent Achievements
            </CardTitle>
            <CardDescription>
              Your latest earned badges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {earnedBadges.slice(0, 4).map((item, index) => (
                <div key={index} className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl mb-2">{item.badge.icon}</div>
                  <p className="font-medium text-sm">{item.badge.name}</p>
                  {item.earnedAt && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}