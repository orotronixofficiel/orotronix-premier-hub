const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseConfigured = Boolean(url && anonKey);
let accessToken: string | null = null;
export function setSupabaseAccessToken(token: string | null) { accessToken = token; }
export async function supabaseAuth(path: string, body: unknown) {
  if (!supabaseConfigured) throw new Error("Supabase n'est pas configuré.");
  const response = await fetch(url + "/auth/v1/" + path, {
    method: "POST", headers: { apikey: anonKey!, "Content-Type": "application/json" }, body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.msg || data.message || "Erreur Supabase");
  return data as { access_token: string; refresh_token?: string; user?: { email?: string } };
}
export async function supabaseRest<T = unknown>(table: string, options: {
  method?: "GET" | "POST" | "PATCH" | "DELETE"; query?: string; body?: unknown; prefer?: string;
} = {}): Promise<T> {
  if (!supabaseConfigured) throw new Error("Supabase n'est pas configuré.");
  const response = await fetch(url + "/rest/v1/" + table + (options.query ?? ""), {
    method: options.method ?? "GET",
    headers: { apikey: anonKey!, Authorization: "Bearer " + (accessToken || anonKey!), "Content-Type": "application/json", ...(options.prefer ? { Prefer: options.prefer } : {}) },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) })
  });
  if (!response.ok) throw new Error((await response.text()) || "Supabase HTTP " + response.status);
  if (response.status === 204) return undefined as T;
  return await response.json() as T;
}
