'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  User, 
  Calendar, 
  BookOpen, 
  Camera, 
  BarChart3, 
  MessageCircle, 
  Trophy,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Logo } from '@/components/ui/logo'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Meal Plan', href: '/meal-plan', icon: Calendar },
  { name: 'Recipes', href: '/recipes', icon: BookOpen },
  { name: 'Food Log', href: '/food-log', icon: Camera },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
  { name: 'AI Coach', href: '/coach', icon: MessageCircle },
  { name: 'Achievements', href: '/achievements', icon: Trophy },
]

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:w-72 lg:bg-gradient-to-b lg:from-card lg:via-card lg:to-muted/30 lg:border-r-2 lg:border-primary/20 lg:shadow-2xl">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-20 px-6 bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground justify-between shadow-lg">
            <Logo size="lg" showText={true} className="text-primary-foreground" />
            <ThemeToggle />
          </div>
          
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            <nav className="mt-6 flex-1 px-4 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover-lift',
                      isActive
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg transform scale-105'
                        : 'text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground hover:shadow-md hover:scale-102'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-4 flex-shrink-0 h-5 w-5 transition-all duration-200',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
                      )}
                    />
                    <span className="font-semibold">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile menu button */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-card to-muted/50 border-b-2 border-primary/20 px-4 py-3 shadow-lg" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}>
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden button-hover hover-lift"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-card via-card to-muted/30 border-r-2 border-primary/20 shadow-2xl">
              <div className="flex items-center h-20 px-6 bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground justify-between shadow-lg" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                <Logo size="lg" showText={true} className="text-primary-foreground" />
                <ThemeToggle />
              </div>
              
              <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
                <nav className="mt-6 flex-1 px-4 space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover-lift',
                          isActive
                            ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg transform scale-105'
                            : 'text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground hover:shadow-md hover:scale-102'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'mr-4 flex-shrink-0 h-5 w-5 transition-all duration-200',
                            isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
                          )}
                        />
                        <span className="font-semibold">{item.name}</span>
                        {isActive && (
                          <div className="ml-auto w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}