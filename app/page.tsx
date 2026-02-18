'use client'

import { useState, useCallback, useRef } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { useLyzrAgentEvents } from '@/lib/lyzrAgentEvents'
import { AgentActivityPanel } from '@/components/AgentActivityPanel'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  FiTarget, FiTrendingUp, FiUsers, FiCalendar, FiCopy, FiDownload,
  FiRefreshCw, FiPlus, FiTrash2, FiChevronDown, FiChevronRight,
  FiCheck, FiAlertCircle, FiStar, FiList, FiZap, FiSettings,
  FiActivity, FiArrowRight, FiBookOpen
} from 'react-icons/fi'

// ── Constants ──────────────────────────────────────────────────────
const AGENT_ID = '69951bcac0c7cf4934c52cc7'

const CATEGORIES = ['Health', 'Career', 'Learning', 'Finance', 'Fitness', 'Relationships', 'Personal Growth', 'Creative', 'Other']
const CADENCES = ['Daily', 'Weekly']

// ── TypeScript Interfaces ──────────────────────────────────────────
interface MicroGoal {
  goal_text: string
  difficulty: string
  due_date: string
  reasoning: string
  measurable_outcome: string
}

interface Nudge {
  nudge_text: string
  behavioral_principle: string
}

interface WeeklyPlanDay {
  day: string
  micro_goal: string
  reminder: string
  supporter_prompt: string
}

interface Explanations {
  pact_interpretation: string
  behavior_insights: string
  supporter_insights: string
}

interface DifficultyDistribution {
  easy_percent: number
  medium_percent: number
  hard_percent: number
}

interface WeeklyPlanOutput {
  behavioral_state: string
  identity_affirmation: string
  micro_goals: MicroGoal[]
  nudges: Nudge[]
  weekly_plan: WeeklyPlanDay[]
  explanations: Explanations
  difficulty_distribution: DifficultyDistribution
}

interface Supporter {
  name: string
  feedback: string
}

interface PactForm {
  title: string
  description: string
  category: string
  cadence: string
  startDate: string
  endDate: string
  supporters: Supporter[]
}

// User profile is auto-populated from the app backend
interface UserProfile {
  name: string
  current_streak: number
  last_check_in: string
  completion_rate: number
  recent_check_ins: string[]
}

// ── Sample Data ────────────────────────────────────────────────────
const SAMPLE_PACT: PactForm = {
  title: 'Run a 5K in Under 30 Minutes',
  description: 'Train consistently to improve my running pace and endurance, building up to completing a 5K race in under 30 minutes by the end of the month.',
  category: 'Fitness',
  cadence: 'Weekly',
  startDate: '2026-02-18',
  endDate: '2026-03-18',
  supporters: [
    { name: 'Jordan', feedback: 'Great progress on your intervals! Keep pushing the pace gradually.' },
    { name: 'Sam', feedback: 'Remember to warm up properly, you seemed tight last session.' }
  ]
}

// Simulated user profile (in production, this comes from the GroPact backend)
const AUTO_PROFILE: UserProfile = {
  name: 'Alex Chen',
  current_streak: 4,
  last_check_in: '2026-02-17',
  completion_rate: 72,
  recent_check_ins: ['Ran 2.5K in 16 min', 'Completed interval training', 'Rested due to rain', 'Ran 3K in 19 min', 'Stretching and recovery']
}

