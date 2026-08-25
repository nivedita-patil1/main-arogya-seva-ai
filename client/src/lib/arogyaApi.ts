export type LanguageCode = "en" | "hi" | "kn" | "ml" | "ta" | "te";

export type SessionProfile = { sessionKey: string; preferredLanguage: LanguageCode; name?: string; age?: number; gender?: string; phone?: string; state?: string; familySize?: number; annualIncome?: number; continuityConnected: boolean };
export type ChatMessage = { id: number; role: "user" | "assistant"; content: string; language: LanguageCode; createdAt: string };
export type ChatResponse = { conversationId: number; messages: ChatMessage[]; safetyNotice: string };
export type Conversation = { id: number; title: string; updatedAt: string };
export type Medicine = { id: number; name: string; dosage: string; instructions?: string; active: boolean; reminderTimes: string[] };
export type Scheme = { id: number; name: string; category?: string; state?: string; description: string; benefits?: string; documents?: string; enrolmentInfo?: string; sourceUrl: string };
export type Eligibility = { schemeId: number; schemeName: string; status: "ELIGIBLE" | "NOT_ELIGIBLE" | "POSSIBLY_ELIGIBLE"; reason: string; sourceUrl: string };
export type AshaResource = { id: number; title: string; category: string; summary: string; sourceUrl: string; publisher?: string };
export type Facility = { id: string; name: string; address: string; phone?: string; latitude: number; longitude: number; primaryType: string; distanceKm: number; mapsUrl: string };
export type IvrState = { id: number; state: string; prompt: string; options: string[]; ended?: boolean };

const configuredApiBase = import.meta.env.VITE_JAVA_API_URL;
const isLocalBrowser = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE = (configuredApiBase || (isLocalBrowser ? "http://localhost:8080" : "")).replace(/\/$/, "");
const SESSION_STORAGE_KEY = "arogya-seva-anonymous-session";

function sessionId() {
  let value = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!value) { value = crypto.randomUUID(); localStorage.setItem(SESSION_STORAGE_KEY, value); }
  return value;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE) return previewRequest<T>(path, init, sessionId());
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", "X-Anonymous-Session-ID": sessionId(), ...(init.headers || {}) },
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message || `Request failed with status ${response.status}`);
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof TypeError || error instanceof Error && /failed to fetch|networkerror/i.test(error.message)) return previewRequest<T>(path, init, sessionId());
    throw error;
  }
}

function query(input: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => { if (value !== undefined && value !== "") params.set(key, String(value)); });
  return params.toString() ? `?${params}` : "";
}

export const arogyaApi = {
  getSession: () => request<SessionProfile>("/api/session/me"),
  updateSession: (body: Partial<SessionProfile> & { continuityToken?: string }) => request<SessionProfile>("/api/session/me", { method: "PUT", body: JSON.stringify(body) }),
  conversations: () => request<Conversation[]>("/api/chat/conversations"),
  history: (id: number) => request<ChatMessage[]>(`/api/chat/conversations/${id}`),
  sendMessage: (message: string, language: LanguageCode, conversationId?: number) => request<ChatResponse>("/api/chat/messages", { method: "POST", body: JSON.stringify({ message, language, conversationId }) }),
  medicines: () => request<Medicine[]>("/api/medicines"),
  saveMedicine: (body: { name: string; dosage: string; instructions?: string; reminderTimes: string[] }, id?: number) => request<Medicine>(id ? `/api/medicines/${id}` : "/api/medicines", { method: id ? "PUT" : "POST", body: JSON.stringify(body) }),
  deleteMedicine: (id: number) => request<void>(`/api/medicines/${id}`, { method: "DELETE" }),
  updateDose: (id: number, action: "taken" | "snooze") => request(`/api/medicines/${id}/dose/${action}`, { method: "POST", body: JSON.stringify({}) }),
  schemes: (input: { q?: string; category?: string; state?: string } = {}) => request<Scheme[]>(`/api/schemes${query(input)}`),
  assessEligibility: (body: { age: number; annualIncome: number; state: string; gender?: string; familySize: number }) => request<Eligibility[]>("/api/schemes/eligibility", { method: "POST", body: JSON.stringify(body) }),
  ashaResources: (input: { q?: string; category?: string } = {}) => request<AshaResource[]>(`/api/asha/resources${query(input)}`),
  nearby: (latitude: number, longitude: number, facilityType: string, radiusMeters: number) => request<Facility[]>(`/api/hospitals/nearby${query({ latitude, longitude, facilityType, radiusMeters })}`),
  startIvr: () => request<IvrState>("/api/ivr/session", { method: "POST", body: "{}" }),
  ivrInput: (id: number, input: string) => request<IvrState>(`/api/ivr/session/${id}/input`, { method: "POST", body: JSON.stringify({ input }) }),
};
import { previewRequest } from "./previewFallback";
