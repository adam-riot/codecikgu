import React, { useState, useEffect, useRef } from 'react'
import { 
  Users, 
  MessageCircle, 
  Video, 
  Share2, 
  Eye, 
  Edit3, 
  Save,
  UserCheck,
  Wifi,
  WifiOff,
  Mouse
} from 'lucide-react'
import { io, Socket } from 'socket.io-client'

export interface CollaborationUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'student' | 'teacher' | 'admin'
  isOnline: boolean
  lastSeen: Date
  cursor?: CursorPosition
  currentFile?: string
  permissions: CollaborationPermission[]
}

export interface CursorPosition {
  line: number
  column: number
  selection?: {
    start: { line: number; column: number }
    end: { line: number; column: number }
  }
}

export interface CollaborationPermission {
  action: 'read' | 'write' | 'execute' | 'admin'
  granted: boolean
}

export interface CodeChange {
  id: string
  userId: string
  timestamp: Date
  type: 'insert' | 'delete' | 'replace'
  position: { line: number; column: number }
  content: string
  oldContent?: string
}

export interface ChatMessage {
  id: string
  userId: string
  content: string
  timestamp: Date
  type: 'text' | 'code' | 'file' | 'system'
  replyTo?: string
  reactions?: MessageReaction[]
}

export interface MessageReaction {
  emoji: string
  users: string[]
}

export interface SessionInfo {
  id: string
  name: string
  description: string
  owner: string
  participants: CollaborationUser[]
  createdAt: Date
  isActive: boolean
  files: SessionFile[]
  settings: SessionSettings
}

export interface SessionFile {
  id: string
  name: string
  path: string
  content: string
  language: string
  isLocked: boolean
  lockedBy?: string
}

export interface SessionSettings {
  maxParticipants: number
  allowGuests: boolean
  enableVoiceChat: boolean
  enableVideoChat: boolean
  autoSave: boolean
  moderationEnabled: boolean
}

interface RealTimeCollaborationProps {
  sessionId?: string
  currentUser: CollaborationUser
  onCodeChange: (code: string) => void
  onUserJoin?: (user: CollaborationUser) => void
  onUserLeave?: (userId: string) => void
}

