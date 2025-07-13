'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'
import type { Challenge, Question } from '@/types/index'
import QuizChallenge from '@/components/challenges/QuizChallenge'
import VideoChallenge from '@/components/challenges/VideoChallenge'
import ReadingChallenge from '@/components/challenges/ReadingChallenge'
import UploadChallenge from '@/components/challenges/UploadChallenge'

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenge = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      const { data, error: challengeError } = await supabase.from('challenges').select('*').eq('id', params.id).single();
      if (challengeError) throw challengeError;
      setChallenge(data as Challenge);

      if (data.type === 'quiz') {
        const { data: questionsData, error: questionsError } = await supabase.from('quiz_questions').select('*').eq('challenge_id', params.id).order('order_index');
        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);
      }
    } catch (err) {
      console.error('Error fetching challenge:', err);
      setError('Ralat memuat cabaran.');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchChallenge(); }, [fetchChallenge]);

  const handleChallengeComplete = useCallback(async (passed?: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !challenge) return;
    if (passed) {
      const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single();
      if (profile) {
        await supabase.from('profiles').update({ xp: (profile.xp || 0) + challenge.xp_reward }).eq('id', user.id);
      }
    }
  }, [challenge]);

  const handleBack = () => { router.push('/dashboard-murid'); };

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>{error}</div>;
  if (!challenge) return <div>Cabaran tidak dijumpai.</div>;

  const renderChallenge = () => {
    switch (challenge.type) {
      case 'quiz':
        return <QuizChallenge challenge={challenge} questions={questions} onComplete={(score, passed) => handleChallengeComplete(passed)} onBack={handleBack} />;
      case 'video':
        return <VideoChallenge challenge={challenge} onComplete={(p, passed) => handleChallengeComplete(passed)} onBack={handleBack} />;
      case 'reading':
        return <ReadingChallenge challenge={challenge} onComplete={(p, passed) => handleChallengeComplete(passed)} onBack={handleBack} />;
      case 'upload':
        return <UploadChallenge challenge={challenge} onComplete={(submitted) => handleChallengeComplete(submitted)} onBack={handleBack} />;
      default:
        return <p>Jenis cabaran tidak disokong.</p>;
    }
  };

  return <div className="min-h-screen">{renderChallenge()}</div>;
}
