# 🔧 CodeCikgu Phase 4 - Technical Implementation Guide

## 🎯 **Priority 1: Mobile Application Development**

### **React Native Setup & Architecture**

#### **Project Initialization**
```bash
# Create new React Native project
npx react-native init CodeCikguMobile --template react-native-template-typescript

# Navigate to project
cd CodeCikguMobile

# Install essential dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-reanimated react-native-gesture-handler react-native-screens
npm install @reduxjs/toolkit react-redux redux-persist
npm install react-native-vector-icons react-native-svg
npm install @react-native-async-storage/async-storage
npm install react-native-code-push react-native-splash-screen
```

#### **Project Structure**
```
CodeCikguMobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CodeEditor/      # Mobile code editor
│   │   ├── LessonCard/      # Learning content cards
│   │   ├── ProgressBar/     # Learning progress
│   │   └── Achievement/     # Gamification elements
│   ├── screens/             # App screens
│   │   ├── Auth/            # Login/Register
│   │   ├── Dashboard/       # Student dashboard
│   │   ├── Lessons/         # Learning content
│   │   ├── Playground/      # Code editor
│   │   ├── Profile/         # User profile
│   │   └── Challenges/      # Coding challenges
│   ├── navigation/          # Navigation setup
│   ├── store/              # Redux store
│   ├── services/           # API services
│   ├── utils/              # Helper functions
│   └── types/              # TypeScript definitions
├── android/
├── ios/
└── package.json
```

#### **Core Mobile Components**

##### **Mobile Code Editor Component**
```typescript
// src/components/CodeEditor/MobileCodeEditor.tsx
import React, { useState, useRef } from 'react';
import { View, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

interface MobileCodeEditorProps {
  language: 'javascript' | 'python' | 'php';
  initialCode?: string;
  onCodeChange: (code: string) => void;
}

export const MobileCodeEditor: React.FC<MobileCodeEditorProps> = ({
  language,
  initialCode = '',
  onCodeChange
}) => {
  const [code, setCode] = useState(initialCode);
  const [lineNumbers, setLineNumbers] = useState(['1']);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange(newCode);
    
    // Update line numbers
    const lines = newCode.split('\n');
    setLineNumbers(lines.map((_, index) => (index + 1).toString()));
  };

  return (
    <View style={styles.container}>
      <View style={styles.lineNumbers}>
        {lineNumbers.map((num, index) => (
          <Text key={index} style={styles.lineNumber}>{num}</Text>
        ))}
      </View>
      
      <ScrollView style={styles.editorContainer}>
        <TextInput
          style={styles.codeInput}
          multiline
          value={code}
          onChangeText={handleCodeChange}
          placeholder={`Start coding in ${language}...`}
          placeholderTextColor="#666"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          fontFamily="Monaco"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  lineNumbers: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#2d2d2d',
    minWidth: 40,
  },
  lineNumber: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Monaco',
    lineHeight: 18,
  },
  editorContainer: {
    flex: 1,
  },
  codeInput: {
    flex: 1,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Monaco',
    lineHeight: 18,
  },
});
```

##### **Mobile Dashboard Screen**
```typescript
// src/screens/Dashboard/MobileDashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';

import { ProgressCard } from '../../components/ProgressCard';
import { AchievementCard } from '../../components/AchievementCard';
import { ChallengeCard } from '../../components/ChallengeCard';
import { fetchDashboardData } from '../../store/slices/dashboardSlice';

const { width } = Dimensions.get('window');

export const MobileDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user, progress, achievements, challenges, loading } = useSelector(
    (state: RootState) => state.dashboard
  );
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchDashboardData());
    setRefreshing(false);
  };

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Selamat datang, {user?.name}!
          </Text>
          <Text style={styles.subtitleText}>
            Mari teruskan pembelajaran anda
          </Text>
        </View>

        {/* Progress Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kemajuan Anda</Text>
          <ProgressCard
            xp={progress?.totalXp || 0}
            level={progress?.level || 1}
            completedChallenges={progress?.completedChallenges || 0}
            streak={progress?.streak || 0}
          />
        </View>

        {/* Recent Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pencapaian Terbaru</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {achievements?.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                style={styles.achievementCard}
              />
            ))}
          </ScrollView>
        </View>

        {/* Available Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cabaran Tersedia</Text>
          {challenges?.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              style={styles.challengeCard}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  achievementCard: {
    marginRight: 15,
    width: width * 0.3,
  },
  challengeCard: {
    marginBottom: 15,
  },
});
```

### **Mobile-Specific Features**

