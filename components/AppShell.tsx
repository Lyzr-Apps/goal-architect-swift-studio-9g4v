'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { PactProvider } from '@/contexts/PactContext'
import { RoomProvider } from '@/contexts/RoomContext'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { Skeleton } from '@/components/ui/skeleton'

interface AppShellProps {
  children: ReactNode
  showSidebar?: boolean
}

export default function AppShell({ children, showSidebar = true }: AppShellProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else {
        setReady(true)
      }
    }
  }, [loading, isAuthenticated, router])

  if (loading || !ready) {
    return (
      <div className="min-h-screen">
        <div className="sticky top-0 z-40 glass-card-strong border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center">
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 rounded-lg" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <PactProvider>
      <RoomProvider>
        <div className="min-h-screen">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex gap-6">
              {showSidebar && (
                <div className="hidden lg:block">
                  <Sidebar />
                </div>
              )}
              <main className="flex-1 min-w-0">
                {children}
              </main>
            </div>
          </div>
        </div>
      </RoomProvider>
    </PactProvider>
  )
}
