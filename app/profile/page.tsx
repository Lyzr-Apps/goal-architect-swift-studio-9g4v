'use client'

import { useState } from 'react'
import AppShell from '@/components/AppShell'
import PactCard from '@/components/PactCard'
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
  FiZap, FiAward, FiCalendar, FiX,
} from 'react-icons/fi'

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function ProfileContent() {
  const { user, updateProfile } = useAuth()
  const { pacts } = usePacts()
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

  // Achievements
  const achievements = []
  if ((user?.totalPacts ?? pacts.length) >= 1) {
    achievements.push({ label: 'First Pact', desc: 'Created your first pact', icon: FiTarget })
  }
  if ((user?.completedPacts ?? 0) >= 1) {
    achievements.push({ label: 'Finisher', desc: 'Completed a pact', icon: FiCheck })
  }
  if ((user?.currentStreak ?? 0) >= 7) {
    achievements.push({ label: 'Week Warrior', desc: '7-day streak', icon: FiZap })
  }
  if ((user?.longestStreak ?? 0) >= 7) {
    achievements.push({ label: 'Streak Master', desc: '7+ day best streak', icon: FiAward })
  }
  if ((user?.completionRate ?? 0) >= 80) {
    achievements.push({ label: 'Achiever', desc: '80%+ completion rate', icon: FiTrendingUp })
  }
  if (achievements.length === 0) {
    achievements.push({ label: 'Getting Started', desc: 'Create pacts and build streaks to earn achievements', icon: FiTarget })
  }

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
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">{user?.name ?? 'User'}</h1>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => setEditing(true)}>
                      <FiEdit className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{user?.email ?? ''}</p>
                  {user?.bio && <p className="text-sm text-foreground mt-1">{user.bio}</p>}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4 text-center">
            <FiTarget className="w-5 h-5 text-[#00C4CC] mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{user?.totalPacts ?? pacts.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Pacts</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4 text-center">
            <FiCheck className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{user?.completedPacts ?? pacts.filter(p => p.status === 'completed').length}</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4 text-center">
            <FiTrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{user?.completionRate ?? 0}%</p>
            <p className="text-[10px] text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4 text-center">
            <FiZap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{user?.currentStreak ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Current Streak</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4 text-center">
            <FiAward className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{user?.longestStreak ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Longest Streak</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4 text-center">
            <FiCalendar className="w-5 h-5 text-teal-500 mx-auto mb-1" />
            <p className="text-xs font-bold text-foreground">{formatDate(user?.joinedDate ?? '')}</p>
            <p className="text-[10px] text-muted-foreground">Member Since</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="glass-card rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FiAward className="w-4 h-4 text-[#00C4CC]" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {achievements.map((ach, i) => {
              const Icon = ach.icon
              return (
                <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
                  <Icon className="w-6 h-6 text-[#00C4CC] mx-auto mb-1" />
                  <p className="text-xs font-semibold text-foreground">{ach.label}</p>
                  <p className="text-[10px] text-muted-foreground">{ach.desc}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pact History */}
      <Card className="glass-card rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Pact History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
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
