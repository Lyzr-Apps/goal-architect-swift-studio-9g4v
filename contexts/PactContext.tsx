'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Pact, DailyCheckIn, Verification, WeeklyReflection, ProgressCard, MicroGoal } from '@/lib/types'
import {
  getPacts,
  createPact as storeCreate,
  updatePact as storeUpdate,
  deletePact as storeDelete,
  addVerification as storeAddVerification,
  updateVerification as storeUpdateVerification,
  addWeeklyReflection as storeAddWeeklyReflection,
  addProgressCard as storeAddProgressCard,
  shareProgressCard as storeShareProgressCard,
} from '@/lib/store'
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
  addVerification: (pactId: string, verification: Verification) => void
  confirmVerification: (pactId: string, verificationId: string, verifierName: string) => void
  addWeeklyReflection: (pactId: string, reflection: WeeklyReflection) => void
  generateProgressCard: (pactId: string) => ProgressCard
  shareProgressCard: (pactId: string, cardId: string) => void
  getActivePactWithNextGoal: () => { pact: Pact; goal: MicroGoal } | null
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

  const handleAddVerification = useCallback((pactId: string, verification: Verification) => {
    storeAddVerification(pactId, verification)
    loadPacts()
  }, [loadPacts])

  const handleConfirmVerification = useCallback((pactId: string, verificationId: string, verifierName: string) => {
    storeUpdateVerification(pactId, verificationId, {
      status: 'verified',
      verifiedBy: verifierName,
      verifiedAt: new Date().toISOString(),
    })
    loadPacts()
  }, [loadPacts])

  const handleAddWeeklyReflection = useCallback((pactId: string, reflection: WeeklyReflection) => {
    storeAddWeeklyReflection(pactId, reflection)
    loadPacts()
  }, [loadPacts])

  const handleGenerateProgressCard = useCallback((pactId: string): ProgressCard => {
    const pact = pacts.find(p => p.id === pactId)
    const goals = Array.isArray(pact?.microGoals) ? pact.microGoals : []
    const completedGoals = goals.filter(g => g.completed).length
    const verifications = Array.isArray(pact?.verifications) ? pact.verifications : []
    const card: ProgressCard = {
      id: 'pc-' + generateUUID().slice(0, 8),
      pactId,
      title: pact?.title ? `Progress on ${pact.title}` : 'Progress Update',
      description: `Completed ${completedGoals} of ${goals.length} micro-goals with a ${pact?.streak ?? 0}-day streak.`,
      milestone: completedGoals === goals.length && goals.length > 0
        ? 'All Goals Completed!'
        : `${completedGoals}/${goals.length} Goals Done`,
      verified: verifications.some(v => v.status === 'verified'),
      verificationMethod: pact?.verificationMethod ?? 'self',
      stats: {
        streakDays: pact?.streak ?? 0,
        goalsCompleted: completedGoals,
        totalGoals: goals.length,
        completionRate: pact?.completionRate ?? 0,
      },
      createdAt: new Date().toISOString(),
      shared: false,
    }
    storeAddProgressCard(pactId, card)
    loadPacts()
    return card
  }, [pacts, loadPacts])

  const handleShareProgressCard = useCallback((pactId: string, cardId: string) => {
    storeShareProgressCard(pactId, cardId)
    loadPacts()
  }, [loadPacts])

  const getActivePactWithNextGoal = useCallback((): { pact: Pact; goal: MicroGoal } | null => {
    for (const pact of activePacts) {
      const goals = Array.isArray(pact.microGoals) ? pact.microGoals : []
      const nextGoal = goals.find(g => !g.completed)
      if (nextGoal) {
        return { pact, goal: nextGoal }
      }
    }
    return null
  }, [activePacts])

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
      addVerification: handleAddVerification,
      confirmVerification: handleConfirmVerification,
      addWeeklyReflection: handleAddWeeklyReflection,
      generateProgressCard: handleGenerateProgressCard,
      shareProgressCard: handleShareProgressCard,
      getActivePactWithNextGoal,
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
