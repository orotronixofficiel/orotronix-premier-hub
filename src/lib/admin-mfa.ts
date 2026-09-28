const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function authRequest<T>(path: string, token: string, method = "GET", body?: unknown): Promise<T> {
  if (!url || !anonKey) throw new Error("Supabase n'est pas configuré.");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url + "/auth/v1/" + path, {
      method,
      headers: { apikey: anonKey, Authorization: "Bearer " + token, "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { const detail = data.error_description || data.msg || data.message || (typeof data === "string" ? data : JSON.stringify(data)); throw new Error(detail || "Erreur MFA."); }
    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("La préparation de la sécurité a pris trop de temps. Réessayez.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function getJwtAal(token: string): "aal1" | "aal2" | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { aal?: string };
    return payload.aal === "aal2" ? "aal2" : payload.aal === "aal1" ? "aal1" : null;
  } catch { return null; }
}

export async function listMfaFactors(token: string) {
  if (!url || !anonKey) throw new Error("Supabase n'est pas configuré.");
  const response = await fetch(url + "/rest/v1/auth/factors", {
    method: "GET",
    headers: { apikey: anonKey, Authorization: "Bearer " + token, "Content-Type": "application/json" },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.error_description || data.msg || data.message || (typeof data === "string" ? data : JSON.stringify(data));
    throw new Error(detail || "Impossible de récupérer les facteurs MFA.");
  }
  return (Array.isArray(data) ? data : data.factors ?? []).map((f: any) => ({
    id: f.id,
    factor_type: f.factor_type,
    status: f.status,
  }));
}

export async function enrollAdminTotp(token: string) {
  const data = await authRequest<{
    id: string;
    type: "totp";
    totp: { qr_code: string; secret: string; uri: string };
  }>("factors", token, "POST", {
    factor_type: "totp",
    friendly_name: "OROTRONIX Admin",
    issuer: "OROTRONIX",
  });

  const qrCode = data.totp?.qr_code ?? "";
  const qr = qrCode.trim().startsWith("<svg")
    ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(qrCode)
    : qrCode;

  return { ...data, totp: { ...data.totp, qr_code: qr } };
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
