'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/utils/supabase'
import { FaCheckCircle } from 'react-icons/fa'
import { Challenge } from '@/types'

interface UploadChallengeProps {
  challenge: Challenge
  onComplete: (submitted: boolean) => void
  onBack: () => void
}

export default function UploadChallenge({ challenge, onComplete, onBack }: UploadChallengeProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return alert('Sila pilih fail.')
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      for (const file of selectedFiles) {
        const filePath = `challenge_submissions/${user.id}/${challenge.id}/${file.name}`
        await supabase.storage.from('challenge-uploads').upload(filePath, file)
      }

      await supabase.from('challenge_submissions').insert({
        challenge_id: challenge.id, user_id: user.id, submission_type: 'upload', status: 'pending'
      })
      setSubmitted(true)
      onComplete(true)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files))
  }

  // Safe access to instructions with type checking
  const getInstructions = (): string => {
    if (!challenge.content) {
      return 'Sila muat naik fail yang diperlukan.';
    }

    const content = challenge.content as { instructions?: string };
    if (typeof content.instructions === 'string') {
      return content.instructions;
    }

    return 'Sila muat naik fail yang diperlukan.';
  };

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Fail Berjaya Dihantar!</h2>
        <button onClick={onBack} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded">Kembali</button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold text-white mb-2">{challenge.title}</h1>
      <p className="text-sm text-gray-300 mb-4">{getInstructions()}</p>
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="mb-4 text-white" 
      />
      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-400">Fail dipilih:</p>
          <ul className="text-sm text-gray-300">
            {selectedFiles.map((file, index) => (
              <li key={index}>• {file.name}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex gap-2">
        <button 
          onClick={handleSubmit} 
          disabled={uploading || selectedFiles.length === 0} 
          className="px-6 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {uploading ? 'Memuat naik...' : 'Hantar'}
        </button>
        <button 
          onClick={onBack} 
          className="px-6 py-2 bg-gray-600 text-white rounded"
        >
          Kembali
        </button>
      </div>
    </div>
  )
}

