import type { User, Pact, Room, RoomPost, DailyCheckIn } from './types'
import { MOCK_USER, MOCK_PACTS, MOCK_ROOMS } from './mockData'

const KEYS = {
  USER: 'gropact_user',
  USERS: 'gropact_users',
  SESSION: 'gropact_session',
  PACTS: 'gropact_pacts',
  ROOMS: 'gropact_rooms',
  INITIALIZED: 'gropact_initialized',
}

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable
  }
}

// ── User ──────────────────────────────────────────────────────
export function getUser(): User | null {
  const session = getSession()
  if (!session) return null
  const users = safeGet<User[]>(KEYS.USERS) ?? []
  return users.find(u => u.id === session.userId) ?? null
}

export function getUserByEmail(email: string): User | null {
  const users = safeGet<User[]>(KEYS.USERS) ?? []
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) ?? null
}

export function setUser(user: User): void {
  const users = safeGet<User[]>(KEYS.USERS) ?? []
  const idx = users.findIndex(u => u.id === user.id)
  if (idx >= 0) {
    users[idx] = user
  } else {
    users.push(user)
  }
  safeSet(KEYS.USERS, users)
}

// ── Auth ──────────────────────────────────────────────────────
export function getSession(): { userId: string; token: string } | null {
  return safeGet<{ userId: string; token: string }>(KEYS.SESSION)
}

export function setSession(userId: string): void {
  const token = 'tok_' + Math.random().toString(36).slice(2)
  safeSet(KEYS.SESSION, { userId, token })
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(KEYS.SESSION)
  } catch {
    // ignore
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null
}

// ── Pacts ──────────────────────────────────────────────────────
export function getPacts(userId: string): Pact[] {
  const all = safeGet<Pact[]>(KEYS.PACTS) ?? []
  return all.filter(p => p.userId === userId)
}

export function getAllPacts(): Pact[] {
  return safeGet<Pact[]>(KEYS.PACTS) ?? []
}

export function getPact(pactId: string): Pact | null {
  const all = safeGet<Pact[]>(KEYS.PACTS) ?? []
  return all.find(p => p.id === pactId) ?? null
}

export function createPact(pact: Pact): void {
  const all = safeGet<Pact[]>(KEYS.PACTS) ?? []
  all.push(pact)
  safeSet(KEYS.PACTS, all)
}

export function updatePact(pact: Pact): void {
  const all = safeGet<Pact[]>(KEYS.PACTS) ?? []
  const idx = all.findIndex(p => p.id === pact.id)
  if (idx >= 0) {
    all[idx] = pact
    safeSet(KEYS.PACTS, all)
  }
}

export function deletePact(pactId: string): void {
  const all = safeGet<Pact[]>(KEYS.PACTS) ?? []
  safeSet(KEYS.PACTS, all.filter(p => p.id !== pactId))
}

// ── Rooms ──────────────────────────────────────────────────────
export function getRooms(): Room[] {
  return safeGet<Room[]>(KEYS.ROOMS) ?? []
}

export function getRoom(roomId: string): Room | null {
  const rooms = getRooms()
  return rooms.find(r => r.id === roomId) ?? null
}

export function joinRoom(roomId: string, userId: string): void {
  const rooms = getRooms()
  const room = rooms.find(r => r.id === roomId)
  if (room && !room.members.includes(userId)) {
    room.members.push(userId)
    room.memberCount = room.members.length > room.memberCount ? room.members.length : room.memberCount + 1
    safeSet(KEYS.ROOMS, rooms)
  }
}

export function leaveRoom(roomId: string, userId: string): void {
  const rooms = getRooms()
  const room = rooms.find(r => r.id === roomId)
  if (room) {
    room.members = room.members.filter(m => m !== userId)
    safeSet(KEYS.ROOMS, rooms)
  }
}

export function addPost(roomId: string, post: RoomPost): void {
  const rooms = getRooms()
  const room = rooms.find(r => r.id === roomId)
  if (room) {
    room.posts = [post, ...(Array.isArray(room.posts) ? room.posts : [])]
    safeSet(KEYS.ROOMS, rooms)
  }
}

export function likePost(roomId: string, postId: string, userId: string): void {
  const rooms = getRooms()
  const room = rooms.find(r => r.id === roomId)
  if (room) {
    const post = (Array.isArray(room.posts) ? room.posts : []).find(p => p.id === postId)
    if (post) {
      const likedBy = Array.isArray(post.likedBy) ? post.likedBy : []
      if (likedBy.includes(userId)) {
        post.likedBy = likedBy.filter(id => id !== userId)
        post.likes = Math.max(0, (post.likes ?? 1) - 1)
      } else {
        post.likedBy = [...likedBy, userId]
        post.likes = (post.likes ?? 0) + 1
      }
      safeSet(KEYS.ROOMS, rooms)
    }
  }
}

// ── Initialize ──────────────────────────────────────────────────
export function initializeStore(): void {
  if (typeof window === 'undefined') return
  const initialized = localStorage.getItem(KEYS.INITIALIZED)
  if (initialized) return

  // Seed mock data
  const users = safeGet<User[]>(KEYS.USERS) ?? []
  if (!users.find(u => u.id === MOCK_USER.id)) {
    users.push(MOCK_USER)
  }
  safeSet(KEYS.USERS, users)

  if (!safeGet<Pact[]>(KEYS.PACTS)?.length) {
    safeSet(KEYS.PACTS, MOCK_PACTS)
  }

  if (!safeGet<Room[]>(KEYS.ROOMS)?.length) {
    safeSet(KEYS.ROOMS, MOCK_ROOMS)
  }

  localStorage.setItem(KEYS.INITIALIZED, 'true')
}

// ── Reset ──────────────────────────────────────────────────────
export function clearAllData(): void {
  if (typeof window === 'undefined') return
  Object.values(KEYS).forEach(key => {
    try { localStorage.removeItem(key) } catch { /* ignore */ }
  })
}

export function exportAllData(): object {
  return {
    user: getUser(),
    pacts: getUser() ? getPacts(getUser()!.id) : [],
    rooms: getRooms(),
    exportedAt: new Date().toISOString(),
  }
}
