export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-7xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 leading-tight">
              Selamat Datang<br />
              ke CodeCikgu
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Platform pembelajaran <span className="text-blue-400 font-semibold">Sains Komputer</span> yang interaktif untuk murid Tingkatan 4 & 5.<br />
              Belajar dengan cara yang menyeronokkan dan dapatkan ganjaran!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a href="/daftar" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
                🚀 Daftar Sekarang
              </a>
              <a href="/login" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
                🔐 Log Masuk
              </a>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-400/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </section>

      {/* Quick Access Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              🎯 Ciri-Ciri Platform
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <a href="/playground" className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-gray-700 hover:border-blue-400 transition-all duration-300 group text-center">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🖥️</div>
                <h3 className="text-xl font-bold text-white mb-3">Playground</h3>
                <p className="text-gray-400 text-sm mb-4">Kod Editor Interaktif dengan sokongan pelbagai bahasa</p>
                <div className="text-blue-400 group-hover:underline">Mula Kod →</div>
              </a>

              <a href="/nota" className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-gray-700 hover:border-green-400 transition-all duration-300 group text-center">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📚</div>
                <h3 className="text-xl font-bold text-white mb-3">Nota</h3>
                <p className="text-gray-400 text-sm mb-4">Sumber pembelajaran lengkap untuk Tingkatan 4 & 5</p>
                <div className="text-green-400 group-hover:underline">Baca Nota →</div>
              </a>

              <a href="/leaderboard" className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-gray-700 hover:border-cyan-400 transition-all duration-300 group text-center">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🏆</div>
                <h3 className="text-xl font-bold text-white mb-3">Leaderboard</h3>
                <p className="text-gray-400 text-sm mb-4">Ranking & pencapaian pelajar terbaik</p>
                <div className="text-cyan-400 group-hover:underline">Lihat Ranking →</div>
              </a>

              <a href="/daftar" className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-gray-700 hover:border-purple-400 transition-all duration-300 group text-center">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">👤</div>
                <h3 className="text-xl font-bold text-white mb-3">Daftar</h3>
                <p className="text-gray-400 text-sm mb-4">Cipta akaun untuk akses penuh semua ciri</p>
                <div className="text-purple-400 group-hover:underline">Daftar Sekarang →</div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              🎓 Mula Pembelajaran Anda Hari Ini
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Sertai ribuan pelajar yang telah memulakan perjalanan pembelajaran Sains Komputer mereka dengan CodeCikgu
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a href="/daftar" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-5 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 text-xl">
                Daftar Percuma Sekarang
              </a>
              <a href="/playground" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-5 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 text-xl">
                Cuba Playground
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

