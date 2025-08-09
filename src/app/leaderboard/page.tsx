'use client'

import React, { useEffect, useState } from 'react'

type Row = { user_id: string; name: string; email: string; xp: number }

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all'>('weekly')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/leaderboard?period=${period}`)
      const data = await res.json()
      setRows(data.results || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [period])

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Papan Kedudukan</h1>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
            <option value="all">Sepanjang Masa</option>
          </select>
        </div>

        {loading ? (
          <div className="text-gray-400">Memuatkan...</div>
        ) : (
          <div className="space-y-2">
            {rows.map((r, i) => (
              <div key={r.user_id} className="flex items-center justify-between p-4 bg-gray-800/60 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i===0?'bg-yellow-500 text-black':i===1?'bg-gray-400 text-black':i===2?'bg-orange-600 text-white':'bg-gray-700 text-white'}`}>{i+1}</div>
                  <div>
                    <div className="text-white font-medium">{r.name}</div>
                    <div className="text-xs text-gray-400">{r.email}</div>
                  </div>
                </div>
                <div className="text-yellow-400 font-bold">{r.xp} XP</div>
              </div>
            ))}
            {rows.length === 0 && <div className="text-gray-400">Tiada data untuk tempoh ini.</div>}
          </div>
        )}
      </div>
    </div>
  )
}

