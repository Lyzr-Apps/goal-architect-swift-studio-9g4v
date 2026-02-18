'use client'

import { useState } from 'react'
import AppShell from '@/components/AppShell'
import RoomCard from '@/components/RoomCard'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useRooms } from '@/contexts/RoomContext'
import { FiSearch, FiUsers } from 'react-icons/fi'

const CATEGORIES = ['All', 'Fitness', 'Reading', 'Wellness', 'Career']

function RoomsContent() {
  const { user } = useAuth()
  const { rooms, myRooms, joinRoom, leaveRoom } = useRooms()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const userId = user?.id ?? ''

  const isMember = (room: { members: string[] }) => {
    const members = Array.isArray(room.members) ? room.members : []
    return members.includes(userId)
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = !search || room.name.toLowerCase().includes(search.toLowerCase()) || room.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'All' || room.category === category
    return matchesSearch && matchesCategory
  })

  const discoverRooms = filteredRooms.filter(r => !isMember(r))

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Community Rooms</h1>
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-background/50 h-9 text-sm"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${category === cat ? 'border-[#00C4CC] bg-[#00C4CC]/10 text-[#00C4CC]' : 'border-border text-muted-foreground hover:border-foreground'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* My Rooms */}
      {myRooms.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FiUsers className="w-4 h-4 text-[#00C4CC]" />
            My Rooms ({myRooms.length})
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {myRooms.map((room) => (
              <div key={room.id} className="min-w-[280px] max-w-[320px] flex-shrink-0">
                <RoomCard
                  room={room}
                  isMember={true}
                  onLeave={() => leaveRoom(room.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discover Rooms */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">
          {myRooms.length > 0 ? 'Discover More' : 'All Rooms'}
        </h2>
        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isMember={isMember(room)}
                onJoin={() => joinRoom(room.id)}
                onLeave={() => leaveRoom(room.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiUsers className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No rooms match your search.</p>
          </div>
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
