'use client'

interface TrustScoreBadgeProps {
  score: number
  variant?: 'full' | 'compact'
}

function getColor(score: number): string {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#00C4CC'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

export default function TrustScoreBadge({ score, variant = 'full' }: TrustScoreBadgeProps) {
  const color = getColor(score)
  const radius = variant === 'compact' ? 14 : 20
  const stroke = variant === 'compact' ? 3 : 4
  const circumference = 2 * Math.PI * radius
  const filled = (score / 100) * circumference
  const size = (radius + stroke) * 2

  return (
    <div className="group relative inline-flex flex-col items-center" title="Based on verification history, confirmation accuracy, and engagement consistency">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted/30" />
        <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={circumference - filled} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 font-bold ${variant === 'compact' ? 'text-[9px] -translate-y-1/2' : 'text-xs -translate-y-1/2'}`} style={{ color }}>
        {score}
      </span>
      {variant === 'full' && (
        <span className="text-[9px] text-muted-foreground mt-0.5">Trust Score</span>
      )}
    </div>
  )
}
