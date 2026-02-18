'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { WeeklyReflection } from '@/lib/types'
import { generateUUID } from '@/lib/utils'
import { FiBookOpen, FiCheck } from 'react-icons/fi'

interface WeeklyReflectionFormProps {
  pactId: string
  pactTitle: string
  pactStartDate: string
  reflections: WeeklyReflection[]
  onSubmit: (reflection: WeeklyReflection) => void
}

function getCurrentWeekNumber(startDate: string): number {
  const start = new Date(startDate).getTime()
  const now = Date.now()
  return Math.max(1, Math.ceil((now - start) / (7 * 24 * 60 * 60 * 1000)))
}

const moodOptions = [
  { value: 'energized' as const, label: 'Energized', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { value: 'steady' as const, label: 'Steady', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'drained' as const, label: 'Drained', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'renewed' as const, label: 'Renewed', color: 'bg-purple-100 text-purple-700 border-purple-300' },
]

export default function WeeklyReflectionForm({ pactId, pactTitle, pactStartDate, reflections, onSubmit }: WeeklyReflectionFormProps) {
  const currentWeek = getCurrentWeekNumber(pactStartDate)
  const safeReflections = Array.isArray(reflections) ? reflections : []
  const existingReflection = safeReflections.find(r => r.weekNumber === currentWeek)

  const [whatWentWell, setWhatWentWell] = useState('')
  const [whatWasChallenging, setWhatWasChallenging] = useState('')
  const [lessonsLearned, setLessonsLearned] = useState('')
  const [recommitment, setRecommitment] = useState(`I recommit to ${pactTitle}`)
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [supporterHelpfulness, setSupporterHelpfulness] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [mood, setMood] = useState<'energized' | 'steady' | 'drained' | 'renewed'>('steady')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    const reflection: WeeklyReflection = {
      id: 'wr-' + generateUUID().slice(0, 8),
      pactId,
      weekNumber: currentWeek,
      weekStartDate: new Date(new Date(pactStartDate).getTime() + (currentWeek - 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      whatWentWell: whatWentWell.trim(),
      whatWasChallenging: whatWasChallenging.trim(),
      lessonsLearned: lessonsLearned.trim(),
      recommitment: recommitment.trim(),
      energyLevel,
      supporterHelpfulness,
      mood,
      createdAt: new Date().toISOString(),
    }
    onSubmit(reflection)
    setSubmitted(true)
  }

  const energyColors = ['bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-cyan-400', 'bg-emerald-400']
  const supporterColors = ['bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-cyan-400', 'bg-emerald-400']

  if (existingReflection || submitted) {
    const ref = existingReflection ?? safeReflections[safeReflections.length - 1]
    return (
      <Card className="glass-card rounded-xl border-[#00C4CC]/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FiBookOpen className="w-4 h-4 text-[#00C4CC]" />
              Week {ref?.weekNumber ?? currentWeek} Reflection
            </CardTitle>
            <Badge className="bg-emerald-100 text-emerald-700 text-[9px]">
              <FiCheck className="w-2.5 h-2.5 mr-0.5" />
              Completed
            </Badge>
          </div>
        </CardHeader>
        {ref && (
          <CardContent className="space-y-3">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">What went well</p>
              <p className="text-sm text-foreground">{ref.whatWentWell}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Challenges</p>
              <p className="text-sm text-foreground">{ref.whatWasChallenging}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Lessons learned</p>
              <p className="text-sm text-foreground">{ref.lessonsLearned}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#00C4CC]/5 border border-[#00C4CC]/15">
              <p className="text-[10px] font-semibold text-[#00C4CC] uppercase tracking-widest mb-0.5">Recommitment</p>
              <p className="text-sm text-foreground italic">{ref.recommitment}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Energy: {ref.energyLevel}/5</span>
              <span>Support: {ref.supporterHelpfulness}/5</span>
              <Badge className={moodOptions.find(m => m.value === ref.mood)?.color ?? 'bg-muted'}>
                {ref.mood}
              </Badge>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <Card className="glass-card rounded-xl border-[#00C4CC]/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FiBookOpen className="w-4 h-4 text-[#00C4CC]" />
          Weekly Reflection
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">Week {currentWeek} -- Ritualized recommitment strengthens identity change</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">What went well this week?</Label>
          <Textarea value={whatWentWell} onChange={e => setWhatWentWell(e.target.value)} placeholder="Describe your wins..." rows={2} className="rounded-xl bg-background/50 text-sm resize-none mt-1" />
        </div>
        <div>
          <Label className="text-xs">What was challenging?</Label>
          <Textarea value={whatWasChallenging} onChange={e => setWhatWasChallenging(e.target.value)} placeholder="What obstacles did you face..." rows={2} className="rounded-xl bg-background/50 text-sm resize-none mt-1" />
        </div>
        <div>
          <Label className="text-xs">What did you learn?</Label>
          <Textarea value={lessonsLearned} onChange={e => setLessonsLearned(e.target.value)} placeholder="Key insights from this week..." rows={2} className="rounded-xl bg-background/50 text-sm resize-none mt-1" />
        </div>
        <div>
          <Label className="text-xs">I recommit to...</Label>
          <Textarea value={recommitment} onChange={e => setRecommitment(e.target.value)} rows={2} className="rounded-xl bg-background/50 text-sm resize-none mt-1" />
        </div>
        <div>
          <Label className="text-xs mb-2 block">Energy level this week</Label>
          <div className="flex items-center gap-2">
            {([1, 2, 3, 4, 5] as const).map(level => (
              <button key={level} onClick={() => setEnergyLevel(level)} className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center text-xs font-bold text-white ${energyLevel >= level ? energyColors[level - 1] + ' border-transparent' : 'bg-muted/30 border-border text-muted-foreground'}`}>
                {level}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs mb-2 block">How helpful were your supporters?</Label>
          <div className="flex items-center gap-2">
            {([1, 2, 3, 4, 5] as const).map(level => (
              <button key={level} onClick={() => setSupporterHelpfulness(level)} className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center text-xs font-bold text-white ${supporterHelpfulness >= level ? supporterColors[level - 1] + ' border-transparent' : 'bg-muted/30 border-border text-muted-foreground'}`}>
                {level}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs mb-2 block">Overall mood</Label>
          <div className="grid grid-cols-2 gap-2">
            {moodOptions.map(m => (
              <button key={m.value} onClick={() => setMood(m.value)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${mood === m.value ? m.color : 'border-border text-muted-foreground hover:border-foreground/30'}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={!whatWentWell.trim() || !whatWasChallenging.trim()} className="w-full gropact-gradient text-white rounded-xl text-sm">
          Complete Reflection
        </Button>
      </CardContent>
    </Card>
  )
}
