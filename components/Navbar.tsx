'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/contexts/AuthContext'
import { FiHome, FiTarget, FiUsers, FiUser, FiSettings, FiLogOut, FiMenu, FiActivity } from 'react-icons/fi'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: FiHome },
  { href: '/pacts', label: 'My Pacts', icon: FiTarget },
  { href: '/rooms', label: 'Rooms', icon: FiUsers },
]

const tierLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-gray-100 text-gray-700' },
  mid: { label: 'Growth', color: 'bg-blue-100 text-blue-700' },
  premium: { label: 'Pro', color: 'bg-[#00C4CC]/10 text-[#00C4CC]' },
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const initial = (user?.name ?? 'U')[0]?.toUpperCase() ?? 'U'
  const tier = user?.tier ?? 'free'
  const tierInfo = tierLabels[tier] ?? tierLabels.free

  return (
    <header className="sticky top-0 z-40 glass-card-strong border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="https://asset.lyzr.app/mWfeiOFG" alt="GroPact" className="h-10 w-auto object-contain" />
          <span className="text-base font-bold text-foreground hidden sm:block">GroPact</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href + '/'))
            const Icon = link.icon
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${active ? 'text-[#00C4CC] bg-[#00C4CC]/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            )
          })}
          {tier === 'premium' && (
            <Link href="/pacts/new" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/pacts/new' ? 'text-[#00C4CC] bg-[#00C4CC]/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
              <FiActivity className="w-4 h-4" />
              AI Architect
            </Link>
          )}
        </nav>

        {/* Desktop User Menu */}
        <div className="hidden md:flex items-center gap-2">
          <Badge className={`text-[9px] px-2 py-0.5 ${tierInfo.color}`}>{tierInfo.label}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 gap-2 px-2">
                <div className="w-7 h-7 rounded-full bg-[#00C4CC]/15 flex items-center justify-center text-xs font-semibold text-[#00C4CC]">
                  {initial}
                </div>
                <span className="text-sm text-foreground">{user?.name ?? 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <FiUser className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <FiSettings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <FiLogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <FiMenu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-1">
                <div className="flex items-center gap-2 mb-4 px-3">
                  <div className="w-8 h-8 rounded-full bg-[#00C4CC]/15 flex items-center justify-center text-xs font-bold text-[#00C4CC]">
                    {initial}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user?.name ?? 'User'}</p>
                    <Badge className={`text-[8px] ${tierInfo.color}`}>{tierInfo.label}</Badge>
                  </div>
                </div>
                {navLinks.map((link) => {
                  const active = pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href + '/'))
                  const Icon = link.icon
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'text-[#00C4CC] bg-[#00C4CC]/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  )
                })}
                <div className="my-3 h-px bg-border" />
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50">
                  <FiUser className="w-4 h-4" />
                  Profile
                </Link>
                <Link href="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50">
                  <FiSettings className="w-4 h-4" />
                  Settings
                </Link>
                <button onClick={() => { setMobileOpen(false); handleLogout() }} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 w-full text-left">
                  <FiLogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
