import { createClient } from 'npm:@supabase/supabase-js@2.119.0';
import { getRequiredEnv, jsonResponse, corsHeaders } from '../_shared/http.ts';

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const gateKey = request.headers.get('x-gate-key')?.trim();
    if (!gateKey) return jsonResponse({ error: 'Gate key required' }, 401);

    const supabase = createClient(
      getRequiredEnv('SUPABASE_URL'),
      getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: gate, error: gateError } = await supabase
      .from('gates')
      .select('gate_id, gate_name')
      .eq('api_key_hash', await sha256Hex(gateKey))
      .eq('is_active', true)
      .maybeSingle();
    if (gateError) {
      console.error('Gate lookup failed:', gateError);
      return jsonResponse({ error: 'Internal error' }, 500);
    }
    if (!gate) return jsonResponse({ error: 'Invalid gate key' }, 401);

    let payload: { code?: unknown };
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400);
    }
    if (typeof payload.code !== 'string' || !payload.code.trim()) {
      return jsonResponse({ error: 'code is required' }, 400);
    }

    const { data, error } = await supabase.rpc('process_gate_scan', {
      p_gate_id: gate.gate_id,
      p_scanned_code: payload.code,
    });
    if (error) {
      console.error('process_gate_scan failed:', error);
      return jsonResponse({ error: 'Could not process scan' }, 500);
    }

    // 200 for both accepted and rejected scans; the ESP32 reads `accepted`.
    return jsonResponse({ gate: gate.gate_name, ...data });
  } catch (error) {
    console.error('gate-scan failed:', error);
    return jsonResponse({ error: 'Internal error' }, 500);
  }
});
