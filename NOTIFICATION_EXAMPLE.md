// Example of how to use the notification system in your components

import { useSuccessNotification, useErrorNotification } from '@/components/NotificationProvider'

// In any component:
export default function ExampleComponent() {
  const showSuccess = useSuccessNotification()
  const showError = useErrorNotification()

  const handleSaveData = async () => {
    try {
      // Your save logic here
      await saveData()
      showSuccess(
        'Data Berjaya Disimpan!',
        'Maklumat anda telah dikemas kini dengan jayanya.'
      )
    } catch (error) {
      showError(
        'Ralat Menyimpan Data',
        'Sila cuba lagi atau hubungi sokongan teknikal.'
      )
    }
  }

  const handleCodeExecution = async () => {
    try {
      const result = await executeCode()
      showSuccess(
        'Kod Berjaya Dijalankan!',
        `Output: ${result.output}`
      )
    } catch (error) {
      showError(
        'Ralat Menjalankan Kod',
        'Sila semak kod anda dan cuba lagi.'
      )
    }
  }

  return (
    <div>
      <button onClick={handleSaveData} className="btn-primary">
        Simpan Data
      </button>
      <button onClick={handleCodeExecution} className="btn-secondary">
        Jalankan Kod
      </button>
    </div>
  )
}
