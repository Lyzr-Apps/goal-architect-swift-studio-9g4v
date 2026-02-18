'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Pact, DailyCheckIn } from '@/lib/types'
import { getPacts, createPact as storeCreate, updatePact as storeUpdate, deletePact as storeDelete } from '@/lib/store'
import { useAuth } from '@/contexts/AuthContext'
import { generateUUID } from '@/lib/utils'

interface PactContextValue {
  pacts: Pact[]
  activePacts: Pact[]
  completedPacts: Pact[]
  getPact: (id: string) => Pact | undefined
  createPact: (pact: Pact) => void
  updatePact: (pact: Pact) => void
  deletePact: (id: string) => void
  addCheckIn: (pactId: string, checkIn: DailyCheckIn) => void
  toggleMicroGoal: (pactId: string, goalId: string) => void
  toggleWeeklyDay: (pactId: string, dayIndex: number) => void
  refreshPacts: () => void
}

const PactContext = createContext<PactContextValue | null>(null)

export function PactProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [pacts, setPacts] = useState<Pact[]>([])

  const loadPacts = useCallback(() => {
    if (user?.id) {
      const loaded = getPacts(user.id)
      setPacts(Array.isArray(loaded) ? loaded : [])
    } else {
      setPacts([])
    }
  }, [user?.id])

  useEffect(() => {
    loadPacts()
  }, [loadPacts])

  const activePacts = pacts.filter(p => p.status === 'active')
  const completedPacts = pacts.filter(p => p.status === 'completed')

  const getPactById = useCallback((id: string) => {
    return pacts.find(p => p.id === id)
  }, [pacts])

  const handleCreate = useCallback((pact: Pact) => {
    storeCreate(pact)
    setPacts(prev => [...prev, pact])
  }, [])

  const handleUpdate = useCallback((pact: Pact) => {
    pact.updatedAt = new Date().toISOString()
    storeUpdate(pact)
    setPacts(prev => prev.map(p => p.id === pact.id ? pact : p))
  }, [])

  const handleDelete = useCallback((id: string) => {
    storeDelete(id)
    setPacts(prev => prev.filter(p => p.id !== id))
  }, [])

  const addCheckIn = useCallback((pactId: string, checkIn: DailyCheckIn) => {
    setPacts(prev => {
      const updated = prev.map(p => {
        if (p.id !== pactId) return p
        const newPact = {
          ...p,
          checkIns: [checkIn, ...(Array.isArray(p.checkIns) ? p.checkIns : [])],
          streak: p.streak + 1,
          updatedAt: new Date().toISOString(),
        }
        storeUpdate(newPact)
        return newPact
      })
      return updated
    })
  }, [])

  const toggleMicroGoal = useCallback((pactId: string, goalId: string) => {
    setPacts(prev => {
      const updated = prev.map(p => {
        if (p.id !== pactId) return p
        const goals = Array.isArray(p.microGoals) ? p.microGoals : []
        const newGoals = goals.map(g => {
          if (g.id !== goalId) return g
          return {
            ...g,
            completed: !g.completed,
            completedDate: !g.completed ? new Date().toISOString() : undefined,
          }
        })
        const completedCount = newGoals.filter(g => g.completed).length
        const newPact = {
          ...p,
          microGoals: newGoals,
          completionRate: newGoals.length > 0 ? Math.round((completedCount / newGoals.length) * 100) : 0,
          updatedAt: new Date().toISOString(),
        }
        storeUpdate(newPact)
        return newPact
      })
      return updated
    })
  }, [])

  const toggleWeeklyDay = useCallback((pactId: string, dayIndex: number) => {
    setPacts(prev => {
      const updated = prev.map(p => {
        if (p.id !== pactId) return p
        const plan = Array.isArray(p.weeklyPlan) ? [...p.weeklyPlan] : []
        if (plan[dayIndex]) {
          plan[dayIndex] = { ...plan[dayIndex], completed: !plan[dayIndex].completed }
        }
        const newPact = { ...p, weeklyPlan: plan, updatedAt: new Date().toISOString() }
        storeUpdate(newPact)
        return newPact
      })
      return updated
    })
  }, [])

  return (
    <PactContext.Provider value={{
      pacts,
      activePacts,
      completedPacts,
      getPact: getPactById,
      createPact: handleCreate,
      updatePact: handleUpdate,
      deletePact: handleDelete,
      addCheckIn,
      toggleMicroGoal,
      toggleWeeklyDay,
      refreshPacts: loadPacts,
    }}>
      {children}
    </PactContext.Provider>
  )
}

export function usePacts(): PactContextValue {
  const ctx = useContext(PactContext)
  if (!ctx) {
    throw new Error('usePacts must be used within a PactProvider')
  }
  return ctx
}