#### **Camera Code Scanner**
```typescript
// src/components/CodeScanner/CameraCodeScanner.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RNCamera } from 'react-native-camera';
import TextRecognition from 'react-native-text-recognition';

export const CameraCodeScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedCode, setExtractedCode] = useState('');

  const handleScan = async (imageUri: string) => {
    try {
      setIsScanning(true);
      const result = await TextRecognition.recognize(imageUri);
      
      // Process OCR result to extract code
      const codeText = processOCRResult(result);
      setExtractedCode(codeText);
    } catch (error) {
      console.error('Code scanning error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const processOCRResult = (ocrResult: string): string => {
    // Clean and format extracted text to valid code
    return ocrResult
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  };

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        autoFocus={RNCamera.Constants.AutoFocus.on}
        captureAudio={false}
      >
        <View style={styles.overlay}>
          <Text style={styles.instructionText}>
            Fokuskan kamera pada kod yang ingin discan
          </Text>
          
          <TouchableOpacity
            style={styles.captureButton}
            onPress={() => {
              // Take picture and process
            }}
            disabled={isScanning}
          >
            <Text style={styles.captureButtonText}>
              {isScanning ? 'Memproses...' : 'Scan Kod'}
            </Text>
          </TouchableOpacity>
        </View>
      </RNCamera>
      
      {extractedCode && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Kod yang dikesan:</Text>
          <Text style={styles.resultCode}>{extractedCode}</Text>
        </View>
      )}
    </View>
  );
};
```

#### **Offline Learning Capability**
```typescript
// src/services/OfflineService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';

interface LessonData {
  id: string;
  title: string;
  content: string;
  exercises: Exercise[];
  downloadedAt: number;
}

export class OfflineService {
  private static STORAGE_KEY = 'offline_lessons';
  private static PROGRESS_KEY = 'offline_progress';

  static async downloadLesson(lessonId: string): Promise<void> {
    try {
      // Check if online
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }

      // Fetch lesson data
      const response = await fetch(`/api/lessons/${lessonId}`);
      const lessonData: LessonData = await response.json();
      
      // Store offline
      const existingLessons = await this.getOfflineLessons();
      const updatedLessons = {
        ...existingLessons,
        [lessonId]: {
          ...lessonData,
          downloadedAt: Date.now()
        }
      };
      
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(updatedLessons)
      );
    } catch (error) {
      console.error('Download lesson error:', error);
      throw error;
    }
  }

  static async getOfflineLessons(): Promise<Record<string, LessonData>> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Get offline lessons error:', error);
      return {};
    }
  }

  static async saveProgress(lessonId: string, progress: any): Promise<void> {
    try {
      const existingProgress = await this.getOfflineProgress();
      const updatedProgress = {
        ...existingProgress,
        [lessonId]: {
          ...progress,
          updatedAt: Date.now()
        }
      };
      
      await AsyncStorage.setItem(
        this.PROGRESS_KEY,
        JSON.stringify(updatedProgress)
      );
    } catch (error) {
      console.error('Save progress error:', error);
    }
  }

  static async syncWhenOnline(): Promise<void> {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) return;

    try {
      const offlineProgress = await this.getOfflineProgress();
      
      // Sync each lesson progress
      for (const [lessonId, progress] of Object.entries(offlineProgress)) {
        await fetch(`/api/progress/${lessonId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progress)
        });
      }
      
      // Clear offline progress after sync
      await AsyncStorage.removeItem(this.PROGRESS_KEY);
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  private static async getOfflineProgress(): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem(this.PROGRESS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  }
}
```

## 🤖 **Priority 2: AI Integration**

### **AI Code Review Service**

#### **Backend AI Service Setup**
```python
# ai_service/code_review.py
import openai
import ast
import pylint
import bandit
from typing import Dict, List, Any

