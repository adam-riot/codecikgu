'use client'

import { useState, useCallback } from 'react'
import { Challenge, Question } from '@/types'

interface QuizChallengeProps {
  challenge: Challenge;
  questions: Question[];
  onComplete: (score: number, passed: boolean) => void;
  onBack: () => void;
}

// Extended Question interface to include points
interface QuestionWithPoints extends Question {
  points?: number;
}

export default function QuizChallenge({ challenge, questions, onComplete, onBack }: QuizChallengeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  const handleSubmitQuiz = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        // Use points if available, otherwise default to 1 point per question
        const questionWithPoints = q as QuestionWithPoints;
        const questionPoints = questionWithPoints.points || 1;
        score += questionPoints;
      }
    });

    const passed = score >= (challenge.pass_criteria?.min_score ?? 0);
    setShowResults(true);
    onComplete(score, passed);
    setIsSubmitting(false);
  }, [answers, challenge, questions, onComplete, isSubmitting]);

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
  };

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-white">Keputusan</h2>
        <button onClick={onBack} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded">Kembali</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-lg text-white mb-6">{currentQuestion?.question_text}</h2>
      <div className="space-y-3 mb-6">
        {currentQuestion?.options.map((option, index) => {
          const optionLetter = String.fromCharCode(65 + index);
          return (
            <button 
              key={index} 
              onClick={() => handleAnswerSelect(optionLetter)} 
              className={`w-full p-4 rounded-lg border-2 text-left ${
                answers[currentQuestion.id] === optionLetter ? 'border-blue-500' : 'border-gray-600'
              }`}
            >
              {optionLetter}. {option}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between">
        <button 
          onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))} 
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
        >
          Sebelumnya
        </button>
        {currentQuestionIndex === totalQuestions - 1 ? (
          <button 
            onClick={handleSubmitQuiz} 
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            Hantar
          </button>
        ) : (
          <button 
            onClick={() => setCurrentQuestionIndex(p => Math.min(totalQuestions - 1, p + 1))}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Seterusnya
          </button>
        )}
      </div>
    </div>
  );
}

