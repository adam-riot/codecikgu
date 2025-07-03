// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://bhilmyrvbfzosxntldwx.supabase.co', // <-- TAMBAH TANDA PETIK
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoaWxteXJ2YmZ6b3N4bnRsZHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE2NTQ2NSwiZXhwIjoyMDY2NzQxNDY1fQ.ug_OF6sbvjHWOlYn4x5ZjXxjyjWVaTlD-i5uGz-PucI', // <-- TAMBAH TANDA PETIK
    },
  };
  
  module.exports = nextConfig;
  