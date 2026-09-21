const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseConfigured = Boolean(url && anonKey);
let accessToken: string | null = null;

export function setSupabaseAccessToken(token: string | null) {
  accessToken = token;
}

export function getSupabaseUserId(): string | null {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem("orotronix_user_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { sub?: string };
    return payload.sub || null;
  } catch {
    return null;
  }
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

export async function supabasePublicRest<T = unknown>(table: string, options: {
  method?: "GET" | "POST" | "PATCH" | "DELETE"; query?: string; body?: unknown; prefer?: string;
} = {}): Promise<T> {
  if (!supabaseConfigured) throw new Error("Supabase n'est pas configuré.");
  const response = await fetch(url + "/rest/v1/" + table + (options.query ?? ""), {
    method: options.method ?? "GET",
    headers: {
      apikey: anonKey!,
      Authorization: "Bearer " + anonKey!,
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
  });
  if (!response.ok) throw new Error((await response.text()) || "Supabase HTTP " + response.status);
  if (response.status === 204 || response.status === 201 || response.status === 202) return undefined as T;
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return undefined as T;
  return await response.json() as T;
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

export async function uploadSupabaseStorage(file: File, folder = "products"): Promise<string> {
  if (!supabaseConfigured || !url || !anonKey) throw new Error("Supabase n'est pas configuré.");
  if (!accessToken) throw new Error("Session administrateur expirée. Reconnectez-vous.");
  if (!file.type.startsWith("image/")) throw new Error("Veuillez sélectionner une image.");
  if (file.size > 8 * 1024 * 1024) throw new Error("L'image doit faire au maximum 8 Mo.");

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
  const filename = (globalThis.crypto?.randomUUID?.() || Date.now().toString()) + "." + safeExtension;
  const path = folder + "/" + filename;

  let response = await fetch(url + "/storage/v1/object/orotronix-media/" + path, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: "Bearer " + accessToken,
      "Content-Type": file.type,
      "x-upsert": "false",
    },
    body: file,
  });

  if (response.status === 401) {
    const refreshed = await refreshSupabaseSession();
    if (refreshed) {
      accessToken = refreshed;
      response = await fetch(url + "/storage/v1/object/orotronix-media/" + path, {
        method: "POST",
        headers: {
          apikey: anonKey,
          Authorization: "Bearer " + accessToken,
          "Content-Type": file.type,
          "x-upsert": "false",
        },
        body: file,
      });
    }
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Échec de l'upload de l'image.");
  }

  return url + "/storage/v1/object/public/orotronix-media/" + path;
}
