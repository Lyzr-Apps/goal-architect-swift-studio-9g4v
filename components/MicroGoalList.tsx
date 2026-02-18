'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FiChevronDown, FiChevronRight, FiCalendar, FiTarget, FiShield, FiFilter } from 'react-icons/fi'
import type { MicroGoal, Verification } from '@/lib/types'

interface MicroGoalListProps {
  goals: MicroGoal[]
  onToggle?: (goalId: string) => void
  readOnly?: boolean
  verifications?: Verification[]
  onRequestVerification?: (goalId: string) => void
}

type SortOption = 'default' | 'difficulty' | 'dueDate' | 'status'

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

function getDifficultyOrder(difficulty: string): number {
  const d = (difficulty ?? '').toLowerCase()
  if (d === 'easy') return 0
  if (d === 'medium') return 1
  return 2
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function MicroGoalList({ goals, onToggle, readOnly = false, verifications, onRequestVerification }: MicroGoalListProps) {
  const safeGoals = Array.isArray(goals) ? goals : []
  const safeVerifications = Array.isArray(verifications) ? verifications : []
  const completedCount = safeGoals.filter(g => g.completed).length
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [showSortMenu, setShowSortMenu] = useState(false)

  const sortedGoals = [...safeGoals].sort((a, b) => {
    if (sortBy === 'difficulty') return getDifficultyOrder(a.difficulty) - getDifficultyOrder(b.difficulty)
    if (sortBy === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    if (sortBy === 'status') return (a.completed ? 1 : 0) - (b.completed ? 1 : 0)
    return 0
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {completedCount} of {safeGoals.length} completed
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">
            {safeGoals.length > 0 ? Math.round((completedCount / safeGoals.length) * 100) : 0}%
          </span>
          <div className="relative">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => setShowSortMenu(!showSortMenu)}>
              <FiFilter className="w-3 h-3" />
            </Button>
            {showSortMenu && (
              <div className="absolute right-0 top-7 z-10 bg-card border border-border rounded-lg shadow-lg p-1 min-w-[120px]">
                {([
                  { value: 'default', label: 'Default' },
                  { value: 'difficulty', label: 'Difficulty' },
                  { value: 'dueDate', label: 'Due Date' },
                  { value: 'status', label: 'Status' },
                ] as { value: SortOption; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setShowSortMenu(false) }}
                    className={`w-full text-left px-2 py-1 text-[11px] rounded transition-colors ${sortBy === opt.value ? 'bg-[#00C4CC]/10 text-[#00C4CC]' : 'text-foreground hover:bg-muted'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {sortedGoals.map((goal) => (
          <MicroGoalItem
            key={goal.id}
            goal={goal}
            onToggle={onToggle}
            readOnly={readOnly}
            verifications={safeVerifications}
            onRequestVerification={onRequestVerification}
          />
        ))}
      </div>

      {safeGoals.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">No micro-goals yet.</p>
      )}
    </div>
  )
}

function MicroGoalItem({
  goal,
  onToggle,
  readOnly,
  verifications,
  onRequestVerification,
}: {
  goal: MicroGoal
  onToggle?: (id: string) => void
  readOnly: boolean
  verifications: Verification[]
  onRequestVerification?: (goalId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  // Check if there is a verification tied to this goal (by note containing goal text)
  const relatedVerification = verifications.find(v =>
    (v.note ?? '').toLowerCase().includes((goal.goalText ?? '').toLowerCase().slice(0, 30))
  )

  const verificationStatus = relatedVerification?.status

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
              {/* Verification Status Badge */}
              {verificationStatus && (
                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 gap-0.5 ${verificationStatus === 'verified' ? 'text-emerald-600 border-emerald-200' : verificationStatus === 'disputed' ? 'text-red-600 border-red-200' : 'text-amber-600 border-amber-200'}`}>
                  <FiShield className="w-2.5 h-2.5" />
                  {verificationStatus}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {goal.completed && !verificationStatus && onRequestVerification && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] text-[#00C4CC] hover:text-[#00C4CC] gap-0.5 px-1.5"
                onClick={() => onRequestVerification(goal.id)}
              >
                <FiShield className="w-3 h-3" />
                Verify
              </Button>
            )}
            {goal.reasoning && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {expanded ? <FiChevronDown className="w-3.5 h-3.5" /> : <FiChevronRight className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
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
