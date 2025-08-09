"use client"

import React, { useState } from 'react'

export default function NotaViewer({ title, fileUrl, format }: { title: string; fileUrl: string; format: string }) {
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleMarkComplete = async () => {
    try {
      setLoading(true)
      setMessage('')
      const res = await fetch('/api/activity/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityKey: `note:${title}`,
          activityType: 'reading',
          xp: 50,
          metadata: { title }
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Ralat menanda siap')
        return
      }
      setCompleted(true)
      setMessage(data.duplicate ? 'Anda telah melengkapkan nota ini sebelum ini' : `Selesai! +${data.xpEarned} XP`)
    } catch (e) {
      setMessage('Ralat rangkaian')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl w-full bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <button
          onClick={handleMarkComplete}
          disabled={loading || completed}
          className={`px-4 py-2 rounded-lg text-white ${completed ? 'bg-green-600' : 'bg-electric-blue hover:bg-electric-blue/90'} disabled:opacity-60`}
        >
          {completed ? 'Selesai' : loading ? 'Memproses...' : 'Tanda Siap (+50 XP)'}
        </button>
      </div>
      <div className="text-sm text-gray-400 mb-3">Format: {format?.toUpperCase() || 'PDF'}</div>
      {message && <div className="text-sm text-gray-300 mb-4">{message}</div>}
      <div className="bg-black rounded-lg h-[70vh]">
        <iframe src={fileUrl} className="w-full h-full rounded-lg" />
      </div>
    </div>
  )
}

 