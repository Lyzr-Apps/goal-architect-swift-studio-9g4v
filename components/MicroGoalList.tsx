'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { FiChevronDown, FiChevronRight, FiCalendar, FiTarget } from 'react-icons/fi'
import type { MicroGoal } from '@/lib/types'

interface MicroGoalListProps {
  goals: MicroGoal[]
  onToggle?: (goalId: string) => void
  readOnly?: boolean
}

function getDifficultyColor(difficulty: string): string {
  const d = (difficulty ?? '').toLowerCase()
  if (d === 'easy') return 'bg-cyan-100 text-cyan-700 border-cyan-200'
  if (d === 'hard') return 'bg-red-100 text-red-700 border-red-200'
  return 'bg-amber-100 text-amber-700 border-amber-200'
}

function getDifficultyBorder(difficulty: string): string {
  const d = (difficulty ?? '').toLowerCase()
  if (d === 'easy') return 'border-l-cyan-500'
  if (d === 'hard') return 'border-l-red-500'
  return 'border-l-amber-500'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function MicroGoalList({ goals, onToggle, readOnly = false }: MicroGoalListProps) {
  const safeGoals = Array.isArray(goals) ? goals : []
  const completedCount = safeGoals.filter(g => g.completed).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {completedCount} of {safeGoals.length} completed
        </span>
        <span className="text-xs font-medium text-foreground">
          {safeGoals.length > 0 ? Math.round((completedCount / safeGoals.length) * 100) : 0}%
        </span>
      </div>

      <div className="space-y-2">
        {safeGoals.map((goal) => (
          <MicroGoalItem
            key={goal.id}
            goal={goal}
            onToggle={onToggle}
            readOnly={readOnly}
          />
        ))}
      </div>

      {safeGoals.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">No micro-goals yet.</p>
      )}
    </div>
  )
}

function MicroGoalItem({ goal, onToggle, readOnly }: { goal: MicroGoal; onToggle?: (id: string) => void; readOnly: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-xl border border-l-4 ${getDifficultyBorder(goal.difficulty)} bg-card/80 backdrop-blur-sm transition-all duration-200 hover:shadow-md ${goal.completed ? 'opacity-70' : ''}`}>
      <div className="p-3">
        <div className="flex items-start gap-3">
          {!readOnly && (
            <Checkbox
              checked={goal.completed}
              onCheckedChange={() => onToggle?.(goal.id)}
              className="mt-0.5 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium text-foreground leading-relaxed ${goal.completed ? 'line-through' : ''}`}>
              {goal.goalText}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getDifficultyColor(goal.difficulty)}`}>
                {goal.difficulty}
              </Badge>
              {goal.dueDate && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <FiCalendar className="w-3 h-3" />
                  {formatDate(goal.dueDate)}
                </span>
              )}
              {goal.measurableOutcome && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <FiTarget className="w-3 h-3 text-[#00C4CC]" />
                  {goal.measurableOutcome}
                </span>
              )}
            </div>
          </div>
          {goal.reasoning && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <FiChevronDown className="w-3.5 h-3.5" /> : <FiChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
        {expanded && goal.reasoning && (
          <div className="mt-2 pt-2 border-t border-border/50 ml-8">
            <p className="text-xs text-muted-foreground leading-relaxed">{goal.reasoning}</p>
          </div>
        )}
      </div>
    </div>
  )
}
