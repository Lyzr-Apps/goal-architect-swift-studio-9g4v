'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FiPlus, FiTrash2, FiUsers, FiHeart, FiShield, FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import TrustScoreBadge from '@/components/TrustScoreBadge'
import type { Supporter } from '@/lib/types'
import { ENCOURAGEMENT_TEMPLATES } from '@/lib/mockData'
import { generateUUID } from '@/lib/utils'

interface SupporterListProps {
  supporters: Supporter[]
  onAdd?: (supporter: Supporter) => void
  onRemove?: (id: string) => void
  readOnly?: boolean
  onSendEncouragement?: (supporterId: string, message: string) => void
}

const roleColors: Record<string, string> = {
  accountability: 'bg-blue-100 text-blue-700',
  encourager: 'bg-pink-100 text-pink-700',
  verifier: 'bg-emerald-100 text-emerald-700',
  all: 'bg-[#00C4CC]/10 text-[#00C4CC]',
}

export default function SupporterList({ supporters, onAdd, onRemove, readOnly = false, onSendEncouragement }: SupporterListProps) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newFeedback, setNewFeedback] = useState('')
  const [newRole, setNewRole] = useState<Supporter['role']>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({})

  const safeSupporters = Array.isArray(supporters) ? supporters : []

  const handleAdd = () => {
    if (!newName.trim()) return
    const supporter: Supporter = {
      id: 'sup-' + generateUUID().slice(0, 8),
      name: newName.trim(),
      email: newEmail.trim() || undefined,
      feedback: newFeedback.trim(),
      addedDate: new Date().toISOString(),
      trustScore: 50,
      verificationsCompleted: 0,
      encouragementsSent: 0,
      role: newRole,
    }
    onAdd?.(supporter)
    setNewName('')
    setNewEmail('')
    setNewFeedback('')
    setNewRole('all')
    setAdding(false)
  }

  const handleSendEncouragement = (supporterId: string, message: string) => {
    onSendEncouragement?.(supporterId, message)
    setSentMap(prev => ({ ...prev, [supporterId]: true }))
    setTimeout(() => {
      setSentMap(prev => ({ ...prev, [supporterId]: false }))
    }, 3000)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-[#00C4CC]" />
          <span className="text-sm font-semibold text-foreground">Supporters ({safeSupporters.length})</span>
        </div>
        {!readOnly && (
          <Button variant="ghost" size="sm" className="h-7 text-xs text-[#00C4CC] hover:text-[#00C4CC] gap-1" onClick={() => setAdding(!adding)}>
            <FiPlus className="w-3 h-3" />
            Add
          </Button>
        )}
      </div>

      {adding && !readOnly && (
        <div className="p-3 rounded-xl border border-border bg-card/60 space-y-2">
          <Input placeholder="Supporter name" value={newName} onChange={(e) => setNewName(e.target.value)} className="rounded-xl bg-background/50 h-8 text-xs" />
          <Input placeholder="Email (optional)" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="rounded-xl bg-background/50 h-8 text-xs" />
          <Textarea placeholder="Their feedback or message..." value={newFeedback} onChange={(e) => setNewFeedback(e.target.value)} rows={2} className="rounded-xl bg-background/50 text-xs resize-none" />
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Role</p>
            <div className="flex flex-wrap gap-1">
              {(['accountability', 'encourager', 'verifier', 'all'] as const).map(role => (
                <button key={role} onClick={() => setNewRole(role)} className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-all ${newRole === role ? 'border-[#00C4CC] bg-[#00C4CC]/5 text-[#00C4CC]' : 'border-border text-muted-foreground'}`}>
                  {role}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs gropact-gradient text-white" onClick={handleAdd} disabled={!newName.trim()}>
              Add Supporter
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setAdding(false); setNewName(''); setNewEmail(''); setNewFeedback('') }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {safeSupporters.map((supporter) => (
          <div key={supporter.id} className="rounded-xl bg-card/60 border border-border/50 overflow-hidden">
            <div className="flex items-start gap-3 p-3">
              <div className="w-8 h-8 rounded-full bg-[#00C4CC]/15 flex items-center justify-center text-xs font-semibold text-[#00C4CC] flex-shrink-0">
                {(supporter.name ?? '?')[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground">{supporter.name}</p>
                  <Badge className={`text-[8px] px-1.5 py-0 ${roleColors[supporter.role] ?? roleColors.all}`}>
                    {supporter.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <FiShield className="w-2.5 h-2.5" />
                    {supporter.verificationsCompleted ?? 0} verified
                  </span>
                  <span className="flex items-center gap-0.5">
                    <FiHeart className="w-2.5 h-2.5" />
                    {supporter.encouragementsSent ?? 0} sent
                  </span>
                </div>
                {supporter.feedback && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed italic">&quot;{supporter.feedback}&quot;</p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <TrustScoreBadge score={supporter.trustScore ?? 50} variant="compact" />
                <button onClick={() => setExpandedId(expandedId === supporter.id ? null : supporter.id)} className="p-1 text-muted-foreground hover:text-foreground">
                  {expandedId === supporter.id ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
                </button>
                {!readOnly && onRemove && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => onRemove(supporter.id)}>
                    <FiTrash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {expandedId === supporter.id && (
              <div className="px-3 pb-3 border-t border-border/50 pt-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {ENCOURAGEMENT_TEMPLATES.slice(0, 4).map(t => (
                    <button key={t.id} onClick={() => handleSendEncouragement(supporter.id, t.text)} className="px-2 py-0.5 rounded-full text-[9px] border border-border hover:border-[#00C4CC] hover:bg-[#00C4CC]/5 transition-all text-foreground">
                      {t.text}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-6 text-[10px] rounded-lg gap-1" variant="outline" onClick={() => handleSendEncouragement(supporter.id, 'Keep going!')}>
                    <FiHeart className="w-2.5 h-2.5" />
                    Encourage
                  </Button>
                  {(supporter.role === 'verifier' || supporter.role === 'all') && (
                    <Button size="sm" className="h-6 text-[10px] rounded-lg gap-1" variant="outline" onClick={() => {}}>
                      <FiShield className="w-2.5 h-2.5" />
                      Request Verification
                    </Button>
                  )}
                </div>
                {sentMap[supporter.id] && (
                  <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-0.5">
                    <FiCheck className="w-2.5 h-2.5" />
                    Encouragement sent!
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {safeSupporters.length === 0 && !adding && (
        <p className="text-xs text-muted-foreground text-center py-4">No supporters added yet.</p>
      )}
    </div>
  )
}
