'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/utils/supabase'
import { Upload, File, CheckCircle, X, Download, Eye, Clock, Award } from 'lucide-react'

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

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  const isFileTypeAllowed = (file: File) => {
    const extension = getFileExtension(file.name)
    return allowedTypes.includes(extension)
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
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!isFileTypeAllowed(file)) {
        alert(`Jenis fail ${getFileExtension(file.name)} tidak dibenarkan`)
        return false
      }
      if (file.size > maxFileSize) {
        alert(`Fail ${file.name} terlalu besar. Maksimum: ${formatFileSize(maxFileSize)}`)
        return false
      }
      return true
    })

    setSelectedFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = getFileExtension(file.name)
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `challenge-submissions/${fileName}`

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        onUploadProgress: (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: (progress.loaded / progress.total) * 100
          }))
        }
      })

    if (error) throw error
    return filePath
  }

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      alert('Sila pilih sekurang-kurangnya satu fail untuk dimuat naik')
      return
    }

    setUploading(true)

    try {
      // Upload all files
      const uploadPromises = selectedFiles.map(uploadFile)
      const filePaths = await Promise.all(uploadPromises)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Save submission to database
      const { error: submissionError } = await supabase
        .from('challenge_submissions')
        .insert({
          challenge_id: challenge.id,
          user_id: user.id,
          submission_type: 'upload',
          submission_data: {
            files: selectedFiles.map((file, index) => ({
              name: file.name,
              size: file.size,
              type: file.type,
              path: filePaths[index]
            })),
            notes: submissionNotes
          },
          status: 'pending'
        })

      if (submissionError) throw submissionError

      setSubmitted(true)
      onComplete(true)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Ralat semasa memuat naik. Sila cuba lagi.')
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (filename: string) => {
    const ext = getFileExtension(filename)
    switch (ext) {
      case 'pdf': return '📄'
      case 'doc':
      case 'docx': return '📝'
      case 'txt': return '📃'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️'
      case 'zip':
      case 'rar': return '📦'
      case 'mp4':
      case 'avi':
      case 'mov': return '🎥'
      case 'mp3':
      case 'wav': return '🎵'
      default: return '📁'
    }
  }

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-neon-green to-electric-blue rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gradient-green mb-4">
            Fail Berjaya Dihantar!
          </h1>
          
          <p className="text-gray-300 text-lg mb-6">
            Terima kasih! Fail anda telah dihantar dan sedang menunggu semakan.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-gradient mb-1">{selectedFiles.length}</div>
              <div className="text-gray-400 text-sm">Fail Dihantar</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-gradient mb-1">
                {formatFileSize(selectedFiles.reduce((total, file) => total + file.size, 0))}
              </div>
              <div className="text-gray-400 text-sm">Jumlah Saiz</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-gradient mb-1">{challenge.xp_reward}</div>
              <div className="text-gray-400 text-sm">XP Menunggu</div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-8">
            <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Status Semakan
            </h3>
            <p className="text-blue-200 text-sm">
              Fail anda sedang dalam proses semakan oleh pengajar. Anda akan menerima notifikasi 
              apabila semakan selesai dan markah telah diberikan.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
            >
              Kembali ke Senarai
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Upload Header */}
      <div className="glass-dark rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gradient mb-2">{challenge.title}</h1>
            <p className="text-gray-300">{challenge.description}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient">{selectedFiles.length}</div>
              <div className="text-gray-400 text-sm">Fail Dipilih</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient">{challenge.xp_reward}</div>
              <div className="text-gray-400 text-sm">XP</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructions */}
          <div className="glass-dark rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <File className="w-6 h-6" />
              Arahan Tugasan
            </h2>
            <div 
              className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: challenge.content.instructions.replace(/\n/g, '<br />') 
              }}
            />
          </div>

          {/* File Upload Area */}
          <div className="glass-dark rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Muat Naik Fail
            </h2>

            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-electric-blue bg-electric-blue/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Seret fail ke sini atau klik untuk pilih
              </h3>
              <p className="text-gray-400 mb-4">
                Jenis fail yang dibenarkan: {allowedTypes.join(', ').toUpperCase()}
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Saiz maksimum: {formatFileSize(maxFileSize)}
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-gradient-to-r from-electric-blue to-neon-cyan text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
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
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-white mb-4">Fail Dipilih ({selectedFiles.length})</h3>
                <div className="space-y-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="glass rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFileIcon(file.name)}</span>
                        <div>
                          <div className="font-medium text-white">{file.name}</div>
                          <div className="text-sm text-gray-400">
                            {formatFileSize(file.size)} • {getFileExtension(file.name).toUpperCase()}
                          </div>
                          {uploadProgress[file.name] && (
                            <div className="w-32 bg-gray-600 rounded-full h-2 mt-1">
                              <div 
                                className="bg-electric-blue h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress[file.name]}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeFile(index)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        disabled={uploading}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submission Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nota Tambahan (Pilihan)
              </label>
              <textarea
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Tambah sebarang nota atau penjelasan untuk tugasan ini..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-electric-blue focus:outline-none resize-none"
                rows={4}
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-neon-green to-electric-blue text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Memuat naik...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Hantar Tugasan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Upload Info */}
        <div className="space-y-6">
          {/* File Requirements */}
          <div className="glass-dark rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Keperluan Fail
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Jenis dibenarkan:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {allowedTypes.map(type => (
                    <span key={type} className="px-2 py-1 bg-electric-blue/20 text-electric-blue rounded text-xs">
                      .{type.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Saiz maksimum:</span>
                <span className="text-white font-medium">{formatFileSize(maxFileSize)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Bilangan fail:</span>
                <span className="text-white font-medium">Tanpa had</span>
              </div>
            </div>
          </div>

          {/* Upload Tips */}
          <div className="glass-dark rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Tips Muat Naik
            </h3>
            
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• Pastikan fail dalam format yang betul</li>
              <li>• Periksa saiz fail sebelum muat naik</li>
              <li>• Beri nama fail yang jelas dan mudah faham</li>
              <li>• Tambah nota jika perlu penjelasan tambahan</li>
              <li>• Pastikan sambungan internet stabil</li>
            </ul>
          </div>

          {/* Submission Status */}
          <div className="glass-dark rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Proses Semakan
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-electric-blue rounded-full"></div>
                <span className="text-gray-300">1. Hantar tugasan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <span className="text-gray-400">2. Semakan pengajar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <span className="text-gray-400">3. Markah diberikan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <span className="text-gray-400">4. XP dikreditkan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
