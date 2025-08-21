import AppLayout from '@/components/layout/AppLayout'
import OnboardingCheck from '@/components/layout/OnboardingCheck'
import FoodLogger from '@/components/features/FoodLogger'

export default function FoodLogPage() {
  return (
    <OnboardingCheck>
      <AppLayout>
        <div className="px-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Food Logger</h1>
            <p className="text-muted-foreground mt-2">
              Log your meals with AI-powered food recognition and nutritional analysis
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <FoodLogger />
          </div>
        </div>
      </AppLayout>
    </OnboardingCheck>
  )
}