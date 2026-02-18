'use client'

import { useState, useCallback, useRef } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { useLyzrAgentEvents } from '@/lib/lyzrAgentEvents'
import { AgentActivityPanel } from '@/components/AgentActivityPanel'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FiTarget, FiTrendingUp, FiUsers, FiCalendar, FiCopy, FiDownload, FiRefreshCw, FiPlus, FiTrash2, FiChevronDown, FiChevronRight, FiCheck, FiAlertCircle, FiStar, FiList } from 'react-icons/fi'

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

interface FormData {
  title: string
  description: string
  category: string
  cadence: string
  startDate: string
  endDate: string
  name: string
  streak: number
  lastCheckIn: string
  completionRate: number
  recentCheckIns: string
  supporters: Supporter[]
}

// ── Sample Data ────────────────────────────────────────────────────
const SAMPLE_FORM: FormData = {
  title: 'Run a 5K in Under 30 Minutes',
  description: 'Train consistently to improve my running pace and endurance, building up to completing a 5K race in under 30 minutes by the end of the month.',
  category: 'Fitness',
  cadence: 'Weekly',
  startDate: '2026-02-18',
  endDate: '2026-03-18',
  name: 'Alex Chen',
  streak: 4,
  lastCheckIn: '2026-02-17',
  completionRate: 72,
  recentCheckIns: 'Ran 2.5K in 16 min, Completed interval training, Rested due to rain, Ran 3K in 19 min, Stretching and recovery',
  supporters: [
    { name: 'Jordan', feedback: 'Great progress on your intervals! Keep pushing the pace gradually.' },
    { name: 'Sam', feedback: 'Remember to warm up properly, you seemed tight last session.' }
  ]
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

const EMPTY_FORM: FormData = {
  title: '',
  description: '',
  category: '',
  cadence: '',
  startDate: '',
  endDate: '',
  name: '',
  streak: 0,
  lastCheckIn: '',
  completionRate: 50,
  recentCheckIns: '',
  supporters: [{ name: '', feedback: '' }]
}

// ── Markdown Renderer ──────────────────────────────────────────────
function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">{part}</strong>
    ) : (
      part
    )
  )
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>
      })}
    </div>
  )
}

// ── Difficulty Badge Helper ────────────────────────────────────────
function getDifficultyColor(difficulty: string): string {
  const d = (difficulty ?? '').toLowerCase()
  if (d === 'easy') return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  if (d === 'hard') return 'bg-red-100 text-red-800 border-red-200'
  return 'bg-amber-100 text-amber-800 border-amber-200'
}

