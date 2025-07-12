'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
  icon?: React.ReactNode
}

export function Breadcrumbs() {
  const pathname = usePathname()
  
  // Define route mappings
  const routeMap: Record<string, string> = {
    '/': 'Laman Utama',
    '/playground': 'Playground',
    '/nota': 'Nota',
    '/leaderboard': 'Papan Pendahulu',
    '/dashboard-murid': 'Dashboard Murid',
    '/dashboard-admin': 'Dashboard Admin',
    '/dashboard-awam': 'Dashboard Awam',
    '/profile': 'Profil',
    '/login': 'Log Masuk',
    '/daftar': 'Daftar',
    '/about': 'Tentang',
    '/challenges': 'Cabaran',
    '/lengkap-profil': 'Lengkap Profil'
  }

  // Special handling for dynamic routes
  const getDynamicLabel = (segment: string, fullPath: string): string => {
    if (fullPath.includes('/challenges/') && segment !== 'challenges') {
      return `Cabaran ${segment}`
    }
    if (fullPath.includes('/nota/') && segment !== 'nota') {
      if (segment.includes('tingkatan')) {
        return segment.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
      return `Nota ${segment}`
    }
    if (fullPath.includes('/dashboard-admin/')) {
      if (segment === 'cabaran') return 'Urus Cabaran'
      if (segment === 'nota') return 'Urus Nota'
    }
    return segment.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(segment => segment !== '')
    
    // Always start with home
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Laman Utama',
        href: '/',
        icon: <Home className="w-4 h-4" />
      }
    ]

    // Don't add breadcrumbs for home page
    if (pathname === '/') {
      return breadcrumbs
    }

    let currentPath = ''
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      const isLast = index === pathSegments.length - 1
      const label = routeMap[currentPath] || getDynamicLabel(segment, pathname)
      
      breadcrumbs.push({
        label,
        href: isLast ? '#' : currentPath, // Last item is not clickable
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Don't show breadcrumbs on home page
  if (pathname === '/') {
    return null
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6 px-4 py-2 bg-black/20 backdrop-blur-sm rounded-lg border border-gray-700/30">
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center space-x-2">
          {index === 0 && item.icon && (
            <span className="text-electric-blue">{item.icon}</span>
          )}
          
          {index === breadcrumbs.length - 1 ? (
            // Last item - not clickable, highlighted
            <span className="text-white font-medium">{item.label}</span>
          ) : (
            // Clickable items
            <Link
              href={item.href}
              className="hover:text-electric-blue transition-colors duration-200 font-medium"
            >
              {item.label}
            </Link>
          )}
          
          {index < breadcrumbs.length - 1 && (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </div>
      ))}
    </nav>
  )
}

// Simplified breadcrumbs for mobile
export function MobileBreadcrumbs() {
  const pathname = usePathname()
  
  const routeMap: Record<string, string> = {
    '/': 'Home',
    '/playground': 'Code',
    '/nota': 'Nota',
    '/leaderboard': 'Rank',
    '/dashboard-murid': 'Stats',
    '/dashboard-admin': 'Admin',
    '/dashboard-awam': 'Dashboard',
    '/profile': 'Profile'
  }

  const currentPage = routeMap[pathname] || pathname.split('/').pop()?.replace('-', ' ')

  if (pathname === '/') {
    return null
  }

  return (
    <div className="md:hidden flex items-center justify-between px-4 py-2 bg-black/30 backdrop-blur-sm border-b border-gray-700/30">
      <button
        onClick={() => window.history.back()}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Kembali</span>
      </button>
      
      <h1 className="text-white font-semibold capitalize">
        {currentPage}
      </h1>
      
      <div className="w-16"></div> {/* Spacer for centering */}
    </div>
  )
}
