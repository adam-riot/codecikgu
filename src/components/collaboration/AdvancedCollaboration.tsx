// Advanced Real-Time Collaboration System
// src/components/collaboration/AdvancedCollaboration.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Users, 
  MessageCircle, 
  Share2, 
  Video, 
  Mic, 
  MicOff,
  VideoOff,
  Phone,
  PhoneOff,
  Screen,
  Mouse,
  Edit,
  Eye,
  Crown,
  UserPlus,
  Settings,
  Activity,
  Clock,
  Code,
  PlayCircle,
  StopCircle
} from 'lucide-react'

export interface CollaborationUser {
  id: string
  name: string
  avatar?: string
  role: 'teacher' | 'student' | 'moderator'
  isOnline: boolean
  cursor?: CursorPosition
  isTyping: boolean
  permissions: UserPermissions
  joinedAt: Date
}

export interface CursorPosition {
  x: number
  y: number
  elementId?: string
  line?: number
  column?: number
}

export interface UserPermissions {
  canEdit: boolean
  canExecute: boolean
  canShare: boolean
  canInvite: boolean
  canManageUsers: boolean
}

export interface ChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: Date
  type: 'text' | 'code' | 'file' | 'system'
  metadata?: any
}

export interface CodeChange {
  id: string
  userId: string
  type: 'insert' | 'delete' | 'replace'
  position: { line: number; column: number }
  content: string
  timestamp: Date
}

export interface SessionState {
  id: string
  title: string
  code: string
  language: string
  isRunning: boolean
  output: string
  activeUsers: CollaborationUser[]
  changes: CodeChange[]
  chat: ChatMessage[]
  voiceCall: {
    isActive: boolean
    participants: string[]
  }
  screenShare: {
    isActive: boolean
    sharedBy?: string
  }
}

