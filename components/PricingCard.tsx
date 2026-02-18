'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FiCheck } from 'react-icons/fi'

interface PricingCardProps {
  currentTier: 'free' | 'mid' | 'premium'
  onUpgrade: (tier: 'mid' | 'premium') => void
}

const plans = [
  {
    tier: 'free' as const,
    name: 'Free',
    price: '$0',
    period: '/month',
    features: [
      '2 Active Pacts',
      '3 Supporters per Pact',
      'Basic Check-ins',
      'Community Rooms',
    ],
  },
  {
    tier: 'mid' as const,
    name: 'Growth',
    price: '$4.99',
    period: '/month',
    features: [
      'Unlimited Pacts',
      '5 Supporters per Pact',
      'Weekly AI Reviews',
      'Advanced Check-in Analytics',
      'Priority Support',
    ],
  },
  {
    tier: 'premium' as const,
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    popular: true,
    features: [
      'Everything in Growth',
      'AI Goal Architect (Full)',
      'Unlimited Supporters',
      'Verification Engine',
      'Progress Cards',
      'Creator Challenge Tools',
      'AI Blueprint Export',
      'Custom Rooms',
    ],
  },
]

export default function PricingCard({ currentTier, onUpgrade }: PricingCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map(plan => {
        const isCurrent = currentTier === plan.tier
        const isPro = plan.tier === 'premium'
        return (
          <Card key={plan.tier} className={`rounded-xl relative ${isPro ? 'border-[#00C4CC] shadow-lg shadow-[#00C4CC]/10' : 'glass-card'}`}>
            {isPro && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="gropact-gradient text-white text-[10px] shadow-md">Most Popular</Badge>
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{plan.name}</CardTitle>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                <span className="text-xs text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <FiCheck className="w-3.5 h-3.5 text-[#00C4CC] flex-shrink-0" />
                    <span className="text-xs text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              {isCurrent ? (
                <Badge variant="outline" className="w-full justify-center py-1.5 text-xs">Current Plan</Badge>
              ) : plan.tier !== 'free' ? (
                <Button onClick={() => onUpgrade(plan.tier)} className="w-full gropact-gradient text-white rounded-xl text-xs">
                  Upgrade to {plan.name}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
