import type { SessionProfile } from "./arogyaApi";

export function getHeaderProfileLabel(profile: SessionProfile | null, isAuthenticated: boolean, authenticatedName?: string | null) {
  const savedName = profile?.name?.trim();
  if (savedName) return savedName;
  if (isAuthenticated) return authenticatedName?.trim() || "Connected";
  return "Continue";
}
