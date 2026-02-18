'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Room, RoomPost } from '@/lib/types'
import {
  getRooms as storeGetRooms,
  getRoom as storeGetRoom,
  joinRoom as storeJoin,
  leaveRoom as storeLeave,
  addPost as storeAddPost,
  likePost as storeLikePost,
} from '@/lib/store'
import { useAuth } from '@/contexts/AuthContext'
import { generateUUID } from '@/lib/utils'

interface RoomContextValue {
  rooms: Room[]
  myRooms: Room[]
  getRoom: (id: string) => Room | undefined
  joinRoom: (id: string) => void
  leaveRoom: (id: string) => void
  addPost: (roomId: string, content: string, type: RoomPost['type']) => void
  likePost: (roomId: string, postId: string) => void
  refreshRooms: () => void
}

const RoomContext = createContext<RoomContextValue | null>(null)

export function RoomProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])

  const loadRooms = useCallback(() => {
    const loaded = storeGetRooms()
    setRooms(Array.isArray(loaded) ? loaded : [])
  }, [])

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  const myRooms = rooms.filter(r => {
    const members = Array.isArray(r.members) ? r.members : []
    return user?.id ? members.includes(user.id) : false
  })

  const getRoomById = useCallback((id: string) => {
    return rooms.find(r => r.id === id)
  }, [rooms])

  const handleJoin = useCallback((id: string) => {
    if (!user?.id) return
    storeJoin(id, user.id)
    loadRooms()
  }, [user?.id, loadRooms])

  const handleLeave = useCallback((id: string) => {
    if (!user?.id) return
    storeLeave(id, user.id)
    loadRooms()
  }, [user?.id, loadRooms])

  const handleAddPost = useCallback((roomId: string, content: string, type: RoomPost['type']) => {
    if (!user) return
    const post: RoomPost = {
      id: 'post-' + generateUUID().slice(0, 8),
      userId: user.id,
      userName: user.name,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      type,
    }
    storeAddPost(roomId, post)
    loadRooms()
  }, [user, loadRooms])

  const handleLikePost = useCallback((roomId: string, postId: string) => {
    if (!user?.id) return
    storeLikePost(roomId, postId, user.id)
    loadRooms()
  }, [user?.id, loadRooms])

  return (
    <RoomContext.Provider value={{
      rooms,
      myRooms,
      getRoom: getRoomById,
      joinRoom: handleJoin,
      leaveRoom: handleLeave,
      addPost: handleAddPost,
      likePost: handleLikePost,
      refreshRooms: loadRooms,
    }}>
      {children}
    </RoomContext.Provider>
  )
}

export function useRooms(): RoomContextValue {
  const ctx = useContext(RoomContext)
  if (!ctx) {
    throw new Error('useRooms must be used within a RoomProvider')
  }
  return ctx
}
