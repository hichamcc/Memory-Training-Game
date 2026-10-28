import type { Metadata } from 'next';
import Link from 'next/link';
import LearningPath from '@/components/LearningPath';
import ProgressSummary from '@/components/ProgressSummary';
import PostCard from '@/components/PostCard';
import { FIRST_TACTIC_ID } from '@/lib/tactics';
import { getAllPosts } from '@/lib/blog';
import { AUTHOR, SITE_ALTERNATE_NAMES, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const steps = [
  {
    icon: '📚',
    title: 'Learn a technique',
    text: 'Each one takes a minute to read, with examples and tips from memory athletes.',
  },
  {
    icon: '🎮',
    title: 'Practice with a game',
    text: 'Short timed rounds put the technique to work. Start easy, then turn up the difficulty.',
  },
  {
    icon: '📈',
    title: 'Beat your best',
    text: 'Your scores are saved on this device. Come back daily to build a streak.',
  },
];

const faqs = [
  {
    question: 'What is Memory Champions?',
    answer:
      'Memory Champions is a free website that teaches the memory techniques used in memory competitions, such as the memory palace, the Major System and the PAO system, and lets you practice each one with a short game.',
  },
  {
    question: 'Is Memory Champions free?',
    answer: 'Yes. Every guide and practice game is free, with no account needed. Your scores are saved in your browser.',
  },
  {
    question: 'Where should I start?',
    answer:
      'Start with the Linking Method. It is the easiest technique to learn and the base for the others. Then try the daily challenge to build a habit.',
  },
];

// Tells search engines the site's name (shown above results) and who runs it
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: SITE_ALTERNATE_NAMES,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon`,
      founder: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  ],
};

export default function Home() {
  const latestPosts = getAllPosts().slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      {/* Hero */}
      <section className="py-14 sm:py-20 text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 mb-6">
          Memory Champions · 8 techniques, free practice games
        </p>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-5">
          Train your memory
          <span className="block text-blue-600">like a champion</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-9">
          Learn the techniques professional memory athletes use, then practice them
          with quick games that track your progress.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto">
          <Link
            href={`/tactics/${FIRST_TACTIC_ID}`}
            className="inline-flex items-center justify-center min-h-[52px] px-7 rounded-xl bg-blue-600 text-white font-semibold text-lg shadow-sm hover:bg-blue-700 transition-colors"
          >
            New here? Start with the Linking Method
          </Link>
          <Link
            href="/daily"
            className="inline-flex items-center justify-center gap-2 min-h-[52px] px-7 rounded-xl bg-white text-slate-900 font-semibold text-lg border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-colors"
          >
            <span aria-hidden="true">📅</span>
            Today&apos;s challenge
          </Link>
        </div>
      </section>

      <ProgressSummary />

      <LearningPath />

      {/* How it works */}
      <section aria-labelledby="how-it-works" className="mt-20">
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 text-center mb-8">
          How it works
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-2xl mb-4" aria-hidden="true">
                {step.icon}
              </div>
              <h3 className="font-bold text-slate-900 mb-1.5">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {latestPosts.length > 0 && (
        <section aria-labelledby="from-the-blog" className="mt-20">
          <div className="flex items-baseline justify-between mb-6">
            <h2 id="from-the-blog" className="text-2xl font-bold text-slate-900">From the blog</h2>
            <Link href="/blog" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              All articles →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {latestPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="about" className="mt-20 max-w-3xl">
        <h2 id="about" className="text-2xl font-bold text-slate-900 mb-6">About Memory Champions</h2>
        <dl className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="font-semibold text-slate-900 mb-1.5">{faq.question}</dt>
              <dd className="text-slate-600 leading-relaxed">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
