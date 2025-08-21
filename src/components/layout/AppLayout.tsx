'use client'

import { ReactNode } from 'react'
import Navigation from './Navigation'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />
      
      {/* Main content */}
      <div className="flex-1 lg:pl-72 relative">
        {/* Mobile header space */}
        <div className="lg:hidden" style={{ height: 'calc(4rem + env(safe-area-inset-top, 0px))' }} />
        
        {/* Page content */}
        <main className="flex-1 focus:outline-none relative z-10">
          <div className="py-6 px-4 lg:px-8 max-w-7xl mx-auto">
            <div className="slide-in-up">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}