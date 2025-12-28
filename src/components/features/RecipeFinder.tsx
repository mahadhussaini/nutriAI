'use client'

import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { useMealStore } from '@/store/mealStore'
// Removed direct AI service import - now using API routes

import { Search, Plus, Clock, Users, ChefHat, Loader2, Heart, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Recipe } from '@/types'

export default function RecipeFinder() {
  const { profile } = useUserStore()
  const { 
    searchResults, 
    isSearching, 
    savedRecipes, 
    addSavedRecipe, 
    removeSavedRecipe,
    setSearchResults,
    setIsSearching 
  } = useMealStore()
  
  const [ingredients, setIngredients] = useState<string[]>([])
  const [currentIngredient, setCurrentIngredient] = useState('')
  const [servings, setServings] = useState(4)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  const handleAddIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()])
      setCurrentIngredient('')
    }
  }

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient))
  }

  const handleSearchRecipes = async () => {
    if (ingredients.length === 0) return

    setIsSearching(true)
    try {
      const dietaryPreferences = profile?.dietaryPreferences || []

      // Call AI recipe API route
      const apiResponse = await fetch('/api/ai/recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: ingredients,
          dietaryPreferences: dietaryPreferences,
          servings: servings,
        }),
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(errorData.error || 'Failed to generate recipe')
      }

      const data = await apiResponse.json()
      const recipe = data.recipe
      
      setSearchResults([recipe])
    } catch (error) {
      console.error('Error generating recipe:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSaveRecipe = (recipe: Recipe) => {
    addSavedRecipe(recipe)
  }

  const handleUnsaveRecipe = (recipeId: string) => {
    removeSavedRecipe(recipeId)
  }

  const isRecipeSaved = (recipeId: string) => {
    return savedRecipes.some(r => r.id === recipeId)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
    <Card className="h-full card-hover hover-lift">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-primary">{recipe.name}</CardTitle>
            <CardDescription className="mt-1">{recipe.description}</CardDescription>
          </div>
          <Button
            variant={isRecipeSaved(recipe.id) ? "default" : "outline"}
            size="sm"
            onClick={() => isRecipeSaved(recipe.id) 
              ? handleUnsaveRecipe(recipe.id) 
              : handleSaveRecipe(recipe)
            }
            className="button-hover hover-lift"
          >
            <Heart 
              className={`w-4 h-4 ${isRecipeSaved(recipe.id) ? 'fill-current' : ''}`} 
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recipe Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {recipe.preparationTime + recipe.cookingTime} min
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {recipe.servings} servings
            </div>
          </div>
          <Badge className={getDifficultyColor(recipe.difficulty)}>
            {recipe.difficulty}
          </Badge>
        </div>

        {/* Nutrition Info */}
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div>
            <p className="font-medium">{recipe.nutrition.calories}</p>
            <p className="text-muted-foreground">cal</p>
          </div>
          <div>
            <p className="font-medium">{recipe.nutrition.protein}g</p>
            <p className="text-muted-foreground">protein</p>
          </div>
          <div>
            <p className="font-medium">{recipe.nutrition.carbs}g</p>
            <p className="text-muted-foreground">carbs</p>
          </div>
          <div>
            <p className="font-medium">{recipe.nutrition.fat}g</p>
            <p className="text-muted-foreground">fat</p>
          </div>
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Button 
          variant="outline" 
          className="w-full button-hover hover-lift"
          onClick={() => setSelectedRecipe(recipe)}
        >
          <ChefHat className="w-4 h-4 mr-2" />
          View Recipe
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Recipe Generator */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2 text-primary" />
            Recipe Generator
          </CardTitle>
          <CardDescription>
                          Tell me what ingredients you have, and I&apos;ll create a healthy recipe for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ingredient Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Available Ingredients</label>
            <div className="flex space-x-2">
              <Input
                placeholder="e.g., chicken breast, broccoli, rice..."
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
              />
              <Button onClick={handleAddIngredient} disabled={!currentIngredient.trim()} className="button-hover hover-lift">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Ingredient Tags */}
            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {ingredients.map((ingredient, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {ingredient}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => handleRemoveIngredient(ingredient)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Servings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Servings</label>
              <Input
                type="number"
                min="1"
                max="12"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 4)}
              />
            </div>
          </div>

          <Button 
            onClick={handleSearchRecipes} 
            disabled={ingredients.length === 0 || isSearching}
            className="w-full button-hover gradient-primary"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 spinner" />
                Creating Recipe...
              </>
            ) : (
              <>
                <ChefHat className="w-4 h-4 mr-2" />
                Generate Recipe
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated Recipe</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}

      {/* Saved Recipes */}
      {savedRecipes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Saved Recipes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedRecipe.name}</CardTitle>
                  <CardDescription>{selectedRecipe.description}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRecipe(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recipe Info */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Prep Time</p>
                  <p className="font-medium">{selectedRecipe.preparationTime} min</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cook Time</p>
                  <p className="font-medium">{selectedRecipe.cookingTime} min</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Servings</p>
                  <p className="font-medium">{selectedRecipe.servings}</p>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h4 className="font-semibold mb-2">Ingredients</h4>
                <ul className="space-y-1">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-sm">
                      • {ingredient.amount} {ingredient.unit} {ingredient.name}
                      {ingredient.optional && <span className="text-muted-foreground"> (optional)</span>}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="font-semibold mb-2">Instructions</h4>
                <ol className="space-y-2">
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-medium">{index + 1}.</span> {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Nutrition */}
              <div>
                <h4 className="font-semibold mb-2">Nutrition per serving</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Calories: {selectedRecipe.nutrition.calories}</div>
                  <div>Protein: {selectedRecipe.nutrition.protein}g</div>
                  <div>Carbohydrates: {selectedRecipe.nutrition.carbs}g</div>
                  <div>Fat: {selectedRecipe.nutrition.fat}g</div>
                  <div>Fiber: {selectedRecipe.nutrition.fiber}g</div>
                  <div>Sugar: {selectedRecipe.nutrition.sugar}g</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}