export function RealTimeCollaboration({ 
  sessionId, 
  currentUser, 
  onCodeChange,
  onUserJoin,
  onUserLeave 
}: RealTimeCollaborationProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [participants, setParticipants] = useState<CollaborationUser[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [currentFile, setCurrentFile] = useState<SessionFile | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(true)
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState<string[]>([])
  
  const codeEditorRef = useRef<HTMLTextAreaElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (sessionId) {
      initializeSocket()
    }
    
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [sessionId])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [chatMessages])

  const initializeSocket = () => {
    const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001', {
      query: {
        sessionId,
        userId: currentUser.id,
        userName: currentUser.name
      }
    })

    // Connection events
    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to collaboration server')
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from collaboration server')
    })

    // Session events
    newSocket.on('session:joined', (data: { session: SessionInfo; participants: CollaborationUser[] }) => {
      setSession(data.session)
      setParticipants(data.participants)
      if (data.session.files.length > 0) {
        setCurrentFile(data.session.files[0])
      }
    })

    newSocket.on('session:user-joined', (user: CollaborationUser) => {
      setParticipants(prev => [...prev, user])
      addSystemMessage(`${user.name} telah menyertai sesi`)
      onUserJoin?.(user)
    })

    newSocket.on('session:user-left', (userId: string) => {
      const user = participants.find(p => p.id === userId)
      setParticipants(prev => prev.filter(p => p.id !== userId))
      if (user) {
        addSystemMessage(`${user.name} telah meninggalkan sesi`)
      }
      onUserLeave?.(userId)
    })

    // Code collaboration events
    newSocket.on('code:change', (change: CodeChange) => {
      applyCodeChange(change)
    })

    newSocket.on('code:cursor-move', (data: { userId: string; position: CursorPosition }) => {
      updateUserCursor(data.userId, data.position)
    })

    newSocket.on('code:selection', (data: { userId: string; selection: any }) => {
      updateUserSelection(data.userId, data.selection)
    })

    // Chat events
    newSocket.on('chat:message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message])
    })

    newSocket.on('chat:typing', (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== currentUser.id) {
        setIsTyping(prev => {
          if (data.isTyping) {
            return prev.includes(data.userId) ? prev : [...prev, data.userId]
          } else {
            return prev.filter(id => id !== data.userId)
          }
        })
      }
    })

    // File events
    newSocket.on('file:lock', (data: { fileId: string; userId: string }) => {
      updateFileLock(data.fileId, data.userId)
    })

    newSocket.on('file:unlock', (data: { fileId: string }) => {
      updateFileLock(data.fileId, null)
    })

    setSocket(newSocket)
  }

  const applyCodeChange = (change: CodeChange) => {
    if (currentFile && codeEditorRef.current) {
      const textarea = codeEditorRef.current
      const content = textarea.value
      
      // Calculate actual position
      const lines = content.split('\n')
      let position = 0
      for (let i = 0; i < change.position.line; i++) {
        position += lines[i].length + 1 // +1 for newline
      }
      position += change.position.column

      let newContent = ''
      
      switch (change.type) {
        case 'insert':
          newContent = content.slice(0, position) + change.content + content.slice(position)
          break
        case 'delete':
          newContent = content.slice(0, position) + content.slice(position + change.content.length)
          break
        case 'replace':
          const endPos = position + (change.oldContent?.length || 0)
          newContent = content.slice(0, position) + change.content + content.slice(endPos)
          break
      }

      textarea.value = newContent
      setCurrentFile(prev => prev ? { ...prev, content: newContent } : null)
      onCodeChange(newContent)
    }
  }

  const updateUserCursor = (userId: string, position: CursorPosition) => {
    setParticipants(prev => 
      prev.map(p => p.id === userId ? { ...p, cursor: position } : p)
    )
  }

  const updateUserSelection = (userId: string, selection: any) => {
    // Update user selection display
    console.log('User selection update:', userId, selection)
  }

  const updateFileLock = (fileId: string, userId: string | null) => {
    setSession(prev => {
      if (!prev) return null
      return {
        ...prev,
        files: prev.files.map(f => 
          f.id === fileId 
            ? { ...f, isLocked: !!userId, lockedBy: userId || undefined }
            : f
        )
      }
    })
  }

  const addSystemMessage = (content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      content,
      timestamp: new Date(),
      type: 'system'
    }
    setChatMessages(prev => [...prev, message])
  }

  const handleCodeEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    
    if (currentFile && socket) {
      // Calculate change
      const oldContent = currentFile.content
      const change: CodeChange = {
        id: Date.now().toString(),
        userId: currentUser.id,
        timestamp: new Date(),
        type: 'replace', // Simplified for demo
        position: { line: 0, column: 0 },
        content: newContent,
        oldContent
      }

      // Emit change to other users
      socket.emit('code:change', change)
      
      // Update local state
      setCurrentFile(prev => prev ? { ...prev, content: newContent } : null)
      onCodeChange(newContent)
    }
  }

  const handleCursorMove = (e: React.MouseEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (socket && codeEditorRef.current) {
      const textarea = codeEditorRef.current
      const position = textarea.selectionStart
      const content = textarea.value
      
      // Calculate line and column
      const beforeCursor = content.slice(0, position)
      const lines = beforeCursor.split('\n')
      const line = lines.length - 1
      const column = lines[lines.length - 1].length

      socket.emit('code:cursor-move', {
        userId: currentUser.id,
        position: { line, column }
      })
    }
  }

  const handleSendMessage = () => {
    if (chatInput.trim() && socket) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: currentUser.id,
        content: chatInput.trim(),
        timestamp: new Date(),
        type: 'text'
      }

      socket.emit('chat:message', message)
      setChatInput('')
      
      // Stop typing indicator
      socket.emit('chat:typing', { userId: currentUser.id, isTyping: false })
    }
  }

  const handleChatTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value)
    
    if (socket) {
      socket.emit('chat:typing', { userId: currentUser.id, isTyping: true })
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('chat:typing', { userId: currentUser.id, isTyping: false })
      }, 2000)
    }
  }

  const toggleFileSelection = (file: SessionFile) => {
    if (!file.isLocked || file.lockedBy === currentUser.id) {
      setCurrentFile(file)
      if (socket) {
        socket.emit('file:select', { fileId: file.id, userId: currentUser.id })
      }
    }
  }

  const requestFileLock = (file: SessionFile) => {
    if (socket && !file.isLocked) {
      socket.emit('file:lock', { fileId: file.id, userId: currentUser.id })
    }
  }

  const releaseFileLock = (file: SessionFile) => {
    if (socket && file.lockedBy === currentUser.id) {
      socket.emit('file:unlock', { fileId: file.id })
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Menyambung ke sesi kolaborasi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="real-time-collaboration h-full flex">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Session Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-medium text-gray-900">{session.name}</h2>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="w-4 h-4 mr-1" />
                    <span className="text-sm">Disambung</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <WifiOff className="w-4 h-4 mr-1" />
                    <span className="text-sm">Terputus</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">{participants.length}</span>
              </button>
              
              <button
                onClick={() => setShowChat(!showChat)}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">Chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* File Tabs */}
        <div className="bg-gray-50 border-b border-gray-200 px-4">
          <div className="flex space-x-1 py-2">
            {session.files.map((file) => (
              <button
                key={file.id}
                onClick={() => toggleFileSelection(file)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
                  currentFile?.id === file.id
                    ? 'bg-white text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{file.name}</span>
                {file.isLocked && (
                  <div className="flex items-center">
                    {file.lockedBy === currentUser.id ? (
                      <Edit3 className="w-3 h-3 text-green-600" />
                    ) : (
                      <Eye className="w-3 h-3 text-yellow-600" />
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 relative">
          <textarea
            ref={codeEditorRef}
            value={currentFile?.content || ''}
            onChange={handleCodeEdit}
            onMouseUp={handleCursorMove}
            onKeyUp={handleCursorMove}
            placeholder="Mula menulis kod di sini..."
            className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
            style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", consolas, monospace' }}
            readOnly={currentFile?.isLocked && currentFile.lockedBy !== currentUser.id}
          />
          
          {/* User Cursors */}
          {participants
            .filter(p => p.id !== currentUser.id && p.cursor)
            .map((participant) => (
              <div
                key={participant.id}
                className="absolute w-0.5 h-5 bg-blue-500 pointer-events-none"
                style={{
                  // Position calculation would need to be more sophisticated
                  top: `${(participant.cursor!.line + 1) * 20}px`,
                  left: `${participant.cursor!.column * 8 + 16}px`
                }}
              >
                <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-1 rounded whitespace-nowrap">
                  {participant.name}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Participants Panel */}
      {showParticipants && (
        <div className="w-64 bg-white border-l border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Peserta ({participants.length})</h3>
          </div>
          <div className="p-2 space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                <div className="relative">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                  <div className="text-xs text-gray-500">
                    {participant.role === 'teacher' ? 'Guru' : 
                     participant.role === 'admin' ? 'Admin' : 'Pelajar'}
                  </div>
                </div>
                {participant.currentFile && (
                  <div className="text-xs text-blue-600">
                    {session.files.find(f => f.id === participant.currentFile)?.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {showChat && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Chat</h3>
          </div>
          
          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((message) => (
              <div key={message.id} className={`${
                message.type === 'system' ? 'text-center' : ''
              }`}>
                {message.type === 'system' ? (
                  <div className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1 inline-block">
                    {message.content}
                  </div>
                ) : (
                  <div className={`${
                    message.userId === currentUser.id ? 'ml-8' : 'mr-8'
                  }`}>
                    {message.userId !== currentUser.id && (
                      <div className="text-xs text-gray-500 mb-1">
                        {participants.find(p => p.id === message.userId)?.name}
                      </div>
                    )}
                    <div className={`rounded-lg px-3 py-2 text-sm ${
                      message.userId === currentUser.id
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.content}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {message.timestamp.toLocaleTimeString('ms-MY')}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing Indicators */}
            {isTyping.length > 0 && (
              <div className="text-xs text-gray-500 italic">
                {isTyping.map(userId => participants.find(p => p.id === userId)?.name).join(', ')} sedang menaip...
              </div>
            )}
          </div>
          
          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={handleChatTyping}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Taip mesej..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export class CollaborationService {
  private static socket: Socket | null = null

  /**
   * Initialize collaboration service
   */
  static initialize() {
    // Socket.io initialization would go here
    console.log('Collaboration service initialized')
  }

  /**
   * Create a new collaboration session
   */
  static async createSession(params: {
    name: string
    description: string
    files: { name: string; content: string; language: string }[]
    settings: SessionSettings
  }): Promise<SessionInfo> {
    // Implementation would create session via API
    const sessionId = Date.now().toString()
    
    const session: SessionInfo = {
      id: sessionId,
      name: params.name,
      description: params.description,
      owner: 'current-user-id', // Would come from auth
      participants: [],
      createdAt: new Date(),
      isActive: true,
      files: params.files.map((file, index) => ({
        id: `file-${index}`,
        name: file.name,
        path: `/${file.name}`,
        content: file.content,
        language: file.language,
        isLocked: false
      })),
      settings: params.settings
    }

    return session
  }

  /**
   * Join an existing session
   */
  static async joinSession(sessionId: string, user: CollaborationUser): Promise<SessionInfo> {
    // Implementation would join session via API/Socket
    console.log('Joining session:', sessionId, user)
    
    // Mock return
    return {
      id: sessionId,
      name: 'Sesi Pembelajaran',
      description: 'Belajar algoritma bersama',
      owner: 'teacher-id',
      participants: [user],
      createdAt: new Date(),
      isActive: true,
      files: [{
        id: 'file-1',
        name: 'main.js',
        path: '/main.js',
        content: '// Tulis kod di sini\nconsole.log("Hello World!");',
        language: 'javascript',
        isLocked: false
      }],
      settings: {
        maxParticipants: 10,
        allowGuests: false,
        enableVoiceChat: true,
        enableVideoChat: false,
        autoSave: true,
        moderationEnabled: true
      }
    }
  }

  /**
   * Leave session
   */
  static leaveSession(sessionId: string, userId: string) {
    if (this.socket) {
      this.socket.emit('session:leave', { sessionId, userId })
    }
  }

  /**
   * Send code change
   */
  static sendCodeChange(change: CodeChange) {
    if (this.socket) {
      this.socket.emit('code:change', change)
    }
  }

  /**
   * Send chat message
   */
  static sendChatMessage(message: ChatMessage) {
    if (this.socket) {
      this.socket.emit('chat:message', message)
    }
  }
}
