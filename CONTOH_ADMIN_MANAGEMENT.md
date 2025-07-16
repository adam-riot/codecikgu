# **Contoh Pengurusan Admin: Teori vs Coding**

## **Admin Interface untuk Tambah Cabaran**

### **1. Tambah Cabaran Teori**

```typescript
// Interface dalam AdminGamificationPanel.tsx
const createTheoryChallenge = {
  title: "Sistem Komputer - Komponen Hardware",
  type: "THEORY", // Jenis cabaran
  subject: "Computer Science",
  grade: "T4", // Tingkatan 4
  dskp_topic: "1.1 Komponen Asas Sistem Komputer",
  
  // Kandungan teori
  content: {
    reading_material: "nota_sistem_komputer.pdf",
    video_url: "https://youtube.com/watch?v=hardware_intro",
    interactive_diagram: "system_diagram.svg"
  },
  
  // Aktiviti dan penilaian
  activities: [
    {
      type: "QUIZ",
      questions: [
        {
          question: "Apakah fungsi utama CPU?",
          options: ["Simpan data", "Proses data", "Paparan data", "Input data"],
          correct: 1,
          explanation: "CPU berfungsi memproses semua data dan arahan..."
        }
      ],
      xp_reward: 25
    },
    {
      type: "DRAG_DROP",
      task: "Susun komponen mengikut aliran data",
      xp_reward: 30
    },
    {
      type: "ESSAY",
      question: "Terangkan proses input-process-output dengan contoh",
      max_words: 200,
      rubric: ["Kejelasan", "Contoh tepat", "Struktur"],
      xp_reward: 40
    }
  ],
  
  // Gamifikasi
  unlock_requirements: {
    previous_level: "hardware_intro",
    min_xp: 100
  },
  rewards: {
    xp: 95,
    badge: "hardware_expert",
    unlock_next: ["advanced_hardware", "software_basics"]
  }
}
```

### **2. Tambah Cabaran Coding**

```typescript
const createCodingChallenge = {
  title: "Python - Struktur Kawalan Loop",
  type: "CODING", // Jenis cabaran
  subject: "Computer Science", 
  grade: "T5", // Tingkatan 5
  dskp_topic: "2.3 Struktur Kawalan Berulang",
  
  // Kandungan coding
  content: {
    tutorial: "python_loops_tutorial.md",
    video_demo: "https://youtube.com/watch?v=python_loops",
    code_examples: [
      {
        title: "For Loop Asas",
        code: `for i in range(5):\n    print(f"Nombor: {i}")`,
        explanation: "Loop ini akan ulang 5 kali..."
      }
    ]
  },
  
  // Coding challenges berperingkat
  coding_tasks: [
    {
      level: "BEGINNER",
      title: "Print Pattern Bintang",
      description: "Cipta pattern segitiga menggunakan for loop",
      starter_code: `# Tulis kod untuk print pattern:\n# *\n# **\n# ***\n# ****\n# *****\n\nn = 5\n# Kodkan penyelesaian di sini`,
      test_cases: [
        {
          input: "5",
          expected_output: "*\n**\n***\n****\n*****"
        }
      ],
      xp_reward: 30
    },
    {
      level: "INTERMEDIATE", 
      title: "Kira Jumlah Nombor Genap",
      description: "Gunakan loop untuk kira jumlah nombor genap 1-100",
      starter_code: `# Kira jumlah semua nombor genap dari 1 hingga 100\n\ntotal = 0\n# Kodkan penyelesaian di sini\n\nprint(f"Jumlah: {total}")`,
      test_cases: [
        {
          input: "100",
          expected_output: "Jumlah: 2550"
        }
      ],
      xp_reward: 50
    },
    {
      level: "ADVANCED",
      title: "Program Pengurusan Skor",
      description: "Cipta program untuk kira purata dan gred murid",
      starter_code: `# Program untuk input skor murid dan kira purata\n# Tentukan gred berdasarkan purata\n\ndef kira_gred(skor_list):\n    # Kodkan fungsi di sini\n    pass\n\n# Test kod dengan data sample`,
      test_cases: [
        {
          input: "[85, 92, 78, 90, 88]",
          expected_output: "Purata: 86.6, Gred: A"
        }
      ],
      xp_reward: 75
    }
  ],
  
  // Auto-grading system
  evaluation: {
    auto_test: true,
    code_quality_check: true,
    performance_benchmark: true,
    style_guide: "PEP8"
  },
  
  // Gamifikasi
  unlock_requirements: {
    previous_level: "python_basics",
    min_xp: 200
  },
  rewards: {
    xp: 155, // Total dari semua tasks
    badge: "loop_master", 
    unlock_next: ["functions_advanced", "data_structures"]
  }
}
```

### **3. Interface Admin untuk Kedua-Dua Jenis**

```typescript
// Dalam AdminGamificationPanel.tsx
const AdminChallengeCreator = () => {
  const [challengeType, setChallengeType] = useState<'THEORY' | 'CODING'>('THEORY');
  
  return (
    <div className="admin-challenge-creator">
      {/* Toggle antara Teori dan Coding */}
      <div className="challenge-type-selector">
        <button 
          className={challengeType === 'THEORY' ? 'active' : ''}
          onClick={() => setChallengeType('THEORY')}
        >
          📚 Cabaran Teori
        </button>
        <button 
          className={challengeType === 'CODING' ? 'active' : ''}
          onClick={() => setChallengeType('CODING')}
        >
          💻 Cabaran Coding
        </button>
      </div>

      {/* Form berdasarkan jenis */}
      {challengeType === 'THEORY' ? (
        <TheoryChallengeForm />
      ) : (
        <CodingChallengeForm />
      )}
    </div>
  );
};

