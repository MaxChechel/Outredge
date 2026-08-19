/**
 * Contact form endpoint — Cloudflare Pages Function.
 *
 * Not yet live: it needs TURNSTILE_SECRET_KEY and a delivery binding, and no
 * account has been created. The form on /contact stays disabled until this is
 * deployed and verified end to end.
 *
 * Defence in depth, cheapest check first:
 *   1. Honeypot field ("company_website"). Free, catches naive bots.
 *   2. Time-to-submit floor. A human does not fill seven fields in 3 seconds.
 *   3. Turnstile server-side verification. Never trust the client widget alone.
 */

interface Env {
  TURNSTILE_SECRET_KEY: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
  /** Set when using Resend; unused on the MailChannels path. */
  RESEND_API_KEY?: string;
}

const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MIN_FILL_MS = 3000;

const FIELDS = ['name', 'company', 'email', 'service', 'engagement', 'budget', 'message'] as const;

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);

  const res = await fetch(TURNSTILE_VERIFY, { method: 'POST', body });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const form = await request.formData();

  // 1. Honeypot — a real browser never fills a hidden field.
  if (String(form.get('company_website') ?? '').trim() !== '') {
    // Answer 200 so the bot cannot distinguish rejection from success.
    return json({ ok: true }, 200);
  }

  // 2. Time floor.
  const started = Number(form.get('started_at') ?? 0);
  if (!started || Date.now() - started < MIN_FILL_MS) {
    return json({ ok: false, error: 'Submission looked automated. Please try again.' }, 400);
  }

  // 3. Turnstile, verified server-side.
  const token = String(form.get('cf-turnstile-response') ?? '');
  if (!token) return json({ ok: false, error: 'Verification missing.' }, 400);

  const ip = request.headers.get('CF-Connecting-IP');
  if (!(await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip))) {
    return json({ ok: false, error: 'Verification failed.' }, 403);
  }

  const values: Record<string, string> = {};
  for (const field of FIELDS) values[field] = String(form.get(field) ?? '').trim();

  if (!values.name || !values.email || !values.email.includes('@')) {
    return json({ ok: false, error: 'Name and a valid email address are required.' }, 400);
  }

  const lines = FIELDS.map((f) => `${f}: ${values[f] || '—'}`).join('\n');

  // Delivery hop is a pending decision — see the WORKLOG proposal. Both paths
  // are a single fetch from here, so switching is a few lines.
  const delivered = await deliver(env, values.email, lines);
  if (!delivered) return json({ ok: false, error: 'Could not send. Please email directly.' }, 502);

  return json({ ok: true }, 200);
};

async function deliver(env: Env, replyTo: string, text: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false; // No provider configured yet.

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: replyTo,
      subject: 'New brief from outredge.com',
      text,
    }),
  });
  return res.ok;
}
