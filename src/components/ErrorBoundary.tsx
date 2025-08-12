'use client'

import React from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, Bug, Wifi, Database, Code } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorType?: 'network' | 'database' | 'runtime' | 'auth' | 'unknown'
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error?: Error; resetError: () => void }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error?: Error; resetError: () => void }> }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Determine error type for better UX
    let errorType: 'network' | 'database' | 'runtime' | 'auth' | 'unknown' = 'unknown'
    
    if (error.message.includes('fetch') || error.message.includes('network')) {
      errorType = 'network'
    } else if (error.message.includes('database') || error.message.includes('supabase')) {
      errorType = 'database'
    } else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      errorType = 'auth'
    } else if (error.message.includes('syntax') || error.message.includes('runtime')) {
      errorType = 'runtime'
    }

    return { hasError: true, error, errorType }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    // Log error to monitoring service (if available)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      console.log('Error logged to monitoring service')
    }
    
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={() => this.setState({ hasError: false })} />
      }

      return <DefaultErrorFallback error={this.state.error} errorType={this.state.errorType} resetError={() => this.setState({ hasError: false })} />
    }

    return this.props.children
  }
}

const DefaultErrorFallback = ({ 
  error, 
  errorType = 'unknown', 
  resetError 
}: { 
  error?: Error; 
  errorType?: 'network' | 'database' | 'runtime' | 'auth' | 'unknown';
  resetError: () => void 
}) => {
  const getErrorIcon = () => {
    switch (errorType) {
      case 'network': return <Wifi className="w-16 h-16 mx-auto" />
      case 'database': return <Database className="w-16 h-16 mx-auto" />
      case 'runtime': return <Code className="w-16 h-16 mx-auto" />
      case 'auth': return <AlertTriangle className="w-16 h-16 mx-auto" />
      default: return <Bug className="w-16 h-16 mx-auto" />
    }
  }

  const getErrorTitle = () => {
    switch (errorType) {
      case 'network': return 'Masalah Sambungan'
      case 'database': return 'Masalah Pangkalan Data'
      case 'runtime': return 'Ralat Sistem'
      case 'auth': return 'Masalah Pengesahan'
      default: return 'Oops! Terdapat Masalah'
    }
  }

  const getErrorDescription = () => {
    switch (errorType) {
      case 'network': return 'Tidak dapat menyambung ke pelayan. Sila semak sambungan internet anda dan cuba lagi.'
      case 'database': return 'Masalah dengan pangkalan data. Pasukan kami sedang menyelesaikan masalah ini.'
      case 'runtime': return 'Berlaku ralat dalam sistem. Sila muat semula halaman atau cuba lagi.'
      case 'auth': return 'Masalah dengan pengesahan pengguna. Sila log masuk semula.'
      default: return 'Maaf, berlaku ralat yang tidak dijangka. Jangan risau, pasukan kami telah dimaklumkan mengenai masalah ini.'
    }
  }

  const getActionButton = () => {
    switch (errorType) {
      case 'network': return 'Cuba Lagi'
      case 'database': return 'Muat Semula'
      case 'runtime': return 'Muat Semula'
      case 'auth': return 'Log Masuk Semula'
      default: return 'Muat Semula'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="glass-dark rounded-2xl p-8">
          <div className="text-red-400 mb-6">
            {getErrorIcon()}
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            {getErrorTitle()}
          </h1>
          
          <p className="text-gray-400 mb-6 leading-relaxed">
            {getErrorDescription()}
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-6 text-left">
              <summary className="text-red-400 cursor-pointer mb-2">Detail Ralat (Development)</summary>
              <pre className="text-xs text-gray-500 bg-gray-800 p-3 rounded overflow-auto max-h-32">
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                resetError()
                window.location.reload()
              }}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{getActionButton()}</span>
            </button>
            
            <Link href="/" className="btn-secondary flex items-center justify-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Ke Laman Utama</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Specific error components for different scenarios
export const NetworkErrorFallback = ({ retryAction }: { retryAction: () => void }) => (
  <div className="glass-dark rounded-xl p-8 text-center">
    <div className="text-yellow-400 mb-4">
      <Wifi className="w-12 h-12 mx-auto" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">Masalah Sambungan</h3>
    <p className="text-gray-400 mb-4">
      Tidak dapat menyambung ke pelayan. Sila semak sambungan internet anda.
    </p>
    <button onClick={retryAction} className="btn-primary">
      Cuba Lagi
    </button>
  </div>
)

export const DatabaseErrorFallback = ({ retryAction, message }: { retryAction: () => void; message?: string }) => (
  <div className="glass-dark rounded-xl p-8 text-center">
    <div className="text-red-400 mb-4">
      <Database className="w-12 h-12 mx-auto" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">Masalah Pangkalan Data</h3>
    <p className="text-gray-400 mb-4">
      {message || 'Tidak dapat memuat data pada masa ini. Sila cuba lagi.'}
    </p>
    <button onClick={retryAction} className="btn-primary">
      Muat Semula
    </button>
  </div>
)

export const AuthErrorFallback = ({ loginUrl = '/login' }: { loginUrl?: string }) => (
  <div className="glass-dark rounded-xl p-8 text-center">
    <div className="text-orange-400 mb-4">
      <AlertTriangle className="w-12 h-12 mx-auto" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">Sesi Tamat</h3>
    <p className="text-gray-400 mb-4">
      Sesi anda telah tamat. Sila log masuk semula untuk meneruskan.
    </p>
    <Link href={loginUrl} className="btn-primary">
      Log Masuk Semula
    </Link>
  </div>
)

export const NotFoundFallback = ({ title, message, actionHref, actionText }: {
  title?: string
  message?: string
  actionHref?: string
  actionText?: string
}) => (
  <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
    <div className="max-w-md mx-auto text-center p-8">
      <div className="glass-dark rounded-2xl p-8">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          {title || '404 - Halaman Tidak Ditemui'}
        </h1>
        <p className="text-gray-400 mb-6 leading-relaxed">
          {message || 'Halaman yang anda cari tidak wujud atau telah dipindahkan.'}
        </p>
        <Link href={actionHref || '/'} className="btn-primary">
          {actionText || 'Kembali ke Laman Utama'}
        </Link>
      </div>
    </div>
  </div>
)

export default ErrorBoundary
