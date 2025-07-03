// src/components/CreateChallenge.tsx
import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Challenge, Question, ChallengeContent, ChallengePassCriteria } from '@/types'; // Import interfaces

interface CreateChallengeProps {
  onClose: () => void;
  onChallengeCreated: () => void;
}

export default function CreateChallenge({ onClose, onChallengeCreated }: CreateChallengeProps) {
  const [step, setStep] = useState(1);
  const [challengeType, setChallengeType] = useState<'quiz' | 'video' | 'reading' | 'upload'>('quiz');
  const [challengeData, setChallengeData] = useState<Partial<Challenge>>({
    title: '',
    description: '',
    subject: '',
    tingkatan: '',
    xp_reward: 0,
    due_date: '',
    evaluation_type: 'automatic',
    content: {},
    pass_criteria: {},
  });
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]); // Specify type as Question[]
  const [loading, setLoading] = useState(false);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleAddQuestion = () => {
    // Generate a temporary ID for new questions
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setQuizQuestions([...quizQuestions, { 
      id: tempId,
      question_text: '', 
      options: ['', '', '', ''], 
      correct_answer: '' 
    }]);
  };

  const handleUpdateQuestion = (index: number, field: keyof Question | 'options', value: string | [number, string]) => {
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
    } else if (field === 'id') {
      updatedQuestions[index].id = value as string;
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
      let finalContent: ChallengeContent = {};
      let finalPassCriteria: ChallengePassCriteria = {};

      if (challengeType === 'quiz') {
        finalContent = { questions: quizQuestions };
        finalPassCriteria = { min_score: challengeData.pass_criteria?.min_score || 0 };
      } else if (challengeType === 'video') {
        finalContent = { video_url: challengeData.content?.video_url };
        finalPassCriteria = { min_percentage: challengeData.pass_criteria?.min_percentage || 0 };
      } else if (challengeType === 'reading') {
        finalContent = { text_content: challengeData.content?.text_content };
        finalPassCriteria = { min_percentage: challengeData.pass_criteria?.min_percentage || 0 };
      } else if (challengeType === 'upload') {
        finalContent = { allowed_file_types: challengeData.content?.allowed_file_types, max_file_size: challengeData.content?.max_file_size };
        finalPassCriteria = {}; // No specific pass criteria for upload
      }

      const { error } = await supabase.from('challenges').insert([
        {
          ...challengeData,
          type: challengeType,
          content: finalContent,
          pass_criteria: finalPassCriteria,
          is_active: true,
        } as Challenge, // Cast to Challenge to satisfy type checking
      ]);

      if (error) throw error;

      onChallengeCreated();
      onClose();
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Gagal mencipta cabaran. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-dark rounded-2xl p-8 w-full max-w-4xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">&times;</button>
        <h2 className="text-3xl font-bold text-gradient mb-6 text-center">Wizard Cipta Cabaran</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Langkah 1: Maklumat Asas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Tajuk Cabaran</label>
                  <input type="text" value={challengeData.title} onChange={e => setChallengeData({ ...challengeData, title: e.target.value })} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Jenis Cabaran</label>
                  <select value={challengeType} onChange={e => setChallengeType(e.target.value as 'quiz' | 'video' | 'reading' | 'upload')} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg" required>
                    <option value="quiz">Kuiz (MCQ)</option>
                    <option value="video">Video</option>
                    <option value="reading">Bacaan</option>
                    <option value="upload">Muat Naik Fail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Subjek</label>
                  <input type="text" value={challengeData.subject} onChange={e => setChallengeData({ ...challengeData, subject: e.target.value })} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Tingkatan</label>
                  <input type="text" value={challengeData.tingkatan} onChange={e => setChallengeData({ ...challengeData, tingkatan: e.target.value })} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Ganjaran XP</label>
                  <input type="number" value={challengeData.xp_reward} onChange={e => setChallengeData({ ...challengeData, xp_reward: parseInt(e.target.value) })} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Tarikh Akhir (Pilihan)</label>
                  <input type="date" value={challengeData.due_date} onChange={e => setChallengeData({ ...challengeData, due_date: e.target.value })} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Deskripsi</label>
                <textarea value={challengeData.description} onChange={e => setChallengeData({ ...challengeData, description: e.target.value })} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg" rows={3} required></textarea>
              </div>
              <div className="flex justify-end mt-6">
                <button type="button" onClick={handleNext} className="bg-gradient-to-r from-electric-blue to-neon-cyan text-white px-6 py-3 rounded-lg font-medium">Seterusnya</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Langkah 2: Kandungan Cabaran</h3>
              
              {challengeType === 'quiz' && (
                <div className="space-y-4">
                  {quizQuestions.map((q, qIndex) => (
                    <div key={q.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <label className="block text-gray-300 text-sm font-medium mb-1">Soalan {qIndex + 1}</label>
                      <input type="text" value={q.question_text} onChange={e => handleUpdateQuestion(qIndex, 'question_text', e.target.value)} className="w-full px-3 py-2 bg-gray-700 rounded-lg mb-2" required />
                      
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {q.options.map((opt: string, optIndex: number) => (
                          <input key={optIndex} type="text" value={opt} onChange={e => handleUpdateQuestion(qIndex, 'options', [optIndex, e.target.value])} className="w-full px-3 py-2 bg-gray-700 rounded-lg" placeholder={`Pilihan ${optIndex + 1}`} required />
                        ))}
                      </div>
                      <label className="block text-gray-300 text-sm font-medium mb-1">Jawapan Betul</label>
                      <select value={q.correct_answer} onChange={e => handleUpdateQuestion(qIndex, 'correct_answer', e.target.value)} className="w-full px-3 py-2 bg-gray-700 rounded-lg" required>
                        <option value="">Pilih Jawapan Betul</option>
                        {q.options.map((opt: string, optIndex: number) => (
                          <option key={optIndex} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="mt-2 bg-red-600 px-3 py-1 rounded-lg text-sm">Buang Soalan</button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddQuestion} className="bg-blue-600 px-4 py-2 rounded-lg text-white">Tambah Soalan</button>
                  <label className="block text-gray-300 text-sm font-medium mt-4 mb-1">Markah Minimum Lulus (%)</label>
                  <input type="number" value={challengeData.pass_criteria?.min_score || ''} onChange={e => setChallengeData({ ...challengeData, pass_criteria: { ...challengeData.pass_criteria, min_score: parseInt(e.target.value) } })} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg" placeholder="Contoh: 70" />
                </div>
              )}

              {challengeType === 'video' && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">URL Video (YouTube/Vimeo)</label>
                  <input type="text" value={challengeData.content?.video_url || ''} onChange={e => setChallengeData({ ...challengeData, content: { ...challengeData.content, video_url: e.target.value } })} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg" required />
                  <label className="block text-gray-300 text-sm font-medium mt-4 mb-1">Peratus Tontonan Minimum Lulus (%)</label>
                  <input type="number" value={challengeData.pass_criteria?.min_percentage || ''} onChange={e => setChallengeData({ ...challengeData, pass_criteria: { ...challengeData.pass_criteria, min_percentage: parseInt(e.target.value) } })} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg" placeholder="Contoh: 80" />
                </div>
              )}

              {challengeType === 'reading' && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Kandungan Bacaan (HTML/Markdown)</label>
                  <textarea value={challengeData.content?.text_content || ''} onChange={e => setChallengeData({ ...challengeData, content: { ...challengeData.content, text_content: e.target.value } })} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg" rows={10} required></textarea>
                  <label className="block text-gray-300 text-sm font-medium mt-4 mb-1">Peratus Bacaan Minimum Lulus (%)</label>
                  <input type="number" value={challengeData.pass_criteria?.min_percentage || ''} onChange={e => setChallengeData({ ...challengeData, pass_criteria: { ...challengeData.pass_criteria, min_percentage: parseInt(e.target.value) } })} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg" placeholder="Contoh: 90" />
                </div>
              )}

              {challengeType === 'upload' && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Jenis Fail Dibenarkan (koma dipisahkan)</label>
                  <input type="text" value={challengeData.content?.allowed_file_types?.join(',')} onChange={e => setChallengeData({ ...challengeData, content: { ...challengeData.content, allowed_file_types: e.target.value.split(',').map(s => s.trim()) } })} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg" placeholder="pdf, docx, jpg" />
                  <label className="block text-gray-300 text-sm font-medium mt-4 mb-1">Saiz Fail Maksimum (MB)</label>
                  <input type="number" value={challengeData.content?.max_file_size ? challengeData.content.max_file_size / (1024 * 1024) : ''} onChange={e => setChallengeData({ ...challengeData, content: { ...challengeData.content, max_file_size: parseInt(e.target.value) * 1024 * 1024 } })} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg" placeholder="Contoh: 10" />
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button type="button" onClick={handleBack} className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium">Kembali</button>
                <button type="button" onClick={handleNext} className="bg-gradient-to-r from-electric-blue to-neon-cyan text-white px-6 py-3 rounded-lg font-medium">Seterusnya</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Langkah 3: Semak & Cipta</h3>
              <div className="bg-gray-800/50 p-6 rounded-lg space-y-3">
                <p><strong>Tajuk:</strong> {challengeData.title}</p>
                <p><strong>Deskripsi:</strong> {challengeData.description}</p>
                <p><strong>Jenis:</strong> {challengeType}</p>
                <p><strong>Subjek:</strong> {challengeData.subject}</p>
                <p><strong>Tingkatan:</strong> {challengeData.tingkatan}</p>
                <p><strong>Ganjaran XP:</strong> {challengeData.xp_reward}</p>
                {challengeData.due_date && <p><strong>Tarikh Akhir:</strong> {challengeData.due_date}</p>}
                
                {challengeType === 'quiz' && (
                  <div>
                    <p><strong>Soalan Kuiz:</strong> {quizQuestions.length} soalan</p>
                    <p><strong>Markah Minimum Lulus:</strong> {challengeData.pass_criteria?.min_score}%</p>
                  </div>
                )}
                {challengeType === 'video' && (
                  <div>
                    <p><strong>URL Video:</strong> {challengeData.content?.video_url}</p>
                    <p><strong>Peratus Tontonan Minimum:</strong> {challengeData.pass_criteria?.min_percentage}%</p>
                  </div>
                )}
                {challengeType === 'reading' && (
                  <div>
                    <p><strong>Kandungan Bacaan:</strong> {challengeData.content?.text_content?.substring(0, 100)}...</p>
                    <p><strong>Peratus Bacaan Minimum:</strong> {challengeData.pass_criteria?.min_percentage}%</p>
                  </div>
                )}
                {challengeType === 'upload' && (
                  <div>
                    <p><strong>Jenis Fail Dibenarkan:</strong> {challengeData.content?.allowed_file_types?.join(', ')}</p>
                    <p><strong>Saiz Fail Maksimum:</strong> {challengeData.content?.max_file_size ? (challengeData.content.max_file_size / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A'}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-6">
                <button type="button" onClick={handleBack} className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium">Kembali</button>
                <button type="submit" disabled={loading} className="bg-gradient-to-r from-neon-green to-teal-500 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50">
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

