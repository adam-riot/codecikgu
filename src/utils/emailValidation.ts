import React from 'react'

export interface EmailValidation {
  isValid: boolean
  type: 'moe_student' | 'moe_staff' | 'public' | 'invalid'
  domain: string
  suggestions?: string[]
  errors?: string[]
}

export interface MOEEmailConfig {
  studentPatterns: RegExp[]
  staffPatterns: RegExp[]
  allowedDomains: string[]
  commonTypos: Record<string, string[]>
}

// Comprehensive MOE email patterns
const MOE_CONFIG: MOEEmailConfig = {
  studentPatterns: [
    // Standard student patterns
    /^m-\d{6,9}@moe-dl\.edu\.my$/i,
    /^m\d{7,8}@moe-dl\.edu\.my$/i,
    /^student\d{6,8}@moe\.edu\.my$/i,
    /^pelajar\d{6,8}@moe\.edu\.my$/i,
    // School-specific patterns
    /^s\d{6,8}@sekolah\d{4}\.edu\.my$/i,
    /^murid\d{6,8}@smk[a-z0-9]+\.edu\.my$/i,
    /^\d{6,8}@smk[a-z0-9]+\.moe\.edu\.my$/i
  ],
  staffPatterns: [
    // Standard staff patterns
    /^g-\d{6,8}@moe-dl\.edu\.my$/i,
    /^staff\d{6,8}@moe\.edu\.my$/i,
    /^teacher\d{6,8}@moe\.edu\.my$/i,
    /^guru\d{6,8}@moe\.edu\.my$/i,
    /^cikgu\d{6,8}@moe\.edu\.my$/i,
    // Administrative staff
    /^admin\d{6,8}@moe\.edu\.my$/i,
    /^pentadbir\d{6,8}@moe\.edu\.my$/i,
    // School head patterns
    /^gb\d{6,8}@moe\.edu\.my$/i,
    /^pengetua\d{6,8}@moe\.edu\.my$/i
  ],
  allowedDomains: [
    'moe.edu.my',
    'moe-dl.edu.my',
    'kpm.edu.my',
    'jpm.edu.my'
  ],
  commonTypos: {
    'moe.edu.my': ['moe.com.my', 'moe.gov.my', 'moe-edu.my', 'moe.edu'],
    'moe-dl.edu.my': ['moe-dl.com.my', 'moe-dl.gov.my', 'moe-dl.edu', 'moedl.edu.my']
  }
}

export class EmailValidationService {
  /**
   * Comprehensive email validation for Malaysian education system
   */
  static validateEmail(email: string): EmailValidation {
    // Basic format validation
    const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!basicEmailRegex.test(email)) {
      return {
        isValid: false,
        type: 'invalid',
        domain: '',
        errors: ['Format email tidak sah']
      }
    }

    const normalizedEmail = email.toLowerCase().trim()
    const [localPart, domain] = normalizedEmail.split('@')

    // Check for MOE domains
    if (this.isMOEDomain(domain)) {
      return this.validateMOEEmail(normalizedEmail, localPart, domain)
    }

    // Check for typos in domain
    const suggestions = this.generateDomainSuggestions(domain)
    if (suggestions.length > 0) {
      return {
        isValid: false,
        type: 'invalid',
        domain,
        suggestions,
        errors: ['Domain mungkin salah taip. Cuba salah satu cadangan di atas.']
      }
    }

