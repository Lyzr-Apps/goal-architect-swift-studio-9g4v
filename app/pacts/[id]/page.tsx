'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import MicroGoalList from '@/components/MicroGoalList'
import WeeklyPlanView from '@/components/WeeklyPlanView'
import SupporterList from '@/components/SupporterList'
import CheckInForm from '@/components/CheckInForm'
import AIGoalArchitect from '@/components/AIGoalArchitect'
import VerificationPanel from '@/components/VerificationPanel'
import WeeklyReflectionForm from '@/components/WeeklyReflectionForm'
import ProgressCardDisplay from '@/components/ProgressCardDisplay'
import StreakCounter from '@/components/StreakCounter'
import TrustScoreBadge from '@/components/TrustScoreBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { usePacts } from '@/contexts/PactContext'
import type { Supporter, AIPlanOutput, DailyCheckIn, Verification, WeeklyReflection } from '@/lib/types'
import {
  FiArrowLeft, FiCalendar, FiTarget, FiZap, FiStar,
  FiTrash2, FiActivity, FiShield, FiBookOpen, FiAward,
} from 'react-icons/fi'

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function daysRemaining(endDate: string): number {
  if (!endDate) return 0
  const end = new Date(endDate).getTime()
  const now = Date.now()
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)))
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  paused: 'bg-amber-100 text-amber-700 border-amber-200',
  abandoned: 'bg-red-100 text-red-700 border-red-200',
}

const moodColors: Record<string, string> = {
  great: 'bg-emerald-100 text-emerald-700',
  good: 'bg-cyan-100 text-cyan-700',
  okay: 'bg-amber-100 text-amber-700',
  tough: 'bg-red-100 text-red-700',
}

const verMethodLabels: Record<string, string> = {
  photo: 'Photo Proof',
  strava: 'Strava',
  supporter: 'Supporter',
  self: 'Self Report',
  mixed: 'Mixed',
}

function PactDetailContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const {
    getPact, updatePact, deletePact, addCheckIn, toggleMicroGoal, toggleWeeklyDay,
    pacts, addVerification, confirmVerification, addWeeklyReflection,
    generateProgressCard, shareProgressCard,
  } = usePacts()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const pactId = typeof params?.id === 'string' ? params.id : ''
  const pact = getPact(pactId)

  if (!pact) {
    return (
      <div className="text-center py-12">
        <FiTarget className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-foreground mb-1">Pact not found</h3>
        <p className="text-sm text-muted-foreground mb-4">This pact may have been deleted.</p>
        <Button variant="outline" onClick={() => router.push('/pacts')} className="rounded-xl gap-1">
          <FiArrowLeft className="w-4 h-4" />
          Back to Pacts
        </Button>
      </div>
    )
  }

  const goals = Array.isArray(pact.microGoals) ? pact.microGoals : []
  const nudges = Array.isArray(pact.nudges) ? pact.nudges : []
  const weeklyPlan = Array.isArray(pact.weeklyPlan) ? pact.weeklyPlan : []
  const supporters = Array.isArray(pact.supporters) ? pact.supporters : []
  const checkIns = Array.isArray(pact.checkIns) ? pact.checkIns : []
  const verifications = Array.isArray(pact.verifications) ? pact.verifications : []
  const reflections = Array.isArray(pact.weeklyReflections) ? pact.weeklyReflections : []
  const progressCards = Array.isArray(pact.progressCards) ? pact.progressCards : []
  const remaining = daysRemaining(pact.endDate)
  const completedGoals = goals.filter(g => g.completed).length
  const verifiedCount = verifications.filter(v => v.status === 'verified').length

  const handleDelete = () => {
    deletePact(pact.id)
    router.push('/pacts')
  }

  const handleAddSupporter = (supporter: Supporter) => {
    updatePact({ ...pact, supporters: [...supporters, supporter] })
  }

  const handleRemoveSupporter = (id: string) => {
    updatePact({ ...pact, supporters: supporters.filter(s => s.id !== id) })
  }

  const handleCheckIn = (checkIn: DailyCheckIn) => {
    addCheckIn(pact.id, checkIn)
  }

  const handleApplyPlan = (plan: AIPlanOutput) => {
    updatePact({
      ...pact,
      microGoals: plan.microGoals.length > 0 ? plan.microGoals : pact.microGoals,
      nudges: plan.nudges.length > 0 ? plan.nudges : pact.nudges,
      weeklyPlan: plan.weeklyPlan.length > 0 ? plan.weeklyPlan : pact.weeklyPlan,
      aiPlan: plan,
      behavioralState: plan.behavioralState || pact.behavioralState,
      identityAffirmation: plan.identityAffirmation || pact.identityAffirmation,
    })
  }

  const handleAddVerification = (verification: Verification) => {
    addVerification(pact.id, verification)
  }

  const handleConfirmVerification = (verificationId: string) => {
    confirmVerification(pact.id, verificationId, user?.name ?? 'User')
  }

  const handleAddReflection = (reflection: WeeklyReflection) => {
    addWeeklyReflection(pact.id, reflection)
  }

  const handleGenerateCard = () => {
    generateProgressCard(pact.id)
  }

  const handleShareCard = (cardId: string) => {
    shareProgressCard(pact.id, cardId)
  }

  const recentCheckIns = pacts
    .flatMap(p => Array.isArray(p.checkIns) ? p.checkIns : [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(ci => ci.note || 'Check-in recorded')

  const diffDist = pact.aiPlan?.difficultyDistribution
  const previousCheckIn = checkIns.length > 0 ? checkIns[0] : null

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/pacts')} className="h-8 w-8 p-0 flex-shrink-0">
            <FiArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{pact.title}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className={`text-xs border ${statusColors[pact.status] ?? ''}`}>
                {pact.status}
              </Badge>
              {pact.category && (
                <Badge variant="outline" className="text-xs">{pact.category}</Badge>
              )}
              <Badge variant="outline" className="text-xs gap-0.5">
                <FiShield className="w-3 h-3" />
                {verMethodLabels[pact.verificationMethod] ?? pact.verificationMethod}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <FiCalendar className="w-3 h-3" />
                {formatDate(pact.startDate)} - {formatDate(pact.endDate)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive gap-1">
                <FiTrash2 className="w-3 h-3" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Pact</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{pact.title}&quot;? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Identity Card */}
      {(pact.identityStatement || pact.identityAffirmation) && (
        <Card className="glass-card rounded-xl border-[#00C4CC]/20">
          <CardContent className="p-5">
            {pact.identityStatement && (
              <div className="mb-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Your Identity Statement</p>
                <p className="text-sm text-foreground leading-relaxed">{pact.identityStatement}</p>
              </div>
            )}
            {pact.identityAffirmation && (
              <div className="relative rounded-lg overflow-hidden p-3 border border-[#00C4CC]/15">
                <div className="absolute inset-0 gropact-gradient opacity-[0.04]" />
                <div className="relative flex items-start gap-2">
                  <FiStar className="w-4 h-4 text-[#00C4CC] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-semibold text-[#00C4CC] uppercase tracking-widest mb-0.5">AI Affirmation</p>
                    <p className="text-sm text-foreground leading-relaxed italic">{pact.identityAffirmation}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start bg-muted/50 rounded-xl p-1 flex-wrap h-auto gap-0.5">
              <TabsTrigger value="overview" className="rounded-lg text-xs">Overview</TabsTrigger>
              <TabsTrigger value="goals" className="rounded-lg text-xs">Goals</TabsTrigger>
              <TabsTrigger value="plan" className="rounded-lg text-xs">Plan</TabsTrigger>
              <TabsTrigger value="verification" className="rounded-lg text-xs">Verification</TabsTrigger>
              <TabsTrigger value="supporters" className="rounded-lg text-xs">Supporters</TabsTrigger>
              <TabsTrigger value="checkins" className="rounded-lg text-xs">Check-ins</TabsTrigger>
              <TabsTrigger value="reflections" className="rounded-lg text-xs">Reflections</TabsTrigger>
              <TabsTrigger value="ai" className="rounded-lg text-xs">AI Plan</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="glass-card rounded-xl">
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-foreground">{pact.completionRate ?? 0}%</p>
                    <p className="text-[10px] text-muted-foreground">Completion</p>
                  </CardContent>
                </Card>
                <Card className="glass-card rounded-xl">
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-foreground">{pact.streak}</p>
                    <p className="text-[10px] text-muted-foreground">Day Streak</p>
                  </CardContent>
                </Card>
                <Card className="glass-card rounded-xl">
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-foreground">{completedGoals}/{goals.length}</p>
                    <p className="text-[10px] text-muted-foreground">Goals Done</p>
                  </CardContent>
                </Card>
                <Card className="glass-card rounded-xl">
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-foreground">{remaining}</p>
                    <p className="text-[10px] text-muted-foreground">Days Left</p>
                  </CardContent>
                </Card>
              </div>

              {/* Verified Count */}
              {verifiedCount > 0 && (
                <Card className="glass-card rounded-xl">
                  <CardContent className="p-3 flex items-center gap-3">
                    <FiShield className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{verifiedCount} Verified Actions</p>
                      <p className="text-[10px] text-muted-foreground">{verifications.length} total verifications submitted</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Next Goal */}
              {goals.find(g => !g.completed) && (
                <Card className="glass-card rounded-xl">
                  <CardContent className="p-4">
                    <p className="text-[10px] font-semibold text-[#00C4CC] uppercase tracking-widest mb-1">Next Goal</p>
                    <p className="text-sm text-foreground">{goals.find(g => !g.completed)?.goalText}</p>
                  </CardContent>
                </Card>
              )}

              <Card className="glass-card rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-foreground">Overall Progress</span>
                    <span className="text-xs text-muted-foreground">{pact.completionRate ?? 0}%</span>
                  </div>
                  <Progress value={pact.completionRate ?? 0} className="h-2" />
                </CardContent>
              </Card>

              {diffDist && (diffDist.easyPercent + diffDist.mediumPercent + diffDist.hardPercent) > 0 && (
                <Card className="glass-card rounded-xl">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-foreground mb-2">Difficulty Mix</p>
                    <div className="flex items-center gap-3">
                      <div className="flex rounded-full overflow-hidden h-2 bg-muted flex-1">
                        <div className="bg-cyan-500" style={{ width: `${diffDist.easyPercent}%` }} />
                        <div className="bg-amber-500" style={{ width: `${diffDist.mediumPercent}%` }} />
                        <div className="bg-red-500" style={{ width: `${diffDist.hardPercent}%` }} />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />{diffDist.easyPercent}%</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{diffDist.mediumPercent}%</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{diffDist.hardPercent}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {checkIns.length > 0 && (
                <Card className="glass-card rounded-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Recent Check-ins</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {checkIns.slice(0, 3).map((ci) => (
                      <div key={ci.id} className="flex items-start gap-2">
                        <Badge className={`text-[9px] px-1.5 py-0 flex-shrink-0 mt-0.5 ${moodColors[ci.mood] ?? 'bg-muted'}`}>
                          {ci.mood}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground truncate">{ci.note || 'Check-in recorded'}</p>
                          <p className="text-[10px] text-muted-foreground">{formatDate(ci.date)}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Progress Cards */}
              {progressCards.length > 0 && (
                <Card className="glass-card rounded-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FiAward className="w-4 h-4 text-[#00C4CC]" />
                      Progress Cards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressCardDisplay
                      cards={progressCards}
                      onGenerate={handleGenerateCard}
                      onShare={handleShareCard}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Micro-Goals */}
            <TabsContent value="goals" className="mt-4">
              <MicroGoalList
                goals={goals}
                onToggle={(goalId) => toggleMicroGoal(pact.id, goalId)}
                verifications={verifications}
                onRequestVerification={(goalId) => {
                  const goal = goals.find(g => g.id === goalId)
                  if (goal) {
                    const verification: Verification = {
                      id: 'ver-' + Date.now().toString(36),
                      pactId: pact.id,
                      type: 'self_report',
                      status: 'pending',
                      evidence: `Goal completed: ${goal.goalText}`,
                      createdAt: new Date().toISOString(),
                      note: goal.goalText,
                    }
                    handleAddVerification(verification)
                  }
                }}
              />
            </TabsContent>

            {/* Weekly Plan */}
            <TabsContent value="plan" className="mt-4">
              <WeeklyPlanView
                plan={weeklyPlan}
                onToggle={(dayIndex) => toggleWeeklyDay(pact.id, dayIndex)}
                verifications={verifications}
              />
            </TabsContent>

            {/* Verification */}
            <TabsContent value="verification" className="mt-4">
              <VerificationPanel
                pactId={pact.id}
                verifications={verifications}
                supporters={supporters}
                verificationMethod={pact.verificationMethod}
                onAddVerification={handleAddVerification}
                onConfirmVerification={handleConfirmVerification}
              />
            </TabsContent>

            {/* Supporters */}
            <TabsContent value="supporters" className="mt-4">
              <SupporterList
                supporters={supporters}
                onAdd={handleAddSupporter}
                onRemove={handleRemoveSupporter}
              />
            </TabsContent>

            {/* Check-ins */}
            <TabsContent value="checkins" className="space-y-4 mt-4">
              <CheckInForm
                microGoals={goals}
                onSubmit={handleCheckIn}
                identityStatement={pact.identityStatement}
                previousCheckIn={previousCheckIn}
                onRequestVerification={handleAddVerification}
                pactId={pact.id}
              />

              {checkIns.length > 0 && (
                <Card className="glass-card rounded-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Check-in History</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {checkIns.map((ci) => (
                      <div key={ci.id} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-[9px] px-1.5 py-0 ${moodColors[ci.mood] ?? 'bg-muted'}`}>
                            {ci.mood}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{formatDate(ci.date)}</span>
                        </div>
                        <p className="text-sm text-foreground">{ci.note || 'No note'}</p>
                        {Array.isArray(ci.completedGoals) && ci.completedGoals.length > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Completed {ci.completedGoals.length} goal(s)
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Reflections */}
            <TabsContent value="reflections" className="mt-4">
              <WeeklyReflectionForm
                pactId={pact.id}
                pactStartDate={pact.startDate}
                existingReflections={reflections}
                onSubmit={handleAddReflection}
              />
            </TabsContent>

            {/* AI Plan */}
            <TabsContent value="ai" className="mt-4">
              <AIGoalArchitect
                pactTitle={pact.title}
                pactDescription={pact.description}
                startDate={pact.startDate?.split('T')[0] ?? ''}
                endDate={pact.endDate?.split('T')[0] ?? ''}
                supporters={supporters.map(s => ({ name: s.name, feedback: s.feedback }))}
                userName={user?.name ?? 'User'}
                currentStreak={user?.currentStreak ?? 0}
                completionRate={user?.completionRate ?? 0}
                recentCheckIns={recentCheckIns}
                onApply={handleApplyPlan}
              />

              {pact.aiPlan?.explanations && (
                <Card className="glass-card rounded-xl mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">AI Explanations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pact.aiPlan.explanations.pactInterpretation && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Pact Interpretation</p>
                        <p className="text-sm text-foreground leading-relaxed">{pact.aiPlan.explanations.pactInterpretation}</p>
                      </div>
                    )}
                    {pact.aiPlan.explanations.behaviorInsights && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Behavior Insights</p>
                        <p className="text-sm text-foreground leading-relaxed">{pact.aiPlan.explanations.behaviorInsights}</p>
                      </div>
                    )}
                    {pact.aiPlan.explanations.supporterInsights && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Supporter Insights</p>
                        <p className="text-sm text-foreground leading-relaxed">{pact.aiPlan.explanations.supporterInsights}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar stats */}
        <div className="lg:w-64 space-y-4 flex-shrink-0">
          <Card className="glass-card rounded-xl">
            <CardContent className="p-4 space-y-3">
              <StreakCounter streak={pact.streak} />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium text-foreground">{pact.completionRate ?? 0}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Days Left</span>
                  <span className="font-medium text-foreground">{remaining}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Check-ins</span>
                  <span className="font-medium text-foreground">{checkIns.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Supporters</span>
                  <span className="font-medium text-foreground">{supporters.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Verified</span>
                  <span className="font-medium text-emerald-600">{verifiedCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Reflections</span>
                  <span className="font-medium text-foreground">{reflections.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Cards */}
          <Card className="glass-card rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <FiAward className="w-3.5 h-3.5 text-[#00C4CC]" />
                Progress Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressCardDisplay
                cards={progressCards}
                onGenerate={handleGenerateCard}
                onShare={handleShareCard}
              />
            </CardContent>
          </Card>

          {/* Nudges */}
          {nudges.length > 0 && (
            <Card className="glass-card rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <FiZap className="w-3.5 h-3.5 text-[#00C4CC]" />
                  Nudges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {nudges.slice(0, 3).map((nudge, i) => (
                  <div key={i} className="p-2 rounded-lg bg-muted/30">
                    <p className="text-xs text-foreground leading-relaxed">{nudge.nudgeText}</p>
                    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide mt-1">{nudge.behavioralPrinciple}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AppShell showSidebar={false}>
      <PactDetailContent />
    </AppShell>
  )
}
