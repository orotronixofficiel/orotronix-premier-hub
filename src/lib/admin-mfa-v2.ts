const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "https://qeqqfelebzxwupsqyzbz.supabase.co").replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_nnvN9OsnpO_ipsFx0l-orw_yERvs7da";

type MfaResponse<T> = T;

async function mfaRequest<T>(token: string, path: string, method = "GET", body?: unknown): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase n'est pas configuré.");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);
  let response: Response;
  try {
    response = await fetch(SUPABASE_URL + "/auth/v1/" + path, {
      method,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("La requête MFA a expiré après 10 secondes.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
  const raw = await response.text();
  let data: Record<string, unknown> = {};
  try { data = raw ? JSON.parse(raw) as Record<string, unknown> : {}; } catch {}
  if (!response.ok) {
    const detail = String(data.error_description || data.msg || data.message || data.error || "").trim();
    throw new Error(detail || "Erreur MFA HTTP " + response.status + (raw ? ": " + raw.slice(0, 180) : ""));
  }
  try {
    return (raw ? JSON.parse(raw) : {}) as T;
  } catch {
    throw new Error("Réponse MFA invalide (HTTP " + response.status + ").");
  }
}

export type TotpFactor = {
  id: string;
  type?: "totp";
  factor_type?: "totp";
  friendly_name?: string;
  status: "verified" | "unverified";
};

export type MfaFactors = {
  all: TotpFactor[];
  totp: TotpFactor[];
};

export type TotpEnrollment = {
  id: string;
  type: "totp";
  friendly_name?: string;
  totp: { qr_code: string; secret: string; uri: string };
};

export type MfaChallenge = { id: string; type: "totp"; expires_at: number };
export type MfaVerifyResult = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: "bearer";
  user: { id: string; email?: string };
};

/**
 * Supabase's current JS SDK implements listFactors() by calling getUser()
 * and reading user.factors. The /auth/v1/factors route is not the listFactors
 * endpoint and returns HTTP 405 for GET on this project.
 */
export async function listAdminMfaFactors(token: string): Promise<MfaFactors> {
  const user = await mfaRequest<{
    factors?: Array<{
      id: string;
      factor_type?: string;
      type?: string;
      friendly_name?: string;
      status: "verified" | "unverified";
    }>;
  }>(token, "user");

  const all = (user.factors || [])
    .filter((factor) => (factor.factor_type || factor.type) === "totp")
    .map((factor) => ({
      id: factor.id,
      type: "totp" as const,
      factor_type: "totp" as const,
      friendly_name: factor.friendly_name,
      status: factor.status,
    }));

  return {
    all,
    totp: all.filter((factor) => factor.status === "verified"),
  };
}

export function unenrollAdminMfa(token: string, factorId: string) {
  return mfaRequest<{ id: string }>(token, "factors/" + encodeURIComponent(factorId), "DELETE");
}

export function enrollAdminTotp(token: string) {
  return mfaRequest<TotpEnrollment>(token, "factors", "POST", {
    factor_type: "totp",
    friendly_name: "OROTRONIX Admin",
    issuer: "OROTRONIX",
  }).then((data) => ({
    ...data,
    totp: {
      ...data.totp,
      qr_code: data.totp.qr_code.startsWith("data:")
        ? data.totp.qr_code
        : "data:image/svg+xml;utf-8," + data.totp.qr_code,
    },
  }));
}

export function challengeAdminTotp(token: string, factorId: string) {
  return mfaRequest<MfaChallenge>(token, "factors/" + encodeURIComponent(factorId) + "/challenge", "POST");
}

export function verifyAdminTotp(token: string, factorId: string, challengeId: string, code: string) {
  return mfaRequest<MfaVerifyResult>(token, "factors/" + encodeURIComponent(factorId) + "/verify", "POST", {
    challenge_id: challengeId,
    code: code.trim(),
  });
}

export function getJwtAal(token: string): "aal1" | "aal2" {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { aal?: string };
    return payload.aal === "aal2" ? "aal2" : "aal1";
  } catch {
    return "aal1";
  }
}