const SAMPLE_RESPONSE: WeeklyPlanOutput = {
  behavioral_state: 'consistent',
  identity_affirmation: 'You are a dedicated runner who shows up for yourself, rain or shine. Your consistency over the past 4 days proves that this goal is not just a wish -- it is who you are becoming.',
  micro_goals: [
    { goal_text: 'Complete a 3K tempo run at target 5K pace', difficulty: 'medium', due_date: '2026-02-20', reasoning: 'Building pace awareness at race speed will prepare your body for sustained effort.', measurable_outcome: 'Finish 3K in under 18 minutes' },
    { goal_text: 'Do 6x400m interval sprints with 90s rest', difficulty: 'hard', due_date: '2026-02-22', reasoning: 'High-intensity intervals improve VO2 max and leg turnover speed.', measurable_outcome: 'Complete all 6 intervals under 1:50 each' },
    { goal_text: 'Perform 20 minutes of dynamic stretching and foam rolling', difficulty: 'easy', due_date: '2026-02-19', reasoning: 'Recovery prevents injury and keeps momentum going.', measurable_outcome: 'Complete full stretching routine without skipping' },
    { goal_text: 'Run a full 5K at comfortable pace', difficulty: 'medium', due_date: '2026-02-24', reasoning: 'Distance practice builds endurance and mental confidence.', measurable_outcome: 'Complete 5K without walking breaks' }
  ],
  nudges: [
    { nudge_text: 'Lay out your running gear the night before -- removing friction makes starting easier.', behavioral_principle: 'Friction Reduction' },
    { nudge_text: 'After each run, write one sentence about how you felt. Tracking emotions builds intrinsic motivation.', behavioral_principle: 'Reflective Practice' },
    { nudge_text: 'Tell Jordan your next run time so they can check in with you afterward.', behavioral_principle: 'Social Accountability' }
  ],
  weekly_plan: [
    { day: 'Monday', micro_goal: 'Dynamic stretching and foam rolling (20 min)', reminder: 'Recovery is training too. Your muscles need this.', supporter_prompt: 'Ask Sam for stretching tips they mentioned.' },
    { day: 'Tuesday', micro_goal: 'Tempo run: 3K at target pace', reminder: 'Focus on breathing rhythm, not speed at the start.', supporter_prompt: 'Share your time with Jordan after the run.' },
    { day: 'Wednesday', micro_goal: 'Rest day with light walking', reminder: 'Rest is strategic, not lazy. Trust the process.', supporter_prompt: 'Check in with your supporters about how you feel.' },
    { day: 'Thursday', micro_goal: 'Interval sprints: 6x400m', reminder: 'Push hard on sprints, recover fully between sets.', supporter_prompt: 'Ask Jordan to join you for this session if possible.' },
    { day: 'Friday', micro_goal: 'Easy 2K jog and stretching', reminder: 'Keep it light today. Tomorrow is your big run.', supporter_prompt: 'Let Sam know you are on track this week.' },
    { day: 'Saturday', micro_goal: 'Full 5K run at comfortable pace', reminder: 'This is your confidence builder. No pressure on time.', supporter_prompt: 'Invite Jordan and Sam to cheer you on or join!' },
    { day: 'Sunday', micro_goal: 'Rest and reflection', reminder: 'Write about your week. Celebrate what you achieved.', supporter_prompt: 'Share your weekly summary with your supporters.' }
  ],
  explanations: {
    pact_interpretation: 'Your pact focuses on progressive running improvement with a clear time-based target. The 5K under 30 minutes goal is realistic given your current 3K time of 19 minutes, suggesting a comfortable pace that can be improved with structured training. The weekly cadence allows for proper recovery cycles.',
    behavior_insights: 'Your 4-day streak and 72% completion rate indicate a consistent pattern with occasional dips. The rain-related rest day shows external factors can disrupt your routine. Building weather-independent alternatives and maintaining flexibility in your schedule will help sustain momentum.',
    supporter_insights: 'Jordan provides performance-focused encouragement while Sam offers practical safety advice. This complementary support structure is valuable. Leveraging Jordan for accountability and Sam for technique will maximize their contributions to your success.'
  },
  difficulty_distribution: {
    easy_percent: 25,
    medium_percent: 50,
    hard_percent: 25
  }
}

const EMPTY_PACT: PactForm = {
  title: '',
  description: '',
  category: '',
  cadence: '',
  startDate: '',
  endDate: '',
  supporters: [{ name: '', feedback: '' }]
}

// ── Helper Functions ────────────────────────────────────────────────
function getDifficultyColor(difficulty: string): string {
  const d = (difficulty ?? '').toLowerCase()
  if (d === 'easy') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (d === 'hard') return 'bg-red-100 text-red-700 border-red-200'
  return 'bg-amber-100 text-amber-700 border-amber-200'
}

function getDifficultyBorderColor(difficulty: string): string {
  const d = (difficulty ?? '').toLowerCase()
  if (d === 'easy') return 'border-l-emerald-500'
  if (d === 'hard') return 'border-l-red-500'
  return 'border-l-amber-500'
}

