const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseConfigured = Boolean(url && anonKey);
let accessToken: string | null = null;

export function setSupabaseAccessToken(token: string | null) {
  accessToken = token;
}

export async function refreshSupabaseSession(): Promise<string | null> {
  if (!supabaseConfigured || typeof window === "undefined") return null;
  const refreshToken = sessionStorage.getItem("orotronix_user_refresh_token");
  if (!refreshToken) return null;
  const response = await fetch(url + "/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    headers: { apikey: anonKey!, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response.ok) {
    sessionStorage.removeItem("orotronix_user_token");
    sessionStorage.removeItem("orotronix_user_refresh_token");
    accessToken = null;
    return null;
  }
  const data = await response.json() as { access_token?: string; refresh_token?: string };
  if (!data.access_token) return null;
  accessToken = data.access_token;
  sessionStorage.setItem("orotronix_user_token", data.access_token);
  if (data.refresh_token) sessionStorage.setItem("orotronix_user_refresh_token", data.refresh_token);
  return data.access_token;
}

export async function supabaseAuth(path: string, body: unknown) {
  if (!supabaseConfigured) throw new Error("Supabase n'est pas configuré.");
  const response = await fetch(url + "/auth/v1/" + path, {
    method: "POST",
    headers: { apikey: anonKey!, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.msg || data.message || "Erreur Supabase");
  return data as { access_token: string; refresh_token?: string; user?: { email?: string } };
}

export async function supabaseRest<T = unknown>(table: string, options: {
  method?: "GET" | "POST" | "PATCH" | "DELETE"; query?: string; body?: unknown; prefer?: string;
} = {}): Promise<T> {
  if (!supabaseConfigured) throw new Error("Supabase n'est pas configuré.");
  const makeRequest = () => fetch(url + "/rest/v1/" + table + (options.query ?? ""), {
    method: options.method ?? "GET",
    headers: {
      apikey: anonKey!,
      Authorization: "Bearer " + (accessToken || anonKey!),
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
  });
  let response = await makeRequest();
  if (response.status === 401 && accessToken) {
    const refreshed = await refreshSupabaseSession();
    if (refreshed) response = await makeRequest();
  }
  if (!response.ok) throw new Error((await response.text()) || "Supabase HTTP " + response.status);
  if (response.status === 204) return undefined as T;
  return await response.json() as T;
}
