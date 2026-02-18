'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { RoomChallenge } from '@/lib/types'
import { FiFlag, FiUsers, FiCheck, FiCalendar, FiAward, FiCamera, FiEdit, FiShield } from 'react-icons/fi'

interface ChallengeCardProps {
  challenge: RoomChallenge
  roomId: string
  currentUserId: string
  onJoin: () => void
}

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-700',
}

const verMethodIcons: Record<string, typeof FiCamera> = {
  photo: FiCamera,
  self_report: FiEdit,
  supporter: FiShield,
}

export default function ChallengeCard({ challenge, roomId, currentUserId, onJoin }: ChallengeCardProps) {
  const participants = Array.isArray(challenge.participants) ? challenge.participants : []
  const milestones = Array.isArray(challenge.milestones) ? challenge.milestones : []
  const isJoined = participants.some(p => p.userId === currentUserId)
  const myProgress = participants.find(p => p.userId === currentUserId)?.progress ?? 0

  const startDate = new Date(challenge.startDate)
  const endDate = new Date(challenge.endDate)
  const now = new Date()
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
  const elapsedDays = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
  const dayProgress = Math.min(100, Math.round((elapsedDays / totalDays) * 100))

  const VerIcon = verMethodIcons[challenge.verificationMethod] ?? FiEdit

  return (
    <Card className="glass-card rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FiFlag className="w-4 h-4 text-[#00C4CC] flex-shrink-0" />
              <h3 className="text-sm font-semibold text-foreground truncate">{challenge.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{challenge.description}</p>
          </div>
          <Badge className={`text-[9px] flex-shrink-0 ml-2 ${statusColors[challenge.status] ?? 'bg-muted'}`}>
            {challenge.status}
          </Badge>
        </div>

        <p className="text-[10px] text-muted-foreground mb-2">by {challenge.creatorName}</p>

        {/* Date range and progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <FiCalendar className="w-3 h-3" />
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span>{elapsedDays}/{totalDays} days</span>
          </div>
          <Progress value={dayProgress} className="h-1.5" />
        </div>

        {/* Participants */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-1.5">
            {participants.slice(0, 4).map((p, i) => (
              <div key={p.userId} className="w-6 h-6 rounded-full bg-[#00C4CC]/15 flex items-center justify-center text-[9px] font-bold text-[#00C4CC] border-2 border-background">
                {(p.userName ?? '?')[0]?.toUpperCase()}
              </div>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <FiUsers className="w-3 h-3" />
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="mb-3 space-y-1">
            {milestones.slice(0, 3).map(m => {
              const completed = isJoined && participants.find(p => p.userId === currentUserId)?.completedMilestones?.includes(m.id)
              return (
                <div key={m.id} className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${completed ? 'bg-emerald-500 text-white' : 'border border-border'}`}>
                    {completed && <FiCheck className="w-2.5 h-2.5" />}
                  </div>
                  <span className={`${completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{m.title}</span>
                  {m.verificationRequired && <VerIcon className="w-3 h-3 text-muted-foreground" />}
                </div>
              )
            })}
          </div>
        )}

        {/* Verification method + prize */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="outline" className="text-[9px] gap-0.5">
            <VerIcon className="w-2.5 h-2.5" />
            {challenge.verificationMethod === 'photo' ? 'Photo' : challenge.verificationMethod === 'self_report' ? 'Self Report' : 'Supporter'}
          </Badge>
          {challenge.prize && (
            <Badge className="bg-amber-100 text-amber-700 text-[9px] gap-0.5">
              <FiAward className="w-2.5 h-2.5" />
              {challenge.prize}
            </Badge>
          )}
        </div>

        {/* Action */}
        {isJoined ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Your progress</span>
              <span className="font-medium text-foreground">{myProgress}%</span>
            </div>
            <Progress value={myProgress} className="h-1.5" />
          </div>
        ) : challenge.status === 'active' || challenge.status === 'upcoming' ? (
          <Button onClick={onJoin} className="w-full gropact-gradient text-white rounded-xl text-xs h-8">
            Join Challenge
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