// Form untuk Theory Challenge
const TheoryChallengeForm = () => (
  <form className="theory-form">
    <h3>📚 Cipta Cabaran Teori</h3>
    
    {/* Basic Info */}
    <div className="form-section">
      <h4>Maklumat Asas</h4>
      <input placeholder="Tajuk cabaran..." />
      <select>
        <option value="T4">Tingkatan 4</option>
        <option value="T5">Tingkatan 5</option>
      </select>
      <input placeholder="Topik DSKP..." />
    </div>

    {/* Content Upload */}
    <div className="form-section">
      <h4>Bahan Pembelajaran</h4>
      <FileUpload accept=".pdf,.doc" label="Upload nota" />
      <input placeholder="URL video (opsional)" />
      <ImageUpload label="Diagram interaktif" />
    </div>

    {/* Assessment Types */}
    <div className="form-section">
      <h4>Jenis Penilaian</h4>
      <CheckboxGroup options={[
        "Multiple Choice Quiz",
        "Drag & Drop Activity", 
        "Essay Questions",
        "Interactive Diagram",
        "Case Study Analysis"
      ]} />
    </div>

    {/* Gamification */}
    <div className="form-section">
      <h4>Tetapan Gamifikasi</h4>
      <input type="number" placeholder="XP reward" />
      <input placeholder="Nama lencana" />
      <select>
        <option>Level yang dibuka seterusnya</option>
      </select>
    </div>
  </form>
);

// Form untuk Coding Challenge  
const CodingChallengeForm = () => (
  <form className="coding-form">
    <h3>💻 Cipta Cabaran Coding</h3>
    
    {/* Basic Info */}
    <div className="form-section">
      <h4>Maklumat Asas</h4>
      <input placeholder="Tajuk cabaran..." />
      <select>
        <option value="Python">Python</option>
        <option value="JavaScript">JavaScript</option>
        <option value="HTML/CSS">HTML/CSS</option>
      </select>
      <select>
        <option value="BEGINNER">Beginner</option>
        <option value="INTERMEDIATE">Intermediate</option>
        <option value="ADVANCED">Advanced</option>
      </select>
    </div>

    {/* Code Template */}
    <div className="form-section">
      <h4>Template Kod</h4>
      <CodeEditor 
        placeholder="# Kod starter untuk murid..."
        language="python"
      />
      <textarea placeholder="Penerangan tugasan..." />
    </div>

    {/* Test Cases */}
    <div className="form-section">
      <h4>Test Cases</h4>
      <TestCaseBuilder />
      <button onClick={addTestCase}>+ Tambah Test Case</button>
    </div>

    {/* Auto-grading */}
    <div className="form-section">
      <h4>Penilaian Automatik</h4>
      <CheckboxGroup options={[
        "Auto-test kod",
        "Semak kualiti kod", 
        "Benchmark prestasi",
        "Style guide check"
      ]} />
    </div>

    {/* Gamification */}
    <div className="form-section">
      <h4>Tetapan Gamifikasi</h4>
      <input type="number" placeholder="XP per test case pass" />
      <input type="number" placeholder="Bonus XP untuk perfect solution" />
      <input placeholder="Nama lencana untuk completion" />
    </div>
  </form>
);
```

### **4. Sistem XP dan Lencana untuk Kedua-Dua Jenis**

```typescript
// XP Distribution System
const XP_SYSTEM = {
  THEORY: {
    quiz_completion: 25,
    perfect_score: 40, 
    essay_submission: 30,
    diagram_activity: 35,
    note_reading: 15,
    video_watching: 10
  },
  CODING: {
    code_execution: 20,
    test_case_pass: 15,
    perfect_solution: 50,
    code_quality: 25,
    early_submission: 10,
    help_others: 30
  }
};

// Badge System untuk kedua-dua jenis
const BADGE_SYSTEM = {
  THEORY_BADGES: [
    {
      id: "theory_novice",
      name: "Pembaca Teori",
      description: "Baca 5 topik teori",
      icon: "📖",
      requirement: { theory_topics_read: 5 }
    },
    {
      id: "quiz_master", 
      name: "Master Kuiz",
      description: "Score 90%+ dalam 10 kuiz",
      icon: "🧠",
      requirement: { quiz_high_score: 10 }
    }
  ],
  CODING_BADGES: [
    {
      id: "code_warrior",
      name: "Pejuang Kod",
      description: "Selesai 10 cabaran coding",
      icon: "⚔️",
      requirement: { coding_challenges: 10 }
    },
    {
      id: "debug_detective",
      name: "Detektif Debug", 
      description: "Betulkan 20 kod yang error",
      icon: "🔍",
      requirement: { bugs_fixed: 20 }
    }
  ]
};
```

## **Kesimpulan**

Sistem gamifikasi CodeCikgu telah direka untuk menampung **kedua-dua jenis pembelajaran**:

1. **📚 Teori**: Kuiz interaktif, aktiviti drag-drop, esei, dan analisis kes
2. **💻 Coding**: Programming challenges, auto-grading, test cases, dan projek

**Admin boleh dengan mudah**:
- Toggle antara jenis cabaran (Teori/Coding)
- Set XP rewards yang berbeza untuk setiap jenis
- Tambah test cases automatik untuk coding
- Upload bahan pembelajaran untuk teori
- Monitor progress murid dalam kedua-dua aspek

Sistem ini memastikan **penjajaran penuh dengan DSKP** dan memberikan pengalaman pembelajaran yang seimbang antara pemahaman konsep dan kemahiran praktikal.
