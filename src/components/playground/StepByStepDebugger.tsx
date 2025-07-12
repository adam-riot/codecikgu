'use client'

import React, { useState, useEffect } from 'react'
import { Play, Pause, SkipForward, RotateCcw, Bug, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

interface DebugStep {
  id: string
  line: number
  description: string
  variables: Record<string, any>
  output?: string
  error?: string
  explanation: string
}

interface DebugSession {
  code: string
  language: string
  steps: DebugStep[]
  currentStep: number
  isRunning: boolean
  isCompleted: boolean
}

// Sample debugging scenarios
const debugScenarios = {
  'php-variables': {
    title: 'Debug Pembolehubah PHP',
    description: 'Langkah demi langkah pemprosesan pembolehubah',
    code: `<?php
$nama = "Ahmad";
$umur = 25;
$tinggi = 175.5;

echo "Nama: " . $nama . "\\n";
echo "Umur: " . $umur . " tahun\\n";
echo "Tinggi: " . $tinggi . " cm\\n";

$umur = $umur + 1;
echo "Umur tahun depan: " . $umur;
?>`,
    language: 'php',
    steps: [
      {
        id: 'step1',
        line: 2,
        description: 'Menetapkan pembolehubah $nama',
        variables: { nama: 'Ahmad' },
        explanation: 'Pembolehubah string $nama ditetapkan dengan nilai "Ahmad"'
      },
      {
        id: 'step2',
        line: 3,
        description: 'Menetapkan pembolehubah $umur',
        variables: { nama: 'Ahmad', umur: 25 },
        explanation: 'Pembolehubah integer $umur ditetapkan dengan nilai 25'
      },
      {
        id: 'step3',
        line: 4,
        description: 'Menetapkan pembolehubah $tinggi',
        variables: { nama: 'Ahmad', umur: 25, tinggi: 175.5 },
        explanation: 'Pembolehubah float $tinggi ditetapkan dengan nilai 175.5'
      },
      {
        id: 'step4',
        line: 6,
        description: 'Memaparkan nama',
        variables: { nama: 'Ahmad', umur: 25, tinggi: 175.5 },
        output: 'Nama: Ahmad\n',
        explanation: 'Echo statement menggabungkan string dan memaparkan nama'
      },
      {
        id: 'step5',
        line: 7,
        description: 'Memaparkan umur',
        variables: { nama: 'Ahmad', umur: 25, tinggi: 175.5 },
        output: 'Nama: Ahmad\nUmur: 25 tahun\n',
        explanation: 'Concatenation operator (.) menggabungkan string dengan integer'
      },
      {
        id: 'step6',
        line: 8,
        description: 'Memaparkan tinggi',
        variables: { nama: 'Ahmad', umur: 25, tinggi: 175.5 },
        output: 'Nama: Ahmad\nUmur: 25 tahun\nTinggi: 175.5 cm\n',
        explanation: 'Float value dipaparkan dengan titik perpuluhan'
      },
      {
        id: 'step7',
        line: 10,
        description: 'Mengubah nilai umur',
        variables: { nama: 'Ahmad', umur: 26, tinggi: 175.5 },
        explanation: 'Pembolehubah $umur dikemas kini daripada 25 kepada 26'
      },
      {
        id: 'step8',
        line: 11,
        description: 'Memaparkan umur baru',
        variables: { nama: 'Ahmad', umur: 26, tinggi: 175.5 },
        output: 'Nama: Ahmad\nUmur: 25 tahun\nTinggi: 175.5 cm\nUmur tahun depan: 26',
        explanation: 'Nilai $umur yang telah dikemas kini dipaparkan'
      }
    ]
  },
  'js-loops': {
    title: 'Debug JavaScript Loop',
    description: 'Memahami gelung for dalam JavaScript',
    code: `let total = 0;
for (let i = 1; i <= 5; i++) {
    total += i;
    console.log("i = " + i + ", total = " + total);
}
console.log("Final total: " + total);`,
    language: 'javascript',
    steps: [
      {
        id: 'step1',
        line: 1,
        description: 'Inisialisasi pembolehubah total',
        variables: { total: 0 },
        explanation: 'Pembolehubah total dimulakan dengan nilai 0'
      },
      {
        id: 'step2',
        line: 2,
        description: 'Gelung dimulakan (i = 1)',
        variables: { total: 0, i: 1 },
        explanation: 'Gelung for dimulakan dengan i = 1'
      },
      {
        id: 'step3',
        line: 3,
        description: 'Iterasi 1: Tambah i ke total',
        variables: { total: 1, i: 1 },
        explanation: 'total = 0 + 1 = 1'
      },
      {
        id: 'step4',
        line: 4,
        description: 'Iterasi 1: Papar hasil',
        variables: { total: 1, i: 1 },
        output: 'i = 1, total = 1\n',
        explanation: 'Memaparkan nilai semasa i dan total'
      },
      {
        id: 'step5',
        line: 2,
        description: 'Gelung iterasi 2 (i = 2)',
        variables: { total: 1, i: 2 },
        explanation: 'i dikemas kini kepada 2, syarat i <= 5 masih benar'
      },
      {
        id: 'step6',
        line: 3,
        description: 'Iterasi 2: Tambah i ke total',
        variables: { total: 3, i: 2 },
        explanation: 'total = 1 + 2 = 3'
      },
      {
        id: 'step7',
        line: 4,
        description: 'Iterasi 2: Papar hasil',
        variables: { total: 3, i: 2 },
        output: 'i = 1, total = 1\ni = 2, total = 3\n',
        explanation: 'Output dikumpulkan dari iterasi sebelumnya'
      },
      {
        id: 'step8',
        line: 6,
        description: 'Gelung selesai, papar total akhir',
        variables: { total: 15, i: 6 },
        output: 'i = 1, total = 1\ni = 2, total = 3\ni = 3, total = 6\ni = 4, total = 10\ni = 5, total = 15\nFinal total: 15',
        explanation: 'Gelung selesai apabila i > 5, total akhir adalah 15'
      }
    ]
  }
}

export function StepByStepDebugger() {
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [session, setSession] = useState<DebugSession | null>(null)
  const [showVariables, setShowVariables] = useState(true)
  const [autoPlay, setAutoPlay] = useState(false)
  const [playSpeed, setPlaySpeed] = useState(1000) // milliseconds

  // Auto-play effect
  useEffect(() => {
    if (autoPlay && session && !session.isCompleted && session.isRunning) {
      const timer = setTimeout(() => {
        nextStep()
      }, playSpeed)
      return () => clearTimeout(timer)
    }
  }, [autoPlay, session?.currentStep, session?.isRunning])

  const startDebugging = (scenarioKey: string) => {
    const scenario = debugScenarios[scenarioKey as keyof typeof debugScenarios]
    if (!scenario) return

    setSession({
      code: scenario.code,
      language: scenario.language,
      steps: scenario.steps,
      currentStep: -1, // Start before first step
      isRunning: false,
      isCompleted: false
    })
    setSelectedScenario(scenarioKey)
  }

  const play = () => {
    if (!session) return
    setSession(prev => prev ? { ...prev, isRunning: true } : null)
    if (session.currentStep === -1) {
      nextStep()
    }
  }

  const pause = () => {
    setSession(prev => prev ? { ...prev, isRunning: false } : null)
  }

  const nextStep = () => {
    if (!session || session.isCompleted) return

    const newStep = session.currentStep + 1
    if (newStep >= session.steps.length) {
      setSession(prev => prev ? { 
        ...prev, 
        currentStep: newStep - 1,
        isRunning: false, 
        isCompleted: true 
      } : null)
      setAutoPlay(false)
    } else {
      setSession(prev => prev ? { 
        ...prev, 
        currentStep: newStep 
      } : null)
    }
  }

  const previousStep = () => {
    if (!session || session.currentStep <= 0) return
    setSession(prev => prev ? { 
      ...prev, 
      currentStep: prev.currentStep - 1,
      isCompleted: false 
    } : null)
  }

  const reset = () => {
    if (!session) return
    setSession(prev => prev ? {
      ...prev,
      currentStep: -1,
      isRunning: false,
      isCompleted: false
    } : null)
    setAutoPlay(false)
  }

  const highlightLine = (lineNumber: number) => {
    const currentStep = session?.steps[session.currentStep]
    return currentStep?.line === lineNumber ? 'bg-yellow-400/20 border-l-4 border-yellow-400' : ''
  }

  const formatValue = (value: any) => {
    if (typeof value === 'string') return `"${value}"`
    if (typeof value === 'number') return value.toString()
    if (typeof value === 'boolean') return value.toString()
    return JSON.stringify(value)
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gradient mb-2">Step-by-Step Debugger</h2>
          <p className="text-gray-400">Ikuti pelaksanaan kod langkah demi langkah</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(debugScenarios).map(([key, scenario]) => (
            <div key={key} className="glass-dark rounded-xl p-6 card-hover">
              <div className="flex items-center space-x-3 mb-3">
                <Bug className="w-6 h-6 text-electric-blue" />
                <h3 className="text-xl font-semibold text-white">{scenario.title}</h3>
              </div>
              <p className="text-gray-400 mb-4">{scenario.description}</p>
              <button
                onClick={() => startDebugging(key)}
                className="w-full btn-primary"
              >
                Mula Debug
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const currentStep = session.currentStep >= 0 ? session.steps[session.currentStep] : null
  const scenario = debugScenarios[selectedScenario as keyof typeof debugScenarios]

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{scenario.title}</h2>
          <p className="text-gray-400">{scenario.description}</p>
        </div>
        <button
          onClick={() => setSession(null)}
          className="text-gray-400 hover:text-white"
        >
          Kembali ke Senarai
        </button>
      </div>

      {/* Controls */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={session.isRunning ? pause : play}
              className="flex items-center space-x-2 px-4 py-2 bg-electric-blue text-black rounded-lg hover:bg-electric-blue/80"
            >
              {session.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{session.isRunning ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={nextStep}
              disabled={session.isCompleted}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
            >
              <SkipForward className="w-4 h-4" />
              <span>Langkah</span>
            </button>

            <button
              onClick={reset}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-gray-300">
              <input
                type="checkbox"
                checked={autoPlay}
                onChange={(e) => setAutoPlay(e.target.checked)}
                className="rounded"
              />
              <span>Auto Play</span>
            </label>

            <select
              value={playSpeed}
              onChange={(e) => setPlaySpeed(Number(e.target.value))}
              className="bg-gray-700 text-white rounded px-3 py-1"
            >
              <option value={500}>Fast (0.5s)</option>
              <option value={1000}>Normal (1s)</option>
              <option value={2000}>Slow (2s)</option>
            </select>

            <button
              onClick={() => setShowVariables(!showVariables)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              {showVariables ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>Variables</span>
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Langkah {Math.max(0, session.currentStep + 1)} dari {session.steps.length}</span>
            <span>{session.isCompleted ? 'Selesai' : session.isRunning ? 'Berjalan' : 'Dijeda'}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-electric-blue to-neon-cyan h-2 rounded-full transition-all duration-300"
              style={{ width: `${((session.currentStep + 1) / session.steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code Panel */}
        <div className="lg:col-span-2">
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Kod</h3>
            <div className="bg-black/50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm">
                {session.code.split('\n').map((line, index) => (
                  <div
                    key={index}
                    className={`flex ${highlightLine(index + 1)} px-2 py-1 rounded`}
                  >
                    <span className="text-gray-500 w-8 text-right mr-4">{index + 1}</span>
                    <code className={`${session.language === 'php' ? 'text-purple-300' : 'text-green-300'}`}>
                      {line}
                    </code>
                  </div>
                ))}
              </pre>
            </div>
          </div>

          {/* Output Panel */}
          {currentStep?.output && (
            <div className="glass-dark rounded-xl p-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Output</h3>
              <div className="bg-black/50 rounded-lg p-4">
                <pre className="text-green-300 text-sm whitespace-pre-wrap">
                  {currentStep.output}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* Current Step */}
          {currentStep && (
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Langkah Semasa</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">{currentStep.description}</span>
                </div>
                <p className="text-gray-300 text-sm bg-gray-800/50 p-3 rounded-lg">
                  {currentStep.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Variables */}
          {showVariables && currentStep && (
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Pembolehubah</h3>
              <div className="space-y-2">
                {Object.entries(currentStep.variables).map(([name, value]) => (
                  <div key={name} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                    <span className="text-electric-blue font-mono">${name}</span>
                    <span className="text-green-300 font-mono">{formatValue(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {currentStep?.error && (
            <div className="glass-dark rounded-xl p-6 border border-red-500/30">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-red-400">Ralat</h3>
              </div>
              <p className="text-red-300 text-sm bg-red-900/20 p-3 rounded-lg">
                {currentStep.error}
              </p>
            </div>
          )}

          {/* Completion */}
          {session.isCompleted && (
            <div className="glass-dark rounded-xl p-6 border border-green-500/30">
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-400 mb-2">Debug Selesai!</h3>
                <p className="text-gray-300 text-sm">
                  Anda telah mengikuti semua langkah pelaksanaan kod.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
