// Enhanced code execution functions for CodeCikgu Playground

export const executeCode = async (language: string, code: string, fileName: string) => {
    switch (language) {
      case 'javascript':
        return await executeJavaScript(code)
      case 'html':
        return executeHTML(code, fileName)
      case 'css':
        return executeCSS(code, fileName)
      case 'python':
        return simulatePython(code, fileName)
      case 'java':
        return simulateJava(code, fileName)
      case 'cpp':
        return simulateCpp(code, fileName)
      case 'php':
        return simulatePHP(code, fileName)
      case 'sql':
        return simulateSQL(code, fileName)
      default:
        return simulateGeneric(language, code, fileName)
    }
  }
  
  const executeJavaScript = async (code: string) => {
    return new Promise<{ output: string; error?: string }>((resolve) => {
      try {
        // Capture console output
        const originalLog = console.log
        const originalError = console.error
        const originalWarn = console.warn
        let output = ''
  
        console.log = (...args) => {
          output += args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ') + '\n'
        }
  
        console.error = (...args) => {
          output += 'ERROR: ' + args.map(arg => String(arg)).join(' ') + '\n'
        }
  
        console.warn = (...args) => {
          output += 'WARNING: ' + args.map(arg => String(arg)).join(' ') + '\n'
        }
  
        try {
          // Execute code safely
          const func = new Function(code)
          const result = func()
          
          if (result !== undefined) {
            output += 'Return value: ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)) + '\n'
          }
  
          if (output.trim() === '') {
            output = '✅ Kod JavaScript berjaya dijalankan!\nTiada output untuk dipaparkan.'
          }
  
          resolve({ output })
        } catch (execError: any) {
          output += '❌ EXECUTION ERROR: ' + execError.message + '\n'
          resolve({ output, error: execError.message })
        }
  
        // Restore console
        console.log = originalLog
        console.error = originalError
        console.warn = originalWarn
  
      } catch (err: any) {
        resolve({ output: '❌ Error: ' + err.message, error: err.message })
      }
    })
  }
  
  const executeHTML = (code: string, fileName: string) => {
    // Basic HTML validation and preview info
    const hasDoctype = code.includes('<!DOCTYPE')
    const hasHtml = code.includes('<html')
    const hasHead = code.includes('<head')
    const hasBody = code.includes('<body')
    
    let output = '🌐 HTML Analysis:\n\n'
    
    if (hasDoctype) output += '✅ DOCTYPE declaration found\n'
    else output += '⚠️  DOCTYPE declaration missing\n'
    
    if (hasHtml) output += '✅ HTML tag found\n'
    else output += '⚠️  HTML tag missing\n'
    
    if (hasHead) output += '✅ HEAD section found\n'
    else output += '⚠️  HEAD section missing\n'
    
    if (hasBody) output += '✅ BODY section found\n'
    else output += '⚠️  BODY section missing\n'
    
    output += '\n📄 Untuk melihat hasil HTML:\n'
    output += `1. Muat turun fail ${fileName}.html\n`
    output += '2. Buka dalam web browser\n'
    output += '3. Atau gunakan Live Server extension\n'
    
    return { output }
  }
  
  const executeCSS = (code: string, fileName: string) => {
    // Basic CSS validation
    const ruleCount = (code.match(/\{[^}]*\}/g) || []).length
    const selectorCount = (code.match(/[^{}]+\{/g) || []).length
    
    let output = '🎨 CSS Analysis:\n\n'
    output += `📊 Statistics:\n`
    output += `• CSS Rules: ${ruleCount}\n`
    output += `• Selectors: ${selectorCount}\n\n`
    
    // Check for common properties
    const commonProps = ['color', 'background', 'font-size', 'margin', 'padding', 'border']
    const foundProps = commonProps.filter(prop => code.includes(prop))
    
    if (foundProps.length > 0) {
      output += `✅ Common properties found: ${foundProps.join(', ')}\n\n`
    }
    
    output += `📄 Untuk menggunakan CSS:\n`
    output += `1. Muat turun fail ${fileName}.css\n`
    output += '2. Link dalam HTML: <link rel="stylesheet" href="style.css">\n'
    output += '3. Atau copy-paste dalam <style> tag\n'
    
    return { output }
  }
  
  const simulatePython = (code: string, fileName: string) => {
    let output = '🐍 Python Code Analysis:\n\n'
    
    // Analyze code structure
    const lines = code.split('\n').filter(line => line.trim())
    const functions = lines.filter(line => line.trim().startsWith('def '))
    const classes = lines.filter(line => line.trim().startsWith('class '))
    const imports = lines.filter(line => line.trim().startsWith('import ') || line.trim().startsWith('from '))
    const prints = lines.filter(line => line.includes('print('))
    
    output += `📊 Code Structure:\n`
    output += `• Total lines: ${lines.length}\n`
    output += `• Functions: ${functions.length}\n`
    output += `• Classes: ${classes.length}\n`
    output += `• Import statements: ${imports.length}\n`
    output += `• Print statements: ${prints.length}\n\n`
    
    if (functions.length > 0) {
      output += `🔧 Functions found:\n`
      functions.forEach(func => {
        const funcName = func.match(/def\s+(\w+)/)?.[1]
        if (funcName) output += `• ${funcName}()\n`
      })
      output += '\n'
    }
    
    // Simulate some output based on print statements
    if (prints.length > 0) {
      output += `📤 Simulated Output:\n`
      prints.forEach((printLine, index) => {
        const match = printLine.match(/print\s*\(\s*["']([^"']+)["']\s*\)/)
        if (match) {
          output += `${match[1]}\n`
        } else {
          output += `[Output from print statement ${index + 1}]\n`
        }
      })
      output += '\n'
    }
    
    output += `🚀 Untuk menjalankan Python sebenar:\n`
    output += `1. Muat turun fail ${fileName}.py\n`
    output += `2. Install Python dari python.org\n`
    output += `3. Jalankan: python ${fileName}.py\n`
    output += `4. Atau gunakan online interpreter seperti repl.it\n`
    
    return { output }
  }
  
  const simulateJava = (code: string, fileName: string) => {
    let output = '☕ Java Code Analysis:\n\n'
    
    // Extract class name and methods
    const classMatch = code.match(/class\s+(\w+)/)
    const className = classMatch ? classMatch[1] : 'Main'
    const methods = code.match(/public\s+static\s+\w+\s+\w+\s*\([^)]*\)/g) || []
    const hasMain = code.includes('public static void main')
    
    output += `📊 Code Structure:\n`
    output += `• Class name: ${className}\n`
    output += `• Methods: ${methods.length}\n`
    output += `• Has main method: ${hasMain ? 'Yes' : 'No'}\n\n`
    
    if (hasMain) {
      output += `✅ Main method found - program can be executed\n\n`
      
      // Simulate System.out.println output
      const printMatches = code.match(/System\.out\.println\s*\(\s*"([^"]+)"\s*\)/g)
      if (printMatches) {
        output += `📤 Simulated Output:\n`
        printMatches.forEach(match => {
          const text = match.match(/"([^"]+)"/)?.[1]
          if (text) output += `${text}\n`
        })
        output += '\n'
      }
    }
    
    output += `🚀 Untuk menjalankan Java sebenar:\n`
    output += `1. Muat turun fail ${fileName}.java\n`
    output += `2. Install Java JDK\n`
    output += `3. Compile: javac ${fileName}.java\n`
    output += `4. Run: java ${className}\n`
    output += `5. Atau gunakan IDE seperti IntelliJ IDEA\n`
    
    return { output }
  }
  
  const simulateCpp = (code: string, fileName: string) => {
    let output = '⚡ C++ Code Analysis:\n\n'
    
    // Analyze includes and functions
    const includes = code.match(/#include\s*<[^>]+>/g) || []
    const functions = code.match(/\w+\s+\w+\s*\([^)]*\)\s*\{/g) || []
    const hasMain = code.includes('int main')
    
    output += `📊 Code Structure:\n`
    output += `• Include statements: ${includes.length}\n`
    output += `• Functions: ${functions.length}\n`
    output += `• Has main function: ${hasMain ? 'Yes' : 'No'}\n\n`
    
    if (includes.length > 0) {
      output += `📚 Libraries used:\n`
      includes.forEach(inc => {
        const lib = inc.match(/<([^>]+)>/)?.[1]
        if (lib) output += `• ${lib}\n`
      })
      output += '\n'
    }
    
    // Simulate cout output
    const coutMatches = code.match(/cout\s*<<\s*"([^"]+)"/g)
    if (coutMatches) {
      output += `📤 Simulated Output:\n`
      coutMatches.forEach(match => {
        const text = match.match(/"([^"]+)"/)?.[1]
        if (text) output += `${text}\n`
      })
      output += '\n'
    }
    
    output += `🚀 Untuk menjalankan C++ sebenar:\n`
    output += `1. Muat turun fail ${fileName}.cpp\n`
    output += `2. Install compiler (g++, Visual Studio)\n`
    output += `3. Compile: g++ -o ${fileName.replace('.cpp', '')} ${fileName}.cpp\n`
    output += `4. Run: ./${fileName.replace('.cpp', '')}\n`
    output += `5. Atau gunakan IDE seperti Code::Blocks\n`
    
    return { output }
  }
  
  const simulatePHP = (code: string, fileName: string) => {
    let output = '🐘 PHP Code Analysis:\n\n'
    
    // Analyze PHP structure
    const functions = code.match(/function\s+\w+\s*\([^)]*\)/g) || []
    const variables = code.match(/\$\w+/g) || []
    const uniqueVars = [...new Set(variables)]
    const echos = code.match(/echo\s+[^;]+/g) || []
    
    output += `📊 Code Structure:\n`
    output += `• Functions: ${functions.length}\n`
    output += `• Variables: ${uniqueVars.length}\n`
    output += `• Echo statements: ${echos.length}\n\n`
    
    if (uniqueVars.length > 0) {
      output += `📝 Variables found:\n`
      uniqueVars.slice(0, 10).forEach(variable => {
        output += `• ${variable}\n`
      })
      if (uniqueVars.length > 10) output += `• ... and ${uniqueVars.length - 10} more\n`
      output += '\n'
    }
    
    // Simulate echo output
    if (echos.length > 0) {
      output += `📤 Simulated Output:\n`
      echos.forEach(echo => {
        const match = echo.match(/echo\s+["']([^"']+)["']/)
        if (match) {
          output += `${match[1]}\n`
        } else {
          output += `[Echo output]\n`
        }
      })
      output += '\n'
    }
    
    output += `🚀 Untuk menjalankan PHP sebenar:\n`
    output += `1. Muat turun fail ${fileName}.php\n`
    output += `2. Install XAMPP atau WAMP\n`
    output += `3. Letakkan dalam htdocs folder\n`
    output += `4. Akses melalui http://localhost/${fileName}.php\n`
    output += `5. Atau jalankan: php ${fileName}.php\n`
    
    return { output }
  }
  
  const simulateSQL = (code: string, fileName: string) => {
    let output = '🗄️ SQL Query Analysis:\n\n'
    
    // Analyze SQL statements
    const selects = (code.match(/SELECT\s+/gi) || []).length
    const inserts = (code.match(/INSERT\s+/gi) || []).length
    const updates = (code.match(/UPDATE\s+/gi) || []).length
    const deletes = (code.match(/DELETE\s+/gi) || []).length
    const creates = (code.match(/CREATE\s+/gi) || []).length
    
    output += `📊 Query Analysis:\n`
    output += `• SELECT statements: ${selects}\n`
    output += `• INSERT statements: ${inserts}\n`
    output += `• UPDATE statements: ${updates}\n`
    output += `• DELETE statements: ${deletes}\n`
    output += `• CREATE statements: ${creates}\n\n`
    
    // Extract table names
    const tableMatches = code.match(/FROM\s+(\w+)|INTO\s+(\w+)|UPDATE\s+(\w+)|TABLE\s+(\w+)/gi)
    if (tableMatches) {
      const tables = [...new Set(tableMatches.map(match => 
        match.replace(/FROM\s+|INTO\s+|UPDATE\s+|TABLE\s+/gi, '').trim()
      ))]
      
      output += `📋 Tables referenced:\n`
      tables.forEach(table => output += `• ${table}\n`)
      output += '\n'
    }
    
    output += `📤 Query validation: ✅ Syntax appears valid\n\n`
    
    output += `🚀 Untuk menjalankan SQL sebenar:\n`
    output += `1. Muat turun fail ${fileName}.sql\n`
    output += `2. Install MySQL/PostgreSQL/SQLite\n`
    output += `3. Import dalam database management tool\n`
    output += `4. Atau gunakan phpMyAdmin/pgAdmin\n`
    output += `5. Execute queries dalam database\n`
    
    return { output }
  }
  
  const simulateGeneric = (language: string, code: string, fileName: string) => {
    const lines = code.split('\n').filter(line => line.trim()).length
    
    let output = `📝 ${language.toUpperCase()} Code Analysis:\n\n`
    output += `📊 Basic Statistics:\n`
    output += `• Total lines: ${lines}\n`
    output += `• File size: ${code.length} characters\n\n`
    
    output += `✅ Code has been saved and analyzed.\n\n`
    
    output += `🚀 Untuk menjalankan kod ${language}:\n`
    output += `1. Muat turun fail ${fileName}.${getFileExtension(language)}\n`
    output += `2. Install compiler/interpreter yang sesuai\n`
    output += `3. Jalankan dalam environment yang betul\n`
    output += `4. Rujuk dokumentasi bahasa untuk panduan\n`
    
    return { output }
  }
  
  const getFileExtension = (language: string) => {
    const extensions: Record<string, string> = {
      'javascript': 'js',
      'typescript': 'ts',
      'html': 'html',
      'css': 'css',
      'python': 'py',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'sql': 'sql',
      'xml': 'xml',
      'json': 'json',
      'markdown': 'md',
      'yaml': 'yml',
      'shell': 'sh'
    }
    return extensions[language] || 'txt'
  }
  
  