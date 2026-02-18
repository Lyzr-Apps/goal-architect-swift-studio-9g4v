'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FiCheck, FiActivity, FiShield, FiStar, FiTrendingUp } from 'react-icons/fi'
import type { DailyCheckIn, MicroGoal, Verification } from '@/lib/types'
import { generateUUID } from '@/lib/utils'

interface CheckInFormProps {
  microGoals: MicroGoal[]
  onSubmit: (checkIn: DailyCheckIn) => void
  identityStatement?: string
  previousCheckIn?: DailyCheckIn | null
  onRequestVerification?: (verification: Verification) => void
  pactId?: string
}

type Mood = 'great' | 'good' | 'okay' | 'tough'

const moodOptions: { value: Mood; label: string }[] = [
  { value: 'great', label: 'Great' },
  { value: 'good', label: 'Good' },
  { value: 'okay', label: 'Okay' },
  { value: 'tough', label: 'Tough' },
]

const moodColors: Record<Mood, string> = {
  great: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  good: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  okay: 'bg-amber-100 text-amber-700 border-amber-300',
  tough: 'bg-red-100 text-red-700 border-red-300',
}

const moodActiveColors: Record<Mood, string> = {
  great: 'bg-emerald-500 text-white border-emerald-500',
  good: 'bg-cyan-500 text-white border-cyan-500',
  okay: 'bg-amber-500 text-white border-amber-500',
  tough: 'bg-red-500 text-white border-red-500',
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

export default function CheckInForm({ microGoals, onSubmit, identityStatement, previousCheckIn, onRequestVerification, pactId }: CheckInFormProps) {
  const [note, setNote] = useState('')
  const [mood, setMood] = useState<Mood | null>(null)
  const [completedGoals, setCompletedGoals] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [includeVerification, setIncludeVerification] = useState(false)
  const [verificationNote, setVerificationNote] = useState('')
  const [showPrevious, setShowPrevious] = useState(false)

  const safeGoals = Array.isArray(microGoals) ? microGoals.filter(g => !g.completed) : []

  const toggleGoal = (goalId: string) => {
    setCompletedGoals(prev =>
      prev.includes(goalId) ? prev.filter(id => id !== goalId) : [...prev, goalId]
    )
  }

  const handleSubmit = () => {
    if (!mood) return
    const checkIn: DailyCheckIn = {
      id: 'ci-' + generateUUID().slice(0, 8),
      date: new Date().toISOString(),
      note: note.trim(),
      mood,
      completedGoals,
    }
    onSubmit(checkIn)

    // Submit a self-report verification if requested
    if (includeVerification && onRequestVerification && pactId) {
      const verification: Verification = {
        id: 'ver-' + generateUUID().slice(0, 8),
        pactId,
        type: 'self_report',
        status: 'pending',
        evidence: verificationNote.trim() || `Check-in completed with mood: ${mood}. ${completedGoals.length} goal(s) done.`,
        createdAt: new Date().toISOString(),
        note: verificationNote.trim(),
      }
      onRequestVerification(verification)
    }

    setNote('')
    setMood(null)
    setCompletedGoals([])
    setIncludeVerification(false)
    setVerificationNote('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <Card className="glass-card rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FiActivity className="w-4 h-4 text-[#00C4CC]" />
          Daily Check-In
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Identity Statement Reminder */}
        {identityStatement && (
          <div className="p-3 rounded-lg bg-[#00C4CC]/5 border border-[#00C4CC]/15">
            <div className="flex items-start gap-2">
              <FiStar className="w-3.5 h-3.5 text-[#00C4CC] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-[#00C4CC] uppercase tracking-widest mb-0.5">Remember Your Identity</p>
                <p className="text-xs text-foreground italic leading-relaxed">{identityStatement}</p>
              </div>
            </div>
          </div>
        )}

        {/* Previous Check-in Comparison */}
        {previousCheckIn && (
          <div>
            <button
              onClick={() => setShowPrevious(!showPrevious)}
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <FiTrendingUp className="w-3 h-3" />
              {showPrevious ? 'Hide' : 'Show'} previous check-in
            </button>
            {showPrevious && (
              <div className="mt-1.5 p-2.5 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-[9px] px-1.5 py-0 ${moodColors[previousCheckIn.mood] ?? 'bg-muted'}`}>
                    {previousCheckIn.mood}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{formatDate(previousCheckIn.date)}</span>
                </div>
                <p className="text-xs text-foreground">{previousCheckIn.note || 'No note recorded'}</p>
                {Array.isArray(previousCheckIn.completedGoals) && previousCheckIn.completedGoals.length > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">Completed {previousCheckIn.completedGoals.length} goal(s)</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mood Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">How are you feeling today?</Label>
          <div className="flex gap-2">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setMood(option.value)}
                className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${mood === option.value ? moodActiveColors[option.value] : moodColors[option.value]}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">What did you accomplish or observe today?</Label>
          <Textarea
            placeholder="Write about your progress, challenges, or insights..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="rounded-xl bg-background/50 text-sm resize-none"
          />
        </div>

        {/* Goals Completed */}
        {safeGoals.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Goals completed today</Label>
            <div className="space-y-2">
              {safeGoals.map((goal) => (
                <div key={goal.id} className="flex items-start gap-2">
                  <Checkbox
                    checked={completedGoals.includes(goal.id)}
                    onCheckedChange={() => toggleGoal(goal.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-foreground">{goal.goalText}</span>
                    <Badge variant="outline" className={`text-[8px] ml-1.5 px-1 py-0 ${goal.difficulty === 'easy' ? 'text-cyan-600' : goal.difficulty === 'hard' ? 'text-red-600' : 'text-amber-600'}`}>
                      {goal.difficulty}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification Option */}
        {onRequestVerification && pactId && (
          <div className="space-y-2 p-3 rounded-lg border border-border/50 bg-muted/20">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={includeVerification}
                onCheckedChange={(checked) => setIncludeVerification(checked === true)}
              />
              <div className="flex items-center gap-1.5">
                <FiShield className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-foreground">Submit self-report verification</span>
              </div>
            </div>
            {includeVerification && (
              <Textarea
                placeholder="Optional: Add evidence or notes for verification..."
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                rows={2}
                className="rounded-xl bg-background/50 text-xs resize-none"
              />
            )}
          </div>
        )}

        {/* Status */}
        {submitted && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
            <FiCheck className="w-3.5 h-3.5" />
            Check-in recorded successfully!{includeVerification ? ' Verification submitted.' : ''}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!mood}
          className="w-full rounded-xl gropact-gradient text-white text-sm"
        >
          Submit Check-In
        </Button>
      </CardContent>
    </Card>
  )
}
