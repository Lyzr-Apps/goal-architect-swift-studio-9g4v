'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import PactCard from '@/components/PactCard'
import { Button } from '@/components/ui/button'
import { usePacts } from '@/contexts/PactContext'
import { FiPlus, FiTarget } from 'react-icons/fi'

type FilterTab = 'all' | 'active' | 'completed' | 'paused'

function PactsContent() {
  const { pacts } = usePacts()
  const [filter, setFilter] = useState<FilterTab>('all')

  const tabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'paused', label: 'Paused' },
  ]

  const filteredPacts = filter === 'all'
    ? pacts
    : pacts.filter(p => p.status === filter)

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">My Pacts</h1>
        <Link href="/pacts/new">
          <Button className="rounded-xl gropact-gradient text-white gap-2 text-sm">
            <FiPlus className="w-4 h-4" />
            New Pact
          </Button>
        </Link>
      </div>

      {/* Tab Filters */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
        {tabs.map((tab) => {
          const count = tab.value === 'all'
            ? pacts.length
            : pacts.filter(p => p.status === tab.value).length
          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === tab.value ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Pacts Grid */}
      {filteredPacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPacts.map((pact) => (
            <PactCard key={pact.id} pact={pact} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiTarget className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground mb-1">
            {filter === 'all' ? 'No pacts yet' : `No ${filter} pacts`}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {filter === 'all' ? 'Create your first pact to get started.' : 'Try changing the filter.'}
          </p>
          {filter === 'all' && (
            <Link href="/pacts/new">
              <Button className="rounded-xl gropact-gradient text-white gap-2">
                <FiPlus className="w-4 h-4" />
                Create Pact
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <AppShell showSidebar={true}>
      <PactsContent />
    </AppShell>
  )
}