function getBehavioralStateLabel(state: string): { label: string; color: string } {
  const s = (state ?? '').toLowerCase()
  if (s === 'new') return { label: 'New User', color: 'bg-blue-100 text-blue-800 border-blue-200' }
  if (s === 'consistent') return { label: 'Consistent Performer', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
  if (s === 'inconsistent') return { label: 'Inconsistent Pattern', color: 'bg-amber-100 text-amber-800 border-amber-200' }
  if (s === 'struggling') return { label: 'Struggling', color: 'bg-red-100 text-red-800 border-red-200' }
  if (s === 'recovery') return { label: 'Recovery Mode', color: 'bg-purple-100 text-purple-800 border-purple-200' }
  return { label: state || 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-200' }
}

// ── Parse Agent Response ───────────────────────────────────────────
function parseAgentResponse(result: any): WeeklyPlanOutput | null {
  try {
    let parsed = result?.response?.result
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed) } catch { /* keep as string */ }
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

// ── Loading Skeleton Component ─────────────────────────────────────
function OutputSkeleton() {
  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="h-8 w-40 rounded-xl" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-28 rounded-lg" />
        {[1,2,3,4,5,6,7].map(n => (
          <Skeleton key={n} className="h-20 w-full rounded-xl" />
        ))}
      </div>
      <p className="text-sm text-muted-foreground text-center animate-pulse">Generating your personalized plan...</p>
    </div>
  )
}

// ── Micro Goal Card ────────────────────────────────────────────────
function MicroGoalCard({ goal, index }: { goal: MicroGoal; index: number }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <Card className="glass-card rounded-xl transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground">Goal {index + 1}</span>
              <Badge variant="outline" className={`text-xs ${getDifficultyColor(goal?.difficulty ?? '')}`}>
                {goal?.difficulty ?? 'N/A'}
              </Badge>
              {goal?.due_date && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <FiCalendar className="w-3 h-3" />
                  {goal.due_date}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-foreground leading-relaxed">{goal?.goal_text ?? ''}</p>
            {goal?.measurable_outcome && (
              <div className="mt-2 flex items-center gap-1.5">
                <FiTarget className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-xs text-muted-foreground">{goal.measurable_outcome}</span>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" className="flex-shrink-0 h-7 w-7 p-0" onClick={() => setExpanded(!expanded)}>
            {expanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
          </Button>
        </div>
        {expanded && goal?.reasoning && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-1">Reasoning</p>
            <p className="text-sm text-foreground leading-relaxed">{goal.reasoning}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Nudge Card ─────────────────────────────────────────────────────
function NudgeCard({ nudge }: { nudge: Nudge }) {
  return (
    <Card className="glass-card rounded-xl transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-4">
        <p className="text-sm text-foreground leading-relaxed mb-2">{nudge?.nudge_text ?? ''}</p>
        {nudge?.behavioral_principle && (
          <Badge variant="secondary" className="text-xs font-normal">
            {nudge.behavioral_principle}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

// ── Day Card ───────────────────────────────────────────────────────
function DayCard({ day }: { day: WeeklyPlanDay }) {
  return (
    <Card className="glass-card rounded-xl transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
            {day?.day ?? ''}
          </Badge>
        </div>
        <p className="text-sm font-medium text-foreground mb-2">{day?.micro_goal ?? ''}</p>
        {day?.reminder && (
          <div className="flex items-start gap-1.5 mb-2">
            <FiAlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{day.reminder}</p>
          </div>
        )}
        {day?.supporter_prompt && (
          <div className="flex items-start gap-1.5">
            <FiUsers className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{day.supporter_prompt}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Difficulty Distribution Bar ────────────────────────────────────
function DifficultyBar({ distribution }: { distribution: DifficultyDistribution | undefined }) {
  const easy = distribution?.easy_percent ?? 0
  const medium = distribution?.medium_percent ?? 0
  const hard = distribution?.hard_percent ?? 0
  const total = easy + medium + hard
  if (total === 0) return null
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Difficulty Distribution</p>
      <div className="flex rounded-full overflow-hidden h-3 bg-muted">
        {easy > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${(easy / total) * 100}%` }} />
              </TooltipTrigger>
              <TooltipContent><p>Easy: {easy}%</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {medium > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-amber-500 transition-all duration-500" style={{ width: `${(medium / total) * 100}%` }} />
              </TooltipTrigger>
              <TooltipContent><p>Medium: {medium}%</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {hard > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-red-500 transition-all duration-500" style={{ width: `${(hard / total) * 100}%` }} />
              </TooltipTrigger>
              <TooltipContent><p>Hard: {hard}%</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Easy {easy}%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Medium {medium}%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Hard {hard}%</span>
      </div>
    </div>
  )
}

// ── Output Panel Component ─────────────────────────────────────────
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

  // Empty state
  if (!loading && !data && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <FiTarget className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Architect Your Goals</h3>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          Submit your pact details to generate a personalized weekly plan with micro-goals, behavioral nudges, and supporter engagement prompts.
        </p>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return <OutputSkeleton />
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <FiAlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4 leading-relaxed">{error}</p>
        <Button onClick={onRetry} variant="outline" className="gap-2 rounded-xl">
          <FiRefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    )
  }

  // Data state
  if (!data) return null

  const stateInfo = getBehavioralStateLabel(data.behavioral_state ?? '')
  const microGoals = Array.isArray(data?.micro_goals) ? data.micro_goals : []
  const nudges = Array.isArray(data?.nudges) ? data.nudges : []
  const weeklyPlan = Array.isArray(data?.weekly_plan) ? data.weekly_plan : []

  return (
    <div className="space-y-5 fade-in-up">
      {/* Header: Behavioral State + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Badge className={`${stateInfo.color} rounded-full px-3 py-1 text-xs font-semibold border`}>
            {stateInfo.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs h-8" onClick={handleCopyJson}>
                  {copied ? <FiCheck className="w-3.5 h-3.5 text-emerald-600" /> : <FiCopy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Copy full response as JSON</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs h-8" onClick={handleExport}>
                  <FiDownload className="w-3.5 h-3.5" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Download as .json file</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs h-8" onClick={onRetry}>
                  <FiRefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Regenerate with same inputs</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Identity Affirmation */}
      {data?.identity_affirmation && (
        <Card className="rounded-xl border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FiStar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1.5">Identity Affirmation</p>
                <p className="text-sm text-foreground leading-relaxed italic">&ldquo;{data.identity_affirmation}&rdquo;</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Difficulty Distribution */}
      <Card className="glass-card rounded-xl">
        <CardContent className="p-4">
          <DifficultyBar distribution={data?.difficulty_distribution} />
        </CardContent>
      </Card>

      {/* Micro-Goals Section */}
      <Collapsible open={microGoalsOpen} onOpenChange={setMicroGoalsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 w-full text-left group py-1">
            {microGoalsOpen ? <FiChevronDown className="w-4 h-4 text-muted-foreground" /> : <FiChevronRight className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm font-semibold text-foreground">Micro-Goals</span>
            <Badge variant="secondary" className="text-xs rounded-full">{microGoals.length}</Badge>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 mt-3">
            {microGoals.map((goal, i) => (
              <MicroGoalCard key={i} goal={goal} index={i} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Nudges Section */}
      <Collapsible open={nudgesOpen} onOpenChange={setNudgesOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 w-full text-left group py-1">
            {nudgesOpen ? <FiChevronDown className="w-4 h-4 text-muted-foreground" /> : <FiChevronRight className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm font-semibold text-foreground">Behavioral Nudges</span>
            <Badge variant="secondary" className="text-xs rounded-full">{nudges.length}</Badge>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 mt-3">
            {nudges.map((nudge, i) => (
              <NudgeCard key={i} nudge={nudge} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Weekly Plan Section */}
      <Collapsible open={weeklyPlanOpen} onOpenChange={setWeeklyPlanOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 w-full text-left group py-1">
            {weeklyPlanOpen ? <FiChevronDown className="w-4 h-4 text-muted-foreground" /> : <FiChevronRight className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm font-semibold text-foreground">Weekly Plan</span>
            <Badge variant="secondary" className="text-xs rounded-full">{weeklyPlan.length} days</Badge>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 mt-3">
            {weeklyPlan.map((day, i) => (
              <DayCard key={i} day={day} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Explanations Section */}
      {data?.explanations && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Insights & Explanations</p>
          <Accordion type="multiple" className="space-y-2">
            {data.explanations.pact_interpretation && (
              <AccordionItem value="pact" className="glass-card rounded-xl border px-4">
                <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">Pact Interpretation</AccordionTrigger>
                <AccordionContent className="pb-4">
                  {renderMarkdown(data.explanations.pact_interpretation)}
                </AccordionContent>
              </AccordionItem>
            )}
            {data.explanations.behavior_insights && (
              <AccordionItem value="behavior" className="glass-card rounded-xl border px-4">
                <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">User Behavior Insights</AccordionTrigger>
                <AccordionContent className="pb-4">
                  {renderMarkdown(data.explanations.behavior_insights)}
                </AccordionContent>
              </AccordionItem>
            )}
            {data.explanations.supporter_insights && (
              <AccordionItem value="supporter" className="glass-card rounded-xl border px-4">
                <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">Supporter Insights</AccordionTrigger>
                <AccordionContent className="pb-4">
                  {renderMarkdown(data.explanations.supporter_insights)}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      )}
    </div>
  )
}

// ── Main Page Component ────────────────────────────────────────────
export default function Page() {
  const [formData, setFormData] = useState<FormData>({ ...EMPTY_FORM })
  const [jsonMode, setJsonMode] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [planData, setPlanData] = useState<WeeklyPlanOutput | null>(null)
  const [rawResponse, setRawResponse] = useState<any>(null)
  const [sampleData, setSampleData] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const lastFormRef = useRef<FormData | null>(null)

  const agentActivity = useLyzrAgentEvents(sessionId ?? undefined)

  // Current form data (respects sample mode)
  const currentForm = sampleData ? SAMPLE_FORM : formData
  const currentData = sampleData && !planData ? SAMPLE_RESPONSE : planData

  // Toggle sample data
  const handleSampleToggle = useCallback((checked: boolean) => {
    setSampleData(checked)
    if (!checked) {
      // turning off sample data, keep any real plan data
    }
  }, [])

  // Update form field
  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  // Supporter management
  const addSupporter = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      supporters: [...prev.supporters, { name: '', feedback: '' }]
    }))
  }, [])

  const removeSupporter = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      supporters: prev.supporters.filter((_, i) => i !== index)
    }))
  }, [])

  const updateSupporter = useCallback((index: number, field: 'name' | 'feedback', value: string) => {
    setFormData(prev => ({
      ...prev,
      supporters: prev.supporters.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }))
  }, [])

  // JSON mode toggle
  const handleJsonToggle = useCallback((checked: boolean) => {
    if (checked) {
      // Switching to JSON mode, populate textarea with current form data
      const fd = sampleData ? SAMPLE_FORM : formData
      const payload = {
        pact: {
          title: fd.title,
          description: fd.description,
          category: fd.category,
          cadence: fd.cadence,
          start_date: fd.startDate,
          end_date: fd.endDate
        },
        user_profile: {
          name: fd.name,
          current_streak: fd.streak,
          last_check_in: fd.lastCheckIn,
          completion_rate: fd.completionRate,
          recent_check_ins: fd.recentCheckIns.split(',').map(s => s.trim()).filter(Boolean)
        },
        supporter_feedback: fd.supporters.map(s => ({
          supporter_name: s.name,
          feedback: s.feedback
        }))
      }
      setJsonText(JSON.stringify(payload, null, 2))
    } else {
      // Switching back to form mode, try to parse JSON
      try {
        const parsed = JSON.parse(jsonText)
        setFormData(prev => ({
          ...prev,
          title: parsed?.pact?.title ?? prev.title,
          description: parsed?.pact?.description ?? prev.description,
          category: parsed?.pact?.category ?? prev.category,
          cadence: parsed?.pact?.cadence ?? prev.cadence,
          startDate: parsed?.pact?.start_date ?? prev.startDate,
          endDate: parsed?.pact?.end_date ?? prev.endDate,
          name: parsed?.user_profile?.name ?? prev.name,
          streak: parsed?.user_profile?.current_streak ?? prev.streak,
          lastCheckIn: parsed?.user_profile?.last_check_in ?? prev.lastCheckIn,
          completionRate: parsed?.user_profile?.completion_rate ?? prev.completionRate,
          recentCheckIns: Array.isArray(parsed?.user_profile?.recent_check_ins)
            ? parsed.user_profile.recent_check_ins.join(', ')
            : prev.recentCheckIns,
          supporters: Array.isArray(parsed?.supporter_feedback)
            ? parsed.supporter_feedback.map((s: any) => ({ name: s?.supporter_name ?? '', feedback: s?.feedback ?? '' }))
            : prev.supporters
        }))
      } catch {
        // Invalid JSON, keep form as-is
      }
    }
    setJsonMode(checked)
  }, [formData, jsonText, sampleData])

  // Build message payload
  const buildPayload = useCallback((fd: FormData) => {
    return {
      pact: {
        title: fd.title,
        description: fd.description,
        category: fd.category,
        cadence: fd.cadence,
        start_date: fd.startDate,
        end_date: fd.endDate
      },
      user_profile: {
        name: fd.name,
        current_streak: fd.streak,
        last_check_in: fd.lastCheckIn,
        completion_rate: fd.completionRate,
        recent_check_ins: fd.recentCheckIns.split(',').map(s => s.trim()).filter(Boolean)
      },
      supporter_feedback: fd.supporters.map(s => ({
        supporter_name: s.name,
        feedback: s.feedback
      }))
    }
  }, [])

  // Generate plan
  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setError(null)
    setPlanData(null)
    setRawResponse(null)
    setActiveAgentId(AGENT_ID)

    const fd = sampleData ? SAMPLE_FORM : formData
    lastFormRef.current = fd

    let message: string
    if (jsonMode) {
      message = jsonText
    } else {
      const payload = buildPayload(fd)
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
  }, [formData, sampleData, jsonMode, jsonText, buildPayload])

  // Retry with same inputs
  const handleRetry = useCallback(() => {
    handleGenerate()
  }, [handleGenerate])

  return (
    <div className="min-h-screen">
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 glass-card-strong border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl forest-gradient flex items-center justify-center shadow-md shadow-primary/20">
              <FiTarget className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight leading-none">GroPact</h1>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">AI Goal Architect</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground font-medium cursor-pointer">Sample Data</Label>
            <Switch id="sample-toggle" checked={sampleData} onCheckedChange={handleSampleToggle} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Left Panel: Input ── */}
          <div className="space-y-5">
            {/* Form/JSON Toggle */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Configure Your Pact</h2>
              <div className="flex items-center gap-2">
                <Label htmlFor="json-toggle" className="text-xs text-muted-foreground cursor-pointer">
                  {jsonMode ? 'JSON Editor' : 'Form View'}
                </Label>
                <Switch id="json-toggle" checked={jsonMode} onCheckedChange={handleJsonToggle} />
              </div>
            </div>

            {jsonMode ? (
              /* JSON Editor Mode */
              <Card className="glass-card rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FiList className="w-4 h-4 text-primary" />
                    JSON Payload Editor
                  </CardTitle>
                  <CardDescription className="text-xs">Edit the JSON payload directly. Switch back to form view to populate fields.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    className="font-mono text-xs min-h-[500px] rounded-xl bg-background/50"
                    placeholder='{"pact": {"title": "..."}, "user_profile": {...}, "supporter_feedback": [...]}'
                  />
                </CardContent>
              </Card>
            ) : (
              /* Form Mode */
              <ScrollArea className="h-auto">
                <div className="space-y-5">
                  {/* Pact Details Card */}
                  <Card className="glass-card rounded-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <FiTarget className="w-4 h-4 text-primary" />
                        Pact Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="title" className="text-xs font-medium">Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Run a 5K in Under 30 Minutes"
                          value={currentForm.title}
                          onChange={(e) => updateField('title', e.target.value)}
                          className="rounded-xl bg-background/50"
                          disabled={sampleData}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-xs font-medium">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your goal in detail..."
                          value={currentForm.description}
                          onChange={(e) => updateField('description', e.target.value)}
                          rows={3}
                          className="rounded-xl bg-background/50"
                          disabled={sampleData}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Category</Label>
                          <Select
                            value={currentForm.category}
                            onValueChange={(val) => updateField('category', val)}
                            disabled={sampleData}
                          >
                            <SelectTrigger className="rounded-xl bg-background/50">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Cadence</Label>
                          <Select
                            value={currentForm.cadence}
                            onValueChange={(val) => updateField('cadence', val)}
                            disabled={sampleData}
                          >
                            <SelectTrigger className="rounded-xl bg-background/50">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {CADENCES.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="startDate" className="text-xs font-medium">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={currentForm.startDate}
                            onChange={(e) => updateField('startDate', e.target.value)}
                            className="rounded-xl bg-background/50"
                            disabled={sampleData}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="endDate" className="text-xs font-medium">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={currentForm.endDate}
                            onChange={(e) => updateField('endDate', e.target.value)}
                            className="rounded-xl bg-background/50"
                            disabled={sampleData}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* User Profile Card */}
                  <Card className="glass-card rounded-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <FiTrendingUp className="w-4 h-4 text-primary" />
                        User Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-medium">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={currentForm.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          className="rounded-xl bg-background/50"
                          disabled={sampleData}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="streak" className="text-xs font-medium">Current Streak</Label>
                          <Input
                            id="streak"
                            type="number"
                            min={0}
                            value={currentForm.streak}
                            onChange={(e) => updateField('streak', parseInt(e.target.value) || 0)}
                            className="rounded-xl bg-background/50"
                            disabled={sampleData}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="lastCheckIn" className="text-xs font-medium">Last Check-in</Label>
                          <Input
                            id="lastCheckIn"
                            type="date"
                            value={currentForm.lastCheckIn}
                            onChange={(e) => updateField('lastCheckIn', e.target.value)}
                            className="rounded-xl bg-background/50"
                            disabled={sampleData}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Completion Rate</Label>
                          <span className="text-xs font-semibold text-primary">{currentForm.completionRate}%</span>
                        </div>
                        <Slider
                          value={[currentForm.completionRate]}
                          onValueChange={(val) => updateField('completionRate', val[0])}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                          disabled={sampleData}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="recentCheckIns" className="text-xs font-medium">Recent Check-ins</Label>
                        <Textarea
                          id="recentCheckIns"
                          placeholder="Comma-separated entries (e.g., Ran 3K, Did yoga, Rest day)"
                          value={currentForm.recentCheckIns}
                          onChange={(e) => updateField('recentCheckIns', e.target.value)}
                          rows={2}
                          className="rounded-xl bg-background/50"
                          disabled={sampleData}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Supporter Feedback Card */}
                  <Card className="glass-card rounded-xl">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <FiUsers className="w-4 h-4 text-primary" />
                          Supporter Feedback
                        </CardTitle>
                        {!sampleData && (
                          <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 rounded-xl text-primary hover:text-primary" onClick={addSupporter}>
                            <FiPlus className="w-3.5 h-3.5" />
                            Add
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(currentForm.supporters ?? []).map((supporter, index) => (
                        <div key={index} className="space-y-2 p-3 rounded-xl bg-background/30 border border-border/50">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Supporter name"
                              value={supporter.name}
                              onChange={(e) => updateSupporter(index, 'name', e.target.value)}
                              className="rounded-xl bg-background/50 flex-1"
                              disabled={sampleData}
                            />
                            {!sampleData && currentForm.supporters.length > 1 && (
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeSupporter(index)}>
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                          <Textarea
                            placeholder="Their feedback..."
                            value={supporter.feedback}
                            onChange={(e) => updateSupporter(index, 'feedback', e.target.value)}
                            rows={2}
                            className="rounded-xl bg-background/50"
                            disabled={sampleData}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            )}

            {/* Generate Button + Error */}
            <div className="space-y-3">
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full rounded-xl h-11 text-sm font-semibold forest-gradient text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                    Generating Plan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FiTarget className="w-4 h-4" />
                    Generate Plan
                  </span>
                )}
              </Button>
              {error && !loading && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-sm text-destructive">
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Agent Info */}
            <Card className="glass-card rounded-xl">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Powered By</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${activeAgentId === AGENT_ID ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span className="text-xs font-medium text-foreground">Weekly Plan Composer</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">Manager</Badge>
                  </div>
                  <div className="pl-4 space-y-1.5 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      Pact Interpreter
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      User Behavior Analyst
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      Supporter Insight Agent
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      Micro Goal & Nudge Generator
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right Panel: Output ── */}
          <div>
            <Card className="glass-card-strong rounded-xl min-h-[600px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FiCalendar className="w-4 h-4 text-primary" />
                  Your Personalized Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-auto max-h-[calc(100vh-220px)]">
                  <div className="pr-2">
                    <OutputPanel
                      data={currentData}
                      loading={loading}
                      error={!sampleData ? error : null}
                      onRetry={handleRetry}
                      rawResponse={rawResponse}
                    />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Agent Activity Panel */}
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
