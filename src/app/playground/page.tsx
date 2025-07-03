'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
// --- PADAMKAN IMPORT LAMA INI ---
// import CodeEditor from '../../components/playground/CodeEditor'
// import ProjectManager from '../../components/playground/ProjectManager'
// --- TAMBAH DYNAMIC IMPORT INI ---
import dynamic from 'next/dynamic';
import { Play, Save, Download, Settings, FolderOpen, Plus, Code, Palette } from 'lucide-react'

// --- Interfaces ---
interface Project {
  id: string; name: string; language: string; code: string; created_at: string; updated_at: string;
}
interface Profile {
  id: string; name: string; email: string;
}

// --- Static Data (Moved outside component to prevent re-creation) ---
const languages = [
  { id: 'javascript', name: 'JavaScript', icon: '🟨', extension: 'js' }, { id: 'typescript', name: 'TypeScript', icon: '🔷', extension: 'ts' }, { id: 'python', name: 'Python', icon: '🐍', extension: 'py' }, { id: 'html', name: 'HTML', icon: '🌐', extension: 'html' }, { id: 'css', name: 'CSS', icon: '🎨', extension: 'css' }, { id: 'java', name: 'Java', icon: '☕', extension: 'java' }, { id: 'cpp', name: 'C++', icon: '⚡', extension: 'cpp' }, { id: 'csharp', name: 'C#', icon: '🔵', extension: 'cs' }, { id: 'php', name: 'PHP', icon: '🐘', extension: 'php' }, { id: 'sql', name: 'SQL', icon: '🗄️', extension: 'sql' }, { id: 'json', name: 'JSON', icon: '📋', extension: 'json' }, { id: 'xml', name: 'XML', icon: '📄', extension: 'xml' }, { id: 'markdown', name: 'Markdown', icon: '📝', extension: 'md' }, { id: 'yaml', name: 'YAML', icon: '⚙️', extension: 'yml' }, { id: 'go', name: 'Go', icon: '🐹', extension: 'go' }
];
const themes = [
  { id: 'vs-dark', name: 'Dark (VS Code)', icon: '🌙' }, { id: 'vs', name: 'Light', icon: '☀️' }, { id: 'hc-black', name: 'High Contrast Dark', icon: '⚫' }, { id: 'hc-light', name: 'High Contrast Light', icon: '⚪' }
];
const codeTemplates: { [key: string]: string } = {
  javascript: `// JavaScript Playground\nconsole.log("Hello, CodeCikgu!");`,
  python: `# Python Playground\nprint("Hello, CodeCikgu!")`,
  html: `<!DOCTYPE html>\n<html>\n<head><title>Hello</title></head>\n<body><h1>Hello, CodeCikgu!</h1></body>\n</html>`,
  css: `/* CSS Playground */\nbody { font-family: sans-serif; }`,
  java: `// Java Playground\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, CodeCikgu!");\n  }\n}`,
  php: `<?php\n// PHP Playground\necho "Hello, CodeCikgu!";`,
  sql: `-- SQL Playground\nSELECT * FROM users;`
};

// --- DYNAMIC IMPORTS UNTUK KOMPONEN CLIENT-SIDE ---
const DynamicCodeEditor = dynamic(() => import('../../components/playground/CodeEditor'), {
  ssr: false, // Penting: Jangan render di server
  loading: () => <p className="text-white text-center p-4">Memuat Editor...</p>,
});

const DynamicProjectManager = dynamic(() => import('../../components/playground/ProjectManager'), {
  ssr: false, // Penting: Jangan render di server
  loading: () => <p className="text-white text-center p-4">Memuat Pengurus Projek...</p>,
});
// --- TAMAT DYNAMIC IMPORTS ---


