'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/utils/supabase'
import { FaUpload, FaFile, FaCheckCircle, FaTimes, FaDownload, FaEye, FaClock, FaTrophy } from 'react-icons/fa'

interface Challenge {
  id: string
  title: string
  description: string
  xp_reward: number
  content: {
    instructions: string
    allowed_file_types: string[]
    max_file_size: number
  }
}

interface UploadChallengeProps {
  challenge: Challenge
  onComplete: (submitted: boolean) => void
  onBack: () => void
}

export default function UploadChallenge({ challenge, onComplete, onBack }: UploadChallengeProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [submissionNotes, setSubmissionNotes] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxFileSize = challenge.content.max_file_size || 10 * 1024 * 1024 // 10MB default
  const allowedTypes = challenge.content.allowed_file_types || ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png']

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isFileTypeAllowed = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    return extension && allowedTypes.includes(extension)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!isFileTypeAllowed(file)) {
        alert(`File ${file.name} tidak dibenarkan. Jenis file yang dibenarkan: ${allowedTypes.join(', ')}`)
        return false
      }
      if (file.size > maxFileSize) {
        alert(`File ${file.name} terlalu besar. Saiz maksimum: ${formatFileSize(maxFileSize)}`)
        return false
      }
      return true
    })

    setSelectedFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      alert('Sila pilih sekurang-kurangnya satu file untuk dimuat naik.')
      return
    }

    setUploading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const uploadedFiles = []
      
      for (const file of selectedFiles) {
        const fileName = `${Date.now()}_${file.name}`
        const filePath = `challenge_submissions/${user.id}/${challenge.id}/${fileName}`
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        
        const { data, error } = await supabase.storage
          .from('challenge-uploads')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) throw error
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        uploadedFiles.push({
          name: file.name,
          path: data.path,
          size: file.size,
          type: file.type
        })
      }

      // Submit to database
      await supabase.from('challenge_submissions').insert({
        challenge_id: challenge.id,
        user_id: user.id,
        submission_type: 'upload',
        submission_data: {
          files: uploadedFiles,
          notes: submissionNotes
        },
        status: 'pending'
      })

      setSubmitted(true)
      onComplete(true)
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Ralat semasa memuat naik file. Sila cuba lagi.')
    } finally {
      setUploading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Fail Berjaya Dihantar!</h2>
          <p className="text-gray-300 mb-6">
            Submission anda telah diterima dan sedang menunggu semakan.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {selectedFiles.length}
              </div>
              <div className="text-sm text-gray-400">Fail Dihantar</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                Pending
              </div>
              <div className="text-sm text-gray-400">Status</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {challenge.xp_reward}
              </div>
              <div className="text-sm text-gray-400">XP (Selepas Semakan)</div>
            </div>
          </div>

          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            Kembali ke Senarai
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white mb-2">{challenge.title}</h1>
          <p className="text-gray-400 mb-4">{challenge.description}</p>
          
          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="font-semibold text-blue-400 mb-2">Arahan:</h3>
            <p className="text-gray-300 text-sm whitespace-pre-line">
              {challenge.content.instructions}
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FaUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Seret dan lepas fail di sini
            </h3>
            <p className="text-gray-400 mb-4">atau</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Pilih Fail
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept={allowedTypes.map(type => `.${type}`).join(',')}
            />
            
            <div className="mt-4 text-sm text-gray-400">
              <p>Jenis fail yang dibenarkan: {allowedTypes.join(', ')}</p>
              <p>Saiz maksimum: {formatFileSize(maxFileSize)}</p>
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-white mb-3">Fail Dipilih:</h3>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <FaFile className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="font-medium text-white">{file.name}</div>
                        <div className="text-sm text-gray-400">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {uploadProgress[file.name] !== undefined && (
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[file.name]}%` }}
                          />
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        disabled={uploading}
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submission Notes */}
          <div className="mt-6">
            <label className="block font-medium text-white mb-2">
              Nota Tambahan (Pilihan):
            </label>
            <textarea
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Tambah sebarang nota atau penjelasan untuk submission anda..."
              className="w-full h-24 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              disabled={uploading}
            />
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
              disabled={uploading}
            >
              Kembali
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedFiles.length === 0 || uploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {uploading ? 'Memuat naik...' : 'Hantar Submission'}
            </button>
          </div>
        </div>

        {/* File Requirements */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/30">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">Keperluan Fail</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Jenis fail: {allowedTypes.join(', ')}</li>
                <li>• Saiz maksimum: {formatFileSize(maxFileSize)}</li>
                <li>• Boleh upload multiple files</li>
                <li>• Pastikan fail tidak rosak</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">Proses Semakan</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Submission akan disemak secara manual</li>
                <li>• XP akan diberikan selepas semakan</li>
                <li>• Anda akan menerima notifikasi hasil</li>
                <li>• Boleh resubmit jika diperlukan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
