'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, ArrowLeft, ArrowRight, Play, CheckCircle } from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface TutorialStep {
  id: string
  title: string
  content: string
  target?: string // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: () => void
  code?: string
  language?: string
}

interface Tutorial {
  id: string
  title: string
  description: string
  steps: TutorialStep[]
  category: 'playground' | 'dashboard' | 'general'
}

// Predefined tutorials
const tutorials: Tutorial[] = [
  {
    id: 'playground-basics',
    title: 'Playground Asas',
    description: 'Belajar menggunakan playground untuk menulis dan menjalankan kod',
    category: 'playground',
    steps: [
      {
        id: 'welcome',
        title: 'Selamat Datang ke Playground!',
        content: 'Playground adalah tempat anda boleh menulis, menguji, dan menjalankan kod. Mari kita mulakan tutorial asas!',
        target: '.playground-container'
      },
      {
        id: 'editor',
        title: 'Editor Kod',
        content: 'Ini adalah editor kod tempat anda menulis program. Ia menyokong pelbagai bahasa pengaturcaraan.',
        target: '.monaco-editor',
        position: 'right'
      },
      {
        id: 'run-code',
        title: 'Menjalankan Kod',
        content: 'Klik butang "Jalankan" atau tekan F9 untuk menjalankan kod anda. Hasil akan dipaparkan di panel output.',
        target: '[data-testid="run-button"]',
        position: 'bottom'
      },
      {
        id: 'save',
        title: 'Menyimpan Kerja',
        content: 'Kod anda akan disimpan secara automatik setiap 5 saat. Anda juga boleh tekan Ctrl+S untuk simpan manual.',
        target: '[data-testid="save-button"]',
        position: 'bottom'
      },
      {
        id: 'new-tab',
        title: 'Tab Baru',
        content: 'Anda boleh mencipta tab baru untuk projek yang berbeza. Tekan Ctrl+N atau klik butang "+" ini.',
        target: '[data-testid="new-tab-button"]',
        position: 'bottom'
      }
    ]
  },
  {
    id: 'dashboard-overview',
    title: 'Dashboard Murid',
    description: 'Mengenali dashboard dan ciri-ciri yang tersedia',
    category: 'dashboard',
    steps: [
      {
        id: 'stats',
        title: 'Statistik Pembelajaran',
        content: 'Di sini anda boleh melihat kemajuan pembelajaran termasuk XP, cabaran selesai, dan skor purata.',
        target: '.stats-section',
        position: 'bottom'
      },
      {
        id: 'challenges',
        title: 'Cabaran Tersedia',
        content: 'Lihat semua cabaran yang boleh anda cuba. Setiap cabaran memberikan XP dan badge pencapaian.',
        target: '.challenges-grid',
        position: 'top'
      },
      {
        id: 'leaderboard',
        title: 'Papan Pendahulu',
        content: 'Bandingkan pencapaian anda dengan murid lain dan tingkatkan ranking anda!',
        target: '[href="/leaderboard"]',
        position: 'bottom'
      }
    ]
  }
]

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([])
  const { addNotification } = useNotifications()

  useEffect(() => {
    // Load completed tutorials from localStorage
    const completed = localStorage.getItem('codecikgu-completed-tutorials')
    if (completed) {
      setCompletedTutorials(JSON.parse(completed))
    }
  }, [])

  const startTutorial = (tutorialId: string) => {
    const tutorial = tutorials.find(t => t.id === tutorialId)
    if (tutorial) {
      setActiveTutorial(tutorial)
      setCurrentStep(0)
      setIsVisible(true)
    }
  }

  const nextStep = () => {
    if (activeTutorial && currentStep < activeTutorial.steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      completeTutorial()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const completeTutorial = () => {
    if (activeTutorial) {
      const newCompleted = [...completedTutorials, activeTutorial.id]
      setCompletedTutorials(newCompleted)
      localStorage.setItem('codecikgu-completed-tutorials', JSON.stringify(newCompleted))
      addNotification({
        type: 'success',
        title: 'Tutorial Selesai!',
        message: `Anda telah menyelesaikan tutorial "${activeTutorial.title}"`
      })
    }
    closeTutorial()
  }

  const closeTutorial = () => {
    setIsVisible(false)
    setActiveTutorial(null)
    setCurrentStep(0)
  }

  return (
    <TutorialContext.Provider value={{
      startTutorial,
      completedTutorials,
      tutorials
    }}>
      {children}
      {isVisible && activeTutorial && (
        <TutorialOverlay
          tutorial={activeTutorial}
          currentStep={currentStep}
          onNext={nextStep}
          onPrev={prevStep}
          onClose={closeTutorial}
        />
      )}
    </TutorialContext.Provider>
  )
}

// Tutorial context
const TutorialContext = React.createContext<{
  startTutorial: (id: string) => void
  completedTutorials: string[]
  tutorials: Tutorial[]
} | null>(null)

export function useTutorial() {
  const context = React.useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider')
  }
  return context
}

// Tutorial overlay component
function TutorialOverlay({
  tutorial,
  currentStep,
  onNext,
  onPrev,
  onClose
}: {
  tutorial: Tutorial
  currentStep: number
  onNext: () => void
  onPrev: () => void
  onClose: () => void
}) {
  const step = tutorial.steps[currentStep]
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Highlight target element
    if (step.target) {
      const element = document.querySelector(step.target)
      if (element) {
        element.classList.add('tutorial-highlight')
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    return () => {
      // Remove highlight from all elements
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight')
      })
    }
  }, [step])

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
      
      {/* Tutorial card */}
      <div 
        ref={overlayRef}
        className="fixed z-[60] bg-gradient-to-br from-gray-900 to-black border border-electric-blue/30 rounded-xl p-6 max-w-md shadow-2xl"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gradient">{step.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-300 leading-relaxed">{step.content}</p>
          
          {step.code && (
            <div className="mt-4 p-4 bg-black/50 rounded-lg border border-gray-700">
              <pre className="text-sm text-green-400 overflow-x-auto">
                <code>{step.code}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Langkah {currentStep + 1} dari {tutorial.steps.length}</span>
            <span>{Math.round(((currentStep + 1) / tutorial.steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-electric-blue to-neon-cyan h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorial.steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sebelum</span>
          </button>

          <button
            onClick={onNext}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-electric-blue to-neon-cyan text-black font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            {currentStep === tutorial.steps.length - 1 ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Selesai</span>
              </>
            ) : (
              <>
                <span>Seterusnya</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

// Tutorial selector component
export function TutorialSelector() {
  const { startTutorial, completedTutorials, tutorials } = useTutorial()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-all"
      >
        <Play className="w-4 h-4" />
        <span>Tutorial</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-20 min-w-64">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Tutorial Tersedia</h3>
              <div className="space-y-2">
                {tutorials.map(tutorial => (
                  <button
                    key={tutorial.id}
                    onClick={() => {
                      startTutorial(tutorial.id)
                      setIsOpen(false)
                    }}
                    className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-600"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{tutorial.title}</h4>
                        <p className="text-sm text-gray-400">{tutorial.description}</p>
                      </div>
                      {completedTutorials.includes(tutorial.id) && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
