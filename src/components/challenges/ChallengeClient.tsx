'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter, useParams } from 'next/navigation'
import QuizChallenge from '@/components/challenges/QuizChallenge'
import VideoChallenge from '@/components/challenges/VideoChallenge'
import ReadingChallenge from '@/components/challenges/ReadingChallenge'
import UploadChallenge from '@/components/challenges/UploadChallenge'
import type { Challenge, Question } from '../../types/index'
import { 
  Trophy, 
  Clock, 
  Target, 
  Award, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Star,
  Zap,
  Flame
} from 'lucide-react'

interface Submission {
  id: string;
  challenge_id: string;
  user_id: string;
  status: 'pending' | 'completed' | 'failed' | 'in_progress';
  score?: number;
  max_score?: number;
  passed: boolean;
  submitted_at: string;
  time_spent?: number;
  attempts?: number;
  feedback?: string;
}

interface ChallengeAnalytics {
  total_submissions: number;
  average_score: number;
  completion_rate: number;
  average_time: number;
  difficulty_rating: number;
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
  const [userXP, setUserXP] = useState(0);
  const [analytics, setAnalytics] = useState<ChallengeAnalytics | null>(null);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        
        setUserId(user.id);

        // Fetch user XP
        const { data: profile } = await supabase
          .from('profiles')
          .select('xp')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserXP(profile.xp || 0);
        }

        // Fetch challenge data
        const { data: challengeData, error: challengeError } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', id)
          .single();
        
        if (challengeError || !challengeData) {
          console.error('Error fetching challenge:', challengeError);
          setError('Cabaran tidak ditemui');
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

        // Fetch challenge analytics
        await fetchChallengeAnalytics(id);

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
          if (submissionData.status === 'completed') {
            setShowResults(true);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Ralat memuat cabaran');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, router]);

  const fetchChallengeAnalytics = async (challengeId: string) => {
    try {
      // Fetch analytics data
      const { data: submissions } = await supabase
        .from('challenge_submissions')
        .select('score, max_score, time_spent, status')
        .eq('challenge_id', challengeId);

      if (submissions && submissions.length > 0) {
        const completedSubmissions = submissions.filter((s: any) => s.status === 'completed');
        const totalSubmissions = submissions.length;
        const completionRate = (completedSubmissions.length / totalSubmissions) * 100;
        
        const averageScore = completedSubmissions.length > 0 
          ? completedSubmissions.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / completedSubmissions.length 
          : 0;

        const averageTime = completedSubmissions.length > 0
          ? completedSubmissions.reduce((sum: number, s: any) => sum + (s.time_spent || 0), 0) / completedSubmissions.length
          : 0;

        setAnalytics({
          total_submissions: totalSubmissions,
          average_score: Math.round(averageScore),
          completion_rate: Math.round(completionRate),
          average_time: Math.round(averageTime),
          difficulty_rating: 3.5 // This could be calculated based on completion rate
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const startChallenge = () => {
    setTimeStarted(new Date());
    setTimeSpent(0);
  };

  const handleComplete = async (score: number, passed: boolean, feedback?: string) => {
    if (!userId || !challenge) return;
    
    try {
      const endTime = new Date();
      const timeSpentSeconds = timeStarted 
        ? Math.round((endTime.getTime() - timeStarted.getTime()) / 1000)
        : 0;

      // Create submission record
      const { data, error } = await supabase
        .from('challenge_submissions')
        .insert({
          challenge_id: challenge.id,
          user_id: userId,
          status: passed ? 'completed' : 'failed',
          score: score,
          max_score: getMaxScore(),
          passed: passed,
          submission_type: challenge.type,
          time_spent: timeSpentSeconds,
          attempts: (submission?.attempts || 0) + 1,
          feedback: feedback || null,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating submission:', error);
        setError('Ralat menyimpan penyertaan');
        return;
      }

      setSubmission(data);

      if (passed) {
        // Award XP
        await awardXP(challenge.xp_reward, `Completed challenge: ${challenge.title}`);
        
        // Update user progress
        await updateUserProgress(challenge.id, score, passed);
        
        // Show success message
        setShowResults(true);
      }

      // Refresh analytics
      await fetchChallengeAnalytics(challenge.id);

    } catch (error) {
      console.error('Error in handleComplete:', error);
      setError('Ralat menyelesaikan cabaran');
    }
  };

  const awardXP = async (xp: number, activity: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase.rpc('award_xp', {
        p_user_id: userId,
        p_activity: activity,
        p_xp: xp
      });

      if (!error) {
        setUserXP(prev => prev + xp);
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  };

  const updateUserProgress = async (challengeId: string, score: number, passed: boolean) => {
    if (!userId) return;

    try {
      // Update or create user progress record
      const { data: existingProgress } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();

      const progressData = {
        user_id: userId,
        challenge_id: challengeId,
        status: passed ? 'completed' : 'failed',
        xp_earned: passed ? challenge?.xp_reward || 0 : 0,
        completed_at: passed ? new Date().toISOString() : null,
        submission_data: { score, passed, completed_at: new Date().toISOString() }
      };

      if (existingProgress) {
        await supabase
          .from('user_challenges')
          .update(progressData)
          .eq('id', existingProgress.id);
      } else {
        await supabase
          .from('user_challenges')
          .insert(progressData);
      }
    } catch (error) {
      console.error('Error updating user progress:', error);
    }
  };

  const getMaxScore = (): number => {
    if (!challenge) return 100;
    
    switch (challenge.type) {
      case 'quiz':
        return Array.isArray(challenge.content.questions) ? challenge.content.questions.length : 10;
      case 'coding':
        return Array.isArray(challenge.content.test_cases) ? challenge.content.test_cases.length : 1;
      case 'video':
        return 100;
      case 'reading':
        return 100;
      case 'upload':
        return 100;
      default:
        return 100;
    }
  };

  const handleUploadComplete = (submitted: boolean) => {
    if (submitted) {
      handleComplete(100, true, 'File uploaded successfully');
    }
  };

  const handleBack = () => {
    router.push('/dashboard-murid');
  };

  const getQuizQuestions = (): Question[] => {
    if (!challenge || challenge.type !== 'quiz') return [];
    
    const questions = challenge.content.questions;
    if (!Array.isArray(questions)) return [];
    
    return questions.map((q: any, index: number) => ({
      id: `question-${index}`,
      question_text: q.question || q.question_text || '',
      options: q.options || [],
      correct_answer: q.correct_answer || q.correct || ''
    }));
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Ralat</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Cabaran Tidak Ditemui</h2>
          <p className="text-gray-300 mb-4">Cabaran yang anda cari tidak wujud atau telah dipadamkan.</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="glass-dark rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gradient mb-2">{challenge.title}</h1>
                <p className="text-gray-300">{challenge.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="glass-dark rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-xl font-bold text-white">{userXP}</span>
                  <span className="text-gray-300">XP</span>
                </div>
              </div>
              <div className="glass-dark rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-xl font-bold text-white">+{challenge.xp_reward}</span>
                  <span className="text-gray-300">XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics */}
        {analytics && (
          <div className="glass-dark rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Statistik Cabaran</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{analytics.total_submissions}</div>
                <div className="text-sm text-gray-300">Jumlah Penyertaan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{analytics.average_score}%</div>
                <div className="text-sm text-gray-300">Purata Skor</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{analytics.completion_rate}%</div>
                <div className="text-sm text-gray-300">Kadar Penyelesaian</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{analytics.average_time}s</div>
                <div className="text-sm text-gray-300">Purata Masa</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{analytics.difficulty_rating}/5</div>
                <div className="text-sm text-gray-300">Tahap Kesukaran</div>
              </div>
            </div>
          </div>
        )}

        {/* Challenge Content */}
        <div className="glass-dark rounded-2xl p-6">
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
              onComplete={handleUploadComplete}
              onBack={handleBack}
            />
          )}
        </div>

        {/* Results Modal */}
        {showResults && submission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass-dark rounded-2xl p-8 max-w-md w-full mx-4 text-center">
              {submission.passed ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Tahniah!</h2>
                  <p className="text-gray-300 mb-4">Anda berjaya menyelesaikan cabaran ini!</p>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{submission.score}</div>
                      <div className="text-sm text-gray-300">Skor</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">+{challenge.xp_reward}</div>
                      <div className="text-sm text-gray-300">XP Diterima</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Cuba Lagi</h2>
                  <p className="text-gray-300 mb-4">Anda belum berjaya menyelesaikan cabaran ini.</p>
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold text-red-400">{submission.score}</div>
                    <div className="text-sm text-gray-300">Skor</div>
                  </div>
                </>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowResults(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={handleBack}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Kembali
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

