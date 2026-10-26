'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type Category = 'Bug' | 'Idea' | 'Other';
type Status = 'idle' | 'sending' | 'sent' | 'error';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'Idea', label: '💡 Idea' },
  { value: 'Bug', label: '🐛 Bug' },
  { value: 'Other', label: '💬 Other' },
];

const MAX_MESSAGE_LENGTH = 2000;

export default function FeedbackButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<Category>('Idea');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    textareaRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      trigger?.focus();
    };
  }, [isOpen]);

  const open = () => {
    // Start fresh after a successful send; keep the draft otherwise
    if (status === 'sent') {
      setMessage('');
      setEmail('');
      setCategory('Idea');
    }
    if (status !== 'sending') setStatus('idle');
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || status === 'sending') return;

    setStatus('sending');
    setErrorMessage('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, message, email, website, page: pathname }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }
      setStatus('sent');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 min-h-[44px] px-5 py-3 rounded-full bg-white text-slate-800 font-semibold shadow-xl border border-slate-200 hover:scale-105 hover:shadow-2xl transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400"
      >
        <span aria-hidden="true">💬</span>
        Feedback
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 id="feedback-title" className="text-2xl font-black text-slate-900">
                  Send feedback
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Found a bug or have an idea? I read every message.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close feedback form"
                className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-2xl leading-none transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400"
              >
                ×
              </button>
            </div>

            {status === 'sent' ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4" aria-hidden="true">🎉</div>
                <p className="text-lg font-bold text-slate-900 mb-2">Thanks for your feedback!</p>
                <p className="text-slate-500 mb-6">It helps make the app better for everyone.</p>
                <button
                  type="button"
                  onClick={close}
                  className="min-h-[44px] px-6 py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset>
                  <legend className="sr-only">Feedback type</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        aria-pressed={category === c.value}
                        onClick={() => setCategory(c.value)}
                        className={`min-h-[44px] rounded-xl text-sm font-semibold border-2 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${
                          category === c.value
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="feedback-message" className="block text-sm font-semibold text-slate-700 mb-1">
                    Message
                  </label>
                  <textarea
                    ref={textareaRef}
                    id="feedback-message"
                    required
                    rows={5}
                    maxLength={MAX_MESSAGE_LENGTH}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none resize-none"
                  />
                  <p className="text-xs text-slate-400 text-right">
                    {message.length}/{MAX_MESSAGE_LENGTH}
                  </p>
                </div>

                <div>
                  <label htmlFor="feedback-email" className="block text-sm font-semibold text-slate-700 mb-1">
                    Email <span className="font-normal text-slate-400">(optional, if you want a reply)</span>
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full min-h-[44px] rounded-xl border-2 border-slate-200 px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Honeypot: hidden from users, catches spam bots */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="hidden"
                />

                {status === 'error' && (
                  <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
                    {errorMessage}. Please try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!message.trim() || status === 'sending'}
                  className="w-full min-h-[48px] rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                >
                  {status === 'sending' ? 'Sending…' : 'Send feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
