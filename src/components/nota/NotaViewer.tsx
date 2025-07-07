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