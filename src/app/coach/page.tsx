import AppLayout from '@/components/layout/AppLayout'
import OnboardingCheck from '@/components/layout/OnboardingCheck'
import AICoach from '@/components/features/AICoach'

export default function CoachPage() {
  return (
    <OnboardingCheck>
      <AppLayout>
        <div className="px-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">AI Nutrition Coach</h1>
            <p className="text-muted-foreground mt-2">
              Get personalized nutrition advice and answer your healthy eating questions
            </p>
          </div>
          
          <div className="max-w-4xl">
            <AICoach />
          </div>
        </div>
      </AppLayout>
    </OnboardingCheck>
  )
}