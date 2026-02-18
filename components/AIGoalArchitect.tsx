'use client'

import { useState, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  FiTarget, FiTrendingUp, FiUsers, FiCalendar, FiCopy, FiDownload,
  FiRefreshCw, FiChevronDown, FiChevronRight, FiCheck, FiAlertCircle,
  FiStar, FiZap, FiActivity, FiBookOpen, FiArrowRight,
} from 'react-icons/fi'
import type { AIPlanOutput, MicroGoal } from '@/lib/types'

const AGENT_ID = '69951bcac0c7cf4934c52cc7'

interface AIGoalArchitectProps {
  pactTitle: string
  pactDescription: string
  startDate: string
  endDate: string
  supporters: { name: string; feedback: string }[]
  userName: string
  currentStreak: number
  completionRate: number
  recentCheckIns: string[]
  onApply?: (plan: AIPlanOutput) => void
}

// ── Agent response interfaces ──
interface AgentMicroGoal {
  goal_text: string
  difficulty: string
  due_date: string
  reasoning: string
  measurable_outcome: string
}

interface AgentNudge {
  nudge_text: string
  behavioral_principle: string
}

interface AgentWeeklyPlanDay {
  day: string
  micro_goal: string
  reminder: string
  supporter_prompt: string
}

interface AgentResponse {
  behavioral_state: string
  identity_affirmation: string
  micro_goals: AgentMicroGoal[]
  nudges: AgentNudge[]
  weekly_plan: AgentWeeklyPlanDay[]
  explanations: {
    pact_interpretation: string
    behavior_insights: string
    supporter_insights: string
  }
  difficulty_distribution: {
    easy_percent: number
    medium_percent: number
    hard_percent: number
  }
}

// ── Helpers ──
function parseAgentResponse(result: any): AgentResponse | null {
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
      return parsed as AgentResponse
    }
    if (result?.response?.result?.text) {
      try {
        const tp = JSON.parse(result.response.result.text)
        if (tp && 'behavioral_state' in tp) return tp as AgentResponse
      } catch { /* not JSON */ }
    }
    if (result?.response?.message) {
      try {
        const mp = JSON.parse(result.response.message)
        if (mp && 'behavioral_state' in mp) return mp as AgentResponse
      } catch { /* not JSON */ }
    }
    return null
  } catch {
    return null
  }
}

function convertToPlanOutput(agent: AgentResponse): AIPlanOutput {
  const microGoals: MicroGoal[] = (Array.isArray(agent.micro_goals) ? agent.micro_goals : []).map((g, i) => ({
    id: 'ai-mg-' + i,
    goalText: g.goal_text ?? '',
    difficulty: (['easy', 'medium', 'hard'].includes((g.difficulty ?? '').toLowerCase()) ? g.difficulty.toLowerCase() : 'medium') as 'easy' | 'medium' | 'hard',
    dueDate: g.due_date ?? '',
    reasoning: g.reasoning ?? '',
    measurableOutcome: g.measurable_outcome ?? '',
    completed: false,
  }))

  return {
    behavioralState: agent.behavioral_state ?? '',
    identityAffirmation: agent.identity_affirmation ?? '',
    microGoals,
    nudges: (Array.isArray(agent.nudges) ? agent.nudges : []).map(n => ({
      nudgeText: n.nudge_text ?? '',
      behavioralPrinciple: n.behavioral_principle ?? '',
    })),
    weeklyPlan: (Array.isArray(agent.weekly_plan) ? agent.weekly_plan : []).map(d => ({
      day: d.day ?? '',
      microGoal: d.micro_goal ?? '',
      reminder: d.reminder ?? '',
      supporterPrompt: d.supporter_prompt ?? '',
      completed: false,
    })),
    explanations: {
      pactInterpretation: agent.explanations?.pact_interpretation ?? '',
      behaviorInsights: agent.explanations?.behavior_insights ?? '',
      supporterInsights: agent.explanations?.supporter_insights ?? '',
    },
    difficultyDistribution: {
      easyPercent: agent.difficulty_distribution?.easy_percent ?? 0,
      mediumPercent: agent.difficulty_distribution?.medium_percent ?? 0,
      hardPercent: agent.difficulty_distribution?.hard_percent ?? 0,
    },
  }
}

