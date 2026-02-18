'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import PricingCard from '@/components/PricingCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { clearAllData, exportAllData, updateUserTier } from '@/lib/store'
import { FiSettings, FiUser, FiCheck, FiDownload, FiTrash2, FiShield, FiActivity, FiStar } from 'react-icons/fi'

const tierLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-gray-100 text-gray-700' },
  mid: { label: 'Growth', color: 'bg-blue-100 text-blue-700' },
  premium: { label: 'Pro', color: 'bg-[#00C4CC]/10 text-[#00C4CC]' },
}

function SettingsContent() {
  const { user, updateProfile, logout } = useAuth()
  const router = useRouter()

  const [name, setName] = useState(user?.name ?? '')
  const [saved, setSaved] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const [upgradeMsg, setUpgradeMsg] = useState('')

  // Preferences
  const [reminderFreq, setReminderFreq] = useState('daily')
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(false)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [weeklyReflectionReminder, setWeeklyReflectionReminder] = useState(true)
  const [verificationAlerts, setVerificationAlerts] = useState(true)

  const tier = user?.tier ?? 'free'
  const tierInfo = tierLabels[tier] ?? tierLabels.free

  const handleSaveAccount = () => {
    if (name.trim()) {
      updateProfile({ name: name.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleExport = () => {
    const data = exportAllData()
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gropact-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClearAll = () => {
    clearAllData()
    logout()
    router.push('/login')
  }

  const handleUpgrade = (newTier: 'free' | 'mid' | 'premium') => {
    updateUserTier(newTier)
    updateProfile({ tier: newTier })
    setUpgradeMsg(`Upgraded to ${tierLabels[newTier]?.label ?? newTier}!`)
    setTimeout(() => setUpgradeMsg(''), 3000)
  }

  return (
    <div className="space-y-6 fade-in-up max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <FiSettings className="w-6 h-6 text-[#00C4CC]" />
        Settings
      </h1>

      {/* Account */}
      <Card className="glass-card rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FiUser className="w-4 h-4 text-[#00C4CC]" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`text-[10px] ${tierInfo.color}`}>{tierInfo.label} Plan</Badge>
            <span className="text-[10px] text-muted-foreground">Trust Score: {user?.trustScore ?? 50}</span>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl bg-background/50 h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Email</Label>
            <Input
              value={user?.email ?? ''}
              disabled
              className="rounded-xl bg-muted h-9 text-muted-foreground"
            />
            <p className="text-[10px] text-muted-foreground">Email cannot be changed in this version.</p>
          </div>

          {saved && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-1.5">
              <FiCheck className="w-3 h-3" />
              Account updated!
            </div>
          )}

          <Button
            onClick={handleSaveAccount}
            size="sm"
            className="rounded-xl gropact-gradient text-white text-xs"
            disabled={!name.trim()}
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="glass-card rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FiStar className="w-4 h-4 text-[#00C4CC]" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upgradeMsg && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-1.5 mb-4">
              <FiCheck className="w-3 h-3" />
              {upgradeMsg}
            </div>
          )}
          <PricingCard
            currentTier={tier}
            onSelectTier={handleUpgrade}
          />
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="glass-card rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Reminder Frequency</Label>
            <div className="flex gap-2">
              {['daily', 'weekly', 'off'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setReminderFreq(freq)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${reminderFreq === freq ? 'border-[#00C4CC] bg-[#00C4CC]/10 text-[#00C4CC]' : 'border-border text-muted-foreground'}`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Email Notifications</p>
                <p className="text-[10px] text-muted-foreground">Receive check-in reminders via email</p>
              </div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Push Notifications</p>
                <p className="text-[10px] text-muted-foreground">Browser push notifications for goals due</p>
              </div>
              <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Weekly Digest</p>
                <p className="text-[10px] text-muted-foreground">Weekly summary of your progress</p>
              </div>
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground flex items-center gap-1.5">
                  <FiActivity className="w-3.5 h-3.5 text-amber-500" />
                  Weekly Reflection Reminders
                </p>
                <p className="text-[10px] text-muted-foreground">Get reminded when a weekly reflection is due</p>
              </div>
              <Switch checked={weeklyReflectionReminder} onCheckedChange={setWeeklyReflectionReminder} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground flex items-center gap-1.5">
                  <FiShield className="w-3.5 h-3.5 text-emerald-500" />
                  Verification Alerts
                </p>
                <p className="text-[10px] text-muted-foreground">Notify when verifications need attention</p>
              </div>
              <Switch checked={verificationAlerts} onCheckedChange={setVerificationAlerts} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card className="glass-card rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Export My Data</p>
              <p className="text-[10px] text-muted-foreground">Download all your pacts, verifications, reflections, and profile data</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1" onClick={handleExport}>
              <FiDownload className="w-3 h-3" />
              Export
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-destructive">Clear All Data</p>
              <p className="text-[10px] text-muted-foreground">Permanently delete all local data and sign out</p>
            </div>
            <Dialog open={clearOpen} onOpenChange={setClearOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1">
                  <FiTrash2 className="w-3 h-3" />
                  Clear
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear All Data</DialogTitle>
                  <DialogDescription>
                    This will permanently delete all your pacts, check-ins, verifications, reflections, room data, and account information from this browser. This cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setClearOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleClearAll}>Clear All Data</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="glass-card rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">App Version</span>
            <span className="text-foreground">2.0.0</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">AI Engine</span>
            <span className="text-foreground">Weekly Plan Composer (GPT-4.1)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Agent ID</span>
            <span className="text-foreground font-mono text-[10px]">69951bcac0c7cf4934c52cc7</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Data Storage</span>
            <span className="text-foreground">Browser (localStorage)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Features</span>
            <span className="text-foreground">Verification, Reflections, Progress Cards, Challenges</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Page() {
  return (
    <AppShell showSidebar={false}>
      <SettingsContent />
    </AppShell>
  )
}
