import type { User, Pact, Room, RoomPost, DailyCheckIn, Verification, WeeklyReflection, ProgressCard, SupporterActivity, RoomChallenge } from './types'
import { MOCK_USER, MOCK_PACTS, MOCK_ROOMS, SUPPORTER_ACTIVITY_FEED } from './mockData'

const KEYS = {
  USER: 'gropact_user',
  USERS: 'gropact_users',
  SESSION: 'gropact_session',
  PACTS: 'gropact_pacts',
  ROOMS: 'gropact_rooms',
  INITIALIZED: 'gropact_initialized',
  SUPPORTER_ACTIVITY: 'gropact_supporter_activity',
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

export function updateUserTier(tier: 'free' | 'mid' | 'premium'): void {
  const user = getUser()
  if (user) {
    user.tier = tier
    setUser(user)
  }
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

// ── Verifications ──────────────────────────────────────────────
export function addVerification(pactId: string, verification: Verification): void {
  const all = safeGet<Pact[]>(KEYS.PACTS) ?? []
  const pact = all.find(p => p.id === pactId)
  if (pact) {
    const verifications = Array.isArray(pact.verifications) ? pact.verifications : []
    pact.verifications = [...verifications, verification]
    pact.updatedAt = new Date().toISOString()
    safeSet(KEYS.PACTS, all)
  }
}

export function updateVerification(pactId: string, verificationId: string, updates: Partial<Verification>): void {
  const all = safeGet<Pact[]>(KEYS.PACTS) ?? []
  const pact = all.find(p => p.id === pactId)
  if (pact) {
    const verifications = Array.isArray(pact.verifications) ? pact.verifications : []
    const idx = verifications.findIndex(v => v.id === verificationId)
    if (idx >= 0) {
      verifications[idx] = { ...verifications[idx], ...updates }
      pact.verifications = verifications
      pact.updatedAt = new Date().toISOString()
      safeSet(KEYS.PACTS, all)
    }
  }
}

export function getVerifications(pactId: string): Verification[] {
  const pact = getPact(pactId)
  return Array.isArray(pact?.verifications) ? pact.verifications : []
}

// ── Weekly Reflections ──────────────────────────────────────────
export function addWeeklyReflection(pactId: string, reflection: WeeklyReflection): void {
  const all = safeGet<Pact[]>(KEYS.PACTS) ?? []
  const pact = all.find(p => p.id === pactId)
  if (pact) {
    const reflections = Array.isArray(pact.weeklyReflections) ? pact.weeklyReflections : []
    pact.weeklyReflections = [...reflections, reflection]
    pact.updatedAt = new Date().toISOString()
    safeSet(KEYS.PACTS, all)
  }
}

export function getWeeklyReflections(pactId: string): WeeklyReflection[] {
  const pact = getPact(pactId)
  return Array.isArray(pact?.weeklyReflections) ? pact.weeklyReflections : []
}

// ── Progress Cards ──────────────────────────────────────────────
export function addProgressCard(pactId: string, card: ProgressCard): void {
  const all = safeGet<Pact[]>(KEYS.PACTS) ?? []
  const pact = all.find(p => p.id === pactId)
  if (pact) {
    const cards = Array.isArray(pact.progressCards) ? pact.progressCards : []
    pact.progressCards = [...cards, card]
    pact.updatedAt = new Date().toISOString()
    safeSet(KEYS.PACTS, all)
  }
}

export function getProgressCards(pactId: string): ProgressCard[] {
  const pact = getPact(pactId)
  return Array.isArray(pact?.progressCards) ? pact.progressCards : []
}

export function shareProgressCard(pactId: string, cardId: string): void {
  const all = safeGet<Pact[]>(KEYS.PACTS) ?? []
  const pact = all.find(p => p.id === pactId)
  if (pact) {
    const cards = Array.isArray(pact.progressCards) ? pact.progressCards : []
    const idx = cards.findIndex(c => c.id === cardId)
    if (idx >= 0) {
      cards[idx] = { ...cards[idx], shared: true }
      pact.progressCards = cards
      pact.updatedAt = new Date().toISOString()
      safeSet(KEYS.PACTS, all)
    }
  }
}

// ── Supporter Activity ──────────────────────────────────────────
export function getSupporterActivity(): SupporterActivity[] {
  return safeGet<SupporterActivity[]>(KEYS.SUPPORTER_ACTIVITY) ?? []
}

export function addSupporterActivity(activity: SupporterActivity): void {
  const all = getSupporterActivity()
  safeSet(KEYS.SUPPORTER_ACTIVITY, [activity, ...all])
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

// ── Room Challenges ──────────────────────────────────────────────
export function addChallenge(roomId: string, challenge: RoomChallenge): void {
  const rooms = getRooms()
  const room = rooms.find(r => r.id === roomId)
  if (room) {
    const challenges = Array.isArray(room.challenges) ? room.challenges : []
    room.challenges = [...challenges, challenge]
    safeSet(KEYS.ROOMS, rooms)
  }
}

export function joinChallenge(roomId: string, challengeId: string, userId: string, userName: string): void {
  const rooms = getRooms()
  const room = rooms.find(r => r.id === roomId)
  if (room) {
    const challenges = Array.isArray(room.challenges) ? room.challenges : []
    const challenge = challenges.find(c => c.id === challengeId)
    if (challenge) {
      const participants = Array.isArray(challenge.participants) ? challenge.participants : []
      if (!participants.find(p => p.userId === userId)) {
        challenge.participants = [...participants, {
          userId,
          userName,
          joinedAt: new Date().toISOString(),
          progress: 0,
          completedMilestones: [],
          verified: false,
        }]
        safeSet(KEYS.ROOMS, rooms)
      }
    }
  }
}

export function updateChallengeProgress(roomId: string, challengeId: string, userId: string, progress: number): void {
  const rooms = getRooms()
  const room = rooms.find(r => r.id === roomId)
  if (room) {
    const challenges = Array.isArray(room.challenges) ? room.challenges : []
    const challenge = challenges.find(c => c.id === challengeId)
    if (challenge) {
      const participants = Array.isArray(challenge.participants) ? challenge.participants : []
      const participant = participants.find(p => p.userId === userId)
      if (participant) {
        participant.progress = progress
        safeSet(KEYS.ROOMS, rooms)
      }
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

  if (!safeGet<SupporterActivity[]>(KEYS.SUPPORTER_ACTIVITY)?.length) {
    safeSet(KEYS.SUPPORTER_ACTIVITY, SUPPORTER_ACTIVITY_FEED)
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
    supporterActivity: getSupporterActivity(),
    exportedAt: new Date().toISOString(),
  }
}
