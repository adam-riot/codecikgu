# CodeCikgu Platform - Copilot Instructions

## Platform Overview

CodeCikgu is a comprehensive **Computer Science education platform** for Malaysian secondary school students (Tingkatan 4 & 5), fully aligned with the **DSKP (Dokumen Standard Kurikulum dan Pentaksiran)** curriculum. The platform serves three distinct user types with different access levels.

## Architecture & Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL), Next.js API routes
- **Authentication**: Supabase Auth with role-based access
- **Deployment**: Vercel with PWA capabilities
- **Key Libraries**: Monaco Editor, Lucide React, Recharts, Socket.IO

## User Access Structure (Critical)

Understanding the user types is **essential** for any feature development:

### 🎓 MURID (Registered Students)
- **Full platform access** including gamification (XP, badges, streaks, leaderboards)
- Progress tracking, analytics, and personalized learning paths
- Social features (study groups, collaboration)
- Portfolio and project saving capabilities

### 🌐 AWAM (Public Users)
- **Content-only access** - all educational materials, notes, and playground
- Can attempt quizzes and challenges but **no progress tracking**
- **No gamification features** (no XP, badges, or leaderboards)
- Cannot save progress or join study groups

### 👨‍💼 ADMIN (Content Managers)
- Complete content management system for challenges and materials
- Platform analytics and user monitoring
- Gamification system management (levels, badges, challenges)

## Key Directories & Patterns

### `/src/app/` - Route Structure
- `dashboard-murid/` - Student dashboard with gamification
- `dashboard-awam/` - Public user dashboard (limited features)  
- `dashboard-admin/` - Admin management interface
- `gamification/` - Gamification hub (students only)
- `playground/` - Code editor (universal access)

### `/src/components/`
- `gamification/` - Level systems, exercise library, admin panels
- Component naming: Use descriptive names like `StudentProgressAnalytics.tsx`
- All components support dark/light themes via `ThemeProvider`

### `/src/types/`
- `curriculum.ts` - DSKP-aligned type definitions
- `supabase.ts` - Generated Supabase types

## Database Schema Patterns

### Gamification Tables (Supabase)
```sql
-- Core gamification tables
levels, exercises, user_progress, badges, xp_transactions
-- Admin-managed content
admin_challenges, learning_paths, dskp_topics
```

### Key Relationships
- User progress tied to `user_id` from Supabase Auth
- DSKP topics map to gamification elements
- Admin-created content flows to student experiences

## Development Conventions

### Component Development
- **Always check user type** before rendering gamification features
- Use `<ErrorBoundary>` for complex components
- Implement loading skeletons for better UX
- Mobile-first responsive design

### Gamification Logic
```typescript
// Example: Feature gating based on user type
const showGamification = userType === 'murid'; // Only for registered students
const showAdminPanel = userType === 'admin';   // Only for admins
```

### DSKP Alignment
- All educational content must map to DSKP topics
- Use standardized topic codes (e.g., `T4.2.1`, `T5.3.2`)
- Maintain curriculum.ts types for consistency

## Critical Workflows

### Adding New Features
1. **Identify user type requirements** - who can access this feature?
2. **Check DSKP alignment** - does this support curriculum goals?
3. **Implement access controls** - proper user type gating
4. **Add analytics tracking** - for admin insights

### Content Management
- Admin creates challenges via `AdminGamificationPanel`
- Content flows through approval process
- Student progress tracked in real-time
- Public users see content but no tracking

### Building & Deployment
```bash
npm run dev          # Development with Turbopack
npm run build        # Production build
npm run lint         # ESLint with custom config
```

## External Integrations

### Supabase Configuration
- Row Level Security (RLS) enabled
- User roles managed via metadata
- Real-time subscriptions for live features

### Monaco Editor Setup
- Configured for Python, JavaScript, HTML/CSS
- Custom themes for dark/light mode
- Auto-save every 5 seconds in playground

## Educational Context

### DSKP Compliance (Based on Official Documents)
The platform is aligned with official Malaysian education documents:

