'use client'

import { FiZap } from 'react-icons/fi'

interface StreakCounterProps {
  streak: number
  variant?: 'compact' | 'full'
}

export default function StreakCounter({ streak, variant = 'full' }: StreakCounterProps) {
  const colorClass = streak >= 8
    ? 'text-[#00C4CC]'
    : streak >= 4
      ? 'text-teal-500'
      : streak >= 1
        ? 'text-cyan-400'
        : 'text-muted-foreground'

  const bgClass = streak >= 8
    ? 'bg-[#00C4CC]/10'
    : streak >= 4
      ? 'bg-teal-50'
      : streak >= 1
        ? 'bg-cyan-50'
        : 'bg-muted'

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${bgClass}`}>
        <FiZap className={`w-3 h-3 ${colorClass}`} />
        <span className={`text-xs font-semibold ${colorClass}`}>{streak}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${bgClass}`}>
      <FiZap className={`w-5 h-5 ${colorClass}`} />
      <div>
        <span className={`text-2xl font-bold ${colorClass}`}>{streak}</span>
        <span className={`text-xs ${colorClass} ml-1`}>day streak</span>
      </div>
    </div>
  )
}
