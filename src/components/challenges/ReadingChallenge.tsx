'use client'

import { useState, useEffect, useRef } from 'react'
import { FaCheckCircle } from 'react-icons/fa'
import { Challenge } from '@/types'

interface ReadingChallengeProps {
  challenge: Challenge
  onComplete: (readPercentage: number, passed: boolean) => void
  onBack: () => void
}

export default function ReadingChallenge({ challenge, onComplete, onBack }: ReadingChallengeProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [readPercentage, setReadPercentage] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const element = contentRef.current
      if (!element) return
      const percentage = Math.min(100, (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100)
      setReadPercentage(percentage)
      if (percentage >= 95 && !isCompleted) {
        setIsCompleted(true)
        onComplete(percentage, true)
      }
    }
    const element = contentRef.current
    element?.addEventListener('scroll', handleScroll)
    return () => element?.removeEventListener('scroll', handleScroll)
  }, [isCompleted, onComplete])

  // Safe access to challenge.content with proper type checking
  const getContentHtml = (): string => {
    if (!challenge.content) {
      return 'Tiada kandungan tersedia.';
    }

    // Check for text_content first
    if (typeof challenge.content.text_content === 'string') {
      return challenge.content.text_content.replace(/\n/g, '<br />');
    }

    // Check for content property
    const content = challenge.content as { content?: string };
    if (typeof content.content === 'string') {
      return content.content.replace(/\n/g, '<br />');
    }

    return 'Tiada kandungan tersedia.';
  };

  const contentHtml = getContentHtml();

  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Bacaan Selesai!</h2>
        <button onClick={onBack} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded">Kembali</button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold text-white mb-2">{challenge.title}</h1>
      <div 
        ref={contentRef} 
        className="h-96 overflow-y-auto p-4 bg-gray-800 rounded text-white" 
        dangerouslySetInnerHTML={{ __html: contentHtml }} 
      />
      <div className="mt-2 text-sm text-gray-400">Kemajuan: {Math.round(readPercentage)}%</div>
      <button onClick={onBack} className="mt-4 px-6 py-2 bg-gray-600 text-white rounded">Kembali</button>
    </div>
  )
}

