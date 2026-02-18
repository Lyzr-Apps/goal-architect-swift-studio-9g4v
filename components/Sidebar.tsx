'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FiZap, FiTarget, FiPlus, FiBookOpen, FiCheck, FiArrowUpRight } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import { usePacts } from '@/contexts/PactContext'
import StreakCounter from '@/components/StreakCounter'
import TrustScoreBadge from '@/components/TrustScoreBadge'
import SupporterFeed from '@/components/SupporterFeed'
import { getSupporterActivity } from '@/lib/store'
import type { SupporterActivity } from '@/lib/types'

export default function Sidebar() {
  const { user } = useAuth()
  const { activePacts, getActivePactWithNextGoal, toggleMicroGoal } = usePacts()
  const [activities, setActivities] = useState<SupporterActivity[]>([])
  const [nudgeIndex, setNudgeIndex] = useState(0)

  useEffect(() => {
    setActivities(getSupporterActivity())
    setNudgeIndex(Math.floor(Math.random() * 10))
  }, [])

  const nextGoalData = getActivePactWithNextGoal()

  const allNudges = activePacts.flatMap(p => Array.isArray(p.nudges) ? p.nudges : [])
  const currentNudge = allNudges.length > 0 ? allNudges[nudgeIndex % allNudges.length] : null

  const reflectionDue = activePacts.some(p => {
    const reflections = Array.isArray(p.weeklyReflections) ? p.weeklyReflections : []
    const startMs = new Date(p.startDate).getTime()
    const currentWeek = Math.max(1, Math.ceil((Date.now() - startMs) / (7 * 24 * 60 * 60 * 1000)))
    return !reflections.some(r => r.weekNumber === currentWeek)
  })

  const tier = user?.tier ?? 'free'

  return (
    <aside className="w-64 flex-shrink-0 space-y-4">
      {/* Quick Stats */}
      <Card className="glass-card rounded-xl">
        <CardContent className="p-4 space-y-3">
          <StreakCounter streak={user?.currentStreak ?? 0} variant="full" />
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-lg font-bold text-foreground">{user?.completionRate ?? 0}%</p>
              <p className="text-[10px] text-muted-foreground">Completion</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-lg font-bold text-foreground">{activePacts.length}</p>
              <p className="text-[10px] text-muted-foreground">Active Pacts</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <TrustScoreBadge score={user?.trustScore ?? 50} variant="compact" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Link href="/pacts/new">
        <Button className="w-full rounded-xl gropact-gradient text-white gap-2 text-sm">
          <FiPlus className="w-4 h-4" />
          New Pact
        </Button>
      </Link>

      {/* Today's Focus */}
      {nextGoalData && (
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3">
            <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <FiTarget className="w-3.5 h-3.5 text-[#00C4CC]" />
              Today&apos;s Focus
            </h4>
            <p className="text-xs text-foreground leading-relaxed">{nextGoalData.goal.goalText}</p>
            <div className="flex items-center justify-between mt-2">
              <Badge variant="outline" className="text-[9px]">{nextGoalData.goal.difficulty}</Badge>
              <Button size="sm" className="h-6 text-[10px] rounded-lg gropact-gradient text-white gap-1" onClick={() => toggleMicroGoal(nextGoalData.pact.id, nextGoalData.goal.id)}>
                <FiCheck className="w-3 h-3" />
                Complete
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{nextGoalData.pact.title}</p>
          </CardContent>
        </Card>
      )}

      {/* Weekly Reflection Reminder */}
      {reflectionDue && (
        <Card className="glass-card rounded-xl border-amber-200/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <FiBookOpen className="w-4 h-4 text-amber-500" />
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">Weekly Reflection Due</p>
                <Link href={`/pacts/${activePacts[0]?.id ?? ''}`} className="text-[10px] text-[#00C4CC] flex items-center gap-0.5 hover:underline">
                  Reflect Now <FiArrowUpRight className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supporter Activity */}
      <Card className="glass-card rounded-xl">
        <CardContent className="p-3">
          <h4 className="text-xs font-semibold text-foreground mb-2">Supporter Activity</h4>
          <SupporterFeed activities={activities.slice(0, 3)} compact />
        </CardContent>
      </Card>

      {/* Behavioral Nudge */}
      {currentNudge && (
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <FiZap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-foreground">{currentNudge.nudgeText}</p>
                <Badge variant="outline" className="text-[8px] mt-1">{currentNudge.behavioralPrinciple}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Join a Room */}
      <Link href="/rooms" className="block">
        <Button variant="outline" className="w-full rounded-xl text-xs gap-1.5 h-8">
          <FiTarget className="w-3.5 h-3.5" />
          Join a Room
        </Button>
      </Link>

      {/* Upgrade Card */}
      {tier === 'free' && (
        <Card className="rounded-xl border-[#00C4CC]/20 bg-gradient-to-br from-[#00C4CC]/5 to-transparent">
          <CardContent className="p-3 text-center">
            <p className="text-xs font-medium text-foreground mb-1">Unlock Full Power</p>
            <p className="text-[10px] text-muted-foreground mb-2">AI Goal Architect, Verification Engine, Progress Cards</p>
            <Link href="/settings">
              <Button size="sm" className="h-7 text-[10px] rounded-lg gropact-gradient text-white">
                Upgrade
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </aside>
  )
}
