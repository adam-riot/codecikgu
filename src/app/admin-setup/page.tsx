'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'

export default function AdminSetupPage() {
  const [email, setEmail] = useState('adamsofi@codecikgu.com')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const makeUserAdmin = async () => {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      // First check if user exists in profiles
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Database error: ${checkError.message}`)
      }

      if (existingUser) {
        console.log(`User found: ${existingUser.email} (current role: ${existingUser.role})`)
        
        if (existingUser.role === 'admin') {
          setMessage(`✅ User ${email} is already an admin!`)
          return
        }
        
        // Update existing user to admin role
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)

        if (updateError) {
          throw new Error(`Failed to update user role: ${updateError.message}`)
        }

        setMessage(`✅ User ${email} is now an admin!`)
      } else {
        // Create new admin user
        const { data: newUser, error: insertError } = await supabase
          .from('profiles')
          .insert({
            email: email,
            role: 'admin',
            name: email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (insertError) {
          throw new Error(`Failed to create admin user: ${insertError.message}`)
        }

        setMessage(`✅ Admin user ${email} created successfully!`)
      }
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 border border-white/20">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            🔧 Admin Setup
          </h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>
            
            <button
              onClick={makeUserAdmin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
            >
              {loading ? '🔄 Processing...' : '🚀 Make User Admin'}
            </button>
            
            {message && (
              <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-md">
                <p className="text-green-400 text-sm">{message}</p>
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              This page allows you to create or update admin users.
              <br />
              Use with caution in production environments.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
