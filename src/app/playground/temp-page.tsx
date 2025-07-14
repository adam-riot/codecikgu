// Temporary Simple Playground for Debugging
// src/app/playground/temp-page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Code, Play, Save } from 'lucide-react'

function SimplePlayground() {
  const [code, setCode] = useState(`# Welcome to CodeCikgu!
print("Hello World!")
print("Selamat datang ke platform coding!")

# Your code here...`)

  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  const runCode = () => {
    setIsRunning(true)
    setOutput('Running code...\n')
    
    setTimeout(() => {
      setOutput(`Hello World!
Selamat datang ke platform coding!

>>> Code executed successfully!
Runtime: 0.05 seconds`)
      setIsRunning(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold">CodeCikgu Playground</h1>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>{isRunning ? 'Running...' : 'Run'}</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg">
          <div className="p-3 border-b border-gray-700">
            <span className="text-sm font-medium">main.py</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-96 bg-gray-900 text-white p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="bg-gray-800 rounded-lg">
          <div className="p-3 border-b border-gray-700">
            <span className="text-sm font-medium">Output</span>
          </div>
          <div className="h-96 bg-black p-4 overflow-y-auto">
            <pre className="text-green-400 text-sm whitespace-pre-wrap">
              {output || 'Click "Run" to execute your code...'}
            </pre>
          </div>
        </div>
      </div>

      {/* Mobile Tips */}
      <div className="mt-4 bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
        <h3 className="font-bold mb-2">📱 Mobile Tips:</h3>
        <ul className="text-sm space-y-1">
          <li>• Rotate your device to landscape for better coding experience</li>
          <li>• Use the quick action buttons for common symbols</li>
          <li>• Swipe between tabs for easier navigation</li>
        </ul>
      </div>
    </div>
  )
}

export default function TempPlaygroundPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading CodeCikgu...</p>
        </div>
      </div>
    )
  }

  return <SimplePlayground />
}
