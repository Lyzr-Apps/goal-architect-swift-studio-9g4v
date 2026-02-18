'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FiUsers, FiCheck, FiShield, FiTrendingUp, FiCalendar } from 'react-icons/fi'
import type { WeeklyPlanDay, Verification } from '@/lib/types'

interface WeeklyPlanViewProps {
  plan: WeeklyPlanDay[]
  onToggle?: (dayIndex: number) => void
  readOnly?: boolean
  verifications?: Verification[]
}

const dayColors = [
  'bg-cyan-500', 'bg-cyan-600', 'bg-teal-500',
  'bg-cyan-500', 'bg-teal-600', 'bg-cyan-600', 'bg-teal-500',
]

export default function WeeklyPlanView({ plan, onToggle, readOnly = false, verifications }: WeeklyPlanViewProps) {
  const safePlan = Array.isArray(plan) ? plan : []
  const safeVerifications = Array.isArray(verifications) ? verifications : []
  const completedDays = safePlan.filter(d => d.completed).length
  const totalDays = safePlan.length
  const completionPercent = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
  const verifiedCount = safeVerifications.filter(v => v.status === 'verified').length

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <Card className="glass-card rounded-xl">
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <FiCalendar className="w-3.5 h-3.5 text-[#00C4CC]" />
                <span className="text-xs text-muted-foreground">
                  {completedDays} of {totalDays} days
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiTrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-muted-foreground">{completionPercent}%</span>
              </div>
              {verifiedCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <FiShield className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs text-muted-foreground">{verifiedCount} verified</span>
                </div>
              )}
            </div>
            <div className="flex gap-1">
              {safePlan.map((day, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold ${day.completed ? 'bg-[#00C4CC] text-white' : 'bg-muted text-muted-foreground'}`}
                >
                  {day.completed ? <FiCheck className="w-3 h-3" /> : (day.day ?? '').slice(0, 2)}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Timeline */}
      <div className="space-y-1">
        {safePlan.map((day, index) => {
          // Check if any verification is related to this day
          const dayVerification = safeVerifications.find(v =>
            (v.note ?? '').toLowerCase().includes((day.day ?? '').toLowerCase())
          )

          return (
            <div key={index} className="flex gap-3 group">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-lg ${day.completed ? 'bg-[#00C4CC]' : dayColors[index % 7]} flex items-center justify-center text-white text-xs font-bold`}>
                  {day.completed ? <FiCheck className="w-3.5 h-3.5" /> : (day.day ?? '').slice(0, 2)}
                </div>
                {index < safePlan.length - 1 && <div className="w-px h-full bg-border/50 mt-1" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-semibold text-foreground ${day.completed ? 'line-through opacity-60' : ''}`}>
                    {day.day ?? ''}
                  </p>
                  {!readOnly && (
                    <Checkbox
                      checked={day.completed}
                      onCheckedChange={() => onToggle?.(index)}
                      className="h-3.5 w-3.5"
                    />
                  )}
                  {/* Verification indicator */}
                  {dayVerification && (
                    <Badge variant="outline" className={`text-[8px] px-1 py-0 gap-0.5 ${dayVerification.status === 'verified' ? 'text-emerald-600 border-emerald-200' : 'text-amber-600 border-amber-200'}`}>
                      <FiShield className="w-2 h-2" />
                      {dayVerification.status}
                    </Badge>
                  )}
                </div>
                <p className={`text-sm text-foreground leading-relaxed ${day.completed ? 'line-through opacity-60' : ''}`}>
                  {day.microGoal ?? ''}
                </p>
                {day.reminder && (
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {day.reminder}
                  </p>
                )}
                {day.supporterPrompt && (
                  <div className="flex items-center gap-1 mt-1">
                    <FiUsers className="w-3 h-3 text-[#00C4CC] flex-shrink-0" />
                    <p className="text-[11px] text-[#00C4CC] leading-relaxed">{day.supporterPrompt}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {safePlan.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">No weekly plan generated yet.</p>
      )}
    </div>
  )
}
