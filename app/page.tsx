import TacticCard from '@/components/TacticCard';
import { tactics } from '@/lib/tactics';

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Floating decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-orange-400 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-pink-400 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="inline-block mb-6">
            <span className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium text-sm border border-white/30">
              ✨ Train Your Superhuman Memory
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 drop-shadow-lg">
            Memory
            <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Champions
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-medium drop-shadow">
            Master the secret techniques used by professional memory athletes.
            <br />
            <span className="text-yellow-200">Level up your brain! 🧠⚡</span>
          </p>
        </div>

        {/* Tactics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {tactics.map((tactic) => (
            <TacticCard key={tactic.id} tactic={tactic} />
          ))}
        </div>

        {/* Info Section */}
        <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20 shadow-2xl">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-yellow-400 to-pink-500 px-8 py-3 rounded-full shadow-lg">
              <span className="text-white font-bold text-lg">⚡ How It Works</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-6">
            <div className="text-center group">
              <div className="inline-block p-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl mb-4 transform group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <span className="text-5xl">📚</span>
              </div>
              <h3 className="font-bold text-white text-xl mb-3">Learn the Tricks</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Discover mind-blowing memory techniques that champions actually use in competitions!
              </p>
            </div>
            <div className="text-center group">
              <div className="inline-block p-6 bg-gradient-to-br from-pink-400 to-purple-600 rounded-3xl mb-4 transform group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <span className="text-5xl">🎮</span>
              </div>
              <h3 className="font-bold text-white text-xl mb-3">Play & Practice</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Turn learning into an addictive game with challenges that level up your brain power!
              </p>
            </div>
            <div className="text-center group">
              <div className="inline-block p-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl mb-4 transform group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <span className="text-5xl">🏆</span>
              </div>
              <h3 className="font-bold text-white text-xl mb-3">Become a Legend</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Watch your scores soar as you unlock your brain's hidden superpowers!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-white/60 text-sm">
            Created by{' '}
            <a
              href="https://www.codebyhicham.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:text-white font-semibold underline decoration-white/40 hover:decoration-white transition-colors"
            >
              codebyhicham
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
