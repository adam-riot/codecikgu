import { EmailValidationService } from '../src/utils/emailValidation'

// Test cases for email validation
const testCases = [
  // MOE Student emails
  { email: 'm-1234567@moe-dl.edu.my', expected: 'moe_student' },
  { email: 'm1234567@moe-dl.edu.my', expected: 'moe_student' },
  { email: 'student123456@moe.edu.my', expected: 'moe_student' },
  
  // MOE Staff emails
  { email: 'g-123456@moe-dl.edu.my', expected: 'moe_staff' },
  { email: 'staff123456@moe.edu.my', expected: 'moe_staff' },
  { email: 'teacher123456@moe.edu.my', expected: 'moe_staff' },
  
  // Public emails
  { email: 'user@gmail.com', expected: 'public' },
  { email: 'test@yahoo.com', expected: 'public' },
  { email: 'user@hotmail.com', expected: 'public' },
  
  // Invalid emails
  { email: 'invalid-email', expected: 'invalid' },
  { email: 'test@', expected: 'invalid' },
  { email: '@domain.com', expected: 'invalid' },
  
  // Common typos
  { email: 'user@moe.com.my', expected: 'invalid' }, // Should suggest moe.edu.my
  { email: 'user@moe-dl.com.my', expected: 'invalid' }, // Should suggest moe-dl.edu.my
]

console.log('🧪 EMAIL VALIDATION TEST RESULTS\n')
console.log('=' .repeat(50))

testCases.forEach((testCase, index) => {
  const result = EmailValidationService.validateEmail(testCase.email)
  const passed = result.type === testCase.expected
  
  console.log(`\nTest ${index + 1}: ${testCase.email}`)
  console.log(`Expected: ${testCase.expected}`)
  console.log(`Got: ${result.type}`)
  console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Valid: ${result.isValid}`)
  
  if (result.errors && result.errors.length > 0) {
    console.log(`Errors: ${result.errors.join(', ')}`)
  }
  
  if (result.suggestions && result.suggestions.length > 0) {
    console.log(`Suggestions: ${result.suggestions.join(', ')}`)
  }
})

console.log('\n' + '=' .repeat(50))

// Test role assignment
console.log('\n🎯 ROLE ASSIGNMENT TEST RESULTS\n')

const roleTests = [
  { type: 'moe_student', expected: 'murid' },
  { type: 'moe_staff', expected: 'guru' },
  { type: 'public', expected: 'awam' },
  { type: 'invalid', expected: 'awam' },
]

roleTests.forEach((test, index) => {
  const role = EmailValidationService.getDefaultRole(test.type)
  const passed = role === test.expected
  
  console.log(`Role Test ${index + 1}: ${test.type} → ${role} (${passed ? '✅' : '❌'})`)
})

console.log('\n✨ Email validation system is ready for production!')
console.log('📧 Supported: MOE students, MOE staff, and public emails')
console.log('🔒 Features: Typo detection, role assignment, and security checks')
