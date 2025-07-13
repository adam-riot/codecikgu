'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { EmailValidationService, useEmailValidation } from '@/utils/emailValidation'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Code, 
  Sparkles, 
  BookOpen, 
  Trophy,
  Users,
  Zap,
  Shield,
  CheckCircle,
  AlertCircle,
  School,
  Check,
  X,
  Info,
  GraduationCap,
  UserCheck,
  Bug
} from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
}

interface DebugLog {
  timestamp: string
  step: string
  status: 'success' | 'error' | 'info'
  message: string
  data?: any
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    sekolah: '',
    tingkatan: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'red'
  })
  const [step, setStep] = useState(1)
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([])
  const [showDebug, setShowDebug] = useState(false)

  // Use the new email validation hook
  const { validation: emailValidation, isValidating, validateEmail: validateEmailNew, reset: resetValidation } = useEmailValidation()

  // Debug logging function
  const addDebugLog = (step: string, status: 'success' | 'error' | 'info', message: string, data?: any) => {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      step,
      status,
      message,
      data
    }
    setDebugLogs(prev => [...prev, log])
    console.log(`[DEBUG ${status.toUpperCase()}] ${step}: ${message}`, data || '')
  }

  // Add notification function
  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString()
    const notification: Notification = { id, type, message }
    
    setNotifications(prev => [...prev, notification])
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  // Password strength checker
  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('Minimum 8 aksara')
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Perlu huruf besar')
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Perlu huruf kecil')
    }

    if (/[0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push('Perlu nombor')
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push('Perlu simbol khas')
    }

    let color = 'red'
    if (score >= 4) color = 'green'
    else if (score >= 3) color = 'yellow'
    else if (score >= 2) color = 'orange'

    return { score, feedback, color }
  }

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password))
    }
  }, [formData.password])

  useEffect(() => {
    if (formData.email) {
      validateEmailNew(formData.email)
    } else {
      resetValidation()
    }
  }, [formData.email, validateEmailNew, resetValidation])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.email) {
      addNotification('error', 'Sila lengkapkan maklumat peribadi')
      return false
    }
    if (!emailValidation?.isValid) {
      addNotification('error', 'Format email tidak sah')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.password || !formData.confirmPassword) {
      addNotification('error', 'Sila masukkan password')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      addNotification('error', 'Password tidak sepadan')
      return false
    }
    if (passwordStrength.score < 3) {
      addNotification('error', 'Password terlalu lemah')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep2()) return

    setLoading(true)
    setDebugLogs([]) // Clear previous logs

    try {
      addDebugLog('INIT', 'info', 'Starting registration process', {
        email: formData.email,
        role: getUserRole(),
        timestamp: new Date().toISOString()
      })

      // Test Supabase connection first
      addDebugLog('CONNECTION', 'info', 'Testing Supabase connection...')
      
      try {
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)
        
        if (testError) {
          addDebugLog('CONNECTION', 'error', 'Supabase connection failed', testError)
        } else {
          addDebugLog('CONNECTION', 'success', 'Supabase connection OK')
        }
      } catch (connError: any) {
        addDebugLog('CONNECTION', 'error', 'Connection test failed', connError)
      }

      // Check if email already exists
      addDebugLog('EMAIL_CHECK', 'info', 'Checking if email already exists...')
      
      try {
        const { data: existingUser, error: checkError } = await supabase.auth.getUser()
        addDebugLog('EMAIL_CHECK', 'info', 'Current auth state', { user: existingUser?.user?.email || 'none' })
      } catch (checkErr: any) {
        addDebugLog('EMAIL_CHECK', 'error', 'Auth check failed', checkErr)
      }

      // Prepare metadata
      const metadata = {
        full_name: formData.name,
        name: formData.name,
        sekolah: formData.sekolah || '',
        tingkatan: formData.tingkatan || '',
        role: getUserRole(),
        xp: 0,
        level: 1,
        avatar_url: '',
        bio: '',
        email: formData.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      addDebugLog('METADATA', 'info', 'Prepared user metadata', metadata)

      // Attempt registration
      addDebugLog('AUTH_SIGNUP', 'info', 'Calling supabase.auth.signUp...')
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: metadata
        }
      })

      addDebugLog('AUTH_SIGNUP', 'info', 'Auth signup response received', {
        hasData: !!data,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        userId: data?.user?.id,
        hasError: !!error
      })

      if (error) {
        addDebugLog('AUTH_SIGNUP', 'error', 'Auth signup failed', {
          message: error.message,
          status: error.status,
          name: error.name,
          cause: error.cause
        })
        
        // Handle specific error types
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          addNotification('error', 'Email ini sudah didaftarkan. Sila cuba log masuk.')
        } else if (error.message.includes('invalid email')) {
          addNotification('error', 'Format email tidak sah.')
        } else if (error.message.includes('weak password') || error.message.includes('password')) {
          addNotification('error', 'Password terlalu lemah. Sila gunakan password yang lebih kuat.')
        } else if (error.message.includes('rate limit')) {
          addNotification('error', 'Terlalu banyak percubaan. Sila tunggu sebentar.')
        } else {
          addNotification('error', `Ralat pendaftaran: ${error.message}`)
        }
        return
      }

      if (data?.user) {
        addDebugLog('AUTH_SUCCESS', 'success', 'Auth user created successfully', {
          userId: data.user.id,
          email: data.user.email,
          emailConfirmed: data.user.email_confirmed_at,
          metadata: data.user.user_metadata
        })

        // Check if user needs email confirmation
        if (!data.session && !data.user.email_confirmed_at) {
          addDebugLog('EMAIL_CONFIRMATION', 'info', 'Email confirmation required')
          addNotification('success', `Pendaftaran berjaya sebagai ${EmailValidationService.getUserTypeDescription(emailValidation?.type || 'public')}! Sila semak email untuk pengesahan.`)
        } else {
          addDebugLog('IMMEDIATE_ACCESS', 'success', 'User can access immediately')
          addNotification('success', `Pendaftaran berjaya sebagai ${EmailValidationService.getUserTypeDescription(emailValidation?.type || 'public')}! Anda boleh log masuk sekarang.`)
        }
        
        // Redirect to login after success
        setTimeout(() => {
          router.push('/login?message=registration_success')
        }, 2000)
      } else {
        addDebugLog('NO_USER', 'error', 'No user returned from signup')
        addNotification('error', 'Ralat: Pendaftaran tidak berjaya - tiada user dicipta')
      }

    } catch (error: any) {
      addDebugLog('UNEXPECTED_ERROR', 'error', 'Unexpected registration error', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      addNotification('error', `Ralat tidak dijangka: ${error.message}`)
    } finally {
      setLoading(false)
      addDebugLog('COMPLETE', 'info', 'Registration process completed')
    }
  }

  // Helper function to get role from email validation
  const getUserRole = () => {
    if (!emailValidation) return 'awam'
    return EmailValidationService.getDefaultRole(emailValidation.type)
  }

  // Helper function to check if email is MOE student
  const isMOEStudent = () => {
    return emailValidation?.type === 'moe_student'
  }

  // Helper function to get validation message
  const getValidationMessage = () => {
    if (!emailValidation) return ''
    if (emailValidation.errors) return emailValidation.errors.join('. ')
    
    const userType = EmailValidationService.getUserTypeDescription(emailValidation.type)
    return `Email sah - Anda akan didaftarkan sebagai ${userType}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black relative overflow-hidden">
      {/* Debug Panel */}
      {showDebug && (
        <div className="fixed top-4 left-4 w-96 max-h-96 bg-gray-900/95 border border-gray-700 rounded-lg p-4 z-50 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold flex items-center">
              <Bug className="w-4 h-4 mr-2" />
              Debug Logs
            </h3>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 text-xs">
            {debugLogs.map((log, index) => (
              <div key={index} className={`p-2 rounded ${
                log.status === 'success' ? 'bg-green-500/20 text-green-400' :
                log.status === 'error' ? 'bg-red-500/20 text-red-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                <div className="font-semibold">{log.step}</div>
                <div>{log.message}</div>
                {log.data && (
                  <pre className="mt-1 text-xs opacity-75 overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug Toggle Button */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed bottom-4 left-4 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg z-40 flex items-center"
      >
        <Bug className="w-4 h-4 mr-2" />
        Debug ({debugLogs.length})
      </button>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 text-electric-blue/20 text-6xl font-mono animate-pulse">
          {'</>'}
        </div>
        <div className="absolute top-40 right-20 text-neon-green/20 text-4xl font-mono animate-bounce">
          {'{}'}
        </div>
        <div className="absolute bottom-40 left-20 text-purple-400/20 text-5xl font-mono animate-pulse">
          {'()'}
        </div>
        <div className="absolute bottom-20 right-10 text-orange-400/20 text-3xl font-mono animate-bounce">
          {'[]'}
        </div>
        
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
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
            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {notification.type === 'info' && <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding & Benefits */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <div className="max-w-lg">
            {/* Logo & Brand */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-neon-green rounded-xl flex items-center justify-center mr-4">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gradient">CodeCikgu</h1>
              </div>
              <p className="text-xl text-gray-300 leading-relaxed">
                Sertai ribuan pelajar yang telah memulakan journey programming mereka
              </p>
            </div>

            {/* MOE Email Info - UPDATED */}
            <div className="mb-8 p-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-xl border border-blue-500/20">
              <div className="flex items-center mb-3">
                <GraduationCap className="w-6 h-6 text-blue-400 mr-2" />
                <h4 className="text-lg font-semibold text-white">Pelajar MOE</h4>
              </div>
              <p className="text-gray-300 text-sm mb-2">
                Gunakan email MOE pelajar untuk mendapat akses penuh sebagai <strong>Murid</strong>:
              </p>
              <div className="text-blue-400 text-sm font-mono bg-gray-800/50 p-2 rounded mb-2">
                m-1234567@moe-dl.edu.my<br/>
                m-12345678@moe-dl.edu.my
              </div>
              <div className="text-gray-400 text-xs">
                <strong>Nota:</strong> Email staff MOE (g-xxxxxx@moe-dl.edu.my) akan didaftarkan sebagai <strong>Awam</strong>.
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-electric-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-electric-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Pembelajaran Percuma</h3>
                  <p className="text-gray-400">Akses penuh ke semua nota, video, dan playground kod tanpa bayaran</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-neon-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Sistem XP Gamifikasi</h3>
                  <p className="text-gray-400">Kumpul XP, naik level, dan buka achievement baru setiap hari</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Code className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Playground Kod Canggih</h3>
                  <p className="text-gray-400">Editor kod dengan syntax highlighting, auto-save, dan multi-language support</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Komuniti Aktif</h3>
                  <p className="text-gray-400">Belajar bersama, tanya soalan, dan berkongsi projek dengan rakan-rakan</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-neon-green rounded-xl flex items-center justify-center mr-3">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gradient">CodeCikgu</h1>
              </div>
              <p className="text-gray-400">Mulakan journey programming anda hari ini</p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                <div className={`flex items-center ${step >= 1 ? 'text-electric-blue' : 'text-gray-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step >= 1 ? 'border-electric-blue bg-electric-blue/20' : 'border-gray-500'
                  }`}>
                    {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <span className="ml-2 text-sm font-medium">Maklumat Peribadi</span>
                </div>
                <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-electric-blue' : 'bg-gray-500'}`}></div>
                <div className={`flex items-center ${step >= 2 ? 'text-electric-blue' : 'text-gray-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step >= 2 ? 'border-electric-blue bg-electric-blue/20' : 'border-gray-500'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Keselamatan</span>
                </div>
              </div>
            </div>

            {/* Register Form */}
            <div className="glass-dark rounded-2xl p-8 border border-gray-700/50">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {step === 1 ? 'Maklumat Peribadi' : 'Tetapkan Password'}
                </h2>
                <p className="text-gray-400">
                  {step === 1 
                    ? 'Beritahu kami sedikit tentang diri anda'
                    : 'Buat password yang kuat untuk melindungi akaun anda'
                  }
                </p>
              </div>

              <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleRegister} className="space-y-6">
                {step === 1 ? (
                  <>
                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Nama Penuh *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                          placeholder="Ahmad bin Ali"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Field with MOE Validation */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                            formData.email && emailValidation?.isValid
                              ? isMOEStudent()
                                ? 'border-green-500 focus:ring-green-500'
                                : 'border-blue-500 focus:ring-blue-500'
                              : formData.email && !emailValidation?.isValid
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-600 focus:ring-electric-blue'
                          }`}
                          placeholder="m-1234567@moe-dl.edu.my atau email@example.com"
                          required
                        />
                      </div>
                      
                      {/* Email Validation Feedback */}
                      {formData.email && getValidationMessage() && (
                        <div className={`mt-2 flex items-center text-xs ${
                          emailValidation?.isValid
                            ? isMOEStudent()
                              ? 'text-green-400'
                              : 'text-blue-400'
                            : 'text-red-400'
                        }`}>
                          {emailValidation?.isValid ? (
                            isMOEStudent() ? (
                              <div className="flex items-center">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                <span>{getValidationMessage()}</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <UserCheck className="w-3 h-3 mr-1" />
                                <span>{getValidationMessage()}</span>
                              </div>
                            )
                          ) : (
                            <div className="flex items-center">
                              <X className="w-3 h-3 mr-1" />
                              <span>{getValidationMessage()}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* MOE Email Format Help - UPDATED */}
                      <div className="mt-2 p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Info className="w-4 h-4 text-blue-400 mr-2" />
                          <span className="text-sm font-medium text-blue-400">Format Email MOE</span>
                        </div>
                        <div className="text-xs text-gray-400 space-y-1">
                          <div className="font-semibold text-green-400 mb-1">Pelajar (Role: MURID):</div>
                          <div>• <span className="font-mono text-green-400">m-1234567@moe-dl.edu.my</span> (7 digit)</div>
                          <div>• <span className="font-mono text-green-400">m-12345678@moe-dl.edu.my</span> (8 digit)</div>
                          <div className="font-semibold text-blue-400 mt-2 mb-1">Staff (Role: AWAM):</div>
                          <div>• <span className="font-mono text-blue-400">g-123456@moe-dl.edu.my</span> (6-8 digit)</div>
                          <div className="text-gray-500 mt-2 text-xs">Hanya email pelajar (m-) yang mendapat akses penuh</div>
                        </div>
                      </div>
                    </div>

                    {/* School Field */}
                    <div>
                      <label htmlFor="sekolah" className="block text-sm font-medium text-gray-300 mb-2">
                        Sekolah/Institusi
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <School className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="sekolah"
                          type="text"
                          value={formData.sekolah}
                          onChange={(e) => handleInputChange('sekolah', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                          placeholder="SMK Bandar Utama"
                        />
                      </div>
                    </div>

                    {/* Tingkatan Field */}
                    <div>
                      <label htmlFor="tingkatan" className="block text-sm font-medium text-gray-300 mb-2">
                        Tingkatan
                      </label>
                      <select
                        id="tingkatan"
                        value={formData.tingkatan}
                        onChange={(e) => handleInputChange('tingkatan', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                      >
                        <option value="">Pilih Tingkatan</option>
                        <option value="Tingkatan 1">Tingkatan 1</option>
                        <option value="Tingkatan 2">Tingkatan 2</option>
                        <option value="Tingkatan 3">Tingkatan 3</option>
                        <option value="Tingkatan 4">Tingkatan 4</option>
                        <option value="Tingkatan 5">Tingkatan 5</option>
                        <option value="Tingkatan 6">Tingkatan 6</option>
                        <option value="Universiti">Universiti</option>
                        <option value="Lain-lain">Lain-lain</option>
                      </select>
                    </div>

                    {/* Next Button */}
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-electric-blue to-neon-green text-white font-semibold rounded-lg hover:from-electric-blue/90 hover:to-neon-green/90 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300"
                    >
                      <span>Seterusnya</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Role Display */}
                    <div className={`p-4 rounded-lg border ${
                      isMOEStudent()
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}>
                      <div className="flex items-center">
                        {isMOEStudent() ? (
                          <GraduationCap className="w-5 h-5 text-green-400 mr-2" />
                        ) : (
                          <UserCheck className="w-5 h-5 text-blue-400 mr-2" />
                        )}
                        <div>
                          <div className={`font-medium ${isMOEStudent() ? 'text-green-400' : 'text-blue-400'}`}>
                            Pendaftaran sebagai: {EmailValidationService.getUserTypeDescription(emailValidation?.type || 'public').toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {isMOEStudent()
                              ? 'Akses penuh ke semua features dan XP system'
                              : 'Akses terhad ke features awam'
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                          placeholder="Buat password yang kuat"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  passwordStrength.color === 'red' ? 'bg-red-500' :
                                  passwordStrength.color === 'orange' ? 'bg-orange-500' :
                                  passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-medium ${
                              passwordStrength.color === 'red' ? 'text-red-400' :
                              passwordStrength.color === 'orange' ? 'text-orange-400' :
                              passwordStrength.color === 'yellow' ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {passwordStrength.score < 2 ? 'Lemah' :
                               passwordStrength.score < 3 ? 'Sederhana' :
                               passwordStrength.score < 4 ? 'Kuat' : 'Sangat Kuat'}
                            </span>
                          </div>
                          {passwordStrength.feedback.length > 0 && (
                            <div className="text-xs text-gray-400">
                              {passwordStrength.feedback.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                        Sahkan Password *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className={`w-full pl-10 pr-12 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300 ${
                            formData.confirmPassword && formData.password !== formData.confirmPassword
                              ? 'border-red-500'
                              : 'border-gray-600'
                          }`}
                          placeholder="Taip semula password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <div className="mt-1 flex items-center text-red-400 text-xs">
                          <X className="w-3 h-3 mr-1" />
                          Password tidak sepadan
                        </div>
                      )}
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <div className="mt-1 flex items-center text-green-400 text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Password sepadan
                        </div>
                      )}
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex items-start">
                      <input
                        id="terms"
                        type="checkbox"
                        className="h-4 w-4 text-electric-blue focus:ring-electric-blue border-gray-600 rounded bg-gray-800 mt-1"
                        required
                      />
                      <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                        Saya bersetuju dengan{' '}
                        <Link href="/terms" className="text-electric-blue hover:text-electric-blue/80">
                          Terma & Syarat
                        </Link>{' '}
                        dan{' '}
                        <Link href="/privacy" className="text-electric-blue hover:text-electric-blue/80">
                          Dasar Privasi
                        </Link>
                      </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300"
                      >
                        Kembali
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-electric-blue to-neon-green text-white font-semibold rounded-lg hover:from-electric-blue/90 hover:to-neon-green/90 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Mendaftar...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span>Daftar Akaun</span>
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </div>
                        )}
                      </button>
                    </div>
                  </>
                )}

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-gray-400">
                    Sudah ada akaun?{' '}
                    <Link
                      href="/login"
                      className="text-electric-blue hover:text-electric-blue/80 font-medium transition-colors duration-300"
                    >
                      Log masuk di sini
                    </Link>
                  </p>
                </div>
              </form>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center text-gray-500 text-xs">
                <Shield className="w-4 h-4 mr-1" />
                <span>Data anda dilindungi dengan enkripsi end-to-end</span>
              </div>
            </div>

            {/* Quick Access */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm mb-3">Atau jelajahi tanpa daftar:</p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/playground"
                  className="flex items-center px-3 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition-all duration-300 text-sm"
                >
                  <Code className="w-4 h-4 mr-1" />
                  Playground
                </Link>
                <Link
                  href="/nota"
                  className="flex items-center px-3 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition-all duration-300 text-sm"
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  Nota
                </Link>
                <Link
                  href="/leaderboard"
                  className="flex items-center px-3 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition-all duration-300 text-sm"
                >
                  <Trophy className="w-4 h-4 mr-1" />
                  Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

