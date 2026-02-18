'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FiUsers, FiChevronRight, FiActivity, FiBookOpen, FiStar, FiTarget } from 'react-icons/fi'
import type { Room } from '@/lib/types'

interface RoomCardProps {
  room: Room
  isMember: boolean
  onJoin?: () => void
  onLeave?: () => void
}

const categoryColors: Record<string, string> = {
  Fitness: 'bg-orange-50 text-orange-600 border-orange-200',
  Reading: 'bg-blue-50 text-blue-600 border-blue-200',
  Wellness: 'bg-green-50 text-green-600 border-green-200',
  Career: 'bg-indigo-50 text-indigo-600 border-indigo-200',
}

function getIcon(iconName: string) {
  switch (iconName) {
    case 'FiActivity': return <FiActivity className="w-5 h-5" />
    case 'FiBookOpen': return <FiBookOpen className="w-5 h-5" />
    case 'FiStar': return <FiStar className="w-5 h-5" />
    case 'FiTarget': return <FiTarget className="w-5 h-5" />
    default: return <FiUsers className="w-5 h-5" />
  }
}

export default function RoomCard({ room, isMember, onJoin, onLeave }: RoomCardProps) {
  const posts = Array.isArray(room.posts) ? room.posts : []

  return (
    <Card className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#00C4CC]/10 flex items-center justify-center text-[#00C4CC] flex-shrink-0">
            {getIcon(room.icon)}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/rooms/${room.id}`} className="group">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-[#00C4CC] transition-colors flex items-center gap-1">
                {room.name}
                <FiChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{room.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-[10px] px-2 py-0 border ${categoryColors[room.category] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              {room.category}
            </Badge>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <FiUsers className="w-3 h-3" />
              {room.memberCount} members
            </span>
          </div>
          {isMember ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] rounded-lg"
              onClick={(e) => { e.preventDefault(); onLeave?.() }}
            >
              Joined
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-7 text-[11px] rounded-lg gropact-gradient text-white"
              onClick={(e) => { e.preventDefault(); onJoin?.() }}
            >
              Join
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
