'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Bot, 
  Sparkles,
  Brain,
  Zap,
  Target,
  Settings,
  Trophy,
  Clock,
  Star,
  CheckCircle,
  Play,
  ChevronRight
} from 'lucide-react';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  topics: string[];
  prerequisites: string[];
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  rating: number;
  completionDate?: Date;
}

interface AIRecommendation {
  id: string;
  type: 'learning_path' | 'exercise' | 'resource' | 'challenge';
  title: string;
  description: string;
  confidence: number;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  preferredTopics: string[];
  strengths: string[];
  weaknesses: string[];
  goals: string[];
  timeAvailability: number; // hours per week
  lastActive: Date;
}

interface LearningSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  topics: string[];
  exercises: string[];
  performance: number; // 0-100
  feedback: string;
  nextSteps: string[];
}

const AdvancedAILearningAssistant: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    name: 'Ahmad',
    email: 'ahmad@example.com',
    level: 15,
    xp: 12500,
    learningStyle: 'visual',
    preferredTopics: ['JavaScript', 'React', 'Node.js', 'Database Design'],
    strengths: ['Problem Solving', 'Logical Thinking', 'Creativity'],
    weaknesses: ['Time Management', 'Advanced Algorithms'],
    goals: ['Full Stack Developer', 'AI/ML Engineer', 'System Architect'],
    timeAvailability: 20,
    lastActive: new Date()
  });

  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([
    {
      id: '1',
      title: 'JavaScript Fundamentals to Advanced',
      description: 'Master JavaScript from basics to advanced concepts including ES6+, async programming, and design patterns.',
      difficulty: 'beginner',
      estimatedTime: 480,
      topics: ['Variables', 'Functions', 'Objects', 'Arrays', 'ES6+', 'Async/Await', 'Modules'],
      prerequisites: ['Basic HTML', 'Basic CSS'],
      progress: 75,
      status: 'in_progress',
      rating: 4.8
    },
    {
      id: '2',
      title: 'React & Modern Frontend Development',
      description: 'Build modern web applications with React, including hooks, context, and advanced state management.',
      difficulty: 'intermediate',
      estimatedTime: 600,
      topics: ['React Hooks', 'Context API', 'State Management', 'Performance', 'Testing'],
      prerequisites: ['JavaScript Fundamentals', 'HTML/CSS'],
      progress: 30,
      status: 'in_progress',
      rating: 4.9
    },
    {
      id: '3',
      title: 'Backend Development with Node.js',
      description: 'Create robust backend services using Node.js, Express, and modern database technologies.',
      difficulty: 'intermediate',
      estimatedTime: 720,
      topics: ['Node.js', 'Express.js', 'REST APIs', 'Database Design', 'Authentication', 'Security'],
      prerequisites: ['JavaScript Fundamentals', 'Basic HTTP'],
      progress: 0,
      status: 'not_started',
      rating: 4.7
    }
  ]);

  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([
    {
      id: '1',
      type: 'learning_path',
      title: 'Complete JavaScript Fundamentals',
      description: 'Based on your progress, completing this path will unlock advanced React concepts.',
      confidence: 0.95,
      reason: 'High completion rate and strong performance in related exercises',
      priority: 'high',
      estimatedImpact: 0.8
    },
    {
      id: '2',
      type: 'exercise',
      title: 'Advanced Array Methods Practice',
      description: 'Practice map, filter, reduce with complex data structures to strengthen your JavaScript skills.',
      confidence: 0.87,
      reason: 'You\'ve shown interest in functional programming concepts',
      priority: 'medium',
      estimatedImpact: 0.6
    },
    {
      id: '3',
      type: 'resource',
      title: 'Design Patterns in JavaScript',
      description: 'Learn common design patterns to write more maintainable and scalable code.',
      confidence: 0.78,
      reason: 'You\'re approaching intermediate level and ready for architectural concepts',
      priority: 'medium',
      estimatedImpact: 0.5
    }
  ]);

  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [isAIActive, setIsAIActive] = useState(true);
  const [aiMode, setAiMode] = useState<'adaptive' | 'guided' | 'exploratory'>('adaptive');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'ai', content: string, timestamp: Date}>>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI learning assistant. I\'ve analyzed your profile and created a personalized learning plan. How can I help you today?',
      timestamp: new Date()
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Simulate AI learning from user behavior
  const updateAIRecommendations = useCallback(() => {
    // Simulate AI learning and updating recommendations
    setAiRecommendations(prev => prev.map(rec => ({
      ...rec,
      confidence: Math.min(0.99, rec.confidence + (Math.random() - 0.5) * 0.1),
      estimatedImpact: Math.min(1, rec.estimatedImpact + (Math.random() - 0.5) * 0.1)
    })));
  }, []);

  useEffect(() => {
    if (isAIActive && currentSession) {
      const interval = setInterval(() => {
        // Simulate AI learning and adapting
        updateAIRecommendations();
      }, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAIActive, currentSession, updateAIRecommendations]);

  const startLearningSession = (pathId: string) => {
    const path = learningPaths.find(p => p.id === pathId);
    if (path) {
      const session: LearningSession = {
        id: Date.now().toString(),
        startTime: new Date(),
        duration: 0,
        topics: path.topics.slice(0, 3), // Start with first 3 topics
        exercises: [],
        performance: 0,
        feedback: '',
        nextSteps: []
      };
      setCurrentSession(session);
      setSelectedPath(pathId);
    }
  };

  const endLearningSession = () => {
    if (currentSession) {
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - currentSession.startTime.getTime()) / 60000);
      const performance = Math.floor(Math.random() * 40) + 60; // 60-100%
      
      const updatedSession = {
        ...currentSession,
        endTime,
        duration,
        performance,
        feedback: generateFeedback(performance),
        nextSteps: generateNextSteps(performance, currentSession.topics)
      };

      setCurrentSession(updatedSession);
      
      // Update learning path progress
      if (selectedPath) {
        setLearningPaths(prev => prev.map(path => 
          path.id === selectedPath 
            ? { ...path, progress: Math.min(100, path.progress + Math.floor(performance / 10)) }
            : path
        ));
      }
    }
  };

  const generateFeedback = (performance: number): string => {
    if (performance >= 90) return 'Excellent work! You\'ve mastered these concepts. Ready for more advanced topics.';
    if (performance >= 80) return 'Great job! You have a solid understanding. Some practice will make you even stronger.';
    if (performance >= 70) return 'Good progress! Review the challenging parts and you\'ll improve quickly.';
    return 'Keep practicing! Focus on the fundamentals and don\'t hesitate to ask for help.';
  };

  const generateNextSteps = (performance: number, topics: string[]): string[] => {
    if (performance >= 80) {
      return [
        `Move to next topic: ${topics.length > 0 ? topics[0] : 'Advanced concepts'}`,
        'Try advanced exercises',
        'Help other learners'
      ];
    } else if (performance >= 70) {
      return [
        `Review weak areas in: ${topics.join(', ')}`,
        'Practice similar problems',
        'Watch tutorial videos'
      ];
    } else {
      return [
        `Revisit fundamentals in: ${topics.join(', ')}`,
        'Take basic exercises',
        'Join study group'
      ];
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: Date.now().toString(),
        type: 'user' as const,
        content: newMessage,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      setNewMessage('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = generateAIResponse(newMessage);
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai' as const,
          content: aiResponse,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMessage]);
      }, 1000);
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
      return 'I\'m here to help! What specific concept are you struggling with? I can provide explanations, examples, or suggest practice exercises.';
    }
    
    if (lowerMessage.includes('progress') || lowerMessage.includes('level')) {
      return `You're currently at Level ${userProfile.level} with ${userProfile.xp.toLocaleString()} XP. You're making excellent progress! Your next milestone is at ${Math.ceil(userProfile.xp / 1000) * 1000} XP.`;
    }
    
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      return 'Based on your learning pattern, I recommend focusing on JavaScript fundamentals completion first, then moving to React advanced concepts. Would you like me to create a custom study plan?';
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('schedule')) {
      return `With your ${userProfile.timeAvailability} hours per week, I suggest 3-4 focused sessions of 1-1.5 hours each. This will help you maintain momentum and see consistent progress.`;
    }
    
    return 'That\'s an interesting question! I\'d be happy to help you with that. Could you provide more details so I can give you the most relevant assistance?';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Brain className="w-8 h-8 text-purple-600" />
            {isAIActive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Advanced AI Learning Assistant</h2>
            <p className="text-gray-600">Personalized learning paths and intelligent recommendations</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAIActive(!isAIActive)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isAIActive
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isAIActive ? 'AI Active' : 'AI Inactive'}
          </button>
          
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* AI Mode Selection */}
      {showAdvancedSettings && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Learning Mode</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'adaptive', title: 'Adaptive Learning', description: 'AI adjusts difficulty based on performance' },
              { id: 'guided', title: 'Guided Learning', description: 'Step-by-step structured learning path' },
              { id: 'exploratory', title: 'Exploratory Learning', description: 'Discover topics based on interests' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setAiMode(mode.id as 'adaptive' | 'guided' | 'exploratory')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  aiMode === mode.id
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-semibold mb-2">{mode.title}</h4>
                <p className="text-sm text-gray-600">{mode.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User Profile Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Learning Profile</h3>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Edit Profile
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">Level {userProfile.level}</p>
            <p className="text-sm text-purple-600">Current Level</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{userProfile.xp.toLocaleString()}</p>
            <p className="text-sm text-blue-600">Total XP</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{userProfile.timeAvailability}h</p>
            <p className="text-sm text-green-600">Weekly Study Time</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="w-12 h-12 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600 capitalize">{userProfile.learningStyle}</p>
            <p className="text-sm text-orange-600">Learning Style</p>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
          AI Recommendations
        </h3>
        
        <div className="space-y-4">
          {aiRecommendations.map((recommendation) => (
            <div key={recommendation.id} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(recommendation.priority)}`}>
                      {recommendation.priority} priority
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round(recommendation.confidence * 100)}% confidence
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-1">{recommendation.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{recommendation.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Impact: {Math.round(recommendation.estimatedImpact * 100)}%</span>
                    <span>Reason: {recommendation.reason}</span>
                  </div>
                </div>
                
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Paths */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-500" />
          Your Learning Paths
        </h3>
        
        <div className="space-y-4">
          {learningPaths.map((path) => (
            <div key={path.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(path.difficulty)}`}>
                      {path.difficulty}
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.floor(path.estimatedTime / 60)}h {path.estimatedTime % 60}m
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{path.rating}</span>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-1">{path.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{path.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>Topics: {path.topics.slice(0, 3).join(', ')}...</span>
                    <span>Prerequisites: {path.prerequisites.join(', ')}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${path.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress: {path.progress}%</span>
                    <span className="capitalize">{path.status.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  {path.status === 'not_started' && (
                    <button
                      onClick={() => startLearningSession(path.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Start Learning
                    </button>
                  )}
                  
                  {path.status === 'in_progress' && (
                    <button
                      onClick={() => startLearningSession(path.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Continue
                    </button>
                  )}
                  
                  {path.status === 'completed' && (
                    <div className="text-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-1" />
                      <span className="text-sm text-green-600 font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Learning Session */}
      {currentSession && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Play className="w-5 h-5 mr-2 text-green-500" />
            Current Learning Session
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Session Details</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Started: {currentSession.startTime.toLocaleTimeString()}</p>
                <p>Duration: {currentSession.duration} minutes</p>
                <p>Topics: {currentSession.topics.join(', ')}</p>
                {currentSession.performance > 0 && (
                  <p>Performance: {currentSession.performance}%</p>
                )}
              </div>
              
              {currentSession.feedback && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-1">AI Feedback</h5>
                  <p className="text-sm text-blue-800">{currentSession.feedback}</p>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
              {currentSession.nextSteps.length > 0 ? (
                <ul className="space-y-1">
                  {currentSession.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 text-green-500" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Complete the current session to see next steps</p>
              )}
              
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={endLearningSession}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  End Session
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  Pause
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Assistant */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Bot className="w-5 h-5 mr-2 text-purple-500" />
          AI Chat Assistant
        </h3>
        
        <div className="h-96 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
          <div className="space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-purple-200' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about your learning journey..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAILearningAssistant;
