'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FiChevronRight, FiTarget } from 'react-icons/fi'
import StreakCounter from '@/components/StreakCounter'
import type { Pact } from '@/lib/types'

interface PactCardProps {
  pact: Pact
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  paused: 'bg-amber-100 text-amber-700 border-amber-200',
  abandoned: 'bg-red-100 text-red-700 border-red-200',
}

const categoryColors: Record<string, string> = {
  Fitness: 'bg-orange-50 text-orange-600 border-orange-200',
  Learning: 'bg-blue-50 text-blue-600 border-blue-200',
  Creative: 'bg-purple-50 text-purple-600 border-purple-200',
  Wellness: 'bg-green-50 text-green-600 border-green-200',
  Career: 'bg-indigo-50 text-indigo-600 border-indigo-200',
}

export default function PactCard({ pact }: PactCardProps) {
  const goals = Array.isArray(pact.microGoals) ? pact.microGoals : []
  const nextGoal = goals.find(g => !g.completed)
  const supporters = Array.isArray(pact.supporters) ? pact.supporters : []
  const description = pact.description?.length > 120
    ? pact.description.slice(0, 120) + '...'
    : pact.description ?? ''

  return (
    <Link href={`/pacts/${pact.id}`} className="block group">
      <Card className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-[#00C4CC] transition-colors">
                {pact.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
            </div>
            <FiChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-[#00C4CC] transition-colors" />
          </div>

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge variant="outline" className={`text-[10px] px-2 py-0 border ${statusColors[pact.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {pact.status}
            </Badge>
            {pact.category && (
              <Badge variant="outline" className={`text-[10px] px-2 py-0 border ${categoryColors[pact.category] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {pact.category}
              </Badge>
            )}
            {pact.streak > 0 && <StreakCounter streak={pact.streak} variant="compact" />}
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">Progress</span>
              <span className="text-[10px] font-medium text-foreground">{pact.completionRate ?? 0}%</span>
            </div>
            <Progress value={pact.completionRate ?? 0} className="h-1.5" />
          </div>

          {nextGoal && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-1.5 mb-3">
              <FiTarget className="w-3 h-3 text-[#00C4CC] flex-shrink-0" />
              <span className="truncate">Next: {nextGoal.goalText}</span>
            </div>
          )}

          {supporters.length > 0 && (
            <div className="flex items-center gap-1">
              {supporters.slice(0, 3).map((s) => (
                <div key={s.id} className="w-6 h-6 rounded-full bg-[#00C4CC]/15 flex items-center justify-center text-[10px] font-semibold text-[#00C4CC] border border-[#00C4CC]/20">
                  {(s.name ?? '?')[0]?.toUpperCase()}
                </div>
              ))}
              {supporters.length > 3 && (
                <span className="text-[10px] text-muted-foreground ml-1">+{supporters.length - 3}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
