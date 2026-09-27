const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function authRequest<T>(path: string, token: string, method = "GET", body?: unknown): Promise<T> {
  if (!url || !anonKey) throw new Error("Supabase n'est pas configuré.");
  const response = await fetch(url + "/auth/v1/" + path, {
    method,
    headers: { apikey: anonKey, Authorization: "Bearer " + token, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error_description || data.msg || data.message || "Erreur MFA.");
  return data as T;
}

export function getJwtAal(token: string): "aal1" | "aal2" | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { aal?: string };
    return payload.aal === "aal2" ? "aal2" : payload.aal === "aal1" ? "aal1" : null;
  } catch { return null; }
}

export async function listMfaFactors(token: string) {
  const data = await authRequest<{ factors?: Array<{ id: string; factor_type: string; status: string }> }>("user", token);
  return data.factors ?? [];
}

export async function enrollAdminTotp(token: string) {
  return authRequest<{ id: string; type: "totp"; totp: { qr_code: string; secret: string; uri: string } }>(
    "factors", token, "POST", { factor_type: "totp", friendly_name: "OROTRONIX Admin", issuer: "OROTRONIX" }
  );
}

export async function challengeMfa(token: string, factorId: string) {
  return authRequest<{ id: string; expires_at: number }>(
    "factors/" + encodeURIComponent(factorId) + "/challenge", token, "POST", {}
  );
}

export async function verifyMfa(token: string, factorId: string, challengeId: string, code: string) {
  return authRequest<{ access_token: string; refresh_token: string; expires_in: number }>(
    "factors/" + encodeURIComponent(factorId) + "/verify", token, "POST",
    { code, challenge_id: challengeId }
  );
}
