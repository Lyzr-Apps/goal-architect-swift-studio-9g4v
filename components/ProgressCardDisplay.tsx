'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ProgressCard } from '@/lib/types'
import { FiShield, FiShare2, FiPlus, FiCheck, FiTarget, FiZap, FiTrendingUp } from 'react-icons/fi'

interface ProgressCardDisplayProps {
  pactId: string
  pactTitle: string
  progressCards: ProgressCard[]
  onGenerate: () => ProgressCard
  onShare: (cardId: string) => void
}

export default function ProgressCardDisplay({ pactId, pactTitle, progressCards, onGenerate, onShare }: ProgressCardDisplayProps) {
  const safeCards = Array.isArray(progressCards) ? progressCards : []
  const [sharedId, setSharedId] = useState<string | null>(null)
  const [justGenerated, setJustGenerated] = useState(false)

  const handleShare = (cardId: string) => {
    onShare(cardId)
    setSharedId(cardId)
    setTimeout(() => setSharedId(null), 3000)
  }

  const handleGenerate = () => {
    onGenerate()
    setJustGenerated(true)
    setTimeout(() => setJustGenerated(false), 3000)
  }

  if (safeCards.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 rounded-2xl bg-[#00C4CC]/10 flex items-center justify-center mx-auto mb-3">
          <FiTarget className="w-7 h-7 text-[#00C4CC]" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No Progress Cards Yet</p>
        <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">Generate your first Progress Card when you hit a milestone.</p>
        <Button onClick={handleGenerate} className="gropact-gradient text-white rounded-xl gap-2 text-xs">
          <FiPlus className="w-3.5 h-3.5" />
          Generate Progress Card
        </Button>
        {justGenerated && (
          <p className="text-xs text-emerald-600 mt-2 flex items-center justify-center gap-1">
            <FiCheck className="w-3 h-3" />
            Progress Card generated!
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Progress Cards ({safeCards.length})</p>
        <Button variant="outline" size="sm" onClick={handleGenerate} className="h-7 text-xs rounded-lg gap-1">
          <FiPlus className="w-3 h-3" />
          Generate New
        </Button>
      </div>
      {justGenerated && (
        <p className="text-xs text-emerald-600 flex items-center gap-1">
          <FiCheck className="w-3 h-3" />
          New Progress Card generated!
        </p>
      )}
      {safeCards.map(card => (
        <Card key={card.id} className="rounded-2xl overflow-hidden shadow-lg border-0">
          <div className="h-1.5 gropact-gradient" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <img src="https://asset.lyzr.app/mWfeiOFG" alt="GroPact" className="h-5 object-contain" />
              {card.verified && (
                <Badge className="bg-emerald-100 text-emerald-700 text-[9px] gap-0.5">
                  <FiShield className="w-2.5 h-2.5" />
                  Verified Progress
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">{card.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{card.description}</p>
            <Badge className="bg-[#00C4CC]/10 text-[#00C4CC] text-xs mb-4">{card.milestone}</Badge>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <FiZap className="w-3.5 h-3.5 text-amber-500 mx-auto mb-0.5" />
                <p className="text-sm font-bold text-foreground">{card.stats?.streakDays ?? 0}</p>
                <p className="text-[9px] text-muted-foreground">Streak</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <FiCheck className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-0.5" />
                <p className="text-sm font-bold text-foreground">{card.stats?.goalsCompleted ?? 0}</p>
                <p className="text-[9px] text-muted-foreground">Done</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <FiTarget className="w-3.5 h-3.5 text-blue-500 mx-auto mb-0.5" />
                <p className="text-sm font-bold text-foreground">{card.stats?.totalGoals ?? 0}</p>
                <p className="text-[9px] text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <FiTrendingUp className="w-3.5 h-3.5 text-[#00C4CC] mx-auto mb-0.5" />
                <p className="text-sm font-bold text-foreground">{card.stats?.completionRate ?? 0}%</p>
                <p className="text-[9px] text-muted-foreground">Rate</p>
              </div>
            </div>
            {card.verified && (
              <div className="flex items-center gap-1 text-xs text-emerald-600 mb-3">
                <FiShield className="w-3 h-3" />
                Verified via {card.verificationMethod}
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Shared on GroPact {card.createdAt ? new Date(card.createdAt).toLocaleDateString() : ''}
              </span>
              {card.shared || sharedId === card.id ? (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <FiCheck className="w-3 h-3" />
                  Shared!
                </span>
              ) : (
                <Button variant="outline" size="sm" className="h-6 text-[10px] rounded-lg gap-1" onClick={() => handleShare(card.id)}>
                  <FiShare2 className="w-3 h-3" />
                  Share
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
