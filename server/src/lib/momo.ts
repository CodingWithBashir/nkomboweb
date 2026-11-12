/**
 * MTN Mobile Money collections (Rwanda).
 *
 * When the school has MoMo credentials, a parent can pay a fee invoice from
 * their phone: the portal asks MTN to collect, MTN prompts the parent, and the
 * payment record is written once MTN confirms. Without credentials the office
 * records payments by hand — the rest of the fees module works the same.
 *
 * Environment (server/.env):
 *   MOMO_SUBSCRIPTION_KEY, MOMO_API_USER, MOMO_API_KEY,
 *   MOMO_ENVIRONMENT=mtnrwanda (or sandbox), MOMO_CALLBACK_URL (optional)
 */

import crypto from 'node:crypto';
import { getDb } from './db';

function env(key: string) {
  return (process.env[key] || '').trim();
}

export function momoStatus() {
  const configured = Boolean(
    env('MOMO_SUBSCRIPTION_KEY') && env('MOMO_API_USER') && env('MOMO_API_KEY')
  );
  return {
    configured,
    provider: 'MTN MoMo',
    environment: env('MOMO_ENVIRONMENT') || 'mtnrwanda',
    currency: env('MOMO_CURRENCY') || 'RWF',
    note: configured
      ? 'Parents can pay invoices with MTN MoMo.'
      : 'Add MOMO_SUBSCRIPTION_KEY, MOMO_API_USER and MOMO_API_KEY in server/.env to collect fees by MTN MoMo. Payments recorded by hand keep working.',
  };
}

type MomoRequest = { amount: number; phone: string; reference: string; payerMessage?: string };

type MomoResult = {
  ok: boolean;
  configured: boolean;
  status: 'pending' | 'failed' | 'not_configured';
  reference: string;
  detail: string;
  provider: string;
};

async function token(): Promise<string> {
  const basic = Buffer.from(`${env('MOMO_API_USER')}:${env('MOMO_API_KEY')}`).toString('base64');
  const response = await fetch('https://proxy.momoapi.mtn.com/collection/token/', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Ocp-Apim-Subscription-Key': env('MOMO_SUBSCRIPTION_KEY'),
    },
  });
  if (!response.ok) throw new Error(`MoMo refused the token request (${response.status}).`);
  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('MoMo returned no access token.');
  return data.access_token;
}

/** Asks MTN to collect a payment. Returns at once; MTN prompts the parent. */
export async function requestToPay(input: MomoRequest): Promise<MomoResult> {
  const status = momoStatus();
  const reference = input.reference || crypto.randomUUID();

  if (!status.configured) {
    return {
      ok: false,
      configured: false,
      status: 'not_configured',
      reference,
      provider: 'MTN MoMo',
      detail: status.note,
    };
  }

  try {
    const accessToken = await token();
    const phone = input.phone.replace(/[^\d]/g, '').replace(/^0/, '250');
    const response = await fetch('https://proxy.momoapi.mtn.com/collection/v1_0/requesttopay', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Reference-Id': reference,
        'X-Target-Environment': status.environment,
        'Ocp-Apim-Subscription-Key': env('MOMO_SUBSCRIPTION_KEY'),
        'Content-Type': 'application/json',
        ...(env('MOMO_CALLBACK_URL') ? { 'X-Callback-Url': env('MOMO_CALLBACK_URL') } : {}),
      },
      body: JSON.stringify({
        amount: String(Math.round(input.amount)),
        currency: status.currency,
        externalId: reference,
        payer: { partyIdType: 'MSISDN', partyId: phone },
        payerMessage: input.payerMessage || 'School fees — Lycée de Nyanza',
        payeeNote: 'Lycée de Nyanza school fees',
      }),
    });

    if (response.status !== 202) {
      const detail = await response.text().catch(() => '');
      return {
        ok: false,
        configured: true,
        status: 'failed',
        reference,
        provider: 'MTN MoMo',
        detail: `MTN rejected the request (${response.status}): ${detail.slice(0, 160)}`,
      };
    }

    getDb()
      .prepare(
        `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      )
      .run(`momo_request_${reference}`, JSON.stringify({ ...input, at: new Date().toISOString() }));

    return {
      ok: true,
      configured: true,
      status: 'pending',
      reference,
      provider: 'MTN MoMo',
      detail: 'A payment request was sent to the parent’s phone. The invoice is marked paid once MTN confirms.',
    };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      status: 'failed',
      reference,
      provider: 'MTN MoMo',
      detail: error instanceof Error ? error.message : 'The MoMo request failed.',
    };
  }
}
