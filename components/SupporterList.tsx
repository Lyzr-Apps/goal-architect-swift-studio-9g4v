'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FiPlus, FiTrash2, FiUsers } from 'react-icons/fi'
import type { Supporter } from '@/lib/types'
import { generateUUID } from '@/lib/utils'

interface SupporterListProps {
  supporters: Supporter[]
  onAdd?: (supporter: Supporter) => void
  onRemove?: (id: string) => void
  readOnly?: boolean
}

export default function SupporterList({ supporters, onAdd, onRemove, readOnly = false }: SupporterListProps) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newFeedback, setNewFeedback] = useState('')

  const safeSupporters = Array.isArray(supporters) ? supporters : []

  const handleAdd = () => {
    if (!newName.trim()) return
    const supporter: Supporter = {
      id: 'sup-' + generateUUID().slice(0, 8),
      name: newName.trim(),
      feedback: newFeedback.trim(),
      addedDate: new Date().toISOString(),
    }
    onAdd?.(supporter)
    setNewName('')
    setNewFeedback('')
    setAdding(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-[#00C4CC]" />
          <span className="text-sm font-semibold text-foreground">Supporters ({safeSupporters.length})</span>
        </div>
        {!readOnly && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-[#00C4CC] hover:text-[#00C4CC] gap-1"
            onClick={() => setAdding(!adding)}
          >
            <FiPlus className="w-3 h-3" />
            Add
          </Button>
        )}
      </div>

      {adding && !readOnly && (
        <div className="p-3 rounded-xl border border-border bg-card/60 space-y-2">
          <Input
            placeholder="Supporter name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="rounded-xl bg-background/50 h-8 text-xs"
          />
          <Textarea
            placeholder="Their feedback or message..."
            value={newFeedback}
            onChange={(e) => setNewFeedback(e.target.value)}
            rows={2}
            className="rounded-xl bg-background/50 text-xs resize-none"
          />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs gropact-gradient text-white" onClick={handleAdd} disabled={!newName.trim()}>
              Add Supporter
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setAdding(false); setNewName(''); setNewFeedback('') }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {safeSupporters.map((supporter) => (
          <div key={supporter.id} className="flex items-start gap-3 p-3 rounded-xl bg-card/60 border border-border/50">
            <div className="w-8 h-8 rounded-full bg-[#00C4CC]/15 flex items-center justify-center text-xs font-semibold text-[#00C4CC] flex-shrink-0">
              {(supporter.name ?? '?')[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{supporter.name}</p>
              {supporter.feedback && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{supporter.feedback}</p>
              )}
            </div>
            {!readOnly && onRemove && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                onClick={() => onRemove(supporter.id)}
              >
                <FiTrash2 className="w-3 h-3" />
              </Button>
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