#### **Reference Documents**
- 📋 [DSKP Sains Komputer Tingkatan 4](https://cikgumk.com/wp-content/uploads/2021/03/DSKP-SAINS-KOMPUTER-TINGKATAN-4.pdf)
- 📋 [DSKP Sains Komputer Tingkatan 5](https://cikgumk.com/wp-content/uploads/2021/03/DSKP-SAINS-KOMPUTER-TINGKATAN-5.pdf)
- 📖 [Buku Teks Tingkatan 4](https://cikgumk.com/wp-content/uploads/2021/03/Sains-komputer-Tingkatan-4.pdf)
- 📖 [Buku Teks Tingkatan 5](https://cikgumk.com/wp-content/uploads/2021/03/Sains-Komputer_Tingkatan-5.pdf)

#### **Curriculum Structure**
- **Tingkatan 4**: Computer systems, networks, problem solving, basic Python programming
- **Tingkatan 5**: Control structures, functions, data structures, application development
- **Assessment Format**: All quizzes and evaluations follow SPM examination patterns
- **Content Mapping**: Every feature maps to specific DSKP topic codes (e.g., T4.2.1, T5.3.2)

#### **Implementation Notes**
- Use `/src/types/curriculum.ts` for DSKP topic definitions
- Refer to `KURIKULUM_MALAYSIA.md` for complete topic breakdown
- All gamification elements must tie to specific learning outcomes

### Gamification Philosophy
- **Students only** - maintains educational focus
- XP system rewards learning progress
- Badges tied to curriculum milestones
- Social features promote collaborative learning

## Common Patterns

### Error Handling
```typescript
// Use ErrorBoundary for component-level errors
// Supabase errors handled with proper user feedback
// Loading states for all async operations
```

### State Management
```typescript
// Context providers for theme, achievements, notifications
// Local storage for user preferences
// Supabase real-time for live data
```

### API Design
```typescript
// Next.js API routes for server-side logic
// Supabase client for direct database operations
// Proper error responses with status codes
```

## When Working on CodeCikgu

1. **Always consider the three user types** and their different access levels
2. **Verify DSKP alignment** for any educational content using the official documents
3. **Test gamification features with student accounts** only
4. **Use existing component patterns** for consistency
5. **Maintain mobile responsiveness** - 70%+ users are mobile
6. **Follow the established file structure** in `/src/app/` and `/src/components/`

### Working with DSKP Documents & SPM Format
- Reference the official DSKP PDFs when adding educational content
- Map new features to specific Standard Kandungan and Standard Pembelajaran
- Use the topic codes from `curriculum.ts` for consistency
- Ensure all assessments follow authentic SPM format guidelines
- Check `KURIKULUM_MALAYSIA.md` for existing curriculum mappings
- Use `SPM_QUESTION_ANALYSIS.md` for authentic question format patterns
- Implement questions using `SPMQuestionBankEnhanced.tsx` component patterns

### SPM Question Format Standards
CodeCikgu follows authentic Malaysian SPM question formats:
- **Paper 1 (Objektif)**: 50 MCQ questions, 75 minutes, 1 mark each
- **Paper 2 (Berstruktur)**: 8-10 structured questions, 150 minutes, varied marks
- **Paper 3 (Projek)**: Portfolio assessment, 100 marks, continuous assessment

### Authentic Question Types
1. **MCQ Questions**: 4 options (A-D), topics from T4/T5 DSKP
2. **Structured Questions**: Multi-part answers (a,b,c), detailed marking schemes
3. **Programming Questions**: Python code with sample answers and error handling
4. **System Analysis**: Diagrams, component identification, functional explanations

### Content Development Workflow
1. **Identify DSKP topic** from official documents
2. **Map to curriculum.ts** type definitions  
3. **Create appropriate user-gated features** (Murid vs Awam vs Admin)
4. **Implement gamification** (students only) tied to learning outcomes
5. **Add admin management interface** for content creation
6. **Test across all user types** and devices

This platform represents a significant investment in Malaysian computer science education - maintain the quality and educational focus that makes it unique.