class CodeReviewAI:
    def __init__(self, openai_api_key: str):
        self.openai_client = openai.OpenAI(api_key=openai_api_key)
        
    async def analyze_code(self, code: str, language: str) -> Dict[str, Any]:
        """Comprehensive code analysis using AI and static analysis tools"""
        
        # Static analysis
        static_analysis = await self._static_analysis(code, language)
        
        # AI-powered analysis
        ai_analysis = await self._ai_analysis(code, language)
        
        # Security analysis
        security_analysis = await self._security_analysis(code, language)
        
        return {
            'overall_score': self._calculate_score(static_analysis, ai_analysis),
            'static_analysis': static_analysis,
            'ai_suggestions': ai_analysis,
            'security_issues': security_analysis,
            'learning_resources': self._generate_learning_resources(ai_analysis)
        }
    
    async def _ai_analysis(self, code: str, language: str) -> Dict[str, Any]:
        """Use OpenAI to analyze code quality and provide suggestions"""
        
        prompt = f"""
        Analyze this {language} code for:
        1. Code quality and best practices
        2. Performance optimizations
        3. Readability improvements
        4. Educational feedback for learning

        Code:
        ```{language}
        {code}
        ```

        Provide structured feedback in JSON format:
        {{
            "quality_score": <1-10>,
            "suggestions": [
                {{
                    "type": "improvement|optimization|style",
                    "line": <line_number>,
                    "message": "Description",
                    "example": "Improved code example"
                }}
            ],
            "positive_aspects": ["List of good practices found"],
            "learning_points": ["Educational insights"]
        }}
        """
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
    
    async def _static_analysis(self, code: str, language: str) -> Dict[str, Any]:
        """Perform static code analysis"""
        
        if language == 'python':
            return await self._analyze_python(code)
        elif language == 'javascript':
            return await self._analyze_javascript(code)
        elif language == 'php':
            return await self._analyze_php(code)
        
        return {}
    
    async def _analyze_python(self, code: str) -> Dict[str, Any]:
        """Python-specific static analysis"""
        try:
            # Parse AST
            tree = ast.parse(code)
            
            # Pylint analysis
            pylint_score = self._run_pylint(code)
            
            # Complexity analysis
            complexity = self._calculate_complexity(tree)
            
            return {
                'syntax_valid': True,
                'pylint_score': pylint_score,
                'complexity': complexity,
                'ast_analysis': self._analyze_ast(tree)
            }
        except SyntaxError as e:
            return {
                'syntax_valid': False,
                'syntax_error': str(e),
                'line': e.lineno
            }
    
    def _calculate_score(self, static: Dict, ai: Dict) -> float:
        """Calculate overall code quality score"""
        static_score = static.get('pylint_score', 5) / 10
        ai_score = ai.get('quality_score', 5) / 10
        
        return round((static_score + ai_score) / 2 * 100, 1)
```

#### **Frontend AI Integration**
```typescript
// src/services/AICodeReview.ts
interface CodeAnalysis {
  overallScore: number;
  suggestions: CodeSuggestion[];
  securityIssues: SecurityIssue[];
  learningResources: LearningResource[];
}

interface CodeSuggestion {
  type: 'improvement' | 'optimization' | 'style';
  line: number;
  message: string;
  example?: string;
}

