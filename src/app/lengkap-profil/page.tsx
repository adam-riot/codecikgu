
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

export default function LengkapProfil() {
  const [name, setName] = useState('')
  const [sekolah, setSekolah] = useState('')
  const [tingkatan, setTingkatan] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, sekolah, tingkatan')
        .eq('id', user.id)
        .single()

      if (error) {
        setMessage(error.message)
      } else if (profile) {
        setName(profile.name || '')
        setSekolah(profile.sekolah || '')
        setTingkatan(profile.tingkatan || '')
      }
      setLoading(false)
    }

    fetchProfile()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setMessage('User not logged in.')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ name, sekolah, tingkatan })
      .eq('id', user.id)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Profil berjaya dikemaskini!')
      router.push('/dashboard-murid') // Redirect to dashboard after update
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Lengkapkan Profil Anda</h2>
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nama Penuh:</label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="sekolah" className="block text-gray-700 text-sm font-bold mb-2">Nama Sekolah:</label>
            <input
              type="text"
              id="sekolah"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={sekolah}
              onChange={(e) => setSekolah(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="tingkatan" className="block text-gray-700 text-sm font-bold mb-2">Tingkatan:</label>
            <input
              type="text"
              id="tingkatan"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={tingkatan}
              onChange={(e) => setTingkatan(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            disabled={loading}
          >
            {loading ? 'Mengemaskini...' : 'Kemaskini Profil'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
      </div>
    </div>
  )
}


