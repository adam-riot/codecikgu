// src/components/CreateChallenge.tsx - Minimal version without problematic fields
import { useState } from 'react';
import { supabase } from '@/utils/supabase';

interface CreateChallengeProps {
  onClose: () => void;
  onChallengeCreated: () => void;
}

// Define types for our data structures
interface QuizQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
}

interface ChallengeData {
  title: string;
  description: string;
  subject: string;
  tingkatan: string;
  xp_reward: number;
  video_url?: string;
  text_content?: string;
  allowed_file_types?: string[];
  max_file_size?: number;
}

export default function CreateChallenge({ onClose, onChallengeCreated }: CreateChallengeProps) {
  const [step, setStep] = useState(1);
  const [challengeType, setChallengeType] = useState<'quiz' | 'video' | 'reading' | 'upload'>('quiz');
  const [challengeData, setChallengeData] = useState<ChallengeData>({
    title: '',
    description: '',
    subject: '',
    tingkatan: '',
    xp_reward: 0,
  });
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleAddQuestion = () => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setQuizQuestions([...quizQuestions, { 
      id: tempId,
      question_text: '', 
      options: ['', '', '', ''], 
      correct_answer: '' 
    }]);
  };

  const handleUpdateQuestion = (index: number, field: string, value: string | [number, string]) => {
    const updatedQuestions = [...quizQuestions];
    if (field === 'options') {
      if (Array.isArray(value)) {
        const [optionIndex, optionValue] = value;
        updatedQuestions[index].options[optionIndex] = optionValue;
      }
    } else if (field === 'question_text') {
      updatedQuestions[index].question_text = value as string;
    } else if (field === 'correct_answer') {
      updatedQuestions[index].correct_answer = value as string;
    }
    setQuizQuestions(updatedQuestions);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simplified data structure - only include fields that definitely exist
      const challengeToInsert = {
        title: challengeData.title,
        description: challengeData.description,
        type: challengeType,
        subject: challengeData.subject,
        tingkatan: challengeData.tingkatan,
        xp_reward: challengeData.xp_reward,
        is_active: true,
        // Only include content if it's not empty
        ...(challengeType === 'quiz' && quizQuestions.length > 0 && {
          content: { questions: quizQuestions }
        }),
        ...(challengeType === 'video' && challengeData.video_url && {
          content: { video_url: challengeData.video_url }
        }),
        ...(challengeType === 'reading' && challengeData.text_content && {
          content: { text_content: challengeData.text_content }
        }),
        ...(challengeType === 'upload' && {
          content: { 
            allowed_file_types: challengeData.allowed_file_types || ['pdf', 'docx', 'jpg', 'png'],
            max_file_size: challengeData.max_file_size || 10485760 // 10MB default
          }
        })
      };

      console.log('Attempting to insert challenge:', challengeToInsert);

      const { data, error } = await supabase
        .from('challenges')
        .insert([challengeToInsert])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Challenge created successfully:', data);
      alert('Cabaran berjaya dicipta!');
      onChallengeCreated();
      onClose();
    } catch (error: unknown) {
      console.error('Error creating challenge:', error);
      // Proper error handling with type checking
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      alert(`Gagal mencipta cabaran: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-4xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">&times;</button>
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Wizard Cipta Cabaran</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Langkah 1: Maklumat Asas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Tajuk Cabaran</label>
                  <input 
                    type="text" 
                    value={challengeData.title} 
                    onChange={e => setChallengeData({ ...challengeData, title: e.target.value })} 
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Jenis Cabaran</label>
                  <select 
                    value={challengeType} 
                    onChange={e => setChallengeType(e.target.value as 'quiz' | 'video' | 'reading' | 'upload')} 
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" 
                    required
                  >
                    <option value="quiz">Kuiz (MCQ)</option>
                    <option value="video">Video</option>
                    <option value="reading">Bacaan</option>
                    <option value="upload">Muat Naik Fail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Subjek</label>
                  <input 
                    type="text" 
                    value={challengeData.subject} 
                    onChange={e => setChallengeData({ ...challengeData, subject: e.target.value })} 
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Tingkatan</label>
                  <input 
                    type="text" 
                    value={challengeData.tingkatan} 
                    onChange={e => setChallengeData({ ...challengeData, tingkatan: e.target.value })} 
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Ganjaran XP</label>
                  <input 
                    type="number" 
                    value={challengeData.xp_reward} 
                    onChange={e => setChallengeData({ ...challengeData, xp_reward: parseInt(e.target.value) || 0 })} 
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" 
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Deskripsi</label>
                <textarea 
                  value={challengeData.description} 
                  onChange={e => setChallengeData({ ...challengeData, description: e.target.value })} 
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" 
                  rows={3} 
                  required
                />
              </div>
              <div className="flex justify-end mt-6">
                <button type="button" onClick={handleNext} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
                  Seterusnya
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Langkah 2: Kandungan Cabaran</h3>
              
              {challengeType === 'quiz' && (
                <div className="space-y-4">
                  {quizQuestions.map((q, qIndex) => (
                    <div key={q.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <label className="block text-gray-300 text-sm font-medium mb-1">Soalan {qIndex + 1}</label>
                      <input 
                        type="text" 
                        value={q.question_text} 
                        onChange={e => handleUpdateQuestion(qIndex, 'question_text', e.target.value)} 
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg mb-2 text-white" 
                        required 
                      />
                      
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {q.options.map((opt: string, optIndex: number) => (
                          <input 
                            key={optIndex} 
                            type="text" 
                            value={opt} 
                            onChange={e => handleUpdateQuestion(qIndex, 'options', [optIndex, e.target.value])} 
                            className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white" 
                            placeholder={`Pilihan ${optIndex + 1}`} 
                            required 
                          />
                        ))}
                      </div>
                      <label className="block text-gray-300 text-sm font-medium mb-1">Jawapan Betul</label>
                      <select 
                        value={q.correct_answer} 
                        onChange={e => handleUpdateQuestion(qIndex, 'correct_answer', e.target.value)} 
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white" 
                        required
                      >
                        <option value="">Pilih Jawapan Betul</option>
                        {q.options.map((opt: string, optIndex: number) => (
                          <option key={optIndex} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveQuestion(qIndex)} 
                        className="mt-2 bg-red-600 px-3 py-1 rounded-lg text-sm text-white hover:bg-red-700"
                      >
                        Buang Soalan
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={handleAddQuestion} 
                    className="bg-blue-600 px-4 py-2 rounded-lg text-white hover:bg-blue-700"
                  >
                    Tambah Soalan
                  </button>
                </div>
              )}

              {challengeType === 'video' && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">URL Video (YouTube/Vimeo)</label>
                  <input 
                    type="text" 
                    value={challengeData.video_url || ''} 
                    onChange={e => setChallengeData({ ...challengeData, video_url: e.target.value })} 
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" 
                    required 
                  />
                </div>
              )}

              {challengeType === 'reading' && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Kandungan Bacaan</label>
                  <textarea 
                    value={challengeData.text_content || ''} 
                    onChange={e => setChallengeData({ ...challengeData, text_content: e.target.value })} 
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" 
                    rows={10} 
                    required
                  />
                </div>
              )}

              {challengeType === 'upload' && (
                <div>
                  <p className="text-gray-300">Cabaran muat naik fail akan dicipta dengan tetapan default.</p>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button type="button" onClick={handleBack} className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700">
                  Kembali
                </button>
                <button type="button" onClick={handleNext} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
                  Seterusnya
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Langkah 3: Semak & Cipta</h3>
              <div className="bg-gray-800 p-6 rounded-lg space-y-3 text-white">
                <p><strong>Tajuk:</strong> {challengeData.title}</p>
                <p><strong>Deskripsi:</strong> {challengeData.description}</p>
                <p><strong>Jenis:</strong> {challengeType}</p>
                <p><strong>Subjek:</strong> {challengeData.subject}</p>
                <p><strong>Tingkatan:</strong> {challengeData.tingkatan}</p>
                <p><strong>Ganjaran XP:</strong> {challengeData.xp_reward}</p>
                
                {challengeType === 'quiz' && (
                  <p><strong>Soalan Kuiz:</strong> {quizQuestions.length} soalan</p>
                )}
                {challengeType === 'video' && (
                  <p><strong>URL Video:</strong> {challengeData.video_url}</p>
                )}
                {challengeType === 'reading' && (
                  <p><strong>Kandungan Bacaan:</strong> {challengeData.text_content?.substring(0, 100)}...</p>
                )}
              </div>
              <div className="flex justify-between mt-6">
                <button type="button" onClick={handleBack} className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700">
                  Kembali
                </button>
                <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 hover:bg-green-700">
                  {loading ? 'Mencipta...' : 'Cipta Cabaran'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

