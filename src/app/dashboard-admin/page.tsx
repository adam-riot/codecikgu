'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import CreateChallenge from '@/components/CreateChallenge'
import Image from 'next/image'
import { Profile, XPLog, Ganjaran, Challenge } from '@/types' // Import dari types/index.ts

export default function DashboardAdmin() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [xpLogs, setXpLogs] = useState<XPLog[]>([])
  const [ganjaran, setGanjaran] = useState<Ganjaran[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [showAddChallengeModal, setShowAddChallengeModal] = useState(false)
  const [showCreateChallengeWizard, setShowCreateChallengeWizard] = useState(false)
  
  const [newGanjaran, setNewGanjaran] = useState({
    nama: '',
    deskripsi: '',
    syarat_xp: 0,
    imej_url: ''
  })

  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    type: 'quiz' as 'quiz' | 'video' | 'reading' | 'upload',
    subject: '',
    tingkatan: '',
    xp_reward: 0,
    due_date: '',
    evaluation_type: 'automatic' as 'automatic' | 'manual',
    content: {}
  })

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'adamsofi@codecikgu.com') {
        router.push('/login');
        return;
      }

      const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (profilesData) setProfiles(profilesData);

      const { data: xpLogsData } = await supabase.from('xp_log').select('*, profiles(name, email)').order('created_at', { ascending: false }).limit(50);
      if (xpLogsData) setXpLogs(xpLogsData as XPLog[]);

      const { data: ganjaranData } = await supabase.from('ganjaran').select('*').order('syarat_xp', { ascending: true });
      if (ganjaranData) setGanjaran(ganjaranData);

      const { data: challengesData } = await supabase.from('challenges').select('*, challenge_submissions(count)').order('created_at', { ascending: false });
      if (challengesData) setChallenges(challengesData as Challenge[]);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddGanjaran = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('ganjaran').insert([newGanjaran]);
      setNewGanjaran({ nama: '', deskripsi: '', syarat_xp: 0, imej_url: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding ganjaran:', error);
    }
  };

  const handleAddChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('challenges').insert([{ ...newChallenge, is_active: true }]);
      setNewChallenge({ title: '', description: '', type: 'quiz', subject: '', tingkatan: '', xp_reward: 0, due_date: '', evaluation_type: 'automatic', content: {} });
      setShowAddChallengeModal(false);
      fetchData();
    } catch (error) {
      console.error('Error adding challenge:', error);
    }
  };

  const handleDeleteGanjaran = async (id: string) => {
    if (confirm('Adakah anda pasti ingin memadam ganjaran ini?')) {
      try {
        await supabase.from('ganjaran').delete().eq('id', id);
        fetchData();
      } catch (error) {
        console.error('Error deleting ganjaran:', error);
      }
    }
  };

  const handleToggleChallengeStatus = async (id: string, currentStatus: boolean) => {
    try {
      await supabase.from('challenges').update({ is_active: !currentStatus }).eq('id', id);
      fetchData();
    } catch (error) {
      console.error('Error updating challenge status:', error);
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    if (confirm('Adakah anda pasti ingin memadam cabaran ini?')) {
      try {
        await supabase.from('challenges').delete().eq('id', id);
        fetchData();
      } catch (error) {
        console.error('Error deleting challenge:', error);
      }
    }
  };

  const getStats = useCallback(() => ({
    totalUsers: profiles.length,
    totalStudents: profiles.filter(p => p.role === 'murid').length,
    totalPublic: profiles.filter(p => p.role === 'awam').length,
    totalXP: profiles.reduce((sum, p) => sum + (p.xp || 0), 0),
    totalChallenges: challenges.length,
    activeChallenges: challenges.filter(c => c.is_active).length,
  }), [profiles, challenges]);

  const getChallengeTypeIcon = useCallback((type: string) => {
    const icons: { [key: string]: string } = { quiz: '📝', video: '🎥', reading: '📖', upload: '📤' };
    return icons[type] || '🏆';
  }, []);

  const getChallengeTypeName = useCallback((type: string) => {
    const names: { [key: string]: string } = { quiz: 'Kuiz', video: 'Video', reading: 'Bacaan', upload: 'Muat Naik' };
    return names[type] || 'Cabaran';
  }, []);

  const getChallengeStats = useCallback(() => ({
    quizCount: challenges.filter(c => c.type === 'quiz').length,
    videoCount: challenges.filter(c => c.type === 'video').length,
    readingCount: challenges.filter(c => c.type === 'reading').length,
    uploadCount: challenges.filter(c => c.type === 'upload').length,
    totalSubmissions: challenges.reduce((sum, c) => sum + (c.challenge_submissions?.[0]?.count || 0), 0),
  }), [challenges]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="text-white text-2xl">Memuatkan Dashboard Admin...</div>
      </div>
    );
  }

  const stats = getStats();
  const challengeStats = getChallengeStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black text-white">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Dashboard Admin</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 p-6 rounded-lg">Total Pengguna: {stats.totalUsers}</div>
          <div className="bg-gray-800/50 p-6 rounded-lg">Murid: {stats.totalStudents}</div>
          <div className="bg-gray-800/50 p-6 rounded-lg">Pengguna Awam: {stats.totalPublic}</div>
          <div className="bg-gray-800/50 p-6 rounded-lg">Total XP: {stats.totalXP}</div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-blue-600' : 'bg-gray-700'}`}>Pengguna</button>
          <button onClick={() => setActiveTab('challenges')} className={`px-4 py-2 rounded ${activeTab === 'challenges' ? 'bg-blue-600' : 'bg-gray-700'}`}>Cabaran</button>
          <button onClick={() => setActiveTab('xp-logs')} className={`px-4 py-2 rounded ${activeTab === 'xp-logs' ? 'bg-blue-600' : 'bg-gray-700'}`}>Log XP</button>
          <button onClick={() => setActiveTab('rewards')} className={`px-4 py-2 rounded ${activeTab === 'rewards' ? 'bg-blue-600' : 'bg-gray-700'}`}>Ganjaran</button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'users' && (
            <div className="bg-gray-800/50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Senarai Pengguna</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-2 text-left">Nama</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Role</th>
                      <th className="p-2 text-left">XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map(profile => (
                      <tr key={profile.id}>
                        <td className="p-2">{profile.name}</td>
                        <td className="p-2">{profile.email}</td>
                        <td className="p-2">{profile.role}</td>
                        <td className="p-2">{profile.xp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="bg-gray-800/50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Senarai Cabaran</h2>
                <div>
                  <button onClick={() => setShowCreateChallengeWizard(true)} className="bg-green-600 px-4 py-2 rounded mr-2">Tambah (Wizard)</button>
                  <button onClick={() => setShowAddChallengeModal(true)} className="bg-blue-500 px-4 py-2 rounded">Tambah Pantas</button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <p>Kuiz: {challengeStats.quizCount}</p>
                  <p>Video: {challengeStats.videoCount}</p>
                  <p>Bacaan: {challengeStats.readingCount}</p>
                  <p>Upload: {challengeStats.uploadCount}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-2 text-left">Ikon</th>
                      <th className="p-2 text-left">Tajuk</th>
                      <th className="p-2 text-left">Jenis</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challenges.map(challenge => (
                      <tr key={challenge.id}>
                        <td className="p-2">{getChallengeTypeIcon(challenge.type)}</td>
                        <td className="p-2">{challenge.title}</td>
                        <td className="p-2">{getChallengeTypeName(challenge.type)}</td>
                        <td className="p-2">{challenge.is_active ? 'Aktif' : 'Tidak Aktif'}</td>
                        <td className="p-2">
                          <button onClick={() => handleToggleChallengeStatus(challenge.id, challenge.is_active)} className="bg-yellow-600 px-2 py-1 rounded mr-2">Toggle</button>
                          <button onClick={() => handleDeleteChallenge(challenge.id)} className="bg-red-600 px-2 py-1 rounded">Padam</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'xp-logs' && (
            <div className="bg-gray-800/50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Log XP</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-2 text-left">Pengguna</th>
                      <th className="p-2 text-left">Aktiviti</th>
                      <th className="p-2 text-left">Mata</th>
                      <th className="p-2 text-left">Tarikh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {xpLogs.map(log => (
                      <tr key={log.id}>
                        <td className="p-2">{log.profiles?.name}</td>
                        <td className="p-2">{log.aktiviti}</td>
                        <td className="p-2">{log.mata}</td>
                        <td className="p-2">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="bg-gray-800/50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Ganjaran</h2>
              <form onSubmit={handleAddGanjaran} className="mb-8 space-y-4">
                <input type="text" placeholder="Nama Ganjaran" value={newGanjaran.nama} onChange={e => setNewGanjaran({...newGanjaran, nama: e.target.value})} className="w-full p-2 bg-gray-700 rounded" />
                <input type="number" placeholder="Syarat XP" value={newGanjaran.syarat_xp} onChange={e => setNewGanjaran({...newGanjaran, syarat_xp: parseInt(e.target.value)})} className="w-full p-2 bg-gray-700 rounded" />
                <input type="text" placeholder="URL Imej" value={newGanjaran.imej_url} onChange={e => setNewGanjaran({...newGanjaran, imej_url: e.target.value})} className="w-full p-2 bg-gray-700 rounded" />
                <textarea placeholder="Deskripsi" value={newGanjaran.deskripsi} onChange={e => setNewGanjaran({...newGanjaran, deskripsi: e.target.value})} className="w-full p-2 bg-gray-700 rounded"></textarea>
                <button type="submit" className="bg-blue-600 px-4 py-2 rounded">Tambah Ganjaran</button>
              </form>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ganjaran.map(item => (
                  <div key={item.id} className="bg-gray-700 p-4 rounded">
                    <Image src={item.imej_url} alt={item.nama} width={100} height={100} />
                    <h3 className="font-bold">{item.nama}</h3>
                    <p>{item.deskripsi}</p>
                    <p>Syarat: {item.syarat_xp} XP</p>
                    <button onClick={() => handleDeleteGanjaran(item.id)} className="bg-red-600 px-2 py-1 rounded mt-2">Padam</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Section */}
      {showAddChallengeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Tambah Cabaran Pantas</h2>
            <form onSubmit={handleAddChallenge} className="space-y-4">
              <input type="text" placeholder="Tajuk" value={newChallenge.title} onChange={e => setNewChallenge({...newChallenge, title: e.target.value})} className="w-full p-2 bg-gray-800 rounded" />
              <textarea placeholder="Deskripsi" value={newChallenge.description} onChange={e => setNewChallenge({...newChallenge, description: e.target.value})} className="w-full p-2 bg-gray-800 rounded"></textarea>
              <button type="submit" className="bg-blue-600 px-4 py-2 rounded">Tambah</button>
              <button type="button" onClick={() => setShowAddChallengeModal(false)} className="bg-gray-600 px-4 py-2 rounded ml-2">Batal</button>
            </form>
          </div>
        </div>
      )}

      {showCreateChallengeWizard && (
        <CreateChallenge 
          onClose={() => setShowCreateChallengeWizard(false)} 
          onChallengeCreated={() => {
            setShowCreateChallengeWizard(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
