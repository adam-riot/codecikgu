export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #111827, #000000, #111827)',
      color: 'white'
    }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 1rem' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
              fontWeight: 'bold',
              marginBottom: '2rem',
              background: 'linear-gradient(to right, #60a5fa, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: '1.2'
            }}>
              Selamat Datang<br />
              ke CodeCikgu
            </h1>
            <p style={{
              fontSize: 'clamp(1.125rem, 4vw, 1.5rem)',
              color: '#d1d5db',
              marginBottom: '3rem',
              lineHeight: '1.6'
            }}>
              Platform pembelajaran <span style={{ color: '#60a5fa', fontWeight: '600' }}>Sains Komputer</span> yang interaktif untuk murid Tingkatan 4 & 5.<br />
              Belajar dengan cara yang menyeronokkan dan dapatkan ganjaran!
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <a href="/daftar" style={{
                background: 'linear-gradient(to right, #3b82f6, #06b6d4)',
                color: 'white',
                fontWeight: 'bold',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}>
                🚀 Daftar Sekarang
              </a>
              <a href="/login" style={{
                background: '#374151',
                color: 'white',
                fontWeight: 'bold',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}>
                🔐 Log Masuk
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Features */}
      <section style={{ padding: '5rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: 'clamp(1.875rem, 6vw, 3rem)',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '4rem',
              background: 'linear-gradient(to right, #60a5fa, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🎯 Ciri-Ciri Platform
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem'
            }}>
              <a href="/playground" style={{
                background: 'rgba(31, 41, 55, 0.5)',
                backdropFilter: 'blur(16px)',
                borderRadius: '0.75rem',
                padding: '2rem',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                textDecoration: 'none',
                color: 'white',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖥️</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Playground</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>Kod Editor Interaktif dengan sokongan pelbagai bahasa</p>
                <div style={{ color: '#60a5fa' }}>Mula Kod →</div>
              </a>

              <a href="/nota" style={{
                background: 'rgba(31, 41, 55, 0.5)',
                backdropFilter: 'blur(16px)',
                borderRadius: '0.75rem',
                padding: '2rem',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                textDecoration: 'none',
                color: 'white',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Nota</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>Sumber pembelajaran lengkap untuk Tingkatan 4 & 5</p>
                <div style={{ color: '#10b981' }}>Baca Nota →</div>
              </a>

              <a href="/leaderboard" style={{
                background: 'rgba(31, 41, 55, 0.5)',
                backdropFilter: 'blur(16px)',
                borderRadius: '0.75rem',
                padding: '2rem',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                textDecoration: 'none',
                color: 'white',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Leaderboard</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>Ranking & pencapaian pelajar terbaik</p>
                <div style={{ color: '#06b6d4' }}>Lihat Ranking →</div>
              </a>

              <a href="/daftar" style={{
                background: 'rgba(31, 41, 55, 0.5)',
                backdropFilter: 'blur(16px)',
                borderRadius: '0.75rem',
                padding: '2rem',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                textDecoration: 'none',
                color: 'white',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Daftar</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>Cipta akaun untuk akses penuh semua ciri</p>
                <div style={{ color: '#8b5cf6' }}>Daftar Sekarang →</div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ padding: '5rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{
              fontSize: 'clamp(1.875rem, 6vw, 3rem)',
              fontWeight: 'bold',
              marginBottom: '2rem',
              background: 'linear-gradient(to right, #60a5fa, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🎓 Mula Pembelajaran Anda Hari Ini
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#d1d5db',
              marginBottom: '3rem'
            }}>
              Sertai ribuan pelajar yang telah memulakan perjalanan pembelajaran Sains Komputer mereka dengan CodeCikgu
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <a href="/daftar" style={{
                background: 'linear-gradient(to right, #3b82f6, #06b6d4)',
                color: 'white',
                fontWeight: 'bold',
                padding: '1.25rem 2.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                display: 'inline-block',
                fontSize: '1.125rem'
              }}>
                Daftar Percuma Sekarang
              </a>
              <a href="/playground" style={{
                background: '#374151',
                color: 'white',
                fontWeight: 'bold',
                padding: '1.25rem 2.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                display: 'inline-block',
                fontSize: '1.125rem'
              }}>
                Cuba Playground
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