function getBehavioralStateLabel(state: string): { label: string; color: string; icon: string } {
  const s = (state ?? '').toLowerCase()
  if (s === 'new') return { label: 'New User', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'new' }
  if (s === 'consistent') return { label: 'Consistent Performer', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: 'consistent' }
  if (s === 'inconsistent') return { label: 'Inconsistent Pattern', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: 'inconsistent' }
  if (s === 'struggling') return { label: 'Struggling', color: 'bg-red-100 text-red-700 border-red-200', icon: 'struggling' }
  if (s === 'recovery') return { label: 'Recovery Mode', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: 'recovery' }
  return { label: state || 'Unknown', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '' }
}

// ── Parse Agent Response ────────────────────────────────────────────
function parseAgentResponse(result: any): WeeklyPlanOutput | null {
  try {
    let parsed = result?.response?.result
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed) } catch { /* keep */ }
    }
    if (parsed && typeof parsed === 'object' && 'result' in parsed && !('behavioral_state' in parsed)) {
      parsed = (parsed as any).result
      if (typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed) } catch { /* keep */ }
      }
    }
    if (parsed && typeof parsed === 'object' && 'behavioral_state' in parsed) {
      return parsed as WeeklyPlanOutput
    }
    if (result?.response?.result?.text) {
      try {
        const textParsed = JSON.parse(result.response.result.text)
        if (textParsed && 'behavioral_state' in textParsed) return textParsed as WeeklyPlanOutput
      } catch { /* not JSON text */ }
    }
    if (result?.response?.message) {
      try {
        const msgParsed = JSON.parse(result.response.message)
        if (msgParsed && 'behavioral_state' in msgParsed) return msgParsed as WeeklyPlanOutput
      } catch { /* not JSON */ }
    }
    return null
  } catch {
    return null
  }
}

// ── Loading Skeleton ────────────────────────────────────────────────
function OutputSkeleton() {
  return (
    <div className="space-y-5 fade-in">
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="space-y-3">
        {[1,2,3].map(n => <Skeleton key={n} className="h-24 w-full rounded-xl" />)}
      </div>
      <div className="space-y-3">
        {[1,2].map(n => <Skeleton key={n} className="h-16 w-full rounded-xl" />)}
      </div>
      <div className="space-y-3">
        {[1,2,3,4,5,6,7].map(n => <Skeleton key={n} className="h-16 w-full rounded-xl" />)}
      </div>
      <p className="text-sm text-muted-foreground text-center animate-pulse pt-2">Generating your personalized plan...</p>
    </div>
  )
}

