'use client'

import { useState, useMemo } from 'react'
import AppShell from '@/components/AppShell'
import RoomCard from '@/components/RoomCard'
import ChallengeCard from '@/components/ChallengeCard'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useRooms } from '@/contexts/RoomContext'
import {
  FiSearch, FiUsers, FiFlag, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi'

const CATEGORIES = ['All', 'Fitness', 'Reading', 'Wellness', 'Career']
const ROOM_TYPES = ['All', 'community', 'challenge', 'creator']

function RoomsContent() {
  const { user } = useAuth()
  const { rooms, myRooms, joinRoom, leaveRoom, getChallengeRooms, getMyActiveChallenges, joinChallenge } = useRooms()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [challengeScrollOffset, setChallengeScrollOffset] = useState(0)

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const searchLower = search.toLowerCase()
      const matchesSearch = !search || (r.name ?? '').toLowerCase().includes(searchLower) || (r.description ?? '').toLowerCase().includes(searchLower)
      const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter
      const matchesType = typeFilter === 'All' || r.type === typeFilter
      return matchesSearch && matchesCategory && matchesType
    })
  }, [rooms, search, categoryFilter, typeFilter])

  const myActiveChallenges = getMyActiveChallenges()

  // All active challenges from all rooms
  const allActiveChallenges = useMemo(() => {
    return rooms.flatMap(r => {
      const challenges = Array.isArray(r.challenges) ? r.challenges : []
      return challenges.filter(c => c.status === 'active').map(c => ({ ...c, roomName: r.name }))
    })
  }, [rooms])

  const visibleChallenges = allActiveChallenges.slice(challengeScrollOffset, challengeScrollOffset + 3)

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rooms</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Join communities and compete in challenges</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <FiUsers className="w-3 h-3" />
            {myRooms.length} joined
          </Badge>
          {myActiveChallenges.length > 0 && (
            <Badge className="text-xs bg-amber-100 text-amber-700 gap-1">
              <FiFlag className="w-3 h-3" />
              {myActiveChallenges.length} active
            </Badge>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-background/50 h-10"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${categoryFilter === cat ? 'border-[#00C4CC] bg-[#00C4CC]/10 text-[#00C4CC]' : 'border-border text-muted-foreground hover:border-foreground/30'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex gap-1.5 flex-wrap">
            {ROOM_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all capitalize ${typeFilter === type ? 'border-[#00C4CC] bg-[#00C4CC]/10 text-[#00C4CC]' : 'border-border text-muted-foreground hover:border-foreground/30'}`}
              >
                {type === 'All' ? 'All Types' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Challenges Horizontal Section */}
      {allActiveChallenges.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <FiFlag className="w-4 h-4 text-amber-500" />
              Active Challenges
            </h2>
            {allActiveChallenges.length > 3 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setChallengeScrollOffset(Math.max(0, challengeScrollOffset - 3))}
                  disabled={challengeScrollOffset === 0}
                >
                  <FiChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setChallengeScrollOffset(Math.min(allActiveChallenges.length - 1, challengeScrollOffset + 3))}
                  disabled={challengeScrollOffset + 3 >= allActiveChallenges.length}
                >
                  <FiChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {visibleChallenges.map(challenge => {
              const participants = Array.isArray(challenge.participants) ? challenge.participants : []
              const isParticipant = user?.id ? participants.some(p => p.userId === user.id) : false
              return (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  isParticipant={isParticipant}
                  onJoin={() => {
                    const room = rooms.find(r => {
                      const c = Array.isArray(r.challenges) ? r.challenges : []
                      return c.some(ch => ch.id === challenge.id)
                    })
                    if (room) joinChallenge(room.id, challenge.id)
                  }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* My Rooms Section */}
      {myRooms.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">My Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                isMember={true}
                onLeave={() => leaveRoom(room.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Rooms */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">
          {categoryFilter !== 'All' || typeFilter !== 'All' ? 'Filtered Rooms' : 'All Rooms'} ({filteredRooms.length})
        </h2>
        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRooms.map(room => {
              const members = Array.isArray(room.members) ? room.members : []
              const isMember = user?.id ? members.includes(user.id) : false
              return (
                <RoomCard
                  key={room.id}
                  room={room}
                  isMember={isMember}
                  onJoin={() => joinRoom(room.id)}
                  onLeave={() => leaveRoom(room.id)}
                />
              )
            })}
          </div>
        ) : (
          <Card className="glass-card rounded-xl">
            <CardContent className="p-8 text-center">
              <FiUsers className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-1">No rooms found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AppShell showSidebar={true}>
      <RoomsContent />
    </AppShell>
  )
}
