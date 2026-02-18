'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SupporterActivity } from '@/lib/types'
import { ENCOURAGEMENT_TEMPLATES } from '@/lib/mockData'
import { FiHeart, FiShield, FiZap, FiThumbsUp, FiSend, FiCheck } from 'react-icons/fi'

interface SupporterFeedProps {
  activities: SupporterActivity[]
  onSendEncouragement?: (message: string, pactId?: string) => void
  compact?: boolean
}

const typeIcons: Record<string, { icon: typeof FiHeart; color: string }> = {
  encouragement: { icon: FiHeart, color: 'text-red-500 bg-red-50' },
  verification: { icon: FiShield, color: 'text-emerald-600 bg-emerald-50' },
  nudge: { icon: FiZap, color: 'text-amber-500 bg-amber-50' },
  reaction: { icon: FiThumbsUp, color: 'text-blue-500 bg-blue-50' },
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function SupporterFeed({ activities, onSendEncouragement, compact = false }: SupporterFeedProps) {
  const safeActivities = Array.isArray(activities) ? activities : []
  const displayActivities = compact ? safeActivities.slice(0, 5) : safeActivities
  const [customMessage, setCustomMessage] = useState('')
  const [showAllTemplates, setShowAllTemplates] = useState(false)
  const [sent, setSent] = useState(false)

  const templates = showAllTemplates ? ENCOURAGEMENT_TEMPLATES : ENCOURAGEMENT_TEMPLATES.slice(0, 4)

  const handleSend = (message: string) => {
    if (onSendEncouragement) {
      onSendEncouragement(message)
    }
    setCustomMessage('')
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  if (safeActivities.length === 0 && compact) {
    return (
      <div className="text-center py-4">
        <FiHeart className="w-6 h-6 text-muted-foreground/30 mx-auto mb-1" />
        <p className="text-[10px] text-muted-foreground">No activity yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex items-center gap-2 mb-1">
          <FiHeart className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-semibold text-foreground">Supporter Activity</h3>
        </div>
      )}

      {displayActivities.length > 0 ? (
        <div className="space-y-2">
          {displayActivities.map(activity => {
            const cfg = typeIcons[activity.type] ?? typeIcons.encouragement
            const Icon = cfg.icon
            const colorParts = cfg.color.split(' ')
            return (
              <div key={activity.id} className="flex items-start gap-2.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${colorParts[1] ?? 'bg-muted'}`}>
                  <Icon className={`w-3 h-3 ${colorParts[0] ?? 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">
                    <span className="font-semibold">{activity.supporterName}</span>
                    {' '}{activity.content}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{formatRelativeTime(activity.createdAt)}</span>
                    <span className="text-[10px] text-[#00C4CC]">{activity.pactTitle}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-4">
          <FiHeart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No supporter activity yet. Invite supporters to your pacts to get started.</p>
        </div>
      )}

      {!compact && onSendEncouragement && (
        <Card className="glass-card rounded-xl mt-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Send Encouragement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSend(t.text)}
                  className="px-2.5 py-1 rounded-full text-[10px] border border-border hover:border-[#00C4CC] hover:bg-[#00C4CC]/5 transition-all text-foreground"
                >
                  {t.text}
                </button>
              ))}
              {!showAllTemplates && ENCOURAGEMENT_TEMPLATES.length > 4 && (
                <button
                  onClick={() => setShowAllTemplates(true)}
                  className="px-2.5 py-1 rounded-full text-[10px] border border-[#00C4CC] text-[#00C4CC]"
                >
                  More...
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                placeholder="Custom message..."
                className="h-8 rounded-lg bg-background/50 text-xs"
                onKeyDown={e => e.key === 'Enter' && customMessage.trim() && handleSend(customMessage.trim())}
              />
              <Button
                size="sm"
                disabled={!customMessage.trim()}
                onClick={() => handleSend(customMessage.trim())}
                className="h-8 rounded-lg gropact-gradient text-white"
              >
                <FiSend className="w-3 h-3" />
              </Button>
            </div>
            {sent && (
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <FiCheck className="w-3 h-3" />
                Encouragement sent!
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
