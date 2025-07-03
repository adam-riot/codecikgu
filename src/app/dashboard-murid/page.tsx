'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// --- Interfaces ---
interface Profile {
  id: string; name: string; email: string; sekolah: string; tingkatan: string; xp: number;
}
interface Progress {
  id: string; topik: string; selesai: boolean;
}
interface Ganjaran {
  id: string; nama: string; deskripsi: string; syarat_xp: number; imej_url: string;
}

// --- Komponen Utama ---
export default function DashboardMurid() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [ganjaran, setGanjaran] = useState<Ganjaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const topics = [
    { name: 'Pengenalan Sains Komputer', xp: 100, icon: '💻' }, { name: 'Sistem Nombor', xp: 150, icon: '🔢' }, { name: 'Asas Pemrograman', xp: 200, icon: '⚡' }, { name: 'Struktur Data', xp: 250, icon: '🗂️' }, { name: 'Algoritma', xp: 300, icon: '🧠' }, { name: 'Pangkalan Data', xp: 200, icon: '🗄️' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);

      const { data: progressData } = await supabase.from('progress').select('*').eq('user_id', user.id);
      if (progressData) setProgress(progressData);

      const { data: ganjaranData } = await supabase.from('ganjaran').select('*').order('syarat_xp', { ascending: true });
      if (ganjaranData) setGanjaran(ganjaranData);
      
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const getXPLevel = (xp: number) => {
    if (xp >= 1000) return { level: 'Expert', color: 'from-purple-500 to-pink-500', icon: '👑' };
    if (xp >= 500) return { level: 'Advanced', color: 'from-neon-green to-electric-blue', icon: '⭐' };
    if (xp >= 200) return { level: 'Intermediate', color: 'from-electric-blue to-neon-cyan', icon: '🚀' };
    return { level: 'Beginner', color: 'from-gray-500 to-gray-700', icon: '🌱' };
  };

  const getProgressPercentage = () => {
    if (topics.length === 0) return 0;
    const completedTopics = progress.filter(p => p.selesai).length;
    return Math.round((completedTopics / topics.length) * 100);
  };

  const getAvailableRewards = () => {
    if (!profile) return [];
    return ganjaran.filter(g => profile.xp >= g.syarat_xp);
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center"><div className="glass-dark rounded-2xl p-8 text-center"><div className="text-2xl text-gradient loading-dots">Memuat dashboard</div></div></div>;
  }
  if (!profile) {
    return <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center"><div className="glass-dark rounded-2xl p-8 text-center"><div className="text-xl text-red-400">Profil tidak ditemui.</div></div></div>;
  }

  const levelInfo = getXPLevel(profile.xp);
  const progressPercentage = getProgressPercentage();
  const availableRewards = getAvailableRewards();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      <section className="relative py-16 overflow-hidden bg-circuit">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gradient">Selamat Datang, {profile.name}!</h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">{profile.sekolah} • Tingkatan {profile.tingkatan}</p>
            <div className="glass-dark rounded-2xl p-6 neon-glow">
              <div className="flex items-center justify-center mb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${levelInfo.color} rounded-full flex items-center justify-center mr-4`}><span className="text-2xl">{levelInfo.icon}</span></div>
                <div><div className="text-2xl font-bold text-gradient">{profile.xp} XP</div><div className={`text-sm bg-gradient-to-r ${levelInfo.color} bg-clip-text text-transparent font-semibold`}>{levelInfo.level}</div></div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2"><div className="bg-gradient-to-r from-electric-blue to-neon-cyan h-3 rounded-full" style={{ width: `${progressPercentage}%` }}></div></div>
              <div className="text-sm text-gray-400">Kemajuan: {progressPercentage}%</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="glass-dark rounded-2xl p-2 mb-8 max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveTab('overview')} className={`px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'overview' ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white' : 'text-gray-400 hover:bg-electric-blue/10'}`}>Gambaran Keseluruhan</button>
            <button onClick={() => setActiveTab('rewards')} className={`px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'rewards' ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white' : 'text-gray-400 hover:bg-electric-blue/10'}`}>Ganjaran</button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {activeTab === 'rewards' && (
            <div className="glass-dark rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gradient-green mb-6">Ganjaran Anda</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableRewards.map((reward) => (
                  <div key={reward.id} className="glass rounded-xl p-6 border border-neon-green/30">
                    {reward.imej_url && (
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden flex items-center justify-center">
                        <Image src={reward.imej_url} alt={reward.nama} width={64} height={64} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-neon-green text-center">{reward.nama}</h3>
                    <p className="text-gray-300 text-sm text-center">{reward.deskripsi}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
