'use client'

import { useState, useMemo } from 'react'
import AppShell from '@/components/AppShell'
import PactCard from '@/components/PactCard'
import TrustScoreBadge from '@/components/TrustScoreBadge'
import StreakCounter from '@/components/StreakCounter'
import ProgressCardDisplay from '@/components/ProgressCardDisplay'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { usePacts } from '@/contexts/PactContext'
import {
  FiUser, FiEdit, FiCheck, FiTarget, FiTrendingUp,
  FiZap, FiAward, FiCalendar, FiX, FiShield,
  FiBookOpen, FiUsers, FiActivity,
} from 'react-icons/fi'

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

const tierLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-gray-100 text-gray-700' },
  mid: { label: 'Growth', color: 'bg-blue-100 text-blue-700' },
  premium: { label: 'Pro', color: 'bg-[#00C4CC]/10 text-[#00C4CC]' },
}

function ProfileContent() {
  const { user, updateProfile } = useAuth()
  const { pacts, generateProgressCard, shareProgressCard } = usePacts()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(user?.name ?? '')
  const [editBio, setEditBio] = useState(user?.bio ?? '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateProfile({ name: editName.trim(), bio: editBio.trim() })
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const initial = (user?.name ?? 'U')[0]?.toUpperCase() ?? 'U'
  const tier = user?.tier ?? 'free'
  const tierInfo = tierLabels[tier] ?? tierLabels.free

  // Computed stats
  const totalVerifications = useMemo(() => {
    return pacts.reduce((sum, p) => {
      const vs = Array.isArray(p.verifications) ? p.verifications : []
      return sum + vs.filter(v => v.status === 'verified').length
    }, 0)
  }, [pacts])

  const totalReflections = useMemo(() => {
    return pacts.reduce((sum, p) => {
      const rs = Array.isArray(p.weeklyReflections) ? p.weeklyReflections : []
      return sum + rs.length
    }, 0)
  }, [pacts])

  const totalSupporters = useMemo(() => {
    return pacts.reduce((sum, p) => {
      const ss = Array.isArray(p.supporters) ? p.supporters : []
      return sum + ss.length
    }, 0)
  }, [pacts])

  const allProgressCards = useMemo(() => {
    return pacts.flatMap(p => Array.isArray(p.progressCards) ? p.progressCards : [])
  }, [pacts])

  // Achievements - 8 possible
  const achievements = useMemo(() => {
    const list = []
    const totalPacts = user?.totalPacts ?? pacts.length
    const completedPacts = user?.completedPacts ?? pacts.filter(p => p.status === 'completed').length
    const currentStreak = user?.currentStreak ?? 0
    const longestStreak = user?.longestStreak ?? 0
    const completionRate = user?.completionRate ?? 0
    const trustScore = user?.trustScore ?? 50

    if (totalPacts >= 1) list.push({ label: 'First Pact', desc: 'Created your first pact', icon: FiTarget, unlocked: true })
    else list.push({ label: 'First Pact', desc: 'Create your first pact', icon: FiTarget, unlocked: false })

    if (completedPacts >= 1) list.push({ label: 'Finisher', desc: 'Completed a pact', icon: FiCheck, unlocked: true })
    else list.push({ label: 'Finisher', desc: 'Complete a pact to unlock', icon: FiCheck, unlocked: false })

    if (currentStreak >= 7) list.push({ label: 'Week Warrior', desc: '7-day streak achieved', icon: FiZap, unlocked: true })
    else list.push({ label: 'Week Warrior', desc: `${currentStreak}/7 day streak needed`, icon: FiZap, unlocked: false })

    if (longestStreak >= 30) list.push({ label: 'Streak Legend', desc: '30+ day best streak', icon: FiAward, unlocked: true })
    else list.push({ label: 'Streak Legend', desc: `${longestStreak}/30 day streak needed`, icon: FiAward, unlocked: false })

    if (completionRate >= 80) list.push({ label: 'Achiever', desc: '80%+ completion rate', icon: FiTrendingUp, unlocked: true })
    else list.push({ label: 'Achiever', desc: `${completionRate}%/80% completion needed`, icon: FiTrendingUp, unlocked: false })

    if (totalVerifications >= 5) list.push({ label: 'Verified', desc: '5+ verified actions', icon: FiShield, unlocked: true })
    else list.push({ label: 'Verified', desc: `${totalVerifications}/5 verifications needed`, icon: FiShield, unlocked: false })

    if (totalReflections >= 4) list.push({ label: 'Reflector', desc: '4+ weekly reflections', icon: FiBookOpen, unlocked: true })
    else list.push({ label: 'Reflector', desc: `${totalReflections}/4 reflections needed`, icon: FiBookOpen, unlocked: false })

    if (trustScore >= 80) list.push({ label: 'Trusted', desc: 'Trust score 80+', icon: FiActivity, unlocked: true })
    else list.push({ label: 'Trusted', desc: `Score ${trustScore}/80 needed`, icon: FiActivity, unlocked: false })

    return list
  }, [user, pacts, totalVerifications, totalReflections])

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div className="space-y-6 fade-in-up max-w-3xl">
      {/* Profile Header */}
      <Card className="glass-card-strong rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#00C4CC]/15 flex items-center justify-center text-2xl font-bold text-[#00C4CC] flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Name</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded-xl bg-background/50 h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Bio</Label>
                    <Textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={2}
                      className="rounded-xl bg-background/50 text-sm resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs gropact-gradient text-white rounded-lg gap-1" onClick={handleSave}>
                      <FiCheck className="w-3 h-3" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditing(false); setEditName(user?.name ?? ''); setEditBio(user?.bio ?? '') }}>
                      <FiX className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-foreground">{user?.name ?? 'User'}</h1>
                    <Badge className={`text-[9px] ${tierInfo.color}`}>{tierInfo.label}</Badge>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => setEditing(true)}>
                      <FiEdit className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{user?.email ?? ''}</p>
                  {user?.bio && <p className="text-sm text-foreground mt-1">{user.bio}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <TrustScoreBadge score={user?.trustScore ?? 50} variant="compact" />
                    <StreakCounter streak={user?.currentStreak ?? 0} variant="compact" />
                  </div>
                </>
              )}
            </div>
          </div>

          {saved && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-1.5">
              <FiCheck className="w-3 h-3" />
              Profile updated successfully!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid - 8 stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <FiTarget className="w-4 h-4 text-[#00C4CC] mx-auto mb-0.5" />
            <p className="text-lg font-bold text-foreground">{user?.totalPacts ?? pacts.length}</p>
            <p className="text-[9px] text-muted-foreground">Total Pacts</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <FiCheck className="w-4 h-4 text-emerald-500 mx-auto mb-0.5" />
            <p className="text-lg font-bold text-foreground">{user?.completedPacts ?? pacts.filter(p => p.status === 'completed').length}</p>
            <p className="text-[9px] text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <FiTrendingUp className="w-4 h-4 text-blue-500 mx-auto mb-0.5" />
            <p className="text-lg font-bold text-foreground">{user?.completionRate ?? 0}%</p>
            <p className="text-[9px] text-muted-foreground">Completion</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <FiZap className="w-4 h-4 text-amber-500 mx-auto mb-0.5" />
            <p className="text-lg font-bold text-foreground">{user?.currentStreak ?? 0}</p>
            <p className="text-[9px] text-muted-foreground">Streak</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <FiAward className="w-4 h-4 text-purple-500 mx-auto mb-0.5" />
            <p className="text-lg font-bold text-foreground">{user?.longestStreak ?? 0}</p>
            <p className="text-[9px] text-muted-foreground">Best Streak</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <FiShield className="w-4 h-4 text-emerald-600 mx-auto mb-0.5" />
            <p className="text-lg font-bold text-foreground">{totalVerifications}</p>
            <p className="text-[9px] text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <FiBookOpen className="w-4 h-4 text-amber-500 mx-auto mb-0.5" />
            <p className="text-lg font-bold text-foreground">{totalReflections}</p>
            <p className="text-[9px] text-muted-foreground">Reflections</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <FiUsers className="w-4 h-4 text-[#00C4CC] mx-auto mb-0.5" />
            <p className="text-lg font-bold text-foreground">{totalSupporters}</p>
            <p className="text-[9px] text-muted-foreground">Supporters</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="glass-card rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FiAward className="w-4 h-4 text-[#00C4CC]" />
              Achievements
            </span>
            <span className="text-xs text-muted-foreground font-normal">{unlockedCount}/{achievements.length} unlocked</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {achievements.map((ach, i) => {
              const Icon = ach.icon
              return (
                <div key={i} className={`p-3 rounded-xl border text-center transition-all ${ach.unlocked ? 'bg-[#00C4CC]/5 border-[#00C4CC]/20 shadow-sm' : 'bg-muted/20 border-border/50 opacity-60'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1.5 ${ach.unlocked ? 'bg-[#00C4CC]/15' : 'bg-muted'}`}>
                    <Icon className={`w-4 h-4 ${ach.unlocked ? 'text-[#00C4CC]' : 'text-muted-foreground'}`} />
                  </div>
                  <p className="text-xs font-semibold text-foreground">{ach.label}</p>
                  <p className="text-[9px] text-muted-foreground">{ach.desc}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Progress Cards Gallery */}
      {allProgressCards.length > 0 && (
        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FiActivity className="w-4 h-4 text-[#00C4CC]" />
              Progress Cards ({allProgressCards.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressCardDisplay
              cards={allProgressCards}
              onGenerate={() => {
                const activePact = pacts.find(p => p.status === 'active')
                if (activePact) generateProgressCard(activePact.id)
              }}
              onShare={(cardId) => {
                const pact = pacts.find(p => {
                  const cards = Array.isArray(p.progressCards) ? p.progressCards : []
                  return cards.some(c => c.id === cardId)
                })
                if (pact) shareProgressCard(pact.id, cardId)
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Member Info */}
      <Card className="glass-card rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Member Since</span>
            <span className="text-foreground">{formatDate(user?.joinedDate ?? '')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Pact History */}
      <Card className="glass-card rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Pact History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pacts.length > 0 ? (
            pacts.map((pact) => (
              <PactCard key={pact.id} pact={pact} />
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No pacts yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function Page() {
  return (
    <AppShell showSidebar={false}>
      <ProfileContent />
    </AppShell>
  )
}
