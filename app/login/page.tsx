'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { FiAlertCircle } from 'react-icons/fi'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [loading, isAuthenticated, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const result = login(email, password)
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error ?? 'Login failed.')
      setSubmitting(false)
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="glass-card-strong rounded-2xl w-full max-w-sm">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <img
              src="https://asset.lyzr.app/mWfeiOFG"
              alt="GroPact"
              className="h-20 w-auto object-contain mx-auto mb-3"
            />
            <h1 className="text-xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your GroPact account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@gropact.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl bg-background/50 h-10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl bg-background/50 h-10"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 rounded-lg px-3 py-2">
                <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl h-11 text-sm font-semibold gropact-gradient text-white"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#00C4CC] font-medium hover:underline">
              Register
            </Link>
          </p>

          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground text-center">
              Demo: alex@gropact.com / password123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
