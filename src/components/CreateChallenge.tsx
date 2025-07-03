'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import { FaTimes, FaBook, FaVideo, FaFileAlt, FaUpload, FaPlus, FaTrash } from 'react-icons/fa'

// --- Interfaces ---
interface CreateChallengeProps {
  onClose: () => void
  onSuccess: () => void
}
interface Question {
  question_text: string
  options: string[]
  correct_answer: string
  points: number
}
type ChallengeType = 'quiz' | 'video' | 'reading' | 'upload';

// --- Komponen Utama ---
export default function CreateChallenge({ onClose, onSuccess }: CreateChallengeProps) {
  const [step, setStep] = useState(1);
  const [challengeType, setChallengeType] = useState<ChallengeType>('quiz');
  const [loading, setLoading] = useState(false);

  // --- States untuk setiap jenis cabaran ---
  const [basicInfo, setBasicInfo] = useState({ title: '', description: '', subject: 'Sains Komputer', tingkatan: 'Tingkatan 4', xp_reward: 50, deadline: '' });
  const [questions, setQuestions] = useState<Question[]>([{ question_text: '', options: ['', '', '', ''], correct_answer: 'A', points: 1 }]);
  const [passCriteria, setPassCriteria] = useState({ min_score: 5 });
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [videoData, setVideoData] = useState({ video_url: '', min_watch_percentage: 90 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [readingData, setReadingData] = useState({ content: '', completion_required: true });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploadData, setUploadData] = useState({ instructions: '', allowed_file_types: ['pdf', 'doc', 'docx'], max_file_size: 10485760 });

  // --- Fungsi Helper ---
  const addQuestion = () => {
    setQuestions([...questions, { question_text: '', options: ['', '', '', ''], correct_answer: 'A', points: 1 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | string[] | number) => {
    const newQuestions = [...questions];
    const questionToUpdate = { ...newQuestions[index] };
    
    if (field === 'options' && Array.isArray(value)) {
      questionToUpdate.options = value;
    } else if (field === 'points' && typeof value === 'number') {
      questionToUpdate.points = value;
    } else if (typeof value === 'string' && (field === 'question_text' || field === 'correct_answer')) {
      questionToUpdate[field] = value;
    }
    
    newQuestions[index] = questionToUpdate;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let content: object = {};
      let pass_criteria: object = {};

      switch (challengeType) {
        case 'quiz':
          content = { questions };
          pass_criteria = { min_score: passCriteria.min_score };
          break;
        case 'video':
          content = { video_url: videoData.video_url };
          pass_criteria = { min_watch_percentage: videoData.min_watch_percentage };
          break;
        case 'reading':
          content = { content: readingData.content };
          pass_criteria = { completion_required: readingData.completion_required };
          break;
        case 'upload':
          content = { instructions: uploadData.instructions, allowed_file_types: uploadData.allowed_file_types, max_file_size: uploadData.max_file_size };
          pass_criteria = { manual_review: true };
          break;
      }

      const { data: challenge, error: challengeError } = await supabase.from('challenges').insert({
        title: basicInfo.title, description: basicInfo.description, type: challengeType, subject: basicInfo.subject, tingkatan: basicInfo.tingkatan, xp_reward: basicInfo.xp_reward, content, pass_criteria, deadline: basicInfo.deadline || null, created_by: user.id, evaluation_type: challengeType === 'upload' ? 'manual' : 'automatic'
      }).select().single();

      if (challengeError) throw challengeError;

      if (challengeType === 'quiz' && challenge) {
        const questionsToInsert = questions.map((q, index) => ({
          challenge_id: challenge.id, question_text: q.question_text, options: q.options, correct_answer: q.correct_answer, points: q.points, order_index: index
        }));
        await supabase.from('quiz_questions').insert(questionsToInsert).throwOnError();
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Ralat mencipta cabaran. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Cipta Cabaran Baru</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><FaTimes className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto flex-grow">
          {step === 1 && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Pilih Jenis Cabaran</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[{ type: 'quiz', icon: FaBook, title: 'Kuiz MCQ', desc: 'Soalan aneka pilihan' }, { type: 'video', icon: FaVideo, title: 'Video', desc: 'Tonton video' }, { type: 'reading', icon: FaFileAlt, title: 'Bacaan', desc: 'Baca kandungan' }, { type: 'upload', icon: FaUpload, title: 'Upload', desc: 'Muat naik fail' }].map(({ type, icon: Icon, title, desc }) => (
                  <button key={type} onClick={() => setChallengeType(type as ChallengeType)} className={`p-4 rounded-lg border-2 text-left transition-all ${challengeType === type ? 'border-blue-500 bg-blue-500/20' : 'border-gray-600 hover:border-gray-500'}`}>
                    <Icon className={`w-8 h-8 mb-3 ${challengeType === type ? 'text-blue-400' : 'text-gray-400'}`} />
                    <h4 className="font-medium text-white mb-1">{title}</h4>
                    <p className="text-sm text-gray-400">{desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-6"><button onClick={() => setStep(2)} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Seterusnya</button></div>
            </div>
          )}
          {step === 2 && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Maklumat Asas</h3>
              <div className="space-y-4">
                <input type="text" value={basicInfo.title} onChange={(e) => setBasicInfo({...basicInfo, title: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" placeholder="Tajuk Cabaran" />
                <textarea value={basicInfo.description} onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white h-24" placeholder="Penerangan" />
                <div className="grid md:grid-cols-2 gap-4">
                  <select value={basicInfo.subject} onChange={(e) => setBasicInfo({...basicInfo, subject: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"><option>Sains Komputer</option><option>Matematik</option></select>
                  <select value={basicInfo.tingkatan} onChange={(e) => setBasicInfo({...basicInfo, tingkatan: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"><option>Tingkatan 4</option><option>Tingkatan 5</option></select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input type="number" value={basicInfo.xp_reward} onChange={(e) => setBasicInfo({...basicInfo, xp_reward: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" />
                  <input type="datetime-local" value={basicInfo.deadline} onChange={(e) => setBasicInfo({...basicInfo, deadline: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" />
                </div>
              </div>
              <div className="flex justify-between mt-6"><button onClick={() => setStep(1)} className="px-6 py-2 bg-gray-600 text-white rounded-lg">Kembali</button><button onClick={() => setStep(3)} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Seterusnya</button></div>
            </div>
          )}
          {step === 3 && (
            <div className="p-6">
              {challengeType === 'quiz' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Setup Kuiz</h3>
                  {questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-gray-800/50 p-4 mb-4 rounded-lg">
                      <div className="flex justify-between items-center mb-3"><h4 className="font-medium text-white">Soalan {qIndex + 1}</h4>{questions.length > 1 && <button onClick={() => removeQuestion(qIndex)} className="p-1 text-red-400"><FaTrash /></button>}</div>
                      <div className="space-y-3">
                        <input type="text" value={q.question_text} onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)} placeholder="Soalan" className="w-full p-2 bg-gray-700 rounded-lg" />
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex gap-2">
                            <span className="p-2 bg-gray-700 rounded-lg">{String.fromCharCode(65 + oIndex)}</span>
                            <input type="text" value={opt} onChange={(e) => { const newOpts = [...q.options]; newOpts[oIndex] = e.target.value; updateQuestion(qIndex, 'options', newOpts); }} placeholder={`Pilihan ${String.fromCharCode(65 + oIndex)}`} className="flex-1 p-2 bg-gray-700 rounded-lg" />
                          </div>
                        ))}
                        <div className="flex gap-4">
                          <select value={q.correct_answer} onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)} className="p-2 bg-gray-700 rounded-lg"><option>A</option><option>B</option><option>C</option><option>D</option></select>
                          <input type="number" value={q.points} onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))} className="w-20 p-2 bg-gray-700 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addQuestion} className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 flex items-center justify-center gap-2"><FaPlus /> Tambah Soalan</button>
                  <div className="mt-6 p-4 bg-gray-800/50 rounded-lg"><label className="block text-sm mb-1">Markah Lulus</label><input type="number" value={passCriteria.min_score} onChange={(e) => setPassCriteria({ min_score: parseInt(e.target.value) })} className="w-32 p-2 bg-gray-700 rounded-lg" /></div>
                </div>
              )}
              <div className="flex justify-between mt-6"><button onClick={() => setStep(2)} className="px-6 py-2 bg-gray-600 text-white rounded-lg">Kembali</button><button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">{loading ? 'Mencipta...' : 'Cipta Cabaran'}</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
