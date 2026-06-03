const TOKEN_KEY = "beauty_ai_token";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export const tokenStore = {
  get: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  set: (token: string) => {
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
  },
  clear: () => {
    if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
  },
};

export class HttpRequest {
  baseUrl: string;
  token: string | null;

  constructor(token: string | null, baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    const token = this.token ?? tokenStore.get();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  async get(path: string, params?: Record<string, unknown>) {
    const url = new URL(this.baseUrl + path);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          url.searchParams.append(k, String(v));
        }
      });
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok) throw new ApiError(res.status, json?.error ?? json?.message ?? "Request failed");
    return json;
  }

  async post(path: string, data?: Record<string, unknown>) {
    const res = await fetch(this.baseUrl + path, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data ?? {}),
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok) throw new ApiError(res.status, json?.error ?? json?.message ?? "Request failed");
    return json;
  }

  async put(path: string, data?: Record<string, unknown>) {
    const res = await fetch(this.baseUrl + path, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data ?? {}),
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok) throw new ApiError(res.status, json?.error ?? json?.message ?? "Request failed");
    return json;
  }

  async del(path: string) {
    const res = await fetch(this.baseUrl + path, {
      method: "DELETE",
      headers: this.getHeaders(),
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok) throw new ApiError(res.status, json?.error ?? json?.message ?? "Request failed");
    return json;
  }
}
