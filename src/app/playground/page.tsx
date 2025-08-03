'use client'

import React, { useState, useEffect } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Code, Play, Download, Plus, X, File, Terminal, CheckCircle, XCircle, Info, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'

interface User {
  id: string
  email: string
  role: string
}

interface Tab {
  id: string
  name: string
  content: string
  language: string
  saved: boolean
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

export default function PlaygroundPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      name: 'main',
      content: `// Welcome to CodeCikgu Playground!
// You can write and execute JavaScript code here

function greet(name) {
  if (name) {
    return 'Hello, ' + name + '!';
  } else {
    return 'Hello, World!';
  }
}

console.log(greet('CodeCikgu'));
console.log('Start coding and click Run to execute!');`,
      language: 'javascript',
      saved: false
    }
  ])
  const [activeTabId, setActiveTabId] = useState('1')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [executionOutput, setExecutionOutput] = useState('')
  const [showOutput, setShowOutput] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0]

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    checkUser()
  }, [])

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, ...updates, saved: updates.saved !== undefined ? updates.saved : false }
        : tab
    ))
  }

  const handleContentChange = (content: string) => {
    updateTab(activeTabId, { content, saved: false })
  }

  const executeCode = async () => {
    setIsExecuting(true)
    setShowOutput(true)
    try {
      const output: string[] = []
      const safeConsole = {
        log: (...args: unknown[]) => {
          output.push(args.map(arg => {
            if (typeof arg === 'object') return JSON.stringify(arg, null, 2)
            return String(arg)
          }).join(' '))
        },
        error: (...args: unknown[]) => {
          output.push('ERROR: ' + args.map(arg => String(arg)).join(' '))
        }
      }
      const func = new Function('console', activeTab.content)
      func(safeConsole)
      setExecutionOutput(output.length > 0 ? output.join('\n') : 'Code executed successfully (no output)')
      addNotification('success', 'Code executed successfully')
    } catch (error) {
      setExecutionOutput(`Error: ${(error as Error).message}`)
      addNotification('error', 'Execution failed')
    } finally {
      setIsExecuting(false)
    }
  }

  const downloadFile = async () => {
    const fileContent = activeTab.content
    const blob = new Blob([fileContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab.name}.js`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    addNotification('success', `File downloaded as ${activeTab.name}.js`)
  }

  const createNewTab = () => {
    const newId = (tabs.length + 1).toString()
    const newTab: Tab = {
      id: newId,
      name: `untitled-${newId}`,
      content: '// New file\nconsole.log("Hello from new file!");',
      language: 'javascript',
      saved: false
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newId)
    addNotification('info', 'New tab created')
  }

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) {
      addNotification('error', 'Cannot close the last tab')
      return
    }
    setTabs(prev => prev.filter(tab => tab.id !== tabId))
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId)
      setActiveTabId(remainingTabs[0].id)
    }
    addNotification('info', 'Tab closed')
  }

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session && session.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        const userRole = profile?.role || 'awam'
        setUser({ id: session.user.id, email: session.user.email || '', role: userRole })
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isClient) {
    return <LoadingSpinner size="xl" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="text-gray-400">Loading playground...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-electric-blue to-neon-green rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">CodeCikgu Playground</span>
            </Link>

            <div className="flex items-center space-x-4">
              {user && (
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === 'murid' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                  <span>Secure session untuk {user.role}: {user.email}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  onClick={executeCode}
                  disabled={isExecuting}
                  className="flex items-center space-x-2 px-4 py-2 bg-neon-green hover:bg-neon-green/90 text-dark-black font-medium rounded-lg transition-colors duration-300 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  <span>{isExecuting ? 'Running...' : 'Run'}</span>
                </button>
                
                <button
                  onClick={downloadFile}
                  className="flex items-center space-x-2 px-4 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white font-medium rounded-lg transition-colors duration-300"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 backdrop-blur-sm ${
              notification.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : notification.type === 'error'
                ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                : 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5" />}
            {notification.type === 'info' && <Info className="w-5 h-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">File Explorer</h3>
              
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors duration-300 ${
                      tab.id === activeTabId 
                        ? 'bg-electric-blue/20 text-electric-blue' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                    onClick={() => setActiveTabId(tab.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <File className="w-4 h-4" />
                      <span className="text-sm">{tab.name}.js</span>
                      {!tab.saved && <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Unsaved changes"></div>}
                      {tab.saved && <div className="w-2 h-2 bg-green-400 rounded-full" title="Saved"></div>}
                      <PlayCircle className="w-3 h-3 text-green-400" />
                    </div>
                    
                    {tabs.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          closeTab(tab.id)
                        }}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={createNewTab}
                  className="flex items-center space-x-2 w-full p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded transition-colors duration-300"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">New File</span>
                </button>
              </div>
            </div>

            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">File Info</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">File Name</label>
                  <input
                    type="text"
                    value={activeTab.name}
                    onChange={(e) => updateTab(activeTabId, { name: e.target.value, saved: false })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-electric-blue"
                  />
                </div>
                
                <div className="text-sm text-gray-400 space-y-1">
                  <div>Lines: {activeTab.content.split('\n').length}</div>
                  <div>Characters: {activeTab.content.length}</div>
                  <div>Download as: <span className="text-electric-blue">{activeTab.name}.js</span></div>
                  <div>Status: <span className={activeTab.saved ? 'text-green-400' : 'text-yellow-400'}>
                    {activeTab.saved ? 'Saved' : 'Unsaved'}
                  </span></div>
                  <div>Execution: <span className="text-green-400">Supported</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Editor */}
              <div className="glass-dark rounded-xl overflow-hidden">
                {/* Tab Bar */}
                <div className="flex items-center bg-gray-800/50 border-b border-gray-700">
                  <div className="flex items-center space-x-2 px-4 py-3 bg-gray-700/50 text-white">
                    <span className="text-sm font-medium">{activeTab.name}.js</span>
                    {!activeTab.saved && <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Unsaved changes"></div>}
                    {activeTab.saved && <div className="w-2 h-2 bg-green-400 rounded-full" title="Saved"></div>}
                    <PlayCircle className="w-4 h-4 text-green-400" />
                  </div>
                </div>

                {/* Simple Text Editor */}
                <div className="bg-gray-900 p-4">
                  <textarea
                    value={activeTab.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-96 bg-gray-800 text-white font-mono text-sm p-4 rounded border border-gray-600 focus:border-electric-blue focus:outline-none resize-none"
                    placeholder="// Start coding here..."
                    spellCheck={false}
                  />
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800/30 border-t border-gray-700 text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>Language: JavaScript</span>
                    <span>Lines: {activeTab.content.split('\n').length}</span>
                    <span>Characters: {activeTab.content.length}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓ Simple Editor</span>
                    <span className="text-blue-400">💾 Auto-Save</span>
                    <span className="text-purple-400">📁 File Upload</span>
                    <span className="text-orange-400">⚡ Auto Indent</span>
                    <span className="text-green-400">▶️ Executable</span>
                    {user && <span className="text-yellow-400">🔒 User: {user.role}</span>}
                  </div>
                </div>
              </div>

              {/* Output Panel */}
              {showOutput && (
                <div className="glass-dark rounded-xl overflow-hidden">
                  <div className="flex items-center bg-gray-800/50 border-b border-gray-700">
                    <div className="flex items-center space-x-2 px-4 py-3 bg-gray-700/50 text-white">
                      <Terminal className="w-4 h-4" />
                      <span className="text-sm">Console Output</span>
                    </div>
                    <div className="flex-1"></div>
                    <button
                      onClick={() => setShowOutput(false)}
                      className="p-3 text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 h-64 overflow-y-auto bg-gray-900/50">
                    <div className="font-mono text-sm">
                      {executionOutput ? (
                        <pre className="text-gray-300 whitespace-pre-wrap">{executionOutput}</pre>
                      ) : (
                        <div className="text-gray-500">
                          Click "Run" to execute your code and see the output here...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}