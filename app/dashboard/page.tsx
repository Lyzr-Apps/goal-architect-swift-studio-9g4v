'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import PactCard from '@/components/PactCard'
import StreakCounter from '@/components/StreakCounter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { usePacts } from '@/contexts/PactContext'
import {
  FiPlus, FiTarget, FiTrendingUp, FiZap, FiAward,
  FiCalendar, FiCheck, FiChevronRight, FiActivity,
} from 'react-icons/fi'

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function DashboardContent() {
  const { user } = useAuth()
  const { pacts, activePacts } = usePacts()

  const allCheckIns = useMemo(() => {
    return pacts
      .flatMap(p => (Array.isArray(p.checkIns) ? p.checkIns : []).map(ci => ({ ...ci, pactTitle: p.title })))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [pacts])

  const recentCheckIns = allCheckIns.slice(0, 5)

  const upcomingGoals = useMemo(() => {
    return activePacts
      .flatMap(p => (Array.isArray(p.microGoals) ? p.microGoals : [])
        .filter(g => !g.completed)
        .map(g => ({ ...g, pactTitle: p.title, pactId: p.id })))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3)
  }, [activePacts])

  const todayFocus = upcomingGoals[0]

  const moodColors: Record<string, string> = {
    great: 'bg-emerald-100 text-emerald-700',
    good: 'bg-cyan-100 text-cyan-700',
    okay: 'bg-amber-100 text-amber-700',
    tough: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here is your accountability overview
          </p>
        </div>
        <StreakCounter streak={user?.currentStreak ?? 0} />
      </div>

      {/* Today's Focus */}
      {todayFocus && (
        <Card className="glass-card-strong rounded-xl border-[#00C4CC]/20">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl gropact-gradient flex items-center justify-center flex-shrink-0">
                <FiTarget className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-[#00C4CC] uppercase tracking-widest mb-0.5">Today&apos;s Focus</p>
                <p className="text-sm font-medium text-foreground">{todayFocus.goalText}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">from {todayFocus.pactTitle}</p>
              </div>
              <Link href={`/pacts/${todayFocus.pactId}`}>
                <Button size="sm" className="h-8 rounded-lg gropact-gradient text-white text-xs gap-1">
                  <FiCheck className="w-3 h-3" />
                  View
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4 text-center">
            <FiTarget className="w-5 h-5 text-[#00C4CC] mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{user?.totalPacts ?? pacts.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Pacts</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4 text-center">
            <FiTrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{user?.completionRate ?? 0}%</p>
            <p className="text-[10px] text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4 text-center">
            <FiZap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{user?.currentStreak ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Current Streak</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4 text-center">
            <FiAward className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{user?.longestStreak ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Longest Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Pacts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Active Pacts</h2>
          <Link href="/pacts/new">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-[#00C4CC] gap-1">
              <FiPlus className="w-3 h-3" />
              New Pact
            </Button>
          </Link>
        </div>
        {activePacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePacts.map((pact) => (
              <PactCard key={pact.id} pact={pact} />
            ))}
          </div>
        ) : (
          <Card className="glass-card rounded-xl">
            <CardContent className="p-8 text-center">
              <FiTarget className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-1">No active pacts</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first pact to start your accountability journey.</p>
              <Link href="/pacts/new">
                <Button className="rounded-xl gropact-gradient text-white gap-2">
                  <FiPlus className="w-4 h-4" />
                  Create Your First Pact
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity & Upcoming */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FiActivity className="w-4 h-4 text-[#00C4CC]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCheckIns.length > 0 ? (
              recentCheckIns.map((ci) => (
                <div key={ci.id} className="flex items-start gap-2">
                  <Badge className={`text-[9px] px-1.5 py-0 flex-shrink-0 mt-0.5 ${moodColors[ci.mood] ?? 'bg-muted text-muted-foreground'}`}>
                    {ci.mood}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{ci.note || 'Check-in recorded'}</p>
                    <p className="text-[10px] text-muted-foreground">{(ci as any).pactTitle} - {formatDate(ci.date)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">No check-ins yet. Start with your first pact!</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Goals */}
        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-[#00C4CC]" />
              Upcoming Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingGoals.length > 0 ? (
              upcomingGoals.map((goal) => (
                <Link key={goal.id} href={`/pacts/${goal.pactId}`} className="flex items-start gap-2 group">
                  <FiTarget className="w-3.5 h-3.5 text-[#00C4CC] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground group-hover:text-[#00C4CC] transition-colors truncate">{goal.goalText}</p>
                    <p className="text-[10px] text-muted-foreground">Due {formatDate(goal.dueDate)} - {goal.pactTitle}</p>
                  </div>
                  <FiChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">No upcoming goals.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AppShell showSidebar={true}>
      <DashboardContent />
    </AppShell>
  )
}
