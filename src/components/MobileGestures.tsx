'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface SwipeGestureOptions {
  threshold?: number
  restraint?: number
  allowedTime?: number
}

export function useMobileGestures(options: SwipeGestureOptions = {}) {
  const {
    threshold = 150,
    restraint = 100,
    allowedTime = 300
  } = options

  const router = useRouter()
  const touchRef = useRef<{
    startX: number
    startY: number
    startTime: number
  } | null>(null)

  useEffect(() => {
    let startX = 0
    let startY = 0
    let startTime = 0

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      startTime = Date.now()
      touchRef.current = { startX, startY, startTime }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchRef.current) return

      const touch = e.changedTouches[0]
      const distX = touch.clientX - touchRef.current.startX
      const distY = touch.clientY - touchRef.current.startY
      const elapsedTime = Date.now() - touchRef.current.startTime

      // Check if gesture meets criteria
      if (elapsedTime <= allowedTime) {
        if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
          // Horizontal swipe detected
          if (distX > 0) {
            // Swipe right - go back
            router.back()
          } else {
            // Swipe left - go forward (if possible)
            router.forward()
          }
        }
      }

      touchRef.current = null
    }

    // Only add touch listeners on mobile devices
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true })
      document.addEventListener('touchend', handleTouchEnd, { passive: true })

      return () => {
        document.removeEventListener('touchstart', handleTouchStart)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [router, threshold, restraint, allowedTime])

  return touchRef
}

// Pull-to-refresh component
export function PullToRefresh({ onRefreshAction }: { onRefreshAction: () => void }) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const isScrolledToTop = useRef(true)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      startY.current = e.touches[0].clientY
      isScrolledToTop.current = window.scrollY === 0
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isScrolledToTop.current || isRefreshing) return

      const currentY = e.touches[0].clientY
      const distance = currentY - startY.current

      if (distance > 0) {
        setPullDistance(Math.min(distance, 120))
        if (distance > 10) {
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = () => {
      if (pullDistance > 80 && !isRefreshing) {
        setIsRefreshing(true)
        onRefreshAction()
        setTimeout(() => {
          setIsRefreshing(false)
          setPullDistance(0)
        }, 2000)
      } else {
        setPullDistance(0)
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [pullDistance, isRefreshing, onRefreshAction])

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-transform duration-300 ${
        pullDistance > 0 ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{ transform: `translateY(${Math.min(pullDistance - 80, 0)}px)` }}
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 m-4">
        {isRefreshing ? (
          <div className="w-6 h-6 border-2 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-6 h-6 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
      </div>
    </div>
  )
}

// Mobile-optimized bottom navigation
export function MobileBottomNav() {
  const router = useRouter()
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  const navItems = [
    { href: '/', icon: '🏠', label: 'Home' },
    { href: '/playground', icon: '💻', label: 'Code' },
    { href: '/nota', icon: '📚', label: 'Nota' },
    { href: '/leaderboard', icon: '🏆', label: 'Rank' },
    { href: '/dashboard-murid', icon: '📊', label: 'Stats' }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-gray-700/50 md:hidden z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-all duration-200 ${
              currentPath === item.href 
                ? 'text-electric-blue bg-electric-blue/20' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
