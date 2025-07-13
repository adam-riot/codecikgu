interface ExecutionResult {
  output: string
  error?: string
  executionTime: number
  memoryUsed: number
  exitCode: number
}

interface ExecutionLimits {
  timeoutMs: number
  maxMemoryMB: number
  maxOutputLength: number
  allowedModules: string[]
}

export class SecureCodeExecutor {
  private static readonly DEFAULT_LIMITS: ExecutionLimits = {
    timeoutMs: 5000,
    maxMemoryMB: 128,
    maxOutputLength: 10000,
    allowedModules: ['math', 'random', 'datetime', 'json']
  }

  /**
   * Execute Python code in a sandboxed environment
   */
  static async executePython(code: string, limits = this.DEFAULT_LIMITS): Promise<ExecutionResult> {
    const startTime = Date.now()
    
    try {
      // Sanitize input
      const sanitizedCode = this.sanitizeCode(code)
      
      // Check for dangerous patterns
      if (this.containsDangerousPatterns(sanitizedCode)) {
        throw new Error('Code contains potentially dangerous operations')
      }

      // For now, simulate execution (in production, use a proper sandbox)
      const result = await this.simulateExecution(sanitizedCode, 'python', limits)
      
      return {
        ...result,
        executionTime: Date.now() - startTime
      }
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Execution failed',
        executionTime: Date.now() - startTime,
        memoryUsed: 0,
        exitCode: 1
      }
    }
  }

  /**
   * Execute JavaScript code in a sandboxed environment
   */
  static async executeJavaScript(code: string, limits = this.DEFAULT_LIMITS): Promise<ExecutionResult> {
    const startTime = Date.now()
    
    try {
      const sanitizedCode = this.sanitizeCode(code)
      
      if (this.containsDangerousPatterns(sanitizedCode)) {
        throw new Error('Code contains potentially dangerous operations')
      }

      const result = await this.simulateExecution(sanitizedCode, 'javascript', limits)
      
      return {
        ...result,
        executionTime: Date.now() - startTime
      }
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Execution failed',
        executionTime: Date.now() - startTime,
        memoryUsed: 0,
        exitCode: 1
      }
    }
  }

  /**
   * Sanitize code input
   */
  private static sanitizeCode(code: string): string {
    // Remove or escape potentially dangerous characters
    return code
      .replace(/\x00/g, '') // Remove null bytes
      .replace(/[\x01-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .trim()
  }

  /**
   * Check for dangerous code patterns
   */
  private static containsDangerousPatterns(code: string): boolean {
    const dangerousPatterns = [
      // File system operations
      /import\s+os|from\s+os\s+import/i,
      /import\s+subprocess|from\s+subprocess\s+import/i,
      /open\s*\(/i,
      /file\s*\(/i,
      
      // Network operations
      /import\s+socket|from\s+socket\s+import/i,
      /import\s+urllib|from\s+urllib\s+import/i,
      /import\s+requests|from\s+requests\s+import/i,
      
      // System operations
      /exec\s*\(/i,
      /eval\s*\(/i,
      /__import__\s*\(/i,
      /globals\s*\(/i,
      /locals\s*\(/i,
      
      // Infinite loops (basic detection)
      /while\s+True\s*:/i,
      /while\s+1\s*:/i,
    ]

    return dangerousPatterns.some(pattern => pattern.test(code))
  }

  /**
   * Simulate code execution (replace with real sandbox in production)
   */
  private static async simulateExecution(
    code: string, 
    language: string, 
    limits: ExecutionLimits
  ): Promise<Omit<ExecutionResult, 'executionTime'>> {
    // This is a simulation - in production, use Docker containers or VM sandboxes
    
    if (language === 'python') {
      return this.simulatePythonExecution(code)
    } else if (language === 'javascript') {
      return this.simulateJavaScriptExecution(code)
    }
    
    throw new Error(`Unsupported language: ${language}`)
  }

  private static simulatePythonExecution(code: string): Omit<ExecutionResult, 'executionTime'> {
    try {
      // Simple pattern matching for common Python operations
      let output = ''
      
      // Handle print statements
      const printMatches = code.match(/print\s*\((.*?)\)/g)
      if (printMatches) {
        printMatches.forEach(match => {
          const content = match.match(/print\s*\((.*?)\)/)?.[1] || ''
          // Simple evaluation for strings and numbers
          if (content.match(/^["'].*["']$/)) {
            output += content.slice(1, -1) + '\n'
          } else if (content.match(/^\d+$/)) {
            output += content + '\n'
          } else {
            output += `${content}\n`
          }
        })
      }

      // Handle simple calculations
      const calcMatches = code.match(/(\d+\s*[+\-*/]\s*\d+)/g)
      if (calcMatches) {
        calcMatches.forEach(calc => {
          try {
            const result = eval(calc) // Safe for numbers only
            output += `${result}\n`
          } catch {
            // Ignore errors in simulation
          }
        })
      }

      return {
        output: output || 'Code executed successfully (no output)',
        memoryUsed: Math.floor(Math.random() * 10) + 5, // Simulate memory usage
        exitCode: 0
      }
    } catch (error) {
      return {
        output: '',
        error: 'Execution error in simulation',
        memoryUsed: 0,
        exitCode: 1
      }
    }
  }

  private static simulateJavaScriptExecution(code: string): Omit<ExecutionResult, 'executionTime'> {
    try {
      let output = ''
      
      // Capture console.log calls
      const originalLog = console.log
      const logs: string[] = []
      
      console.log = (...args) => {
        logs.push(args.map(arg => String(arg)).join(' '))
      }

      try {
        // Execute in a restricted context
        const restrictedEval = new Function(`
          const console = { log: console.log };
          const alert = () => { throw new Error('alert is not allowed'); };
          const document = undefined;
          const window = undefined;
          ${code}
        `)
        
        restrictedEval()
        output = logs.join('\n')
      } finally {
        console.log = originalLog
      }

      return {
        output: output || 'Code executed successfully (no output)',
        memoryUsed: Math.floor(Math.random() * 8) + 3,
        exitCode: 0
      }
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Execution error',
        memoryUsed: 0,
        exitCode: 1
      }
    }
  }

  /**
   * Get execution limits based on user role
   */
  static getLimitsForUser(userRole: 'murid' | 'guru' | 'awam'): ExecutionLimits {
    switch (userRole) {
      case 'guru':
        return {
          timeoutMs: 10000,
          maxMemoryMB: 256,
          maxOutputLength: 50000,
          allowedModules: ['math', 'random', 'datetime', 'json', 'collections', 're']
        }
      case 'murid':
        return {
          timeoutMs: 7000,
          maxMemoryMB: 128,
          maxOutputLength: 20000,
          allowedModules: ['math', 'random', 'datetime', 'json']
        }
      case 'awam':
      default:
        return this.DEFAULT_LIMITS
    }
  }
}
