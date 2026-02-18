'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '@/lib/types'
import {
  getUser,
  setUser as storeSetUser,
  getUserByEmail,
  getSession,
  setSession,
  clearSession,
  initializeStore,
} from '@/lib/store'
import { generateUUID } from '@/lib/utils'

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => { success: boolean; error?: string }
  register: (name: string, email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
  updateProfile: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeStore()
    const session = getSession()
    if (session) {
      const stored = getUser()
      if (stored) {
        setUser(stored)
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' }
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' }
    }

    const existing = getUserByEmail(email)
    if (existing) {
      setSession(existing.id)
      setUser(existing)
      return { success: true }
    }

    // For demo: create a new user on login if not found
    const newUser: User = {
      id: 'user-' + generateUUID().slice(0, 8),
      name: email.split('@')[0],
      email,
      joinedDate: new Date().toISOString(),
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0,
      totalPacts: 0,
      completedPacts: 0,
    }
    storeSetUser(newUser)
    setSession(newUser.id)
    setUser(newUser)
    return { success: true }
  }, [])

  const register = useCallback((name: string, email: string, password: string): { success: boolean; error?: string } => {
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'Name is required.' }
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' }
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' }
    }

    const existing = getUserByEmail(email)
    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' }
    }

    const newUser: User = {
      id: 'user-' + generateUUID().slice(0, 8),
      name: name.trim(),
      email,
      joinedDate: new Date().toISOString(),
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0,
      totalPacts: 0,
      completedPacts: 0,
    }
    storeSetUser(newUser)
    setSession(newUser.id)
    setUser(newUser)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      storeSetUser(updated)
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: user !== null,
      loading,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
