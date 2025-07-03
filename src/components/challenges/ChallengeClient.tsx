'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter, useParams } from 'next/navigation'
import QuizChallenge from '@/components/challenges/QuizChallenge'
import VideoChallenge from '@/components/challenges/VideoChallenge'
import ReadingChallenge from '@/components/challenges/ReadingChallenge'
import UploadChallenge from '@/components/challenges/UploadChallenge'
import { Challenge, Question } from '@/types' // Removed unused import

interface Submission {
  id: string;
  challenge_id: string;
  user_id: string;
  status: string;
  score?: number;
  passed: boolean;
  submitted_at: string;
}

// Client component that handles the challenge logic
export default function ChallengeClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUserId(user.id);

      // Fetch challenge data
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();
      
      if (challengeError || !challengeData) {
        console.error('Error fetching challenge:', challengeError);
        router.push('/dashboard-murid');
        return;
      }
      
      // Ensure all required properties exist and match the expected types
      const completeChallenge: Challenge = {
        ...challengeData,
        evaluation_type: (challengeData.evaluation_type as 'automatic' | 'manual') || 'automatic',
        content: challengeData.content || {},
        pass_criteria: challengeData.pass_criteria || {},
        is_active: !!challengeData.is_active
      };
      
      setChallenge(completeChallenge);

      // Check if user has already submitted this challenge
      const { data: submissionData } = await supabase
        .from('challenge_submissions')
        .select('*')
        .eq('challenge_id', id)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();
      
      if (submissionData) {
        setSubmission(submissionData);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [id, router]);

  const handleComplete = async (score: number, passed: boolean) => {
    if (!userId || !challenge) return;
    
    try {
      // Create submission record
      const { data, error } = await supabase
        .from('challenge_submissions')
        .insert({
          challenge_id: challenge.id,
          user_id: userId,
          status: 'completed',
          score: score,
          passed: passed,
          submission_type: challenge.type
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setSubmission(data);
      
      // Update user XP if passed
      if (passed) {
        const { error: xpError } = await supabase.rpc('increment_user_xp', { 
          user_id: userId, 
          xp_amount: challenge.xp_reward 
        });
        
        if (xpError) console.error('Error updating XP:', xpError);
      }
      
    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };

  // Adapter function for UploadChallenge
  const handleUploadComplete = (submitted: boolean) => {
    // For upload challenges, we consider submission as passed
    handleComplete(100, submitted);
  };

  const handleBack = () => {
    router.push('/dashboard-murid');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="text-2xl text-gradient loading-dots">Memuat cabaran</div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="text-xl text-red-400">Cabaran tidak ditemui.</div>
          <button onClick={handleBack} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded">Kembali</button>
        </div>
      </div>
    );
  }

  // If user has already completed and passed the challenge
  if (submission && submission.passed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center max-w-lg">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="text-2xl font-bold text-gradient mb-4">{challenge.title}</h1>
          <div className="text-xl text-green-400 mb-4">Anda telah berjaya menyelesaikan cabaran ini!</div>
          <div className="text-lg text-white mb-6">+{challenge.xp_reward} XP</div>
          <button onClick={handleBack} className="px-6 py-3 bg-gradient-to-r from-electric-blue to-neon-cyan text-white rounded-lg font-medium">Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }

  // If user has attempted but not passed
  if (submission && !submission.passed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center max-w-lg">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gradient mb-4">{challenge.title}</h1>
          <div className="text-xl text-yellow-400 mb-4">Anda belum berjaya menyelesaikan cabaran ini.</div>
          {challenge.type === 'quiz' && submission.score !== undefined && (
            <div className="text-lg text-white mb-6">Skor: {submission.score}%</div>
          )}
          <div className="flex justify-center gap-4">
            <button onClick={handleBack} className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium">Kembali ke Dashboard</button>
            <button 
              onClick={() => setSubmission(null)} 
              className="px-6 py-3 bg-gradient-to-r from-electric-blue to-neon-cyan text-white rounded-lg font-medium"
            >
              Cuba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to safely get quiz questions
  const getQuizQuestions = (): Question[] => {
    if (challenge.type === 'quiz' && challenge.content?.questions) {
      return challenge.content.questions || [];
    }
    return [];
  };

  // Render the appropriate challenge component based on type
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="glass-dark rounded-2xl p-6 mb-8">
            <h1 className="text-2xl font-bold text-gradient mb-2">{challenge.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">{challenge.subject}</span>
              <span className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">Tingkatan {challenge.tingkatan}</span>
              <span className="px-3 py-1 bg-gray-800 rounded-full text-sm text-neon-cyan">{challenge.xp_reward} XP</span>
            </div>
            <p className="text-gray-300 mb-4">{challenge.description}</p>
          </div>
          
          <div className="glass-dark rounded-2xl overflow-hidden">
            {challenge.type === 'quiz' && (
              <QuizChallenge 
                challenge={challenge} 
                questions={getQuizQuestions()} 
                onComplete={handleComplete} 
                onBack={handleBack} 
              />
            )}
            
            {challenge.type === 'video' && (
              <VideoChallenge 
                challenge={challenge} 
                onComplete={handleComplete} 
                onBack={handleBack} 
              />
            )}
            
            {challenge.type === 'reading' && (
              <ReadingChallenge 
                challenge={challenge} 
                onComplete={handleComplete} 
                onBack={handleBack} 
              />
            )}
            
            {challenge.type === 'upload' && (
              <UploadChallenge 
                challenge={challenge} 
                onComplete={handleUploadComplete} // Use the adapter function
                onBack={handleBack} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