function getDifficultyColor(difficulty: string): string {
  const d = (difficulty ?? '').toLowerCase()
  if (d === 'easy') return 'bg-cyan-100 text-cyan-700 border-cyan-200'
  if (d === 'hard') return 'bg-red-100 text-red-700 border-red-200'
  return 'bg-amber-100 text-amber-700 border-amber-200'
}

function getDifficultyBorderColor(difficulty: string): string {
  const d = (difficulty ?? '').toLowerCase()
  if (d === 'easy') return 'border-l-cyan-500'
  if (d === 'hard') return 'border-l-red-500'
  return 'border-l-amber-500'
}

function getBehavioralStateLabel(state: string) {
  const s = (state ?? '').toLowerCase()
  if (s === 'new') return { label: 'New User', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' }
  if (s === 'consistent') return { label: 'Consistent Performer', color: 'bg-teal-100 text-teal-700 border-teal-200' }
  if (s === 'inconsistent') return { label: 'Inconsistent Pattern', color: 'bg-amber-100 text-amber-700 border-amber-200' }
  if (s === 'struggling') return { label: 'Struggling', color: 'bg-red-100 text-red-700 border-red-200' }
  if (s === 'recovery') return { label: 'Recovery Mode', color: 'bg-purple-100 text-purple-700 border-purple-200' }
  return { label: state || 'Unknown', color: 'bg-gray-100 text-gray-700 border-gray-200' }
}

// ── Sub-components ──
function OutputSkeleton() {
  return (
    <div className="space-y-5 fade-in">
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="space-y-3">
        {[1, 2, 3].map(n => <Skeleton key={n} className="h-24 w-full rounded-xl" />)}
      </div>
      <div className="space-y-3">
        {[1, 2].map(n => <Skeleton key={n} className="h-16 w-full rounded-xl" />)}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7].map(n => <Skeleton key={n} className="h-16 w-full rounded-xl" />)}
      </div>
      <p className="text-sm text-muted-foreground text-center animate-pulse pt-2">Generating your personalized plan...</p>
    </div>
  )
}

