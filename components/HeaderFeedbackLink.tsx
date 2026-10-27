'use client';

import { OPEN_FEEDBACK_EVENT } from './FeedbackButton';

export default function HeaderFeedbackLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_FEEDBACK_EVENT))}
      className="hidden md:inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
    >
      <span aria-hidden="true">💬</span>
      Feedback
    </button>
  );
}
