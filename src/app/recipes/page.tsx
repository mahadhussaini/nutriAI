import AppLayout from '@/components/layout/AppLayout'
import OnboardingCheck from '@/components/layout/OnboardingCheck'
import RecipeFinder from '@/components/features/RecipeFinder'

export default function RecipesPage() {
  return (
    <OnboardingCheck>
      <AppLayout>
        <div className="px-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Recipe Generator</h1>
            <p className="text-muted-foreground mt-2">
              Create healthy recipes from your available ingredients using AI
            </p>
          </div>
          
          <RecipeFinder />
        </div>
      </AppLayout>
    </OnboardingCheck>
  )
}