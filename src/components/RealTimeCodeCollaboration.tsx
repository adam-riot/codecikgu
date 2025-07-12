'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Users, 
  Share2, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff,
  MessageCircle,
  Send,
  Settings,
  UserPlus,
  Crown,
  Eye,
  Edit,
  Copy,
  Download,
  Upload,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  AlertCircle,
  MousePointer,
  Zap,
  Lock,
  Unlock,
  GitBranch,
  Save,
  Undo,
  Redo,
  Play,
  Pause
} from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface User {
  id: string
  name: string
  avatar: string
  color: string
  role: 'owner' | 'editor' | 'viewer'
  isOnline: boolean
  cursor?: { line: number; column: number }
  selection?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

interface ChatMessage {
  id: string
  userId: string
  content: string
  timestamp: Date
  type: 'text' | 'code' | 'system'
  codeSnippet?: string
  language?: string
}

interface CodeChange {
  id: string
  userId: string
  timestamp: Date
  type: 'insert' | 'delete' | 'replace'
  position: { line: number; column: number }
  content: string
  oldContent?: string
}

interface CollaborationSession {
  id: string
  name: string
  description: string
  owner: string
  participants: User[]
  isPrivate: boolean
  maxParticipants: number
  createdAt: Date
  lastActivity: Date
  code: string
  language: string
  version: number
}

export function RealTimeCodeCollaboration() {
  const [isConnected, setIsConnected] = useState(false)
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user-1',
    name: 'Ahmad Coding',
    avatar: '👨‍💻',
    color: '#3B82F6',
    role: 'owner',
    isOnline: true
  })
  const [code, setCode] = useState(`// Real-time Collaboration Demo
function calculateTotal(items) {
    let total = 0;
    
    for (let item of items) {
        total += item.price * item.quantity;
    }
    
    return total;
}

// Usage example
const cart = [
    { name: "Laptop", price: 2500, quantity: 1 },
    { name: "Mouse", price: 50, quantity: 2 },
    { name: "Keyboard", price: 150, quantity: 1 }
];

console.log("Total: RM" + calculateTotal(cart));`)
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'system',
      content: 'Session started. Welcome to collaborative coding!',
      timestamp: new Date(),
      type: 'system'
    }
  ])
  
  const [newMessage, setNewMessage] = useState('')
  const [showChat, setShowChat] = useState(true)
  const [showParticipants, setShowParticipants] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [codeHistory, setCodeHistory] = useState<CodeChange[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [sessionSettings, setSessionSettings] = useState({
    autoSave: true,
    showCursors: true,
    allowVoice: true,
    allowVideo: true,
    maxParticipants: 10,
    requireApproval: false
  })
  
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const codeEditorRef = useRef<HTMLTextAreaElement>(null)
  const { addNotification } = useNotifications()

  // Mock participants
  const mockParticipants: User[] = [
    {
      id: 'user-2',
      name: 'Siti Web Dev',
      avatar: '👩‍💻',
      color: '#EF4444',
      role: 'editor',
      isOnline: true,
      cursor: { line: 5, column: 12 }
    },
    {
      id: 'user-3',
      name: 'Rahman Coder',
      avatar: '🧑‍💻',
      color: '#10B981',
      role: 'editor',
      isOnline: true,
      cursor: { line: 12, column: 8 }
    },
    {
      id: 'user-4',
      name: 'Farah Learn',
      avatar: '👩‍🎓',
      color: '#F59E0B',
      role: 'viewer',
      isOnline: false
    }
  ]

  useEffect(() => {
    setUsers([currentUser, ...mockParticipants])
  }, [currentUser])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  const startSession = () => {
    setIsConnected(true)
    const session: CollaborationSession = {
      id: 'session-' + Date.now(),
      name: 'JavaScript Fundamentals',
      description: 'Learning basic JavaScript concepts together',
      owner: currentUser.id,
      participants: users,
      isPrivate: false,
      maxParticipants: 10,
      createdAt: new Date(),
      lastActivity: new Date(),
      code: code,
      language: 'javascript',
      version: 1
    }
    
    setCurrentSession(session)
    
    addNotification({
      type: 'success',
      title: '🎉 Session Started',
      message: 'Collaboration session is now live!'
    })
  }

  const endSession = () => {
    setIsConnected(false)
    setCurrentSession(null)
    
    addNotification({
      type: 'info',
      title: '👋 Session Ended',
      message: 'Collaboration session has ended'
    })
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: 'msg-' + Date.now(),
      userId: currentUser.id,
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    }

    setChatMessages(prev => [...prev, message])
    setNewMessage('')

    // Simulate responses from other users
    setTimeout(() => {
      const responses = [
        "Great point! Let me try that approach",
        "I see what you mean. How about we refactor this part?",
        "That's a clever solution!",
        "Can you explain that logic a bit more?",
        "Perfect! That fixes the bug I was seeing"
      ]
      
      const randomUser = mockParticipants[Math.floor(Math.random() * mockParticipants.length)]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      const response: ChatMessage = {
        id: 'msg-' + Date.now() + '-response',
        userId: randomUser.id,
        content: randomResponse,
        timestamp: new Date(),
        type: 'text'
      }
      
      setChatMessages(prev => [...prev, response])
    }, 1000 + Math.random() * 2000)
  }

  const shareCodeSnippet = () => {
    const selectedText = codeEditorRef.current?.value.substring(
      codeEditorRef.current?.selectionStart || 0,
      codeEditorRef.current?.selectionEnd || 0
    )

    if (selectedText && selectedText.trim()) {
      const message: ChatMessage = {
        id: 'msg-' + Date.now(),
        userId: currentUser.id,
        content: 'Check out this code snippet:',
        timestamp: new Date(),
        type: 'code',
        codeSnippet: selectedText,
        language: 'javascript'
      }

      setChatMessages(prev => [...prev, message])
    }
  }

  const inviteUser = () => {
    const inviteLink = `https://codecikgu.com/collaborate/${currentSession?.id}`
    navigator.clipboard.writeText(inviteLink)
    
    addNotification({
      type: 'success',
      title: '📋 Link Copied',
      message: 'Invitation link copied to clipboard'
    })
  }

  const exportSession = () => {
    if (!currentSession) return

    const sessionData = {
      ...currentSession,
      finalCode: code,
      chatHistory: chatMessages,
      participants: users,
      exportedAt: new Date()
    }

    const dataStr = JSON.stringify(sessionData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `collaboration-session-${currentSession.id}.json`
    link.click()

    addNotification({
      type: 'success',
      title: '💾 Session Exported',
      message: 'Session data downloaded successfully'
    })
  }

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled)
    addNotification({
      type: 'info',
      title: isVoiceEnabled ? '🔇 Voice Disabled' : '🎤 Voice Enabled',
      message: isVoiceEnabled ? 'Microphone turned off' : 'Microphone turned on'
    })
  }

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled)
    addNotification({
      type: 'info',
      title: isVideoEnabled ? '📹 Video Disabled' : '🎥 Video Enabled',
      message: isVideoEnabled ? 'Camera turned off' : 'Camera turned on'
    })
  }

  const startRecording = () => {
    setIsRecording(true)
    addNotification({
      type: 'success',
      title: '🎬 Recording Started',
      message: 'Session recording has begun'
    })
  }

  const stopRecording = () => {
    setIsRecording(false)
    addNotification({
      type: 'info',
      title: '⏹️ Recording Stopped',
      message: 'Session recording saved'
    })
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gradient mb-2">Real-time Code Collaboration</h2>
        <p className="text-gray-400">Collaborate on code in real-time with your team</p>
      </div>

      {/* Connection Status */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-400' : 'text-gray-400'}`}>
              {isConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              <span className="font-medium">
                {isConnected ? 'Connected to Session' : 'Not Connected'}
              </span>
            </div>
            
            {currentSession && (
              <div className="flex items-center space-x-4 text-gray-400 text-sm">
                <span>Session: {currentSession.name}</span>
                <span>•</span>
                <span>{users.filter(u => u.isOnline).length} online</span>
                <span>•</span>
                <span>Version {currentSession.version}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {!isConnected ? (
              <button
                onClick={startSession}
                className="px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Start Session</span>
              </button>
            ) : (
              <>
                <button
                  onClick={inviteUser}
                  className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
                  title="Invite User"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
                
                <button
                  onClick={shareCodeSnippet}
                  className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
                  title="Share Code Snippet"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={exportSession}
                  className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
                  title="Export Session"
                >
                  <Download className="w-4 h-4" />
                </button>
                
                <button
                  onClick={endSession}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  End Session
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6" style={{ 
        gridTemplateColumns: showParticipants && showChat ? '1fr 300px' : showParticipants || showChat ? '1fr 250px' : '1fr' 
      }}>
        {/* Main Collaboration Area */}
        <div className="space-y-6">
          {/* Video/Voice Controls */}
          {isConnected && (
            <div className="glass-dark rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleVoice}
                    className={`p-3 rounded-lg transition-colors ${
                      isVoiceEnabled 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                    title={isVoiceEnabled ? 'Disable Voice' : 'Enable Voice'}
                  >
                    {isVoiceEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-lg transition-colors ${
                      isVideoEnabled 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                    title={isVideoEnabled ? 'Disable Video' : 'Enable Video'}
                  >
                    {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>

                  <div className="h-6 w-px bg-gray-600"></div>

                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-3 rounded-lg transition-colors flex items-center space-x-2 ${
                      isRecording 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {isRecording ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span className="text-sm">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Recording Indicator */}
              {isRecording && (
                <div className="mt-3 flex items-center space-x-2 text-red-400 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Recording session...</span>
                </div>
              )}
            </div>
          )}

          {/* Code Editor */}
          <div className="glass-dark rounded-xl overflow-hidden">
            {/* Editor Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-400 text-sm">
                  collaborative-code.js {isConnected && <span className="text-green-400">• Live</span>}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
                  title="Undo"
                  disabled={!canUndo}
                >
                  <Undo className="w-4 h-4" />
                </button>
                
                <button
                  className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
                  title="Redo"
                  disabled={!canRedo}
                >
                  <Redo className="w-4 h-4" />
                </button>
                
                <button
                  className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
                  title="Save"
                >
                  <Save className="w-4 h-4" />
                </button>
                
                <div className="h-4 w-px bg-gray-600"></div>
                
                <span className="text-gray-400 text-sm">
                  {code.split('\n').length} lines
                </span>
              </div>
            </div>

            {/* Collaborative Editor */}
            <div className="relative">
              <textarea
                ref={codeEditorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 p-4 bg-transparent text-gray-300 font-mono text-sm resize-none outline-none"
                style={{ fontFamily: 'Fira Code, Monaco, Consolas, monospace' }}
                placeholder="Start typing your code here..."
              />

              {/* User Cursors */}
              {isConnected && sessionSettings.showCursors && (
                <div className="absolute inset-0 pointer-events-none">
                  {users.filter(u => u.id !== currentUser.id && u.cursor && u.isOnline).map(user => (
                    <div
                      key={user.id}
                      className="absolute w-0.5 h-5 animate-pulse"
                      style={{
                        backgroundColor: user.color,
                        left: `${user.cursor!.column * 8.5}px`,
                        top: `${16 + user.cursor!.line * 20}px`
                      }}
                    >
                      <div
                        className="absolute -top-6 -left-1 px-2 py-1 text-xs text-white rounded whitespace-nowrap"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Typing Indicators */}
            {isConnected && (
              <div className="px-4 py-2 border-t border-gray-700 text-xs text-gray-500">
                {users.filter(u => u.id !== currentUser.id && u.isOnline).length > 0 && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-electric-blue rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-electric-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-electric-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span>Siti is typing...</span>
                    </div>
                    <span>Last saved: {new Date().toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Session Settings</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-gray-400 font-medium">Collaboration</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-gray-300 text-sm">
                      <input
                        type="checkbox"
                        checked={sessionSettings.autoSave}
                        onChange={(e) => setSessionSettings({
                          ...sessionSettings,
                          autoSave: e.target.checked
                        })}
                        className="rounded"
                      />
                      <span>Auto-save changes</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 text-gray-300 text-sm">
                      <input
                        type="checkbox"
                        checked={sessionSettings.showCursors}
                        onChange={(e) => setSessionSettings({
                          ...sessionSettings,
                          showCursors: e.target.checked
                        })}
                        className="rounded"
                      />
                      <span>Show user cursors</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 text-gray-300 text-sm">
                      <input
                        type="checkbox"
                        checked={sessionSettings.requireApproval}
                        onChange={(e) => setSessionSettings({
                          ...sessionSettings,
                          requireApproval: e.target.checked
                        })}
                        className="rounded"
                      />
                      <span>Require approval to join</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-gray-400 font-medium">Media</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-gray-300 text-sm">
                      <input
                        type="checkbox"
                        checked={sessionSettings.allowVoice}
                        onChange={(e) => setSessionSettings({
                          ...sessionSettings,
                          allowVoice: e.target.checked
                        })}
                        className="rounded"
                      />
                      <span>Allow voice chat</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 text-gray-300 text-sm">
                      <input
                        type="checkbox"
                        checked={sessionSettings.allowVideo}
                        onChange={(e) => setSessionSettings({
                          ...sessionSettings,
                          allowVideo: e.target.checked
                        })}
                        className="rounded"
                      />
                      <span>Allow video chat</span>
                    </label>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300 text-sm">Max participants:</span>
                      <input
                        type="number"
                        value={sessionSettings.maxParticipants}
                        onChange={(e) => setSessionSettings({
                          ...sessionSettings,
                          maxParticipants: Number(e.target.value)
                        })}
                        className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                        min="2"
                        max="50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {(showParticipants || showChat) && (
          <div className="space-y-6">
            {/* Participants Panel */}
            {showParticipants && (
              <div className="glass-dark rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold flex items-center">
                    <Users className="w-5 h-5 mr-2 text-electric-blue" />
                    Participants ({users.length})
                  </h3>
                  <button
                    onClick={() => setShowParticipants(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-3">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg">
                          {user.avatar}
                        </div>
                        <div 
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
                            user.isOnline ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-white text-sm font-medium truncate">
                            {user.name}
                          </span>
                          {user.role === 'owner' && <Crown className="w-3 h-3 text-yellow-500" />}
                          {user.role === 'editor' && <Edit className="w-3 h-3 text-green-500" />}
                          {user.role === 'viewer' && <Eye className="w-3 h-3 text-gray-500" />}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">{user.role}</div>
                      </div>
                      
                      {user.cursor && user.isOnline && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <MousePointer className="w-3 h-3" />
                          <span>{user.cursor.line}:{user.cursor.column}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {isConnected && (
                  <button
                    onClick={inviteUser}
                    className="w-full mt-4 px-3 py-2 bg-electric-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Invite Participants</span>
                  </button>
                )}
              </div>
            )}

            {/* Chat Panel */}
            {showChat && (
              <div className="glass-dark rounded-xl flex flex-col h-96">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <h3 className="text-white font-semibold flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-electric-blue" />
                    Chat
                  </h3>
                  <button
                    onClick={() => setShowChat(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Chat Messages */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map(message => {
                    const sender = users.find(u => u.id === message.userId)
                    const isSystem = message.type === 'system'
                    const isOwn = message.userId === currentUser.id

                    return (
                      <div
                        key={message.id}
                        className={`${isSystem ? 'text-center' : isOwn ? 'ml-4' : 'mr-4'}`}
                      >
                        {isSystem ? (
                          <div className="text-gray-500 text-xs italic">{message.content}</div>
                        ) : (
                          <div className={`${isOwn ? 'text-right' : 'text-left'}`}>
                            <div className="text-xs text-gray-400 mb-1">
                              {sender?.name} • {message.timestamp.toLocaleTimeString()}
                            </div>
                            
                            {message.type === 'code' ? (
                              <div className="space-y-2">
                                <div className="text-sm text-gray-300">{message.content}</div>
                                <div className="bg-gray-800 rounded p-2 text-xs font-mono">
                                  <pre className="text-green-400">{message.codeSnippet}</pre>
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`inline-block px-3 py-2 rounded-lg text-sm max-w-xs ${
                                  isOwn
                                    ? 'bg-electric-blue text-white'
                                    : 'bg-gray-700 text-gray-300'
                                }`}
                              >
                                {message.content}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm outline-none focus:border-electric-blue"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-3 py-2 bg-electric-blue text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toggle Sidebar Buttons */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 space-y-2">
        {!showParticipants && (
          <button
            onClick={() => setShowParticipants(true)}
            className="p-3 bg-electric-blue text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            title="Show Participants"
          >
            <Users className="w-5 h-5" />
          </button>
        )}
        
        {!showChat && (
          <button
            onClick={() => setShowChat(true)}
            className="p-3 bg-electric-blue text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            title="Show Chat"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
