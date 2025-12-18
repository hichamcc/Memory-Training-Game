import Link from 'next/link';
import { Tactic } from '@/types';

interface TacticCardProps {
  tactic: Tactic;
}

export default function TacticCard({ tactic }: TacticCardProps) {
  const difficultyStyles = {
    Beginner: {
      badge: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/50',
      card: 'from-green-50 to-emerald-50',
      glow: 'hover:shadow-green-400/20'
    },
    Intermediate: {
      badge: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/50',
      card: 'from-amber-50 to-orange-50',
      glow: 'hover:shadow-orange-400/20'
    },
    Advanced: {
      badge: 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/50',
      card: 'from-red-50 to-pink-50',
      glow: 'hover:shadow-pink-400/20'
    }
  };

  const style = difficultyStyles[tactic.difficulty];

  return (
    <Link href={`/tactics/${tactic.id}`}>
      <div className={`group relative h-full rounded-3xl bg-gradient-to-br ${style.card} p-6 shadow-xl transition-all duration-300 hover:shadow-2xl ${style.glow} hover:scale-105 hover:-rotate-1 cursor-pointer border-2 border-white/50 overflow-hidden`}>
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/30 rounded-bl-full"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="text-5xl transform group-hover:scale-125 transition-transform duration-300">
              {tactic.icon}
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${style.badge} transform group-hover:rotate-3 transition-transform`}>
              {tactic.difficulty}
            </span>
          </div>

          <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-orange-700 transition-colors">
            {tactic.name}
          </h3>

          <p className="text-gray-700 text-sm mb-4 line-clamp-2 font-medium">
            {tactic.shortDescription}
          </p>

          <div className="flex items-center text-sm text-gray-600 bg-white/60 rounded-full px-3 py-1.5 w-fit">
            <svg className="w-4 h-4 mr-1.5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-bold">{tactic.bestFor.split(',')[0]}</span>
          </div>

          {/* Hover indicator */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-orange-600 text-white rounded-full p-2 shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