export class AICodeReviewService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;

  async analyzeCode(code: string, language: string): Promise<CodeAnalysis> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze code');
      }

      return await response.json();
    } catch (error) {
      console.error('AI code analysis error:', error);
      throw error;
    }
  }

  async getPersonalizedFeedback(
    userId: string,
    codeHistory: string[]
  ): Promise<PersonalizedFeedback> {
    const response = await fetch(`${this.baseUrl}/api/ai/personalized-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, codeHistory }),
    });

    return await response.json();
  }

  async generateExercise(
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    topic: string,
    language: string
  ): Promise<GeneratedExercise> {
    const response = await fetch(`${this.baseUrl}/api/ai/generate-exercise`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ difficulty, topic, language }),
    });

    return await response.json();
  }
}

// Usage in React component
export const AICodeReviewPanel: React.FC<{ code: string; language: string }> = ({
  code,
  language
}) => {
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const aiService = new AICodeReviewService();

  const analyzeCode = async () => {
    setLoading(true);
    try {
      const result = await aiService.analyzeCode(code, language);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-review-panel">
      <button onClick={analyzeCode} disabled={loading}>
        {loading ? 'Menganalisis...' : 'Analisis Kod dengan AI'}
      </button>

      {analysis && (
        <div className="analysis-results">
          <div className="score">
            <h3>Skor Kualiti: {analysis.overallScore}/100</h3>
          </div>

          <div className="suggestions">
            <h4>Cadangan Penambahbaikan:</h4>
            {analysis.suggestions.map((suggestion, index) => (
              <div key={index} className="suggestion">
                <span className="line">Baris {suggestion.line}</span>
                <span className="type">{suggestion.type}</span>
                <p>{suggestion.message}</p>
                {suggestion.example && (
                  <pre className="example">{suggestion.example}</pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## 🏢 **Priority 3: Enterprise Multi-Tenant Architecture**

### **Database Schema for Multi-Tenancy**
```sql
-- Multi-tenant database schema
-- tenants.sql

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'basic',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

CREATE TABLE tenant_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    custom_settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security (RLS) for tenant isolation
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY tenant_users_policy ON users
    FOR ALL
    USING (
        id IN (
            SELECT user_id FROM tenant_users 
            WHERE tenant_id = current_setting('app.tenant_id')::UUID
        )
    );

CREATE POLICY tenant_courses_policy ON courses
    FOR ALL
    USING (
        id IN (
            SELECT course_id FROM tenant_courses 
            WHERE tenant_id = current_setting('app.tenant_id')::UUID
        )
    );
```

### **Enterprise Dashboard Implementation**
```typescript
// src/components/enterprise/EnterpriseDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, Grid, Typography, Box, Tab, Tabs } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface EnterpriseDashboardProps {
  tenantId: string;
}

export const EnterpriseDashboard: React.FC<EnterpriseDashboardProps> = ({
  tenantId
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [analytics, setAnalytics] = useState<EnterpriseAnalytics | null>(null);

  useEffect(() => {
    fetchEnterpriseAnalytics();
  }, [tenantId]);

  const fetchEnterpriseAnalytics = async () => {
    try {
      const response = await fetch(`/api/enterprise/${tenantId}/analytics`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Enterprise Dashboard
      </Typography>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label="Overview" />
        <Tab label="Student Progress" />
        <Tab label="Course Analytics" />
        <Tab label="Teacher Performance" />
        <Tab label="Reports" />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Key Metrics */}
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h3" color="primary">
                {analytics?.totalStudents || 0}
              </Typography>
              <Typography variant="body2">Total Students</Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h3" color="secondary">
                {analytics?.activeCourses || 0}
              </Typography>
              <Typography variant="body2">Active Courses</Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h3" color="success.main">
                {analytics?.completionRate || 0}%
              </Typography>
              <Typography variant="body2">Completion Rate</Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main">
                {analytics?.averageScore || 0}
              </Typography>
              <Typography variant="body2">Average Score</Typography>
            </Card>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Student Progress Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.progressOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="completedLessons"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Course Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.courseDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {analytics?.courseDistribution?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${index * 45}, 70%, 60%)`}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Additional tabs content... */}
    </Box>
  );
};
```

## 📱 **Deployment & DevOps for Phase 4**

### **CI/CD Pipeline for Mobile Apps**
```yaml
# .github/workflows/mobile-deploy.yml
name: Mobile App Deployment

on:
  push:
    branches: [main]
    paths: ['mobile/**']

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: mobile/package-lock.json
      
      - name: Install dependencies
        working-directory: mobile
        run: npm ci
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '11'
      
      - name: Setup Android SDK
        uses: android-actions/setup-android@v2
      
      - name: Build Android APK
        working-directory: mobile
        run: |
          cd android
          ./gradlew assembleRelease
      
      - name: Upload to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}
          packageName: com.codecikgu.mobile
          releaseFiles: mobile/android/app/build/outputs/apk/release/app-release.apk
          track: internal

  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: mobile/package-lock.json
      
      - name: Install dependencies
        working-directory: mobile
        run: npm ci
      
      - name: Setup Xcode
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: latest-stable
      
      - name: Build iOS
        working-directory: mobile/ios
        run: |
          xcodebuild -workspace CodeCikguMobile.xcworkspace \
                     -scheme CodeCikguMobile \
                     -configuration Release \
                     -destination generic/platform=iOS \
                     -archivePath CodeCikguMobile.xcarchive \
                     archive
      
      - name: Upload to App Store
        uses: apple-actions/upload-testflight-build@v1
        with:
          app-path: mobile/ios/CodeCikguMobile.xcarchive
          issuer-id: ${{ secrets.APP_STORE_CONNECT_ISSUER_ID }}
          api-key-id: ${{ secrets.APP_STORE_CONNECT_KEY_ID }}
          api-private-key: ${{ secrets.APP_STORE_CONNECT_PRIVATE_KEY }}
```

### **Microservices Deployment**
```yaml
# docker-compose.yml for development
version: '3.8'

services:
  # API Gateway
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=development
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  # User Service
  user-service:
    build: ./services/user-service
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/users
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres

  # Learning Service
  learning-service:
    build: ./services/learning-service
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/learning
      - AI_SERVICE_URL=http://ai-service:8000
    depends_on:
      - postgres
      - ai-service

  # AI Service
  ai-service:
    build: ./services/ai-service
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - MODEL_PATH=/models
    volumes:
      - ./models:/models

  # Analytics Service
  analytics-service:
    build: ./services/analytics-service
    environment:
      - CLICKHOUSE_URL=http://clickhouse:8123
      - KAFKA_BROKERS=kafka:9092
    depends_on:
      - clickhouse
      - kafka

  # Databases
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=codecikgu
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  clickhouse:
    image: clickhouse/clickhouse-server:latest
    volumes:
      - clickhouse_data:/var/lib/clickhouse

  kafka:
    image: confluentinc/cp-kafka:latest
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    depends_on:
      - zookeeper

  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

volumes:
  postgres_data:
  redis_data:
  clickhouse_data:
```

This technical implementation guide provides the foundation for Phase 4 development. Each component is designed to be scalable, maintainable, and aligned with the overall vision of making CodeCikgu a global leader in coding education.

The next steps would be to:
1. Set up the development environment
2. Begin mobile app development
3. Implement AI integration proof of concept
4. Design enterprise architecture
5. Plan the 18-month roadmap execution

🚀 **Ready to transform coding education globally with CodeCikgu Phase 4!**
