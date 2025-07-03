'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

// Ini adalah versi yang sangat diringkaskan untuk melepasi 'build'
// Kita akan tambah balik fungsi lain selepas ini berjaya

export default function DashboardAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.email !== 'adamsofi@codecikgu.com') {
        router.push('/login');
      } else {
        setUserEmail(user.email);
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold">Dashboard Admin</h1>
      <p className="mt-4">Selamat datang, {userEmail}</p>
      <p className="mt-2">Dashboard sedang dalam pembinaan.</p>
      {/* KITA AKAN TAMBAH SEMULA SEMUA KOMPONEN SELEPAS INI BERJAYA */}
    </div>
  );
}