// --- Komponen Utama ---
export default function Playground() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from('playground_projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
    if (data && !error) setProjects(data);
  }, []);

  const saveProject = useCallback(async () => {
    if (!currentProject || !profile) return;
    const { error } = await supabase.from('playground_projects').update({ code, language, updated_at: new Date().toISOString() }).eq('id', currentProject.id);
    if (!error) {
      setCurrentProject(prev => prev ? { ...prev, code, language } : null);
      await fetchProjects(profile.id);
    }
  }, [currentProject, profile, code, language, fetchProjects]);

  useEffect(() => {
    const initializePlayground = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);
      await fetchProjects(user.id);
      setCode(codeTemplates.javascript);
      setLoading(false);
    };
    initializePlayground();
  }, [router, fetchProjects]);

  useEffect(() => {
    if (!autoSave || !currentProject || !profile) return;
    const saveTimer = setTimeout(() => { saveProject(); }, 30000);
    return () => clearTimeout(saveTimer);
  }, [code, autoSave, currentProject, profile, saveProject]);

  const createNewProject = useCallback(async () => {
    if (!profile) return;
    const projectName = prompt('Nama projek baru:');
    if (!projectName) return;
    const newProjectData = { name: projectName, language, code: codeTemplates[language] || '', user_id: profile.id };
    const { data, error } = await supabase.from('playground_projects').insert(newProjectData).select().single();
    if (data && !error) {
      setCurrentProject(data);
      setCode(data.code);
      setLanguage(data.language);
      await fetchProjects(profile.id);
    }
  }, [profile, language, fetchProjects]);

  const loadProject = (project: Project) => {
    setCurrentProject(project);
    setCode(project.code);
    setLanguage(project.language);
    setShowProjectManager(false);
  };

  const downloadCode = () => {
    const selectedLang = languages.find(l => l.id === language);
    const extension = selectedLang?.extension || 'txt';
    const filename = currentProject ? `${currentProject.name}.${extension}` : `codecikgu-playground.${extension}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const runCode = () => {
    setIsRunning(true);
    setOutput('🚀 Menjalankan kod...');
    setTimeout(() => {
      if (language === 'javascript') {
        try {
          const logs: string[] = [];
          const originalLog = console.log;
          console.log = (...args) => { logs.push(args.map(a => String(a)).join(' ')); };
          eval(code);
          console.log = originalLog;
          setOutput(logs.length > 0 ? logs.join('\n') : 'Kod berjaya dijalankan! (Tiada output)');
        } catch (e) {
          setOutput(`❌ Ralat: ${(e as Error).message}`);
        }
      } else {
        setOutput(`✅ Preview untuk ${language.toUpperCase()} tidak tersedia dalam playground ini.`);
      }
      setIsRunning(false);
    }, 500);
  };

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (!currentProject) {
      setCode(codeTemplates[newLanguage] || '');
    }
  };

  const currentLanguageIcon = useMemo(() => languages.find(l => l.id === language)?.icon, [language]);
  const currentLanguageName = useMemo(() => languages.find(l => l.id === language)?.name, [language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center"><div className="text-2xl text-gradient loading-dots">Memuat playground</div></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      {/* Header */}
      <div className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-electric-blue to-neon-cyan rounded-lg flex items-center justify-center"><Code className="w-5 h-5 text-white" /></div>
              <div><h1 className="text-xl font-bold text-gradient">CodeCikgu Playground</h1><p className="text-sm text-gray-400">{currentProject ? currentProject.name : 'Projek Baru'}</p></div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={language} onChange={(e) => changeLanguage(e.target.value)} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-electric-blue focus:outline-none">
                {languages.map((lang) => (<option key={lang.id} value={lang.id}>{lang.icon} {lang.name}</option>))}
              </select>
              <button onClick={() => setShowProjectManager(true)} className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg" title="Projek"><FolderOpen className="w-4 h-4" /></button>
              <button onClick={createNewProject} className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg" title="Projek Baru"><Plus className="w-4 h-4" /></button>
              <button onClick={saveProject} disabled={!currentProject} className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50" title="Simpan"><Save className="w-4 h-4" /></button>
              <button onClick={downloadCode} className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg" title="Muat Turun"><Download className="w-4 h-4" /></button>
              <button onClick={() => setShowSettings(true)} className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg" title="Tetapan"><Settings className="w-4 h-4" /></button>
              <button onClick={runCode} disabled={isRunning} className="px-4 py-2 bg-gradient-to-r from-electric-blue to-neon-cyan text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 flex items-center gap-2"><Play className="w-4 h-4" />{isRunning ? 'Menjalankan...' : 'Jalankan'}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          <div className="lg:col-span-2"><div className="glass-dark rounded-xl overflow-hidden h-full"><div className="p-4 border-b border-gray-700/50 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">{currentLanguageIcon}</span><span className="font-semibold text-white">{currentLanguageName} Editor</span></div>{autoSave && currentProject && (<span className="flex items-center gap-1 text-sm text-gray-400"><div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>Auto-save</span>)}</div><div className="h-[calc(100%-60px)]">
            {/* GUNA DynamicCodeEditor DI SINI */}
            <DynamicCodeEditor value={code} onChange={setCode} language={language} theme={theme} />
          </div></div></div>
          <div className="space-y-6"><div className="glass-dark rounded-xl overflow-hidden"><div className="p-4 border-b border-gray-700/50"><h3 className="font-semibold text-white flex items-center gap-2"><span>📤</span>Output</h3></div><div className="p-4 h-64 overflow-y-auto"><pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{output || 'Klik "Jalankan" untuk melihat output kod anda...'}</pre></div></div></div>
        </div>
      </div>

      {showProjectManager && (
        // GUNA DynamicProjectManager DI SINI
        <DynamicProjectManager projects={projects} onClose={() => setShowProjectManager(false)} onLoadProject={loadProject} onRefresh={() => profile && fetchProjects(profile.id)} />
      )}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-dark rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-gradient">Tetapan Playground</h2><button onClick={() => setShowSettings(false)} className="p-2 text-gray-400 hover:text-white">✕</button></div>
              <div className="space-y-6">
                <div><label className="block text-sm font-medium text-gray-300 mb-3"><Palette className="w-4 h-4 inline mr-2" />Tema Editor</label><div className="grid grid-cols-2 gap-2">{themes.map((t) => (<button key={t.id} onClick={() => setTheme(t.id)} className={`p-3 rounded-lg border-2 transition-all text-left ${theme === t.id ? 'border-electric-blue bg-electric-blue/10' : 'border-gray-600 hover:border-gray-500'}`}><div className="flex items-center gap-2"><span>{t.icon}</span><span className="text-sm font-medium text-white">{t.name}</span></div></button>))}</div></div>
                <div className="flex items-center justify-between"><label className="text-sm font-medium text-gray-300">Auto-save (30 saat)</label><button onClick={() => setAutoSave(!autoSave)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoSave ? 'bg-electric-blue' : 'bg-gray-600'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoSave ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-700/50"><button onClick={() => setShowSettings(false)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg">Simpan Tetapan</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
