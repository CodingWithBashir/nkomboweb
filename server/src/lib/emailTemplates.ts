/**
 * The school's e-mail look.
 *
 * Everything the portal sends — account decisions, application outcomes,
 * password resets, alerts to the office — is wrapped in the same branded
 * layout, so a message from the school never looks like spam. The markup is
 * plain tables with inline styles because that is what survives Gmail, Outlook
 * and the phone mail apps.
 */

import { siteUrl } from './mail';

const NAVY = '#002a6b';
const NAVY_DEEP = '#001b45';
const GOLD = '#35ad00';
const INK = '#20304d';
const MUTED = '#6b7c99';
const PAGE = '#eef2f9';

export type EmailAction = { label: string; url: string };

export type LayoutOptions = {
  /** Small caps line above the heading, e.g. "ACCOUNT". */
  eyebrow?: string;
  heading: string;
  paragraphs: string[];
  /** Optional highlighted sentence (the decision itself). */
  banner?: { text: string; tone: 'good' | 'bad' | 'info' };
  action?: EmailAction;
  /** Second, quieter link under the button. */
  secondary?: string;
  reference?: string;
  /** Small print at the bottom, before the standard footer. */
  note?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bannerColours(tone: 'good' | 'bad' | 'info') {
  if (tone === 'good') return { bg: '#ecfdf3', border: '#9be3b4', text: '#11663a' };
  if (tone === 'bad') return { bg: '#fdecec', border: '#f3b4b4', text: '#8f1d1d' };
  return { bg: '#eef4ff', border: '#bcd2f5', text: '#123a7a' };
}

export function emailLayout(options: LayoutOptions): string {
  const site = siteUrl();
  const paragraphs = options.paragraphs
    .filter((paragraph) => paragraph.trim())
    .map(
      (paragraph) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${INK};">${escapeHtml(
          paragraph
        ).replace(/\n/g, '<br />')}</p>`
    )
    .join('');

  const banner = options.banner
    ? (() => {
        const tone = bannerColours(options.banner!.tone);
        return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 18px;">
      <tr><td style="background:${tone.bg};border:1px solid ${tone.border};border-radius:12px;padding:14px 16px;font-size:14.5px;font-weight:700;color:${tone.text};line-height:1.5;">
        ${escapeHtml(options.banner!.text)}
      </td></tr>
    </table>`;
      })()
    : '';

  const action = options.action
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 20px;">
      <tr><td style="border-radius:999px;background:${GOLD};">
        <a href="${escapeHtml(options.action.url)}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeHtml(
          options.action.label
        )}</a>
      </td></tr>
    </table>
    <p style="margin:0 0 18px;font-size:12px;line-height:1.6;color:${MUTED};">
      If the button does not work, copy this address into your browser:<br />
      <a href="${escapeHtml(options.action.url)}" style="color:${NAVY};word-break:break-all;">${escapeHtml(
          options.action.url
        )}</a>
    </p>`
    : '';

  const secondary = options.secondary
    ? `<p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:${MUTED};">${escapeHtml(
        options.secondary
      )}</p>`
    : '';

  const reference = options.reference
    ? `<p style="margin:0 0 16px;font-size:12px;color:${MUTED};">Reference:
        <span style="font-family:'Courier New',monospace;font-weight:700;color:${NAVY};">${escapeHtml(
          options.reference
        )}</span></p>`
    : '';

  const note = options.note
    ? `<p style="margin:18px 0 0;padding-top:16px;border-top:1px solid #e6ecf6;font-size:12px;line-height:1.6;color:${MUTED};">${escapeHtml(
        options.note
      )}</p>`
    : '';

  const eyebrow = options.eyebrow
    ? `<p style="margin:0 0 8px;font-size:10.5px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:${GOLD};">${escapeHtml(
        options.eyebrow
      )}</p>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${PAGE};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${PAGE};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,26,66,0.08);">

          <tr>
            <td style="background:${NAVY};padding:26px 30px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin:0;font-size:17px;font-weight:800;letter-spacing:0.02em;color:#ffffff;">
                      Lycée de Nyanza
                    </p>
                    <p style="margin:4px 0 0;font-size:11.5px;letter-spacing:0.14em;text-transform:uppercase;color:#9fb4d6;">
                      Technical Secondary School · Nyamagabe
                    </p>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="display:inline-block;width:38px;height:4px;background:${GOLD};border-radius:2px;"></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 30px 26px;">
              ${eyebrow}
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:800;color:${NAVY};">
                ${escapeHtml(options.heading)}
              </h1>
              ${banner}
              ${paragraphs}
              ${action}
              ${secondary}
              ${reference}
              ${note}
            </td>
          </tr>

          <tr>
            <td style="background:#f7f9fd;border-top:1px solid #e6ecf6;padding:20px 30px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:${NAVY};">Lycée de Nyanza</p>
              <p style="margin:0 0 4px;font-size:11.5px;line-height:1.6;color:${MUTED};">
                Nyamagabe, Southern Province, Rwanda · +250 788 502 229 ·
                <a href="mailto:lyceedenyanza2018@gmail.com" style="color:${MUTED};">lyceedenyanza2018@gmail.com</a>
              </p>
              <p style="margin:8px 0 0;font-size:11px;line-height:1.6;color:#93a3bd;">
                You are receiving this message because you used the school portal at
                <a href="${site}" style="color:#93a3bd;">${site.replace(/^https?:\/\//, '')}</a>.
                This mailbox is not monitored — please do not reply to this message.
              </p>
            </td>
          </tr>

        </table>
        <p style="margin:16px 0 0;font-size:10.5px;color:#9aa9c2;">© ${new Date().getFullYear()} Lycée de Nyanza · ${NAVY_DEEP}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Plain-text twin of a layout, for mail apps without HTML. */
export function emailText(options: LayoutOptions): string {
  const lines: string[] = [`LYCÉE DE NYANZA`, '', options.heading.toUpperCase(), ''];
  if (options.banner) lines.push(options.banner.text, '');
  for (const paragraph of options.paragraphs) {
    if (!paragraph.trim()) continue;
    lines.push(paragraph, '');
  }
  if (options.action) lines.push(`${options.action.label}: ${options.action.url}`, '');
  if (options.secondary) lines.push(options.secondary, '');
  if (options.reference) lines.push(`Reference: ${options.reference}`, '');
  if (options.note) lines.push(options.note, '');
  lines.push(
    '—',
    'Lycée de Nyanza · Nyamagabe, Southern Province, Rwanda',
    '+250 788 502 229 · lyceedenyanza2018@gmail.com',
    `You are receiving this message because you used the school portal at ${siteUrl()}.`,
    'This mailbox is not monitored — please do not reply to this message.'
  );
  return lines.join('\n');
}

/* -------------------------------------------------------------- messages */

export function welcomeEmail(options: { name: string; email: string; needsPassword: boolean }) {
  const site = siteUrl();
  const action = options.needsPassword
    ? { label: 'Choose your password', url: `${site}/forgot-password` }
    : { label: 'Sign in to the portal', url: `${site}/login` };
  const paragraphs = [
    `Hello ${options.name},`,
    'The school administration has reviewed your registration and your account is now active. You can sign in to the portal with the e-mail address and password you used when you registered.',
  ];
  if (options.needsPassword) {
    paragraphs.push(
      'If you have not chosen a password yet, use the button below to set one — it takes a minute and works from any phone.'
    );
  }
  paragraphs.push(
    'Inside the portal you can follow your admission application, read messages from the school and download holiday material.'
  );

  const layout: LayoutOptions = {
    eyebrow: 'Account accepted',
    heading: `Welcome to Lycée de Nyanza, ${options.name}`,
    banner: { text: 'Your account has been accepted — you can sign in now.', tone: 'good' },
    paragraphs,
    action,
    secondary: `Signed in as ${options.email}. Keep this message: it is your proof that the school accepted your registration.`,
    note: 'If you did not create this account, please tell the school office so it can be removed.',
  };
  return { subject: 'Your Lycée de Nyanza account has been accepted', html: emailLayout(layout), text: emailText(layout) };
}

export function rejectionEmail(options: { name: string; reason?: string }) {
  const site = siteUrl();
  const paragraphs = [
    `Hello ${options.name},`,
    'Thank you for your interest in Lycée de Nyanza. After reviewing your registration, the administration is not able to open an account for you at the moment.',
  ];
  if (options.reason) {
    paragraphs.push(`Reason given by the school: ${options.reason}`);
  }
  paragraphs.push(
    'If you believe this is a mistake — for example you registered with the wrong e-mail address, or you are already a student — please contact the school office. They can correct your record and accept you.'
  );

  const layout: LayoutOptions = {
    eyebrow: 'Account request',
    heading: 'Your account request was not accepted',
    banner: { text: 'The school could not accept this registration.', tone: 'bad' },
    paragraphs,
    action: { label: 'Contact the school', url: `${site}/contact` },
    secondary: 'You can register again later with a different e-mail address if your situation changes.',
    note: 'This decision concerns the online account only. It does not replace any admission decision.',
  };
  return {
    subject: 'Your Lycée de Nyanza account request was not accepted',
    html: emailLayout(layout),
    text: emailText(layout),
  };
}

export function pendingEmail(options: { name: string }) {
  const site = siteUrl();
  const layout: LayoutOptions = {
    eyebrow: 'Registration received',
    heading: 'Your account is waiting for approval',
    banner: { text: 'Nothing else to do — the school will review your request.', tone: 'info' },
    paragraphs: [
      `Hello ${options.name},`,
      'Thank you for creating an account on the Lycée de Nyanza portal. The administration has received your request and will review it shortly.',
      'You will receive another e-mail as soon as a decision is made. If you are accepted, you will be able to sign in with the e-mail address and password you chose.',
    ],
    action: { label: 'Check the portal', url: `${site}/login` },
    note: 'The review usually takes one working day. Please check your spam folder too.',
  };
  return {
    subject: 'Your Lycée de Nyanza account is waiting for approval',
    html: emailLayout(layout),
    text: emailText(layout),
  };
}

export function newRegistrationAlert(options: {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  when?: string;
}) {
  const site = siteUrl();
  const layout: LayoutOptions = {
    eyebrow: 'Action needed',
    heading: 'A new account is waiting for approval',
    banner: { text: 'Someone registered on the website and cannot sign in yet.', tone: 'info' },
    paragraphs: [
      `Name: ${options.name}`,
      `E-mail: ${options.email}`,
      options.phone ? `Phone: ${options.phone}` : '',
      options.role ? `Requested role: ${options.role}` : '',
      options.when ? `Registered: ${options.when}` : '',
      'Open the accounts page to accept or refuse the request. The person is told by e-mail as soon as you decide.',
    ],
    action: { label: 'Review the request', url: `${site}/lyceeadmin/accounts` },
    note: 'You receive this message because you manage accounts at Lycée de Nyanza.',
  };
  return {
    subject: `New account waiting: ${options.name || options.email}`,
    html: emailLayout(layout),
    text: emailText(layout),
  };
}

export function passwordResetEmail(options: { name: string; url: string; minutes: number }) {
  const layout: LayoutOptions = {
    eyebrow: 'Password',
    heading: 'Choose a new password',
    banner: { text: `This link stays valid for ${options.minutes} minutes.`, tone: 'info' },
    paragraphs: [
      `Hello ${options.name},`,
      'Someone asked to reset the password of your Lycée de Nyanza account. If it was you, use the button below to choose a new password.',
      'If you did not ask for this, you can ignore this message — your current password keeps working.',
    ],
    action: { label: 'Choose a new password', url: options.url },
    note: 'For your safety this link can only be used once and expires quickly.',
  };
  return {
    subject: 'Reset your Lycée de Nyanza password',
    html: emailLayout(layout),
    text: emailText(layout),
  };
}

export function testEmail(options: { to: string }) {
  const site = siteUrl();
  const layout: LayoutOptions = {
    eyebrow: 'Test message',
    heading: 'Your school e-mail is working',
    banner: { text: 'This message was sent from the admin panel.', tone: 'good' },
    paragraphs: [
      `This is a test message sent to ${options.to}.`,
      'If you can read it, the portal can deliver acceptance letters, application decisions and password resets to your school inbox.',
    ],
    action: { label: 'Open the e-mail outbox', url: `${site}/lyceeadmin/outbox` },
    note: 'Nothing else was sent because of this test.',
  };
  return {
    subject: 'Lycée de Nyanza — test e-mail',
    html: emailLayout(layout),
    text: emailText(layout),
  };
}

/** Turns a plain notification body into a branded e-mail. */
export function generalEmail(options: {
  subject: string;
  body: string;
  kind?: string;
  reference?: string;
  name?: string;
}) {
  const paragraphs = options.body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
  const eyebrow =
    options.kind === 'application'
      ? 'Admission'
      : options.kind === 'result'
        ? 'Results'
        : options.kind === 'account'
          ? 'Account'
          : 'Message from the school';
  const site = siteUrl();
  const layout: LayoutOptions = {
    eyebrow,
    heading: options.subject,
    paragraphs: options.name ? [`Hello ${options.name},`, ...paragraphs] : paragraphs,
    reference: options.reference,
    action: options.reference
      ? { label: 'Follow your application', url: `${site}/admissions?reference=${encodeURIComponent(options.reference)}` }
      : { label: 'Open the school website', url: site },
    note: 'You are receiving this because you are in contact with the school through its website.',
  };
  return { subject: options.subject, html: emailLayout(layout), text: emailText(layout) };
}
