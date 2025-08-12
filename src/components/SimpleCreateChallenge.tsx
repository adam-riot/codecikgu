'use client'

import React, { useState } from 'react'

interface SimpleCreateChallengeProps {
  onClose?: () => void
}

export default function SimpleCreateChallenge({ onClose }: SimpleCreateChallengeProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Title input change:', e.target.value)
    setTitle(e.target.value)
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('Description input change:', e.target.value)
    setDescription(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with:', { title, description })
    alert(`Title: ${title}\nDescription: ${description}`)
  }

  console.log('Component render - title:', title, 'description:', description)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🧪 Test Form Input</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Title Input
              </label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type here to test..."
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Current value: &quot;{title}&quot; (length: {title.length})
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Description Input
              </label>
              <textarea
                value={description}
                onChange={handleDescriptionChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type description here..."
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Current value: &quot;{description}&quot; (length: {description.length})
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Test Submit
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setTitle('Test Title')
                  setDescription('Test Description')
                }}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
              >
                Set Test Values
              </button>

              <button
                type="button"
                onClick={() => {
                  setTitle('')
                  setDescription('')
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Clear
              </button>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Debug Info:</h3>
              <p>Title State: {JSON.stringify(title)}</p>
              <p>Description State: {JSON.stringify(description)}</p>
              <p>Component Key: {Date.now()}</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
