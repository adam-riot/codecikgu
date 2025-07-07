import { useState } from 'react'
import { supabase } from '@/utils/supabase'

export default function AdminNotaUploader({ onSuccess }: { onSuccess?: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [tingkatan, setTingkatan] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!file || !title || !subject || !tingkatan) {
      setError('Sila lengkapkan semua maklumat dan pilih fail PDF.')
      return
    }
    if (file.type !== 'application/pdf') {
      setError('Hanya fail PDF dibenarkan.')
      return
    }
    setLoading(true)
    try {
      // 1. Upload ke Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${title.replace(/\s+/g, '_')}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage
        .from('notes')
        .upload(fileName, file)
      if (uploadError) throw uploadError

      // 2. Dapatkan public URL
      const { data: publicUrlData } = supabase.storage.from('notes').getPublicUrl(fileName)
      const fileUrl = publicUrlData?.publicUrl
      if (!fileUrl) throw new Error('Gagal dapatkan URL fail.')

      // 3. Simpan metadata ke table notes
      const { error: insertError } = await supabase.from('notes').insert({
        title,
        description,
        subject,
        tingkatan,
        format: 'pdf',
        file_url: fileUrl,
        file_size: file.size.toString(),
      })
      if (insertError) throw insertError

      setSuccess('Nota berjaya dimuat naik!')
      setFile(null)
      setTitle('')
      setDescription('')
      setSubject('')
      setTingkatan('')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message || 'Ralat semasa muat naik.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900 p-6 rounded-xl max-w-lg">
      <h2 className="text-lg font-bold text-white mb-2">Muat Naik Nota (PDF)</h2>
      {error && <div className="text-red-400">{error}</div>}
      {success && <div className="text-green-400">{success}</div>}
      <div>
        <label className="block text-gray-300 mb-1">Tajuk Nota</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-800 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-gray-300 mb-1">Deskripsi (opsyenal)</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-800 text-white"
        />
      </div>
      <div>
        <label className="block text-gray-300 mb-1">Subjek</label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-800 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-gray-300 mb-1">Tingkatan</label>
        <input
          type="text"
          value={tingkatan}
          onChange={e => setTingkatan(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-800 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-gray-300 mb-1">Fail PDF</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="w-full text-white"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        {loading ? 'Memuat naik...' : 'Muat Naik Nota'}
      </button>
    </form>
  )
}