// ── Micro Goal Card ─────────────────────────────────────────────────
function MicroGoalCard({ goal, index }: { goal: MicroGoal; index: number }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={`rounded-xl border border-l-4 ${getDifficultyBorderColor(goal?.difficulty ?? '')} bg-card/80 backdrop-blur-sm transition-all duration-200 hover:shadow-md`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground leading-relaxed">{goal?.goal_text ?? ''}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getDifficultyColor(goal?.difficulty ?? '')}`}>
                {goal?.difficulty ?? 'N/A'}
              </Badge>
              {goal?.due_date && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <FiCalendar className="w-3 h-3" />
                  {goal.due_date}
                </span>
              )}
              {goal?.measurable_outcome && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <FiTarget className="w-3 h-3 text-primary" />
                  {goal.measurable_outcome}
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="flex-shrink-0 h-6 w-6 p-0 text-muted-foreground" onClick={() => setExpanded(!expanded)}>
            {expanded ? <FiChevronDown className="w-3.5 h-3.5" /> : <FiChevronRight className="w-3.5 h-3.5" />}
          </Button>
        </div>
        {expanded && goal?.reasoning && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground leading-relaxed">{goal.reasoning}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Nudge Card ──────────────────────────────────────────────────────
function NudgeCard({ nudge }: { nudge: Nudge }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50">
      <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <FiZap className="w-3.5 h-3.5 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-relaxed">{nudge?.nudge_text ?? ''}</p>
        {nudge?.behavioral_principle && (
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mt-1 inline-block">
            {nudge.behavioral_principle}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Day Card ────────────────────────────────────────────────────────
function DayCard({ day, index }: { day: WeeklyPlanDay; index: number }) {
  const dayColors = [
    'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500',
    'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500'
  ]
  return (
    <div className="flex gap-3 group">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-lg ${dayColors[index % 7]} flex items-center justify-center text-white text-xs font-bold`}>
          {(day?.day ?? '').slice(0, 2)}
        </div>
        {index < 6 && <div className="w-px h-full bg-border/50 mt-1" />}
      </div>
      <div className="flex-1 pb-4">
        <p className="text-xs font-semibold text-foreground mb-0.5">{day?.day ?? ''}</p>
        <p className="text-sm text-foreground leading-relaxed">{day?.micro_goal ?? ''}</p>
        {day?.reminder && (
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{day.reminder}</p>
        )}
        {day?.supporter_prompt && (
          <div className="flex items-center gap-1 mt-1">
            <FiUsers className="w-3 h-3 text-accent flex-shrink-0" />
            <p className="text-[11px] text-accent leading-relaxed">{day.supporter_prompt}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Difficulty Distribution ─────────────────────────────────────────
function DifficultyBar({ distribution }: { distribution: DifficultyDistribution | undefined }) {
  const easy = distribution?.easy_percent ?? 0
  const medium = distribution?.medium_percent ?? 0
  const hard = distribution?.hard_percent ?? 0
  const total = easy + medium + hard
  if (total === 0) return null
  return (
    <div className="flex items-center gap-3">
      <div className="flex rounded-full overflow-hidden h-2 bg-muted flex-1">
        {easy > 0 && <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${(easy / total) * 100}%` }} />}
        {medium > 0 && <div className="bg-amber-500 transition-all duration-500" style={{ width: `${(medium / total) * 100}%` }} />}
        {hard > 0 && <div className="bg-red-500 transition-all duration-500" style={{ width: `${(hard / total) * 100}%` }} />}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-shrink-0">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{easy}%</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{medium}%</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{hard}%</span>
      </div>
    </div>
  )
}

// ── Output Panel ────────────────────────────────────────────────────
function OutputPanel({ data, loading, error, onRetry, rawResponse }: {
  data: WeeklyPlanOutput | null
  loading: boolean
  error: string | null
  onRetry: () => void
  rawResponse: any
}) {
  const [copied, setCopied] = useState(false)
  const [microGoalsOpen, setMicroGoalsOpen] = useState(true)
  const [nudgesOpen, setNudgesOpen] = useState(true)
  const [weeklyPlanOpen, setWeeklyPlanOpen] = useState(true)

  const handleCopyJson = useCallback(async () => {
    const jsonStr = JSON.stringify(data ?? rawResponse ?? {}, null, 2)
    const success = await copyToClipboard(jsonStr)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [data, rawResponse])

  const handleExport = useCallback(() => {
    const jsonStr = JSON.stringify(data ?? rawResponse ?? {}, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gropact-plan-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [data, rawResponse])

  if (!loading && !data && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-8">
        <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-5">
          <FiTarget className="w-9 h-9 text-primary/60" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Your Plan Awaits</h3>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Define your pact on the left and we will generate a personalized weekly plan tailored to your behavioral patterns and supporter network.
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 mt-6">
          <FiActivity className="w-3.5 h-3.5" />
          <span>User metrics are synced automatically</span>
        </div>
      </div>
    )
  }

  if (loading) return <OutputSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-8">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <FiAlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">Something went wrong</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4 leading-relaxed">{error}</p>
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-2 rounded-xl">
          <FiRefreshCw className="w-3.5 h-3.5" />
          Try Again
        </Button>
      </div>
    )
  }

  if (!data) return null

  const stateInfo = getBehavioralStateLabel(data.behavioral_state ?? '')
  const microGoals = Array.isArray(data?.micro_goals) ? data.micro_goals : []
  const nudges = Array.isArray(data?.nudges) ? data.nudges : []
  const weeklyPlan = Array.isArray(data?.weekly_plan) ? data.weekly_plan : []

  return (
    <div className="space-y-6 fade-in-up">
      {/* Top bar: state + actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Badge className={`${stateInfo.color} rounded-full px-3 py-1 text-[11px] font-semibold border`}>
          {stateInfo.label}
        </Badge>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={handleCopyJson}>
            {copied ? <FiCheck className="w-3.5 h-3.5 text-emerald-600" /> : <FiCopy className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={handleExport}>
            <FiDownload className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={onRetry}>
            <FiRefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Identity Affirmation */}
      {data?.identity_affirmation && (
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 forest-gradient opacity-[0.06]" />
          <div className="relative p-5 border border-primary/15 rounded-xl">
            <div className="flex items-start gap-3">
              <FiStar className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-1.5">Your Identity</p>
                <p className="text-sm text-foreground leading-relaxed italic">{data.identity_affirmation}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Difficulty Distribution - compact */}
      <DifficultyBar distribution={data?.difficulty_distribution} />

      {/* Micro-Goals */}
      <Collapsible open={microGoalsOpen} onOpenChange={setMicroGoalsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 w-full text-left py-1 group">
            {microGoalsOpen ? <FiChevronDown className="w-4 h-4 text-muted-foreground" /> : <FiChevronRight className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm font-semibold text-foreground">Micro-Goals</span>
            <Badge variant="secondary" className="text-[10px] rounded-full h-5 px-1.5">{microGoals.length}</Badge>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2 mt-2">
            {microGoals.map((goal, i) => (
              <MicroGoalCard key={i} goal={goal} index={i} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Nudges */}
      <Collapsible open={nudgesOpen} onOpenChange={setNudgesOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 w-full text-left py-1 group">
            {nudgesOpen ? <FiChevronDown className="w-4 h-4 text-muted-foreground" /> : <FiChevronRight className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm font-semibold text-foreground">Nudges</span>
            <Badge variant="secondary" className="text-[10px] rounded-full h-5 px-1.5">{nudges.length}</Badge>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2 mt-2">
            {nudges.map((nudge, i) => (
              <NudgeCard key={i} nudge={nudge} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Weekly Plan */}
      <Collapsible open={weeklyPlanOpen} onOpenChange={setWeeklyPlanOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 w-full text-left py-1 group">
            {weeklyPlanOpen ? <FiChevronDown className="w-4 h-4 text-muted-foreground" /> : <FiChevronRight className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm font-semibold text-foreground">Weekly Plan</span>
            <Badge variant="secondary" className="text-[10px] rounded-full h-5 px-1.5">{weeklyPlan.length} days</Badge>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 pl-1">
            {weeklyPlan.map((day, i) => (
              <DayCard key={i} day={day} index={i} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Explanations */}
      {data?.explanations && (
        <Accordion type="multiple" className="space-y-1.5">
          {data.explanations.pact_interpretation && (
            <AccordionItem value="pact" className="rounded-xl border bg-card/50 px-4">
              <AccordionTrigger className="text-xs font-medium py-2.5 hover:no-underline text-muted-foreground">
                <span className="flex items-center gap-1.5"><FiBookOpen className="w-3 h-3" /> Pact Interpretation</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-sm leading-relaxed text-foreground">
                {data.explanations.pact_interpretation}
              </AccordionContent>
            </AccordionItem>
          )}
          {data.explanations.behavior_insights && (
            <AccordionItem value="behavior" className="rounded-xl border bg-card/50 px-4">
              <AccordionTrigger className="text-xs font-medium py-2.5 hover:no-underline text-muted-foreground">
                <span className="flex items-center gap-1.5"><FiActivity className="w-3 h-3" /> Behavior Insights</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-sm leading-relaxed text-foreground">
                {data.explanations.behavior_insights}
              </AccordionContent>
            </AccordionItem>
          )}
          {data.explanations.supporter_insights && (
            <AccordionItem value="supporter" className="rounded-xl border bg-card/50 px-4">
              <AccordionTrigger className="text-xs font-medium py-2.5 hover:no-underline text-muted-foreground">
                <span className="flex items-center gap-1.5"><FiUsers className="w-3 h-3" /> Supporter Insights</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-sm leading-relaxed text-foreground">
                {data.explanations.supporter_insights}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────
export default function Page() {
  const [pactForm, setPactForm] = useState<PactForm>({ ...EMPTY_PACT })
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [planData, setPlanData] = useState<WeeklyPlanOutput | null>(null)
  const [rawResponse, setRawResponse] = useState<any>(null)
  const [sampleData, setSampleData] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const agentActivity = useLyzrAgentEvents(sessionId ?? undefined)

  const currentPact = sampleData ? SAMPLE_PACT : pactForm
  const currentData = sampleData && !planData ? SAMPLE_RESPONSE : planData

  const handleSampleToggle = useCallback((checked: boolean) => {
    setSampleData(checked)
  }, [])

  const updateField = useCallback(<K extends keyof PactForm>(key: K, value: PactForm[K]) => {
    setPactForm(prev => ({ ...prev, [key]: value }))
  }, [])

  const addSupporter = useCallback(() => {
    setPactForm(prev => ({
      ...prev,
      supporters: [...prev.supporters, { name: '', feedback: '' }]
    }))
  }, [])

  const removeSupporter = useCallback((index: number) => {
    setPactForm(prev => ({
      ...prev,
      supporters: prev.supporters.filter((_, i) => i !== index)
    }))
  }, [])

  const updateSupporter = useCallback((index: number, field: 'name' | 'feedback', value: string) => {
    setPactForm(prev => ({
      ...prev,
      supporters: prev.supporters.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }))
  }, [])

  // Build full payload merging user-entered pact with auto-populated profile
  const buildPayload = useCallback((pact: PactForm) => {
    return {
      pact: {
        title: pact.title,
        description: pact.description,
        category: pact.category,
        cadence: pact.cadence,
        start_date: pact.startDate,
        end_date: pact.endDate
      },
      user_profile: {
        name: AUTO_PROFILE.name,
        current_streak: AUTO_PROFILE.current_streak,
        last_check_in: AUTO_PROFILE.last_check_in,
        completion_rate: AUTO_PROFILE.completion_rate,
        recent_check_ins: AUTO_PROFILE.recent_check_ins
      },
      supporter_feedback: pact.supporters
        .filter(s => s.name.trim() || s.feedback.trim())
        .map(s => ({
          supporter_name: s.name,
          feedback: s.feedback
        }))
    }
  }, [])

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setError(null)
    setPlanData(null)
    setRawResponse(null)
    setActiveAgentId(AGENT_ID)

    const pact = sampleData ? SAMPLE_PACT : pactForm

    let message: string
    if (advancedOpen && jsonText.trim()) {
      message = jsonText
    } else {
      const payload = buildPayload(pact)
      message = JSON.stringify(payload)
    }

    try {
      const result = await callAIAgent(message, AGENT_ID)

      if (result?.session_id) {
        setSessionId(result.session_id)
      }

      if (result.success) {
        setRawResponse(result)
        const parsed = parseAgentResponse(result)
        if (parsed) {
          setPlanData(parsed)
        } else {
          setError('The agent returned an unexpected response format. Please try again.')
          setRawResponse(result)
        }
      } else {
        setError(result?.error ?? result?.response?.message ?? 'Something went wrong. Please check your input and try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
      setActiveAgentId(null)
    }
  }, [pactForm, sampleData, advancedOpen, jsonText, buildPayload])

  const handleRetry = useCallback(() => {
    handleGenerate()
  }, [handleGenerate])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card-strong border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg forest-gradient flex items-center justify-center shadow-sm">
              <FiTarget className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground tracking-tight leading-none">GroPact</h1>
              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">AI Goal Architect</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Auto-synced profile indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{AUTO_PROFILE.name}</span>
              <Separator orientation="vertical" className="h-3" />
              <span>{AUTO_PROFILE.current_streak} day streak</span>
              <Separator orientation="vertical" className="h-3" />
              <span>{AUTO_PROFILE.completion_rate}% rate</span>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground cursor-pointer">Demo</Label>
              <Switch id="sample-toggle" checked={sampleData} onCheckedChange={handleSampleToggle} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left Panel: Input (2 cols) ── */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Define Your Pact</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Your behavioral data syncs automatically from the app.</p>
            </div>

            {/* Pact Details */}
            <Card className="glass-card rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-medium">What is your pact?</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Run a 5K in Under 30 Minutes"
                    value={currentPact.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="rounded-xl bg-background/50 h-10"
                    disabled={sampleData}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-medium">Describe your commitment</Label>
                  <Textarea
                    id="description"
                    placeholder="What does success look like? Why does this matter to you?"
                    value={currentPact.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={3}
                    className="rounded-xl bg-background/50 resize-none"
                    disabled={sampleData}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Category</Label>
                    <Select value={currentPact.category || undefined} onValueChange={(val) => updateField('category', val)} disabled={sampleData}>
                      <SelectTrigger className="rounded-xl bg-background/50 h-9 text-xs">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Cadence</Label>
                    <Select value={currentPact.cadence || undefined} onValueChange={(val) => updateField('cadence', val)} disabled={sampleData}>
                      <SelectTrigger className="rounded-xl bg-background/50 h-9 text-xs">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CADENCES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="startDate" className="text-xs font-medium">Start</Label>
                    <Input id="startDate" type="date" value={currentPact.startDate} onChange={(e) => updateField('startDate', e.target.value)} className="rounded-xl bg-background/50 h-9 text-xs" disabled={sampleData} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="endDate" className="text-xs font-medium">End</Label>
                    <Input id="endDate" type="date" value={currentPact.endDate} onChange={(e) => updateField('endDate', e.target.value)} className="rounded-xl bg-background/50 h-9 text-xs" disabled={sampleData} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supporters */}
            <Card className="glass-card rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiUsers className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Supporters</span>
                  </div>
                  {!sampleData && (
                    <Button variant="ghost" size="sm" className="h-6 text-[11px] text-primary hover:text-primary gap-1 px-2" onClick={addSupporter}>
                      <FiPlus className="w-3 h-3" /> Add
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  {(currentPact.supporters ?? []).map((supporter, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1 space-y-1.5">
                        <Input
                          placeholder="Name"
                          value={supporter.name}
                          onChange={(e) => updateSupporter(index, 'name', e.target.value)}
                          className="rounded-xl bg-background/50 h-8 text-xs"
                          disabled={sampleData}
                        />
                        <Textarea
                          placeholder="Their feedback or observations..."
                          value={supporter.feedback}
                          onChange={(e) => updateSupporter(index, 'feedback', e.target.value)}
                          rows={2}
                          className="rounded-xl bg-background/50 text-xs resize-none"
                          disabled={sampleData}
                        />
                      </div>
                      {!sampleData && currentPact.supporters.length > 1 && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => removeSupporter(index)}>
                          <FiTrash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Advanced: JSON override */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors py-1">
                  <FiSettings className="w-3 h-3" />
                  <span>Advanced: JSON override</span>
                  {advancedOpen ? <FiChevronDown className="w-3 h-3" /> : <FiChevronRight className="w-3 h-3" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="glass-card rounded-xl mt-2">
                  <CardContent className="p-4">
                    <p className="text-[11px] text-muted-foreground mb-2">Paste a full JSON payload to override the form. This sends directly to the agent.</p>
                    <Textarea
                      value={jsonText}
                      onChange={(e) => setJsonText(e.target.value)}
                      className="font-mono text-[11px] min-h-[200px] rounded-xl bg-background/50 resize-none"
                      placeholder='{"pact": {...}, "user_profile": {...}, "supporter_feedback": [...]}'
                    />
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full rounded-xl h-11 text-sm font-semibold forest-gradient text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Generate Plan
                  <FiArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            {error && !loading && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-xs text-destructive">
                <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Powered by */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <div className={`w-1.5 h-1.5 rounded-full ${activeAgentId ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span>5 AI agents orchestrated by Weekly Plan Composer</span>
              </div>
            </div>
          </div>

          {/* ── Right Panel: Output (3 cols) ── */}
          <div className="lg:col-span-3">
            <Card className="glass-card-strong rounded-xl min-h-[600px]">
              <CardHeader className="pb-2 pt-5 px-6">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <FiCalendar className="w-4 h-4 text-primary" />
                  Your Personalized Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <OutputPanel
                  data={currentData}
                  loading={loading}
                  error={!sampleData ? error : null}
                  onRetry={handleRetry}
                  rawResponse={rawResponse}
                />
              </CardContent>
            </Card>

            {sessionId && (
              <div className="mt-4">
                <AgentActivityPanel {...agentActivity} className="rounded-xl" />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
