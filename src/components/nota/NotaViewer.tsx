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

import React from 'react'
import Link from 'next/link'

interface NotaViewerProps {
  title: string
  fileUrl: string
  format?: string
}

export default function NotaViewer({ title, fileUrl, format = 'pdf' }: NotaViewerProps) {
  if (!fileUrl) {
    return <div className="text-red-400">Nota tidak dijumpai.</div>
  }

  return (
    <div className="w-full flex flex-col items-center">
      <Link
        href="/nota/tingkatan-4"
        className="mb-4 text-electric-blue hover:underline self-start"
      >
        ← Kembali ke Senarai Nota
      </Link>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {format === 'pdf' ? (
        <iframe
          src={fileUrl}
          width="100%"
          height="600px"
          style={{ border: 'none' }}
          title={title}
          className="rounded shadow bg-white"
        />
      ) : (
        <div className="text-gray-400">Format tidak disokong untuk preview.</div>
      )}
      <a
        href={fileUrl}
        download
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Muat Turun PDF
      </a>
    </div>
  )
}