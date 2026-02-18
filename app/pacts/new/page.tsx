'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import AIGoalArchitect from '@/components/AIGoalArchitect'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { usePacts } from '@/contexts/PactContext'
import { generateUUID } from '@/lib/utils'
import type { Pact, AIPlanOutput, Supporter } from '@/lib/types'
import {
  FiArrowLeft, FiArrowRight, FiCheck, FiPlus, FiTrash2,
  FiTarget, FiUsers, FiActivity, FiCalendar, FiStar,
} from 'react-icons/fi'

const CATEGORIES = ['Fitness', 'Learning', 'Creative', 'Wellness', 'Career', 'Finance', 'Social', 'Other']

function detectCategory(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase()
  if (/run|gym|workout|exercise|yoga|swim|bike|fitness|weight|muscle/.test(text)) return 'Fitness'
  if (/read|book|learn|study|course|skill|language|code|program/.test(text)) return 'Learning'
  if (/paint|draw|music|guitar|write|art|creative|design|photo/.test(text)) return 'Creative'
  if (/meditat|sleep|mindful|health|diet|water|stretch|mental/.test(text)) return 'Wellness'
  if (/job|career|resume|network|side project|business|promotion/.test(text)) return 'Career'
  if (/save|invest|budget|money|finance|debt/.test(text)) return 'Finance'
  return 'Other'
}

function NewPactContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { createPact, pacts } = usePacts()

  const [step, setStep] = useState(1)
  const totalSteps = 5

  // Step 1
  const [identityStatement, setIdentityStatement] = useState('')
  const [whyItMatters, setWhyItMatters] = useState('')

  // Step 2
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Step 3
  const [supporters, setSupporters] = useState<{ name: string; feedback: string }[]>([
    { name: '', feedback: '' },
  ])

  // Step 4
  const [aiPlan, setAiPlan] = useState<AIPlanOutput | null>(null)

  const detectedCategory = detectCategory(title, description)
  const activeCategory = category || detectedCategory

  const canNext = (): boolean => {
    switch (step) {
      case 1: return identityStatement.trim().length > 0
      case 2: return title.trim().length > 0 && startDate.length > 0 && endDate.length > 0
      case 3: return true
      case 4: return true
      case 5: return true
      default: return false
    }
  }

  const addSupporter = () => {
    setSupporters(prev => [...prev, { name: '', feedback: '' }])
  }

  const removeSupporter = (index: number) => {
    setSupporters(prev => prev.filter((_, i) => i !== index))
  }

  const updateSupporter = (index: number, field: 'name' | 'feedback', value: string) => {
    setSupporters(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  const handleApplyPlan = (plan: AIPlanOutput) => {
    setAiPlan(plan)
  }

  const handleCreate = () => {
    if (!user) return

    const pactSupporters: Supporter[] = supporters
      .filter(s => s.name.trim())
      .map((s, i) => ({
        id: 'sup-' + generateUUID().slice(0, 8),
        name: s.name.trim(),
        feedback: s.feedback.trim(),
        addedDate: new Date().toISOString(),
      }))

    const newPact: Pact = {
      id: 'pact-' + generateUUID().slice(0, 8),
      userId: user.id,
      title: title.trim(),
      description: (description.trim() + (whyItMatters.trim() ? '\n\nWhy it matters: ' + whyItMatters.trim() : '')),
      identityStatement: identityStatement.trim(),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status: 'active',
      category: activeCategory,
      supporters: pactSupporters,
      microGoals: aiPlan?.microGoals ?? [],
      nudges: aiPlan?.nudges ?? [],
      weeklyPlan: aiPlan?.weeklyPlan ?? [],
      checkIns: [],
      aiPlan: aiPlan ?? undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      streak: 0,
      completionRate: 0,
      behavioralState: aiPlan?.behavioralState,
      identityAffirmation: aiPlan?.identityAffirmation,
    }

    createPact(newPact)
    router.push(`/pacts/${newPact.id}`)
  }

  // Gather recent check-in notes
  const recentCheckIns = pacts
    .flatMap(p => Array.isArray(p.checkIns) ? p.checkIns : [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(ci => ci.note || 'Check-in recorded')

  const stepIcons = [FiStar, FiTarget, FiUsers, FiActivity, FiCheck]

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in-up">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="h-8 w-8 p-0">
          <FiArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Create New Pact</h1>
          <p className="text-xs text-muted-foreground">Step {step} of {totalSteps}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <Progress value={(step / totalSteps) * 100} className="h-2" />
        <div className="flex justify-between">
          {Array.from({ length: totalSteps }, (_, i) => {
            const StepIcon = stepIcons[i]
            const completed = i + 1 < step
            const current = i + 1 === step
            return (
              <button
                key={i}
                onClick={() => { if (i + 1 <= step) setStep(i + 1) }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${completed ? 'bg-[#00C4CC] text-white' : current ? 'bg-[#00C4CC]/20 text-[#00C4CC] border-2 border-[#00C4CC]' : 'bg-muted text-muted-foreground'}`}
              >
                {completed ? <FiCheck className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 1: Identity */}
      {step === 1 && (
        <Card className="glass-card rounded-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FiStar className="w-4 h-4 text-[#00C4CC]" />
              Identity and Reason
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Who do you want to become? *</Label>
              <Textarea
                placeholder='e.g., "I am a person who prioritizes my health and shows up for my goals every day."'
                value={identityStatement}
                onChange={(e) => setIdentityStatement(e.target.value)}
                rows={3}
                className="rounded-xl bg-background/50 resize-none"
              />
              <p className="text-[10px] text-muted-foreground">This identity statement anchors your pact to who you are becoming, not just what you are doing.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Why does this matter to you?</Label>
              <Textarea
                placeholder="What will change in your life when you achieve this? What is at stake?"
                value={whyItMatters}
                onChange={(e) => setWhyItMatters(e.target.value)}
                rows={3}
                className="rounded-xl bg-background/50 resize-none"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Goal Definition */}
      {step === 2 && (
        <Card className="glass-card rounded-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FiTarget className="w-4 h-4 text-[#00C4CC]" />
              Goal Definition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">What is your pact? *</Label>
              <Input
                placeholder="e.g., Run a 5K in Under 30 Minutes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl bg-background/50 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Describe your commitment in detail</Label>
              <Textarea
                placeholder="What does success look like? What specific outcomes are you targeting?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="rounded-xl bg-background/50 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat === category ? '' : cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${(category || detectedCategory) === cat ? 'border-[#00C4CC] bg-[#00C4CC]/10 text-[#00C4CC]' : 'border-border text-muted-foreground hover:border-foreground'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {!category && detectedCategory !== 'Other' && (
                <p className="text-[10px] text-muted-foreground">Auto-detected: {detectedCategory}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Start Date *</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl bg-background/50 h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">End Date *</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-xl bg-background/50 h-9 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Supporters */}
      {step === 3 && (
        <Card className="glass-card rounded-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FiUsers className="w-4 h-4 text-[#00C4CC]" />
              Supporters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Add people who will support your journey. Their feedback helps the AI create better plans.</p>
            {supporters.map((supporter, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1 space-y-1.5">
                  <Input
                    placeholder="Supporter name"
                    value={supporter.name}
                    onChange={(e) => updateSupporter(index, 'name', e.target.value)}
                    className="rounded-xl bg-background/50 h-8 text-xs"
                  />
                  <Textarea
                    placeholder="Their observations, feedback, or advice..."
                    value={supporter.feedback}
                    onChange={(e) => updateSupporter(index, 'feedback', e.target.value)}
                    rows={2}
                    className="rounded-xl bg-background/50 text-xs resize-none"
                  />
                </div>
                {supporters.length > 1 && (
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => removeSupporter(index)}>
                    <FiTrash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-1 text-xs rounded-xl" onClick={addSupporter}>
              <FiPlus className="w-3 h-3" />
              Add Another Supporter
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 4: AI Goal Architect */}
      {step === 4 && (
        <Card className="glass-card rounded-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FiActivity className="w-4 h-4 text-[#00C4CC]" />
              AI Goal Architect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIGoalArchitect
              pactTitle={title}
              pactDescription={description + (whyItMatters ? '\n\nWhy it matters: ' + whyItMatters : '')}
              startDate={startDate}
              endDate={endDate}
              supporters={supporters.filter(s => s.name.trim())}
              userName={user?.name ?? 'User'}
              currentStreak={user?.currentStreak ?? 0}
              completionRate={user?.completionRate ?? 0}
              recentCheckIns={recentCheckIns}
              onApply={handleApplyPlan}
            />
            {!aiPlan && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                You can skip this step and generate a plan later.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <Card className="glass-card rounded-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FiCheck className="w-4 h-4 text-[#00C4CC]" />
              Review and Create
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Identity</p>
                <p className="text-sm text-foreground">{identityStatement}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Pact</p>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
              </div>

              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">{activeCategory}</Badge>
                <Badge variant="outline" className="text-xs">
                  <FiCalendar className="w-3 h-3 mr-1" />
                  {startDate} to {endDate}
                </Badge>
              </div>

              {supporters.filter(s => s.name.trim()).length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Supporters</p>
                  <div className="flex gap-2">
                    {supporters.filter(s => s.name.trim()).map((s, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className="w-6 h-6 rounded-full bg-[#00C4CC]/15 flex items-center justify-center text-[10px] font-semibold text-[#00C4CC]">
                          {s.name[0]?.toUpperCase()}
                        </div>
                        <span className="text-xs text-foreground">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiPlan && (
                <div className="p-3 rounded-lg bg-[#00C4CC]/5 border border-[#00C4CC]/20">
                  <p className="text-[10px] text-[#00C4CC] uppercase tracking-widest mb-0.5">AI Plan Applied</p>
                  <p className="text-xs text-foreground">
                    {(Array.isArray(aiPlan.microGoals) ? aiPlan.microGoals : []).length} micro-goals,{' '}
                    {(Array.isArray(aiPlan.nudges) ? aiPlan.nudges : []).length} nudges,{' '}
                    {(Array.isArray(aiPlan.weeklyPlan) ? aiPlan.weeklyPlan : []).length}-day plan
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={handleCreate}
              className="w-full rounded-xl h-11 text-sm font-semibold gropact-gradient text-white"
            >
              Create Pact
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="gap-1 text-sm"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </Button>
        {step < totalSteps ? (
          <Button
            onClick={() => setStep(Math.min(totalSteps, step + 1))}
            disabled={!canNext()}
            className="gap-1 text-sm gropact-gradient text-white rounded-xl"
          >
            Next
            <FiArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            className="gap-1 text-sm gropact-gradient text-white rounded-xl"
          >
            <FiCheck className="w-4 h-4" />
            Create Pact
          </Button>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AppShell showSidebar={false}>
      <NewPactContent />
    </AppShell>
  )
}
