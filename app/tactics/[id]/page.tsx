import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTacticById } from '@/lib/tactics';

export default async function TacticDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tactic = getTacticById(id);

  if (!tactic) {
    notFound();
  }

  const difficultyColors = {
    Beginner: 'bg-green-100 text-green-800 border-green-200',
    Intermediate: 'bg-amber-100 text-amber-800 border-amber-200',
    Advanced: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-white/90 hover:text-white mb-8 transition-colors bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/20"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Tactics
        </Link>

        {/* Header */}
        <div className="bg-white/95 backdrop-blur rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl border-2 border-white/50 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full blur-3xl opacity-30"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="text-5xl md:text-7xl animate-float flex-shrink-0">{tactic.icon}</div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2 md:mb-3 break-words">
                    {tactic.name}
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 font-medium break-words">
                    {tactic.shortDescription}
                  </p>
                </div>
              </div>
              <span className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full text-xs sm:text-sm font-bold border-2 ${difficultyColors[tactic.difficulty]} shadow-lg self-start md:flex-shrink-0`}>
                {tactic.difficulty}
              </span>
            </div>

            <div className="mt-6 flex items-center text-gray-700 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full px-4 md:px-5 py-2.5 md:py-3 w-full md:w-fit border-2 border-yellow-200">
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-bold text-sm md:text-base break-words">Perfect for: {tactic.bestFor}</span>
            </div>
          </div>
        </div>

        {/* Practice Button - Moved to Top */}
        <div className="relative bg-gradient-to-r from-orange-600 via-pink-600 to-red-600 rounded-2xl p-5 md:p-6 shadow-xl text-white text-center overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="text-3xl md:text-4xl mb-3 animate-float">🎮</div>
            <h2 className="text-xl md:text-2xl font-black mb-2">Ready to Level Up?</h2>
            <p className="text-white/90 text-xs sm:text-sm mb-1 max-w-2xl mx-auto font-medium px-2">
              Time to put your skills to the test! Play the game and see how much you can remember! 🧠✨
            </p>
            <p className="text-yellow-300 text-xs mb-4 md:mb-5 font-semibold px-2">
              ⚠️ Read the tips and instructions below first for best results!
            </p>
            <Link
              href={`/tactics/${tactic.id}/practice`}
              className="inline-block bg-white text-orange-600 px-6 md:px-8 py-2.5 md:py-3 rounded-full font-black text-base md:text-lg hover:bg-yellow-300 hover:text-orange-700 transition-all transform hover:scale-110 shadow-xl animate-pulse-glow"
            >
              🚀 Start the Challenge!
            </Link>
          </div>
        </div>

        {/* Full Description */}
        <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-xl border-2 border-white/50 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🤔</span>
            <h2 className="text-3xl font-black text-gray-900">What is it?</h2>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg font-medium">
            {tactic.fullDescription}
          </p>
        </div>

        {/* Steps */}
        <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-xl border-2 border-white/50 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📝</span>
            <h2 className="text-3xl font-black text-gray-900">How to Master This</h2>
          </div>
          <div className="space-y-4">
            {tactic.steps.map((step, index) => (
              <div key={index} className="flex gap-4 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
                  {index + 1}
                </div>
                <p className="text-gray-700 pt-2 font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Examples */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 shadow-xl border-2 border-yellow-200 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">💡</span>
            <h2 className="text-3xl font-black text-gray-900">Real Examples</h2>
          </div>
          <div className="space-y-4">
            {tactic.examples.map((example, index) => (
              <div key={index} className="flex gap-4 bg-white/60 backdrop-blur rounded-2xl p-5 border-2 border-yellow-300">
                <div className="text-2xl">✨</div>
                <p className="text-gray-800 pt-0.5 font-medium">{example}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-xl border-2 border-green-200">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🎯</span>
            <h2 className="text-3xl font-black text-gray-900">Pro Tips</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {tactic.tips.map((tip, index) => (
              <div key={index} className="flex gap-3 bg-white/60 backdrop-blur rounded-2xl p-5 border-2 border-green-300 hover:scale-105 transition-transform">
                <div className="text-2xl">⚡</div>
                <p className="text-gray-800 text-sm font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-white/70 text-sm">
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
      </div>
    </div>
  );
}
