import { supabase } from '@/utils/supabase'
import NotaViewer from '@/components/nota/NotaViewer'

export default async function NotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  try {
    const { data: nota, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !nota) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-red-400 text-lg">Nota tidak dijumpai.</div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-8">
        <NotaViewer
          title={nota.title}
          fileUrl={nota.file_url}
          format={nota.format}
        />
      </div>
    )
  } catch (error) {
    console.error('Error loading nota:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-400 text-lg">Ralat memuat nota.</div>
      </div>
    )
  }
}