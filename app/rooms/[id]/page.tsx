'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import ChallengeCard from '@/components/ChallengeCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { useRooms } from '@/contexts/RoomContext'
import type { RoomPost, RoomChallenge } from '@/lib/types'
import { generateUUID } from '@/lib/utils'
import {
  FiArrowLeft, FiUsers, FiHeart, FiMessageCircle,
  FiStar, FiActivity, FiTarget, FiFlag, FiCheck,
  FiPlus, FiShield,
} from 'react-icons/fi'

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

const typeColors: Record<string, string> = {
  update: 'bg-blue-100 text-blue-700',
  milestone: 'bg-emerald-100 text-emerald-700',
  encouragement: 'bg-amber-100 text-amber-700',
  question: 'bg-purple-100 text-purple-700',
}

const typeIcons: Record<string, React.ReactNode> = {
  update: <FiActivity className="w-3 h-3" />,
  milestone: <FiStar className="w-3 h-3" />,
  encouragement: <FiHeart className="w-3 h-3" />,
  question: <FiMessageCircle className="w-3 h-3" />,
}

const roomTypeColors: Record<string, string> = {
  community: 'bg-blue-100 text-blue-700',
  challenge: 'bg-amber-100 text-amber-700',
  creator: 'bg-purple-100 text-purple-700',
}

function RoomDetailContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { getRoom, joinRoom, leaveRoom, addPost, likePost, addChallenge, joinChallenge } = useRooms()

  const roomId = typeof params?.id === 'string' ? params.id : ''
  const room = getRoom(roomId)

  const [newContent, setNewContent] = useState('')
  const [newType, setNewType] = useState<RoomPost['type']>('update')
  const [posted, setPosted] = useState(false)
  const [activeTab, setActiveTab] = useState('feed')
  const [showNewChallenge, setShowNewChallenge] = useState(false)

  // New challenge form state
  const [challengeTitle, setChallengeTitle] = useState('')
  const [challengeDesc, setChallengeDesc] = useState('')
  const [challengeStart, setChallengeStart] = useState('')
  const [challengeEnd, setChallengeEnd] = useState('')
  const [challengeVerMethod, setChallengeVerMethod] = useState<'photo' | 'self_report' | 'supporter'>('self_report')
  const [challengePrize, setChallengePrize] = useState('')
  const [challengeCreated, setChallengeCreated] = useState(false)

  if (!room) {
    return (
      <div className="text-center py-12">
        <FiUsers className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-foreground mb-1">Room not found</h3>
        <Button variant="outline" onClick={() => router.push('/rooms')} className="rounded-xl gap-1 mt-3">
          <FiArrowLeft className="w-4 h-4" />
          Back to Rooms
        </Button>
      </div>
    )
  }

  const members = Array.isArray(room.members) ? room.members : []
  const posts = Array.isArray(room.posts) ? room.posts : []
  const challenges = Array.isArray(room.challenges) ? room.challenges : []
  const isMember = user?.id ? members.includes(user.id) : false
  const activeChallenges = challenges.filter(c => c.status === 'active')

  const handlePost = () => {
    if (!newContent.trim() || !user) return
    addPost(roomId, newContent.trim(), newType)
    setNewContent('')
    setNewType('update')
    setPosted(true)
    setTimeout(() => setPosted(false), 3000)
  }

  const handleLike = (postId: string) => {
    likePost(roomId, postId)
  }

  const handleCreateChallenge = () => {
    if (!challengeTitle.trim() || !challengeStart || !challengeEnd || !user) return
    const challenge: RoomChallenge = {
      id: 'chal-' + generateUUID().slice(0, 8),
      roomId,
      title: challengeTitle.trim(),
      description: challengeDesc.trim(),
      creatorName: user.name,
      startDate: new Date(challengeStart).toISOString(),
      endDate: new Date(challengeEnd).toISOString(),
      verificationMethod: challengeVerMethod,
      participants: [{
        userId: user.id,
        userName: user.name,
        joinedAt: new Date().toISOString(),
        progress: 0,
        completedMilestones: [],
        verified: false,
      }],
      milestones: [],
      status: 'active',
      prize: challengePrize.trim() || undefined,
      category: room.category,
    }
    addChallenge(roomId, challenge)
    setChallengeTitle('')
    setChallengeDesc('')
    setChallengeStart('')
    setChallengeEnd('')
    setChallengePrize('')
    setShowNewChallenge(false)
    setChallengeCreated(true)
    setTimeout(() => setChallengeCreated(false), 3000)
  }

  const handleJoinChallenge = (challengeId: string) => {
    joinChallenge(roomId, challengeId)
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/rooms')} className="h-8 w-8 p-0 flex-shrink-0">
          <FiArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground">{room.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{room.description}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className="text-xs">{room.category}</Badge>
            <Badge className={`text-[9px] px-1.5 py-0 ${roomTypeColors[room.type] ?? roomTypeColors.community}`}>
              {room.type}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <FiUsers className="w-3 h-3" />
              {room.memberCount} members
            </span>
            {room.creatorName && (
              <span className="text-[10px] text-muted-foreground">by {room.creatorName}</span>
            )}
          </div>
        </div>
        {isMember ? (
          <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg" onClick={() => leaveRoom(roomId)}>
            Leave
          </Button>
        ) : (
          <Button size="sm" className="h-8 text-xs rounded-lg gropact-gradient text-white" onClick={() => joinRoom(roomId)}>
            Join
          </Button>
        )}
      </div>

      {/* Active Challenge Banner */}
      {activeChallenges.length > 0 && (
        <Card className="rounded-xl border-amber-200/50 bg-amber-50/30">
          <CardContent className="p-4 flex items-center gap-3">
            <FiFlag className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{activeChallenges[0].title}</p>
              <p className="text-xs text-muted-foreground">
                {(Array.isArray(activeChallenges[0].participants) ? activeChallenges[0].participants : []).length} participants
                {activeChallenges[0].prize ? ` - Prize: ${activeChallenges[0].prize}` : ''}
              </p>
            </div>
            <Button size="sm" className="h-7 text-xs rounded-lg" variant="outline" onClick={() => setActiveTab('challenges')}>
              View
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 rounded-xl p-1">
          <TabsTrigger value="feed" className="rounded-lg text-xs">Feed</TabsTrigger>
          <TabsTrigger value="challenges" className="rounded-lg text-xs">
            Challenges ({challenges.length})
          </TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="mt-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0 space-y-4">
              {isMember && (
                <Card className="glass-card rounded-xl">
                  <CardContent className="p-4 space-y-3">
                    <Textarea
                      placeholder="Share an update, milestone, or question..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={3}
                      className="rounded-xl bg-background/50 text-sm resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">Type:</Label>
                        <Select value={newType} onValueChange={(v) => setNewType(v as RoomPost['type'])}>
                          <SelectTrigger className="h-7 w-32 rounded-lg text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="update">Update</SelectItem>
                            <SelectItem value="milestone">Milestone</SelectItem>
                            <SelectItem value="encouragement">Encouragement</SelectItem>
                            <SelectItem value="question">Question</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        size="sm"
                        onClick={handlePost}
                        disabled={!newContent.trim()}
                        className="h-7 rounded-lg text-xs gropact-gradient text-white"
                      >
                        Post
                      </Button>
                    </div>
                    {posted && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600">
                        <FiCheck className="w-3 h-3" />
                        Posted successfully!
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {posts.length > 0 ? (
                <div className="space-y-3">
                  {posts.map((post) => {
                    const likedBy = Array.isArray(post.likedBy) ? post.likedBy : []
                    const isLiked = user?.id ? likedBy.includes(user.id) : false
                    return (
                      <Card key={post.id} className="glass-card rounded-xl">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#00C4CC]/15 flex items-center justify-center text-xs font-semibold text-[#00C4CC] flex-shrink-0">
                              {(post.userName ?? '?')[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-foreground">{post.userName}</span>
                                <Badge className={`text-[9px] px-1.5 py-0 ${typeColors[post.type] ?? 'bg-muted'}`}>
                                  <span className="flex items-center gap-0.5">
                                    {typeIcons[post.type]}
                                    {post.type}
                                  </span>
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">{formatRelativeTime(post.createdAt)}</span>
                              </div>
                              <p className="text-sm text-foreground mt-1.5 leading-relaxed">{post.content}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <button
                                  onClick={() => handleLike(post.id)}
                                  className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                                >
                                  <FiHeart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                                  {post.likes ?? 0}
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiMessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No posts yet. Be the first to share!</p>
                </div>
              )}
            </div>

            {/* Members Sidebar */}
            <div className="lg:w-56 flex-shrink-0">
              <Card className="glass-card rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                    <FiUsers className="w-3.5 h-3.5 text-[#00C4CC]" />
                    Members ({room.memberCount})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {members.slice(0, 10).map((memberId, i) => (
                      <div key={memberId} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                          {memberId === user?.id ? (user?.name ?? 'U')[0]?.toUpperCase() : String.fromCharCode(65 + (i % 26))}
                        </div>
                        <span className="text-xs text-foreground truncate">
                          {memberId === user?.id ? user?.name ?? 'You' : `Member ${i + 1}`}
                        </span>
                      </div>
                    ))}
                    {members.length > 10 && (
                      <p className="text-[10px] text-muted-foreground text-center">
                        +{members.length - 10} more members
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Room Challenges</h2>
            {isMember && (
              <Button size="sm" className="h-7 text-xs rounded-lg gropact-gradient text-white gap-1" onClick={() => setShowNewChallenge(!showNewChallenge)}>
                <FiPlus className="w-3 h-3" />
                Create Challenge
              </Button>
            )}
          </div>

          {challengeCreated && (
            <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
              <FiCheck className="w-3 h-3" />
              Challenge created successfully!
            </div>
          )}

          {/* New Challenge Form */}
          {showNewChallenge && (
            <Card className="glass-card rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FiFlag className="w-4 h-4 text-amber-600" />
                  Create New Challenge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Challenge Title *</Label>
                  <Input
                    placeholder="e.g., 30-Day Reading Challenge"
                    value={challengeTitle}
                    onChange={(e) => setChallengeTitle(e.target.value)}
                    className="rounded-xl bg-background/50 h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Description</Label>
                  <Textarea
                    placeholder="Describe the challenge rules and goals..."
                    value={challengeDesc}
                    onChange={(e) => setChallengeDesc(e.target.value)}
                    rows={3}
                    className="rounded-xl bg-background/50 text-xs resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Start Date *</Label>
                    <Input type="date" value={challengeStart} onChange={(e) => setChallengeStart(e.target.value)} className="rounded-xl bg-background/50 h-8 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">End Date *</Label>
                    <Input type="date" value={challengeEnd} onChange={(e) => setChallengeEnd(e.target.value)} className="rounded-xl bg-background/50 h-8 text-xs" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Verification Method</Label>
                  <div className="flex gap-2">
                    {([
                      { value: 'self_report' as const, label: 'Self Report', icon: FiTarget },
                      { value: 'photo' as const, label: 'Photo', icon: FiActivity },
                      { value: 'supporter' as const, label: 'Supporter', icon: FiShield },
                    ]).map(m => {
                      const Icon = m.icon
                      return (
                        <button
                          key={m.value}
                          onClick={() => setChallengeVerMethod(m.value)}
                          className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${challengeVerMethod === m.value ? 'border-[#00C4CC] bg-[#00C4CC]/10 text-[#00C4CC]' : 'border-border text-muted-foreground'}`}
                        >
                          <Icon className="w-3 h-3" />
                          {m.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Prize (optional)</Label>
                  <Input
                    placeholder="e.g., Bragging rights, Gift card..."
                    value={challengePrize}
                    onChange={(e) => setChallengePrize(e.target.value)}
                    className="rounded-xl bg-background/50 h-8 text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs gropact-gradient text-white rounded-lg" onClick={handleCreateChallenge} disabled={!challengeTitle.trim() || !challengeStart || !challengeEnd}>
                    Create Challenge
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowNewChallenge(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Challenges List */}
          {challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map(challenge => {
                const participants = Array.isArray(challenge.participants) ? challenge.participants : []
                const isParticipant = user?.id ? participants.some(p => p.userId === user.id) : false
                return (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    isParticipant={isParticipant}
                    onJoin={() => handleJoinChallenge(challenge.id)}
                  />
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiFlag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No challenges yet. Create the first one!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function Page() {
  return (
    <AppShell showSidebar={false}>
      <RoomDetailContent />
    </AppShell>
  )
}
