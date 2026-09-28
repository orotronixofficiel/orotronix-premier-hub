const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "https://qeqqfelebzxwupsqyzbz.supabase.co").replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_nnvN9OsnpO_ipsFx0l-orw_yERvs7da";

type MfaResponse<T> = T;

async function mfaRequest<T>(token: string, path: string, method = "GET", body?: unknown): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase n'est pas configuré.");
  const response = await fetch(SUPABASE_URL + "/auth/v1/" + path, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error_description || data.msg || data.message || "Erreur MFA.");
  }
  return data as T;
}

export type TotpFactor = {
  id: string;
  type: "totp";
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

export function listAdminMfaFactors(token: string) {
  return mfaRequest<MfaFactors>(token, "factors");
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
