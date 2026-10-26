import { NextResponse } from 'next/server';

const CATEGORIES = ['Bug', 'Idea', 'Other'] as const;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_FIELD_LENGTH = 200;

// Slack treats <, > and & as control characters (e.g. <!channel> pings everyone)
function escapeSlack(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function POST(request: Request) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('SLACK_WEBHOOK_URL is not configured');
    return NextResponse.json({ error: 'Feedback is not configured' }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Honeypot field: real users never see it, bots tend to fill it in
  if (typeof body.website === 'string' && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const category = CATEGORIES.includes(body.category as (typeof CATEGORIES)[number])
    ? (body.category as string)
    : 'Other';
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, MAX_FIELD_LENGTH) : '';
  const page = typeof body.page === 'string' ? body.page.slice(0, MAX_FIELD_LENGTH) : '';

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: 'Message is too long' }, { status: 400 });
  }

  const emoji = category === 'Bug' ? '🐛' : category === 'Idea' ? '💡' : '💬';
  const context = [
    `*Page:* ${escapeSlack(page || 'unknown')}`,
    `*Email:* ${email ? escapeSlack(email) : '_not provided_'}`,
  ].join('  •  ');

  const slackResponse = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `${emoji} New ${category.toLowerCase()} feedback: ${escapeSlack(message).slice(0, 150)}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `${emoji} New feedback: ${category}` },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: escapeSlack(message) },
        },
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: context }],
        },
      ],
    }),
  });

  if (!slackResponse.ok) {
    console.error('Slack webhook failed', slackResponse.status, await slackResponse.text());
    return NextResponse.json({ error: 'Could not send feedback' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
