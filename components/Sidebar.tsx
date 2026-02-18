'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FiZap, FiTrendingUp, FiTarget, FiPlus, FiCalendar } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import { usePacts } from '@/contexts/PactContext'
import StreakCounter from '@/components/StreakCounter'

export default function Sidebar() {
  const { user } = useAuth()
  const { pacts, activePacts } = usePacts()

  const allCheckIns = pacts.flatMap(p => Array.isArray(p.checkIns) ? p.checkIns : [])
  const recentCheckIns = allCheckIns
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  const nextGoal = activePacts
    .flatMap(p => (Array.isArray(p.microGoals) ? p.microGoals : []).filter(g => !g.completed).map(g => ({ ...g, pactTitle: p.title })))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]

  return (
    <aside className="w-64 flex-shrink-0 space-y-4">
      {/* Quick Stats */}
      <Card className="glass-card rounded-xl">
        <CardContent className="p-4 space-y-3">
          <StreakCounter streak={user?.currentStreak ?? 0} variant="full" />
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-lg font-bold text-foreground">{user?.completionRate ?? 0}%</p>
              <p className="text-[10px] text-muted-foreground">Completion</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-lg font-bold text-foreground">{activePacts.length}</p>
              <p className="text-[10px] text-muted-foreground">Active Pacts</p>
            </div>
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
      {nextGoal && (
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4">
            <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <FiTarget className="w-3.5 h-3.5 text-[#00C4CC]" />
              Today&apos;s Focus
            </h4>
            <p className="text-sm text-foreground leading-relaxed">{nextGoal.goalText}</p>
            <p className="text-[10px] text-muted-foreground mt-1">from {(nextGoal as any).pactTitle}</p>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {recentCheckIns.length > 0 && (
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4">
            <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <FiCalendar className="w-3.5 h-3.5 text-[#00C4CC]" />
              Recent Activity
            </h4>
            <div className="space-y-2">
              {recentCheckIns.map((ci) => (
                <div key={ci.id} className="text-xs text-muted-foreground">
                  <p className="text-foreground text-[11px] truncate">{ci.note || 'Check-in recorded'}</p>
                  <p className="text-[10px]">{new Date(ci.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </aside>
  )
}