    // Public email validation
    return this.validatePublicEmail(normalizedEmail, domain)
  }

  /**
   * Validate MOE email addresses
   */
  private static validateMOEEmail(email: string, localPart: string, domain: string): EmailValidation {
    // Check if it's a student email
    const isStudent = MOE_CONFIG.studentPatterns.some(pattern => pattern.test(email))
    if (isStudent) {
      return {
        isValid: true,
        type: 'moe_student',
        domain
      }
    }

    // Check if it's a staff email
    const isStaff = MOE_CONFIG.staffPatterns.some(pattern => pattern.test(email))
    if (isStaff) {
      return {
        isValid: true,
        type: 'moe_staff',
        domain
      }
    }

    // MOE domain but doesn't match patterns
    return {
      isValid: false,
      type: 'invalid',
      domain,
      errors: [
        'Format email MOE tidak dikenali.',
        'Pastikan anda menggunakan email rasmi dari sekolah/MOE.'
      ]
    }
  }

  /**
   * Validate public email addresses
   */
  private static validatePublicEmail(email: string, domain: string): EmailValidation {
    const publicDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'yahoo.com.my', 'hotmail.com.my', 'live.com'
    ]

    if (publicDomains.includes(domain)) {
      return {
        isValid: true,
        type: 'public',
        domain
      }
    }

    // Unknown domain
    return {
      isValid: false,
      type: 'invalid',
      domain,
      errors: [
        'Domain email tidak dikenali.',
        'Sila gunakan email MOE atau email awam yang sah.'
      ]
    }
  }

  /**
   * Check if domain is MOE-related
   */
  private static isMOEDomain(domain: string): boolean {
    return MOE_CONFIG.allowedDomains.some(moeDomain => 
      domain === moeDomain || domain.endsWith('.' + moeDomain)
    )
  }

  /**
   * Generate domain suggestions for common typos
   */
  private static generateDomainSuggestions(domain: string): string[] {
    const suggestions: string[] = []

    // Check for common typos
    for (const [correctDomain, typos] of Object.entries(MOE_CONFIG.commonTypos)) {
      if (typos.includes(domain)) {
        suggestions.push(correctDomain)
      }
    }

    // Check for partial matches
    if (domain.includes('moe') && !domain.includes('edu.my')) {
      suggestions.push('moe.edu.my', 'moe-dl.edu.my')
    }

    return suggestions
  }

  /**
   * Get user type description
   */
  static getUserTypeDescription(type: EmailValidation['type']): string {
    switch (type) {
      case 'moe_student':
        return 'Pelajar MOE'
      case 'moe_staff':
        return 'Kakitangan MOE'
      case 'public':
        return 'Pengguna Awam'
      case 'invalid':
        return 'Email Tidak Sah'
      default:
        return 'Tidak Diketahui'
    }
  }

  /**
   * Check if email type is allowed for registration
   */
  static isEmailTypeAllowed(type: EmailValidation['type']): boolean {
    return ['moe_student', 'moe_staff', 'public'].includes(type)
  }

  /**
   * Get role based on email type
   */
  static getDefaultRole(type: EmailValidation['type']): 'murid' | 'guru' | 'awam' {
    switch (type) {
      case 'moe_student':
        return 'murid'
      case 'moe_staff':
        return 'guru'
      case 'public':
        return 'awam'
      default:
        return 'awam'
    }
  }

  /**
   * Advanced validation with additional checks
   */
  static async validateEmailAdvanced(email: string): Promise<EmailValidation & {
    isDisposable?: boolean
    riskScore?: number
  }> {
    const basicValidation = this.validateEmail(email)

    // Additional checks for advanced validation
    const domain = email.split('@')[1]?.toLowerCase()
    
    // Check for disposable email domains
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
      'mailinator.com', 'yopmail.com', 'throwaway.email'
    ]
    
    const isDisposable = disposableDomains.includes(domain)
    
    // Calculate risk score (0-100, higher = more risky)
    let riskScore = 0
    if (isDisposable) riskScore += 80
    if (!basicValidation.isValid) riskScore += 50
    if (basicValidation.type === 'invalid') riskScore += 30

    return {
      ...basicValidation,
      isDisposable,
      riskScore
    }
  }
}

// React hook for email validation
export function useEmailValidation() {
  const [validation, setValidation] = React.useState<EmailValidation | null>(null)
  const [isValidating, setIsValidating] = React.useState(false)

  const validateEmail = React.useCallback(async (email: string) => {
    if (!email) {
      setValidation(null)
      return
    }

    setIsValidating(true)
    try {
      const result = await EmailValidationService.validateEmailAdvanced(email)
      setValidation(result)
    } catch (error) {
      console.error('Email validation error:', error)
      setValidation({
        isValid: false,
        type: 'invalid',
        domain: '',
        errors: ['Ralat semasa validasi email']
      })
    } finally {
      setIsValidating(false)
    }
  }, [])

  const reset = React.useCallback(() => {
    setValidation(null)
    setIsValidating(false)
  }, [])

  return {
    validation,
    isValidating,
    validateEmail,
    reset
  }
}
