'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Verification, Supporter } from '@/lib/types'
import { generateUUID } from '@/lib/utils'
import {
  FiCamera, FiActivity, FiUsers, FiEdit, FiShield,
  FiClock, FiPlus, FiCheck, FiX, FiAlertTriangle,
} from 'react-icons/fi'

interface VerificationPanelProps {
  pactId: string
  verifications: Verification[]
  supporters: Supporter[]
  verificationMethod: string
  onAddVerification: (v: Verification) => void
  onConfirmVerification: (vId: string, verifierName: string) => void
}

const typeConfig: Record<string, { icon: typeof FiCamera; label: string; color: string }> = {
  photo: { icon: FiCamera, label: 'Photo', color: 'bg-blue-100 text-blue-700' },
  strava: { icon: FiActivity, label: 'Strava', color: 'bg-orange-100 text-orange-700' },
  supporter_confirm: { icon: FiUsers, label: 'Supporter', color: 'bg-purple-100 text-purple-700' },
  self_report: { icon: FiEdit, label: 'Self Report', color: 'bg-gray-100 text-gray-700' },
}

const statusConfig: Record<string, { icon: typeof FiShield; label: string; color: string }> = {
  verified: { icon: FiShield, label: 'Verified', color: 'bg-emerald-100 text-emerald-700' },
  pending: { icon: FiClock, label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  disputed: { icon: FiAlertTriangle, label: 'Disputed', color: 'bg-red-100 text-red-700' },
}

export default function VerificationPanel({
  pactId, verifications, supporters, verificationMethod, onAddVerification, onConfirmVerification
}: VerificationPanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedType, setSelectedType] = useState<Verification['type']>('self_report')
  const [evidence, setEvidence] = useState('')
  const [note, setNote] = useState('')
  const [selectedSupporter, setSelectedSupporter] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const safeVerifications = Array.isArray(verifications) ? verifications : []
  const verifiedCount = safeVerifications.filter(v => v.status === 'verified').length
  const pendingCount = safeVerifications.filter(v => v.status === 'pending').length

  const handleSubmit = () => {
    const v: Verification = {
      id: 'v-' + generateUUID().slice(0, 8),
      pactId,
      type: selectedType,
      status: 'pending',
      evidence: evidence.trim(),
      createdAt: new Date().toISOString(),
      note: note.trim() || undefined,
    }
    onAddVerification(v)
    setShowForm(false)
    setEvidence('')
    setNote('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-foreground">{safeVerifications.length}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-emerald-600">{verifiedCount}</p>
            <p className="text-[10px] text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      {submitted && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
          <FiCheck className="w-3 h-3" />
          Verification submitted successfully!
        </div>
      )}

      {/* Submit Button */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full gropact-gradient text-white rounded-xl gap-2">
          <FiPlus className="w-4 h-4" />
          Submit Verification
        </Button>
      )}

      {/* Form */}
      {showForm && (
        <Card className="glass-card rounded-xl border-[#00C4CC]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Submit Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs mb-2 block">Verification Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['photo', 'strava', 'supporter_confirm', 'self_report'] as const).map(type => {
                  const cfg = typeConfig[type]
                  const Icon = cfg.icon
                  const isStrava = type === 'strava'
                  return (
                    <button
                      key={type}
                      onClick={() => !isStrava && setSelectedType(type)}
                      className={`p-3 rounded-xl border text-left transition-all ${selectedType === type ? 'border-[#00C4CC] bg-[#00C4CC]/5' : 'border-border hover:border-foreground/30'} ${isStrava ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{cfg.label}</span>
                      </div>
                      {isStrava && (
                        <Badge className="text-[8px] mt-1 bg-amber-100 text-amber-700">Coming Soon</Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedType === 'photo' && (
              <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center">
                <FiCamera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Describe your photo evidence below</p>
              </div>
            )}

            {selectedType === 'supporter_confirm' && (
              <div>
                <Label className="text-xs mb-1 block">Select Supporter</Label>
                <div className="space-y-1">
                  {Array.isArray(supporters) && supporters.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSupporter(s.name)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-all ${selectedSupporter === s.name ? 'bg-[#00C4CC]/10 border border-[#00C4CC]' : 'border border-border hover:bg-muted/30'}`}
                    >
                      {s.name} ({s.role})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs mb-1 block">Evidence Description</Label>
              <Textarea
                value={evidence}
                onChange={e => setEvidence(e.target.value)}
                placeholder="Describe what you did and how it can be verified..."
                rows={3}
                className="rounded-xl bg-background/50 text-sm resize-none"
              />
            </div>

            <div>
              <Label className="text-xs mb-1 block">Note (optional)</Label>
              <Textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
                className="rounded-xl bg-background/50 text-sm resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={!evidence.trim()} className="flex-1 gropact-gradient text-white rounded-xl text-xs">
                Submit
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <div className="space-y-2">
        {safeVerifications.length > 0 ? (
          safeVerifications.map(v => {
            const tCfg = typeConfig[v.type] ?? typeConfig.self_report
            const sCfg = statusConfig[v.status] ?? statusConfig.pending
            const TypeIcon = tCfg.icon
            const StatusIcon = sCfg.icon
            return (
              <Card key={v.id} className="glass-card rounded-xl">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tCfg.color}`}>
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-[9px] px-1.5 py-0 ${sCfg.color}`}>
                            <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
                            {sCfg.label}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        {v.evidence && <p className="text-xs text-foreground mt-1 line-clamp-2">{v.evidence}</p>}
                        {v.verifiedBy && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">Verified by {v.verifiedBy}</p>
                        )}
                        {v.note && <p className="text-[10px] text-muted-foreground italic mt-0.5">{v.note}</p>}
                      </div>
                    </div>
                    {v.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] rounded-lg flex-shrink-0"
                        onClick={() => {
                          const verifier = Array.isArray(supporters) && supporters.length > 0
                            ? supporters[0].name
                            : 'Supporter'
                          onConfirmVerification(v.id, verifier)
                        }}
                      >
                        <FiCheck className="w-3 h-3 mr-0.5" />
                        Verify
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-6">
            <FiShield className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No verifications yet. Submit your first one above.</p>
          </div>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground text-center italic">
        Verifications build your trust score and strengthen your accountability.
      </p>
    </div>
  )
}
