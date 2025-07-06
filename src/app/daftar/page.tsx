'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
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
  UserCheck
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

interface EmailValidation {
  isValid: boolean
  isMOE: boolean
  role: 'murid' | 'awam'
  message: string
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
  const [emailValidation, setEmailValidation] = useState<EmailValidation>({
    isValid: false,
    isMOE: false,
    role: 'awam',
    message: ''
  })
  const [step, setStep] = useState(1)

  // Add notification function
  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString()
    const notification: Notification = { id, type, message }
    
    setNotifications(prev => [...prev, notification])
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  // MOE Email validation function - FIXED: Only m- prefix gets murid role
  const validateMOEEmail = (email: string): EmailValidation => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        isMOE: false,
        role: 'awam',
        message: 'Format email tidak sah'
      }
    }

    // FIXED: Only m- prefix gets murid role, g- prefix gets awam role
    const moeStudentPattern = /^m-\d{7,8}@moe-dl\.edu\.my$/i
    const moeStaffPattern = /^g-\d{6,8}@moe-dl\.edu\.my$/i
    
    if (moeStudentPattern.test(email)) {
      return {
        isValid: true,
        isMOE: true,
        role: 'murid',
        message: 'Email MOE Pelajar sah - Anda akan didaftarkan sebagai Murid'
      }
    } else if (moeStaffPattern.test(email)) {
      return {
        isValid: true,
        isMOE: false, // g- prefix is not considered MOE for murid role
        role: 'awam',
        message: 'Email MOE Staff - Anda akan didaftarkan sebagai Awam'
      }
    } else {
      return {
        isValid: true,
        isMOE: false,
        role: 'awam',
        message: 'Email awam - Anda akan didaftarkan sebagai Awam'
      }
    }
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

  // Helper function to wait for auth user to be available
  const waitForAuthUser = async (userId: string, maxAttempts = 10): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const { data, error } = await supabase
          .from('auth.users')
          .select('id')
          .eq('id', userId)
          .single()

        if (data && !error) {
          console.log(`Auth user found on attempt ${attempt}`)
          return true
        }

        console.log(`Attempt ${attempt}: Auth user not found yet, waiting...`)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      } catch (error) {
        console.log(`Attempt ${attempt}: Error checking auth user:`, error)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log('Max attempts reached, auth user not found')
    return false
  }

  // Helper function to create profile with retry mechanism
  const createProfileWithRetry = async (profileData: any, maxAttempts = 5): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Profile creation attempt ${attempt}`)
        
        const { data, error } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()

        if (!error && data) {
          console.log(`Profile created successfully on attempt ${attempt}:`, data)
          return true
        }

        if (error) {
          console.log(`Attempt ${attempt} failed:`, error.message)
          
          // If it's a foreign key constraint error, wait longer
          if (error.message.includes('foreign key') || error.message.includes('violates')) {
            console.log('Foreign key constraint error, waiting longer...')
            await new Promise(resolve => setTimeout(resolve, 2000))
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      } catch (error: any) {
        console.log(`Attempt ${attempt} exception:`, error.message)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log('Max profile creation attempts reached')
    return false
  }

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password))
    }
  }, [formData.password])

  useEffect(() => {
    if (formData.email) {
      setEmailValidation(validateMOEEmail(formData.email))
    } else {
      setEmailValidation({
        isValid: false,
        isMOE: false,
        role: 'awam',
        message: ''
      })
    }
  }, [formData.email])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.email) {
      addNotification('error', 'Sila lengkapkan maklumat peribadi')
      return false
    }
    if (!emailValidation.isValid) {
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

    try {
      console.log('Starting registration process...')
      console.log(`Email: ${formData.email}`)
      console.log(`Role will be: ${emailValidation.role}`)

      // Step 1: Register with Supabase Auth
      console.log('Step 1: Creating auth user...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            sekolah: formData.sekolah || null,
            tingkatan: formData.tingkatan || null,
            role: emailValidation.role
          }
        }
      })

      if (authError) {
        console.error('Auth registration error:', authError)
        addNotification('error', `Ralat pendaftaran: ${authError.message}`)
        return
      }

      if (!authData.user) {
        addNotification('error', 'Ralat: User tidak dicipta')
        return
      }

      console.log('Auth user created successfully:', authData.user.id)

      // Step 2: Wait for auth user to be available in database
      console.log('Step 2: Waiting for auth user to be available...')
      const authUserReady = await waitForAuthUser(authData.user.id)
      
      if (!authUserReady) {
        console.log('Auth user not ready, but continuing with profile creation...')
      }

      // Step 3: Create profile with retry mechanism
      console.log('Step 3: Creating user profile...')
      const profileData = {
        id: authData.user.id,
        email: formData.email,
        name: formData.name,
        sekolah: formData.sekolah || null,
        tingkatan: formData.tingkatan || null,
        role: emailValidation.role,
        xp: 0,
        level: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Profile data to create:', profileData)

      const profileCreated = await createProfileWithRetry(profileData)

      if (profileCreated) {
        console.log('Registration completed successfully!')
        addNotification('success', `Pendaftaran berjaya sebagai ${emailValidation.role}! Sila semak email untuk pengesahan.`)
        
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        console.log('Profile creation failed, but auth user exists')
        addNotification('info', 'Akaun dicipta tetapi profil tidak lengkap. Sila cuba log masuk.')
        
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }

    } catch (error: any) {
      console.error('Unexpected registration error:', error)
      addNotification('error', `Ralat tidak dijangka: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black relative overflow-hidden">
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
                            formData.email && emailValidation.isValid
                              ? emailValidation.isMOE 
                                ? 'border-green-500 focus:ring-green-500'
                                : 'border-blue-500 focus:ring-blue-500'
                              : formData.email && !emailValidation.isValid
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-600 focus:ring-electric-blue'
                          }`}
                          placeholder="m-1234567@moe-dl.edu.my atau email@example.com"
                          required
                        />
                      </div>
                      
                      {/* Email Validation Feedback */}
                      {formData.email && emailValidation.message && (
                        <div className={`mt-2 flex items-center text-xs ${
                          emailValidation.isValid
                            ? emailValidation.isMOE
                              ? 'text-green-400'
                              : 'text-blue-400'
                            : 'text-red-400'
                        }`}>
                          {emailValidation.isValid ? (
                            emailValidation.isMOE ? (
                              <div className="flex items-center">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                <span>{emailValidation.message}</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <UserCheck className="w-3 h-3 mr-1" />
                                <span>{emailValidation.message}</span>
                              </div>
                            )
                          ) : (
                            <div className="flex items-center">
                              <X className="w-3 h-3 mr-1" />
                              <span>{emailValidation.message}</span>
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
                      emailValidation.isMOE 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}>
                      <div className="flex items-center">
                        {emailValidation.isMOE ? (
                          <GraduationCap className="w-5 h-5 text-green-400 mr-2" />
                        ) : (
                          <UserCheck className="w-5 h-5 text-blue-400 mr-2" />
                        )}
                        <div>
                          <div className={`font-medium ${emailValidation.isMOE ? 'text-green-400' : 'text-blue-400'}`}>
                            Pendaftaran sebagai: {emailValidation.role.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {emailValidation.isMOE 
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

