/**
 * Klien ringan untuk endpoint publik backend KHB.
 *
 * Dipakai formulir landing page (gabung komunitas, permintaan template, akun)
 * supaya data benar-benar tersimpan ke database, bukan hanya toast.
 */
const BASE = '/api/v1/public';

export interface LeadInput {
  type: 'community' | 'template' | 'account';
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
}

export interface LeadResult {
  id: string;
  status: string;
}

export class LeadError extends Error {}

export async function submitLead(input: LeadInput): Promise<LeadResult> {
  let response: Response;
  try {
    response = await fetch(`${BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    throw new LeadError('Tidak dapat menghubungi server. Coba lagi sebentar.');
  }

  const payload = (await response.json().catch(() => null)) as
    | { data?: LeadResult; message?: string; error?: { message?: string } }
    | null;

  if (!response.ok) {
    throw new LeadError(payload?.error?.message ?? payload?.message ?? `Pendaftaran gagal (${response.status})`);
  }

  return payload?.data ?? { id: '', status: 'Baru' };
}