function MicroGoalCard({ goal }: { goal: AgentMicroGoal }) {
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
                  <FiTarget className="w-3 h-3 text-[#00C4CC]" />
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

function NudgeCard({ nudge }: { nudge: AgentNudge }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50">
      <div className="w-7 h-7 rounded-lg bg-[#00C4CC]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <FiZap className="w-3.5 h-3.5 text-[#00C4CC]" />
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

function DayCard({ day, index }: { day: AgentWeeklyPlanDay; index: number }) {
  const dayColors = ['bg-cyan-500', 'bg-cyan-600', 'bg-teal-500', 'bg-cyan-500', 'bg-teal-600', 'bg-cyan-600', 'bg-teal-500']
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
            <FiUsers className="w-3 h-3 text-[#00C4CC] flex-shrink-0" />
            <p className="text-[11px] text-[#00C4CC] leading-relaxed">{day.supporter_prompt}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function DifficultyBar({ distribution }: { distribution: { easy_percent: number; medium_percent: number; hard_percent: number } | undefined }) {
  const easy = distribution?.easy_percent ?? 0
  const medium = distribution?.medium_percent ?? 0
  const hard = distribution?.hard_percent ?? 0
  const total = easy + medium + hard
  if (total === 0) return null
  return (
    <div className="flex items-center gap-3">
      <div className="flex rounded-full overflow-hidden h-2 bg-muted flex-1">
        {easy > 0 && <div className="bg-cyan-500 transition-all duration-500" style={{ width: `${(easy / total) * 100}%` }} />}
        {medium > 0 && <div className="bg-amber-500 transition-all duration-500" style={{ width: `${(medium / total) * 100}%` }} />}
        {hard > 0 && <div className="bg-red-500 transition-all duration-500" style={{ width: `${(hard / total) * 100}%` }} />}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-shrink-0">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />{easy}%</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{medium}%</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{hard}%</span>
      </div>
    </div>
  )
}

// ── Main Component ──
export default function AIGoalArchitect({
  pactTitle,
  pactDescription,
  startDate,
  endDate,
  supporters,
  userName,
  currentStreak,
  completionRate,
  recentCheckIns,
  onApply,
}: AIGoalArchitectProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agentData, setAgentData] = useState<AgentResponse | null>(null)
  const [rawResponse, setRawResponse] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [microGoalsOpen, setMicroGoalsOpen] = useState(true)
  const [nudgesOpen, setNudgesOpen] = useState(true)
  const [weeklyPlanOpen, setWeeklyPlanOpen] = useState(true)
  const [applied, setApplied] = useState(false)

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setError(null)
    setAgentData(null)
    setRawResponse(null)
    setApplied(false)

    const payload = {
      pact: {
        title: pactTitle,
        description: pactDescription,
        start_date: startDate,
        end_date: endDate,
      },
      user_profile: {
        name: userName,
        current_streak: currentStreak,
        last_check_in: new Date().toISOString().split('T')[0],
        completion_rate: completionRate,
        recent_check_ins: Array.isArray(recentCheckIns) ? recentCheckIns : [],
      },
      supporter_feedback: (Array.isArray(supporters) ? supporters : [])
        .filter(s => s.name?.trim())
        .map(s => ({
          supporter_name: s.name,
          feedback: s.feedback,
        })),
    }

    try {
      const result = await callAIAgent(JSON.stringify(payload), AGENT_ID)
      if (result.success) {
        setRawResponse(result)
        const parsed = parseAgentResponse(result)
        if (parsed) {
          setAgentData(parsed)
        } else {
          setError('The agent returned an unexpected response format. Please try again.')
        }
      } else {
        setError(result?.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [pactTitle, pactDescription, startDate, endDate, supporters, userName, currentStreak, completionRate, recentCheckIns])

  const handleCopyJson = useCallback(async () => {
    const jsonStr = JSON.stringify(agentData ?? rawResponse ?? {}, null, 2)
    const success = await copyToClipboard(jsonStr)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [agentData, rawResponse])

  const handleExport = useCallback(() => {
    const jsonStr = JSON.stringify(agentData ?? rawResponse ?? {}, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gropact-plan-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [agentData, rawResponse])

  const handleApply = useCallback(() => {
    if (!agentData || !onApply) return
    const plan = convertToPlanOutput(agentData)
    onApply(plan)
    setApplied(true)
  }, [agentData, onApply])

  // No data yet -- show generate button
  if (!loading && !agentData && !error) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-[#00C4CC]/10 flex items-center justify-center mx-auto mb-4">
            <FiActivity className="w-8 h-8 text-[#00C4CC]" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">AI Goal Architect</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Generate a personalized, science-backed plan tailored to your behavioral patterns and supporter network.
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          className="w-full rounded-xl h-11 text-sm font-semibold gropact-gradient text-white shadow-md shadow-[#00C4CC]/20"
          disabled={!pactTitle?.trim()}
        >
          <span className="flex items-center gap-2">
            Generate AI Plan
            <FiArrowRight className="w-4 h-4" />
          </span>
        </Button>
        {!pactTitle?.trim() && (
          <p className="text-xs text-muted-foreground text-center">Please fill in the pact details first.</p>
        )}
      </div>
    )
  }

  if (loading) return <OutputSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <FiAlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">Something went wrong</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{error}</p>
        <Button onClick={handleGenerate} variant="outline" size="sm" className="gap-2 rounded-xl">
          <FiRefreshCw className="w-3.5 h-3.5" />
          Try Again
        </Button>
      </div>
    )
  }

  if (!agentData) return null

  const stateInfo = getBehavioralStateLabel(agentData.behavioral_state ?? '')
  const microGoals = Array.isArray(agentData.micro_goals) ? agentData.micro_goals : []
  const nudges = Array.isArray(agentData.nudges) ? agentData.nudges : []
  const weeklyPlan = Array.isArray(agentData.weekly_plan) ? agentData.weekly_plan : []

  return (
    <div className="space-y-6 fade-in-up">
      {/* Actions bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Badge className={`${stateInfo.color} rounded-full px-3 py-1 text-[11px] font-semibold border`}>
          {stateInfo.label}
        </Badge>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={handleCopyJson}>
            {copied ? <FiCheck className="w-3.5 h-3.5 text-cyan-600" /> : <FiCopy className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={handleExport}>
            <FiDownload className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={handleGenerate}>
            <FiRefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Identity Affirmation */}
      {agentData.identity_affirmation && (
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 gropact-gradient opacity-[0.06]" />
          <div className="relative p-5 border border-[#00C4CC]/15 rounded-xl">
            <div className="flex items-start gap-3">
              <FiStar className="w-4 h-4 text-[#00C4CC] flex-shrink-0 mt-1" />
              <div>
                <p className="text-[10px] font-semibold text-[#00C4CC] uppercase tracking-widest mb-1.5">Your Identity</p>
                <p className="text-sm text-foreground leading-relaxed italic">{agentData.identity_affirmation}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Difficulty Distribution */}
      <DifficultyBar distribution={agentData.difficulty_distribution} />

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
            {microGoals.map((goal, i) => <MicroGoalCard key={i} goal={goal} />)}
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
            {nudges.map((nudge, i) => <NudgeCard key={i} nudge={nudge} />)}
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
            {weeklyPlan.map((day, i) => <DayCard key={i} day={day} index={i} />)}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Explanations */}
      {agentData.explanations && (
        <Accordion type="multiple" className="space-y-1.5">
          {agentData.explanations.pact_interpretation && (
            <AccordionItem value="pact" className="rounded-xl border bg-card/50 px-4">
              <AccordionTrigger className="text-xs font-medium py-2.5 hover:no-underline text-muted-foreground">
                <span className="flex items-center gap-1.5"><FiBookOpen className="w-3 h-3" /> Pact Interpretation</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-sm leading-relaxed text-foreground">
                {agentData.explanations.pact_interpretation}
              </AccordionContent>
            </AccordionItem>
          )}
          {agentData.explanations.behavior_insights && (
            <AccordionItem value="behavior" className="rounded-xl border bg-card/50 px-4">
              <AccordionTrigger className="text-xs font-medium py-2.5 hover:no-underline text-muted-foreground">
                <span className="flex items-center gap-1.5"><FiActivity className="w-3 h-3" /> Behavior Insights</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-sm leading-relaxed text-foreground">
                {agentData.explanations.behavior_insights}
              </AccordionContent>
            </AccordionItem>
          )}
          {agentData.explanations.supporter_insights && (
            <AccordionItem value="supporter" className="rounded-xl border bg-card/50 px-4">
              <AccordionTrigger className="text-xs font-medium py-2.5 hover:no-underline text-muted-foreground">
                <span className="flex items-center gap-1.5"><FiUsers className="w-3 h-3" /> Supporter Insights</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-sm leading-relaxed text-foreground">
                {agentData.explanations.supporter_insights}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}

      {/* Apply button */}
      {onApply && (
        <div className="pt-2">
          {applied ? (
            <div className="flex items-center gap-2 justify-center text-sm text-emerald-600 bg-emerald-50 rounded-xl py-3">
              <FiCheck className="w-4 h-4" />
              Plan applied to your pact!
            </div>
          ) : (
            <Button
              onClick={handleApply}
              className="w-full rounded-xl h-11 text-sm font-semibold gropact-gradient text-white"
            >
              Apply Plan to Pact
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
