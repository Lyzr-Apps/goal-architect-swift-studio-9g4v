'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import PactCard from '@/components/PactCard'
import StreakCounter from '@/components/StreakCounter'
import TrustScoreBadge from '@/components/TrustScoreBadge'
import SupporterFeed from '@/components/SupporterFeed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { usePacts } from '@/contexts/PactContext'
import { getSupporterActivity, addSupporterActivity } from '@/lib/store'
import type { SupporterActivity } from '@/lib/types'
import {
  FiPlus, FiTarget, FiTrendingUp, FiZap, FiAward,
  FiCalendar, FiCheck, FiChevronRight, FiActivity,
  FiShield, FiBookOpen, FiArrowUpRight,
} from 'react-icons/fi'

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

const moodColors: Record<string, string> = {
  great: 'bg-emerald-100 text-emerald-700',
  good: 'bg-cyan-100 text-cyan-700',
  okay: 'bg-amber-100 text-amber-700',
  tough: 'bg-red-100 text-red-700',
}

const tierLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-gray-100 text-gray-700' },
  mid: { label: 'Growth', color: 'bg-blue-100 text-blue-700' },
  premium: { label: 'Pro', color: 'bg-[#00C4CC]/10 text-[#00C4CC]' },
}

function DashboardContent() {
  const { user } = useAuth()
  const { pacts, activePacts, getActivePactWithNextGoal, toggleMicroGoal } = usePacts()
  const [activities, setActivities] = useState<SupporterActivity[]>([])
  const [nudgeIndex, setNudgeIndex] = useState(0)

  useEffect(() => {
    setActivities(getSupporterActivity())
    setNudgeIndex(Math.floor(Math.random() * 10))
  }, [])

  const allCheckIns = useMemo(() => {
    return pacts
      .flatMap(p => (Array.isArray(p.checkIns) ? p.checkIns : []).map(ci => ({ ...ci, pactTitle: p.title })))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [pacts])

  const recentCheckIns = allCheckIns.slice(0, 3)

  const upcomingGoals = useMemo(() => {
    return activePacts
      .flatMap(p => (Array.isArray(p.microGoals) ? p.microGoals : [])
        .filter(g => !g.completed)
        .map(g => ({ ...g, pactTitle: p.title, pactId: p.id })))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
  }, [activePacts])

  const nextGoalData = getActivePactWithNextGoal()

  const reflectionDuePacts = activePacts.filter(p => {
    const reflections = Array.isArray(p.weeklyReflections) ? p.weeklyReflections : []
    const startMs = new Date(p.startDate).getTime()
    const currentWeek = Math.max(1, Math.ceil((Date.now() - startMs) / (7 * 24 * 60 * 60 * 1000)))
    return !reflections.some(r => r.weekNumber === currentWeek)
  })

  const allNudges = activePacts.flatMap(p => Array.isArray(p.nudges) ? p.nudges : [])
  const currentNudge = allNudges.length > 0 ? allNudges[nudgeIndex % allNudges.length] : null

  const tier = user?.tier ?? 'free'
  const tierInfo = tierLabels[tier] ?? tierLabels.free

  const totalVerifications = pacts.reduce((sum, p) => {
    const vs = Array.isArray(p.verifications) ? p.verifications : []
    return sum + vs.filter(v => v.status === 'verified').length
  }, 0)

  const handleSendEncouragement = (message: string) => {
    const activity: SupporterActivity = {
      id: 'sa-' + Date.now().toString(36),
      type: 'encouragement',
      supporterName: user?.name ?? 'You',
      pactTitle: activePacts[0]?.title ?? '',
      pactId: activePacts[0]?.id ?? '',
      content: message,
      createdAt: new Date().toISOString(),
    }
    addSupporterActivity(activity)
    setActivities([activity, ...activities])
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here is your accountability overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`text-[10px] ${tierInfo.color}`}>{tierInfo.label}</Badge>
          <TrustScoreBadge score={user?.trustScore ?? 50} variant="compact" />
          <StreakCounter streak={user?.currentStreak ?? 0} variant="compact" />
        </div>
      </div>

      {/* Weekly Reflection Reminder */}
      {reflectionDuePacts.length > 0 && (
        <Card className="rounded-xl border-amber-200/50 bg-amber-50/30">
          <CardContent className="p-4 flex items-center gap-3">
            <FiBookOpen className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Time for your weekly reflection</p>
              <p className="text-xs text-muted-foreground">{reflectionDuePacts[0]?.title} is due for a weekly reflection</p>
            </div>
            <Link href={`/pacts/${reflectionDuePacts[0]?.id ?? ''}`}>
              <Button size="sm" className="h-7 text-xs rounded-lg gropact-gradient text-white gap-1">
                Reflect <FiArrowUpRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Today's Focus */}
      {nextGoalData && (
        <Card className="glass-card-strong rounded-xl border-[#00C4CC]/20">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl gropact-gradient flex items-center justify-center flex-shrink-0">
                <FiTarget className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-[#00C4CC] uppercase tracking-widest mb-0.5">Today&apos;s Focus</p>
                <p className="text-sm font-medium text-foreground">{nextGoalData.goal.goalText}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[9px]">{nextGoalData.goal.difficulty}</Badge>
                  <p className="text-[11px] text-muted-foreground">{nextGoalData.pact.title}</p>
                </div>
                {nextGoalData.goal.reasoning && (
                  <p className="text-[10px] text-muted-foreground mt-1 italic line-clamp-1">{nextGoalData.goal.reasoning}</p>
                )}
              </div>
              <Button size="sm" className="h-8 rounded-lg gropact-gradient text-white text-xs gap-1" onClick={() => toggleMicroGoal(nextGoalData.pact.id, nextGoalData.goal.id)}>
                <FiCheck className="w-3 h-3" />
                Complete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <FiTarget className="w-4 h-4 text-[#00C4CC] mx-auto mb-0.5" />
            <p className="text-lg font-bold text-foreground">{user?.totalPacts ?? pacts.length}</p>
            <p className="text-[9px] text-muted-foreground">Total Pacts</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <FiTrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-0.5" />
            <p className="text-lg font-bold text-foreground">{user?.completionRate ?? 0}%</p>
            <p className="text-[9px] text-muted-foreground">Completion</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <FiZap className="w-4 h-4 text-amber-500 mx-auto mb-0.5" />
            <p className="text-lg font-bold text-foreground">{user?.currentStreak ?? 0}</p>
            <p className="text-[9px] text-muted-foreground">Streak</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <FiAward className="w-4 h-4 text-purple-500 mx-auto mb-0.5" />
            <p className="text-lg font-bold text-foreground">{user?.longestStreak ?? 0}</p>
            <p className="text-[9px] text-muted-foreground">Best Streak</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <FiShield className="w-4 h-4 text-emerald-600 mx-auto mb-0.5" />
            <p className="text-lg font-bold text-foreground">{totalVerifications}</p>
            <p className="text-[9px] text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <FiActivity className="w-4 h-4 text-[#00C4CC] mx-auto mb-0.5" />
            <p className="text-lg font-bold text-foreground">{user?.trustScore ?? 50}</p>
            <p className="text-[9px] text-muted-foreground">Trust</p>
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

      {/* Activity + Upcoming + Nudge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Check-ins */}
        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FiActivity className="w-4 h-4 text-[#00C4CC]" />
              Recent Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCheckIns.length > 0 ? (
              recentCheckIns.map((ci) => (
                <div key={ci.id} className="flex items-start gap-2">
                  <Badge className={`text-[9px] px-1.5 py-0 flex-shrink-0 mt-0.5 ${moodColors[ci.mood] ?? 'bg-muted'}`}>
                    {ci.mood}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{ci.note || 'Check-in recorded'}</p>
                    <p className="text-[10px] text-muted-foreground">{(ci as any).pactTitle} - {formatDate(ci.date)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">No check-ins yet.</p>
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
                    <p className="text-[10px] text-muted-foreground">Due {formatDate(goal.dueDate)}</p>
                  </div>
                  <FiChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">No upcoming goals.</p>
            )}
          </CardContent>
        </Card>

        {/* Behavioral Nudge */}
        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FiZap className="w-4 h-4 text-amber-500" />
              Behavioral Nudge
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentNudge ? (
              <div>
                <p className="text-xs text-foreground leading-relaxed">{currentNudge.nudgeText}</p>
                <Badge variant="outline" className="text-[9px] mt-2">{currentNudge.behavioralPrinciple}</Badge>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">Create a pact with AI to receive behavioral nudges.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Supporter Activity Feed */}
      <Card className="glass-card rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Supporter Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <SupporterFeed
            activities={activities}
            onSendEncouragement={handleSendEncouragement}
          />
        </CardContent>
      </Card>

      {/* Upgrade prompt for free tier */}
      {tier === 'free' && (
        <Card className="rounded-xl border-[#00C4CC]/20 bg-gradient-to-r from-[#00C4CC]/5 to-transparent">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Unlock AI Goal Architect and Verification Engine</p>
              <p className="text-xs text-muted-foreground">Get GroPact Pro for just $9.99/month</p>
            </div>
            <Link href="/settings">
              <Button size="sm" className="h-8 text-xs rounded-lg gropact-gradient text-white">
                Upgrade
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
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
