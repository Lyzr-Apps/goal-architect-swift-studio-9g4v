'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FiCheck, FiActivity } from 'react-icons/fi'
import type { DailyCheckIn, MicroGoal } from '@/lib/types'
import { generateUUID } from '@/lib/utils'

interface CheckInFormProps {
  microGoals: MicroGoal[]
  onSubmit: (checkIn: DailyCheckIn) => void
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

export default function CheckInForm({ microGoals, onSubmit }: CheckInFormProps) {
  const [note, setNote] = useState('')
  const [mood, setMood] = useState<Mood | null>(null)
  const [completedGoals, setCompletedGoals] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

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
    setNote('')
    setMood(null)
    setCompletedGoals([])
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
                  <span className="text-xs text-foreground">{goal.goalText}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {submitted && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
            <FiCheck className="w-3.5 h-3.5" />
            Check-in recorded successfully!
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