export function AdvancedCollaboration() {
  const [session, setSession] = useState<SessionState>({
    id: 'session_123',
    title: 'Collaborative Coding Session',
    code: `# Collaborative Python Challenge
# Welcome to our coding session!

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Let's optimize this together!
print("Fibonacci sequence:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
    language: 'python',
    isRunning: false,
    output: '',
    activeUsers: [],
    changes: [],
    chat: [],
    voiceCall: { isActive: false, participants: [] },
    screenShare: { isActive: false }
  })

  const [currentUser] = useState<CollaborationUser>({
    id: 'user_1',
    name: 'Teacher Ahmad',
    role: 'teacher',
    isOnline: true,
    isTyping: false,
    permissions: {
      canEdit: true,
      canExecute: true,
      canShare: true,
      canInvite: true,
      canManageUsers: true
    },
    joinedAt: new Date()
  })

  const [chatInput, setChatInput] = useState('')
  const [showChat, setShowChat] = useState(true)
  const [showUsers, setShowUsers] = useState(true)
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const codeEditorRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Initialize sample data
  useEffect(() => {
    const sampleUsers: CollaborationUser[] = [
      {
        id: 'user_1',
        name: 'Teacher Ahmad',
        role: 'teacher',
        isOnline: true,
        isTyping: false,
        permissions: {
          canEdit: true,
          canExecute: true,
          canShare: true,
          canInvite: true,
          canManageUsers: true
        },
        joinedAt: new Date(Date.now() - 300000)
      },
      {
        id: 'user_2',
        name: 'Siti Aminah',
        role: 'student',
        isOnline: true,
        isTyping: false,
        cursor: { x: 200, y: 150, line: 5, column: 10 },
        permissions: {
          canEdit: true,
          canExecute: false,
          canShare: false,
          canInvite: false,
          canManageUsers: false
        },
        joinedAt: new Date(Date.now() - 180000)
      },
      {
        id: 'user_3',
        name: 'Muhammad Haris',
        role: 'student',
        isOnline: true,
        isTyping: true,
        cursor: { x: 150, y: 200, line: 8, column: 25 },
        permissions: {
          canEdit: true,
          canExecute: false,
          canShare: false,
          canInvite: false,
          canManageUsers: false
        },
        joinedAt: new Date(Date.now() - 120000)
      }
    ]

    const sampleChat: ChatMessage[] = [
      {
        id: 'msg_1',
        userId: 'user_1',
        userName: 'Teacher Ahmad',
        message: 'Welcome everyone! Today we\'ll optimize the fibonacci function together.',
        timestamp: new Date(Date.now() - 240000),
        type: 'text'
      },
      {
        id: 'msg_2',
        userId: 'user_2',
        userName: 'Siti Aminah',
        message: 'Teacher, can we use memoization to make it faster?',
        timestamp: new Date(Date.now() - 180000),
        type: 'text'
      },
      {
        id: 'msg_3',
        userId: 'user_3',
        userName: 'Muhammad Haris',
        message: 'I think we can use dynamic programming approach',
        timestamp: new Date(Date.now() - 120000),
        type: 'text'
      }
    ]

    setSession(prev => ({
      ...prev,
      activeUsers: sampleUsers,
      chat: sampleChat
    }))
  }, [])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [session.chat])

  const handleCodeChange = (newCode: string) => {
    const change: CodeChange = {
      id: `change_${Date.now()}`,
      userId: currentUser.id,
      type: 'replace',
      position: { line: 0, column: 0 },
      content: newCode,
      timestamp: new Date()
    }

    setSession(prev => ({
      ...prev,
      code: newCode,
      changes: [...prev.changes, change]
    }))
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      message: chatInput,
      timestamp: new Date(),
      type: 'text'
    }

    setSession(prev => ({
      ...prev,
      chat: [...prev.chat, newMessage]
    }))
    setChatInput('')
  }

  const handleRunCode = async () => {
    if (!currentUser.permissions.canExecute) return

    setSession(prev => ({ ...prev, isRunning: true }))
    
    // Simulate code execution
    setTimeout(() => {
      setSession(prev => ({
        ...prev,
        isRunning: false,
        output: `Fibonacci sequence:
F(0) = 0
F(1) = 1
F(2) = 1
F(3) = 2
F(4) = 3
F(5) = 5
F(6) = 8
F(7) = 13
F(8) = 21
F(9) = 34

Execution completed successfully in 0.12 seconds`
      }))
    }, 2000)
  }

  const toggleVoiceCall = () => {
    setIsVoiceCallActive(!isVoiceCallActive)
    setSession(prev => ({
      ...prev,
      voiceCall: {
        isActive: !isVoiceCallActive,
        participants: !isVoiceCallActive ? [currentUser.id] : []
      }
    }))
  }

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing)
    setSession(prev => ({
      ...prev,
      screenShare: {
        isActive: !isScreenSharing,
        sharedBy: !isScreenSharing ? currentUser.id : undefined
      }
    }))
  }

  const handleInviteUsers = () => {
    // Simulate invite functionality
    const inviteLink = `https://codecikgu.com/collab/${session.id}`
    navigator.clipboard.writeText(inviteLink)
    
    const systemMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: 'system',
      userName: 'System',
      message: `Invite link copied to clipboard: ${inviteLink}`,
      timestamp: new Date(),
      type: 'system'
    }

    setSession(prev => ({
      ...prev,
      chat: [...prev.chat, systemMessage]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="flex h-screen">
        {/* Main Code Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-black/30 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-purple-400" />
                <h1 className="text-xl font-bold">{session.title}</h1>
              </div>
              
              <div className="flex items-center space-x-1">
                {session.activeUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      user.role === 'teacher' ? 'bg-purple-600' :
                      user.role === 'moderator' ? 'bg-blue-600' : 'bg-green-600'
                    }`}
                    title={user.name}
                  >
                    {user.name[0]}
                    {user.role === 'teacher' && <Crown className="w-3 h-3 ml-1" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Voice Call Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={toggleVoiceCall}
                  className={`p-2 rounded-lg transition-colors ${
                    isVoiceCallActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {isVoiceCallActive ? <Phone className="w-4 h-4" /> : <PhoneOff className="w-4 h-4" />}
                </button>
                
                {isVoiceCallActive && (
                  <>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-2 rounded-lg transition-colors ${
                        isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => setIsVideoOn(!isVideoOn)}
                      className={`p-2 rounded-lg transition-colors ${
                        isVideoOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </button>
                  </>
                )}
              </div>

              {/* Screen Share */}
              <button
                onClick={toggleScreenShare}
                className={`p-2 rounded-lg transition-colors ${
                  isScreenSharing ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <Screen className="w-4 h-4" />
              </button>

              {/* Invite Users */}
              <button
                onClick={handleInviteUsers}
                className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 flex">
            <div className="flex-1 p-4">
              <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Code className="w-5 h-5 text-purple-400" />
                    <span className="font-medium">main.py</span>
                    <span className="text-xs bg-purple-600/30 px-2 py-1 rounded">
                      {session.language}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleRunCode}
                      disabled={session.isRunning || !currentUser.permissions.canExecute}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      {session.isRunning ? (
                        <>
                          <StopCircle className="w-4 h-4" />
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4" />
                          <span>Run Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Code Editor with Cursors */}
                <div className="flex-1 relative">
                  <textarea
                    ref={codeEditorRef}
                    value={session.code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="w-full h-full bg-gray-900/50 text-white p-4 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    spellCheck={false}
                    disabled={!currentUser.permissions.canEdit}
                  />
                  
                  {/* Live Cursors */}
                  {session.activeUsers
                    .filter(user => user.cursor && user.id !== currentUser.id)
                    .map((user) => (
                      <div
                        key={user.id}
                        className="absolute pointer-events-none"
                        style={{
                          left: user.cursor!.x,
                          top: user.cursor!.y,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className={`w-2 h-6 ${
                          user.role === 'teacher' ? 'bg-purple-500' :
                          user.role === 'moderator' ? 'bg-blue-500' : 'bg-green-500'
                        } rounded-sm`}>
                          <div className={`absolute -top-6 left-0 text-xs whitespace-nowrap px-2 py-1 rounded ${
                            user.role === 'teacher' ? 'bg-purple-500' :
                            user.role === 'moderator' ? 'bg-blue-500' : 'bg-green-500'
                          } text-white`}>
                            {user.name}
                            {user.isTyping && <span className="ml-1 animate-pulse">typing...</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Output Panel */}
                {session.output && (
                  <div className="mt-4 bg-gray-900/70 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium">Output</span>
                    </div>
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                      {session.output}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-black/30 backdrop-blur-md border-l border-white/10 flex flex-col">
          {/* Users Panel */}
          {showUsers && (
            <div className="p-4 border-b border-white/10">
              <h3 className="font-bold mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Active Users ({session.activeUsers.length})
              </h3>
              
              <div className="space-y-2">
                {session.activeUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg bg-white/5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      user.role === 'teacher' ? 'bg-purple-600' :
                      user.role === 'moderator' ? 'bg-blue-600' : 'bg-green-600'
                    }`}>
                      {user.name[0]}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium">{user.name}</span>
                        {user.role === 'teacher' && <Crown className="w-3 h-3 text-yellow-400" />}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center space-x-2">
                        <span>{user.role}</span>
                        {user.isOnline && (
                          <span className="flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                            online
                          </span>
                        )}
                        {user.isTyping && (
                          <span className="text-yellow-400 animate-pulse">typing...</span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      {user.permissions.canEdit && <Edit className="w-3 h-3 text-blue-400" />}
                      {!user.permissions.canEdit && <Eye className="w-3 h-3 text-gray-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Panel */}
          {showChat && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-bold flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </h3>
              </div>
              
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {session.chat.map((message) => (
                  <div key={message.id} className={`${
                    message.type === 'system' ? 'text-center' : ''
                  }`}>
                    {message.type === 'system' ? (
                      <div className="text-xs text-gray-400 bg-gray-800/30 rounded-lg p-2">
                        {message.message}
                      </div>
                    ) : (
                      <div className={`${
                        message.userId === currentUser.id ? 'ml-4' : 'mr-4'
                      }`}>
                        <div className="text-xs text-gray-400 mb-1 flex items-center space-x-2">
                          <span>{message.userName}</span>
                          <Clock className="w-3 h-3" />
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <div className={`p-3 rounded-lg ${
                          message.userId === currentUser.id 
                            ? 'bg-purple-600/30 ml-auto' 
                            : 'bg-white/10'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-white/10">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
