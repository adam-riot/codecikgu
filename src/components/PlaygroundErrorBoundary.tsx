// Debug Error Boundary for Playground
// src/components/PlaygroundErrorBoundary.tsx

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class PlaygroundErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Playground Error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-8 max-w-md w-full text-center border border-red-500/30">
            <div className="mb-6">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Oops! Terdapat Masalah
              </h1>
              <p className="text-gray-300 mb-4">
                Maaf, berlaku ralat yang tidak dijangka. Jangan risau, pasukan kami telah dimaklumkan mengenai masalah ini.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-900/30 rounded-lg border border-red-500/30 text-left">
                <h3 className="text-red-400 font-bold mb-2">Debug Info:</h3>
                <pre className="text-xs text-red-300 overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-xs text-red-300 overflow-auto max-h-32 mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Muat Semula</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Ke Laman Utama</span>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                Jika masalah berterusan, sila hubungi support kami di{' '}
                <a href="mailto:support@codecikgu.com" className="text-blue-400 hover:text-blue-300">
                  support@codecikgu.com
                </a>
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default PlaygroundErrorBoundary
