import { beforeEach, describe, expect, it } from "vitest";
import { previewRequest } from "./previewFallback";
import type { IvrState, Medicine, Scheme } from "./arogyaApi";

const values = new Map<string, string>();

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  },
});

describe("hosted preview fallback", () => {
  beforeEach(() => values.clear());

  it("persists an anonymous profile without requiring the Java service", async () => {
    const initial = await previewRequest<{ sessionKey: string; preferredLanguage: string }>("/api/session/me", {}, "preview-test");
    const updated = await previewRequest<{ name?: string; state?: string }>("/api/session/me", {
      method: "PUT",
      body: JSON.stringify({ name: "Preview Tester", state: "Karnataka" }),
    }, "preview-test");
    const reloaded = await previewRequest<{ name?: string; state?: string }>("/api/session/me", {}, "preview-test");
    expect(initial.sessionKey).toBe("preview-test");
    expect(updated).toMatchObject({ name: "Preview Tester", state: "Karnataka" });
    expect(reloaded).toMatchObject({ name: "Preview Tester", state: "Karnataka" });
  });

  it("persists a medicine without requiring the Java service", async () => {
    const created = await previewRequest<Medicine>("/api/medicines", {
      method: "POST",
      body: JSON.stringify({ name: "Vitamin D", dosage: "1 tablet", reminderTimes: ["08:00"] }),
    }, "preview-test");
    const medicines = await previewRequest<Medicine[]>("/api/medicines", {}, "preview-test");
    expect(created.name).toBe("Vitamin D");
    expect(medicines).toHaveLength(1);
    expect(medicines[0]?.reminderTimes).toEqual(["08:00"]);
  });

  it("filters official schemes by state while retaining all-India guidance", async () => {
    const schemes = await previewRequest<Scheme[]>("/api/schemes?category=Health+assurance&state=Maharashtra", {}, "preview-test");
    expect(schemes.map(scheme => scheme.name)).toEqual(["Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana"]);
  });

  it("provides practical safety-first fever guidance rather than an outage message", async () => {
    const response = await previewRequest<{ messages: Array<{ role: string; content: string }> }>("/api/chat/messages", {
      method: "POST",
      body: JSON.stringify({ message: "I am having fever", language: "en" }),
    }, "preview-test");
    const answer = response.messages.find(message => message.role === "assistant")?.content || "";
    expect(answer).toContain("38°C");
    expect(answer).toContain("drink fluids");
    expect(answer).toContain("39.4°C");
    expect(answer).toContain("112");
  });

  it("varies general guidance by the health concern instead of repeating fever steps", async () => {
    const ask = async (message: string, conversationId: number) => {
      const response = await previewRequest<{ messages: Array<{ role: string; content: string }> }>("/api/chat/messages", {
        method: "POST",
        body: JSON.stringify({ message, conversationId, language: "en" }),
      }, "preview-test");
      return response.messages.find(item => item.role === "assistant")?.content || "";
    };
    const [fever, pain, cough, emergency] = await Promise.all([
      ask("I have fever", 1), ask("I have back pain", 2), ask("I have cough and sore throat", 3), ask("I have chest pain", 4),
    ]);
    expect(fever).toContain("38°C");
    expect(pain).toContain("severity from 0–10");
    expect(cough).toContain("avoiding smoke");
    expect(emergency).toContain("urgent in-person assessment");
    expect(pain).not.toContain("39.4°C");
    expect(new Set([fever, pain, cough, emergency]).size).toBe(4);
  });

  it("returns selected-language guidance rather than English fallback copy", async () => {
    const response = await previewRequest<{ messages: Array<{ role: string; content: string }> }>("/api/chat/messages", {
      method: "POST",
      body: JSON.stringify({ message: "എനിക്ക് പനി ഉണ്ട്", conversationId: 5, language: "ml" }),
    }, "preview-test");
    const answer = response.messages.find(message => message.role === "assistant")?.content || "";
    expect(answer).toContain("ഞാൻ ഡോക്ടറല്ല");
    expect(answer).toContain("39.4°C");
  });

  it("gives a useful IVR branch prompt and directs the hospital option to its feature", async () => {
    const started = await previewRequest<IvrState>("/api/ivr/session", { method: "POST", body: "{}" }, "preview-test");
    const hospitals = await previewRequest<IvrState>(`/api/ivr/session/${started.id}/input`, {
      method: "POST",
      body: JSON.stringify({ input: "1" }),
    }, "preview-test");
    expect(started.prompt).toContain("take you directly");
    expect(hospitals.state).toBe("HOSPITAL_LOCATOR");
    expect(hospitals.prompt).toContain("Use my location");
    expect(hospitals.options).toContain("back Main menu");
  });

  it("uses the saved Malayalam preference for hosted-preview IVR prompts", async () => {
    await previewRequest("/api/session/me", { method: "PUT", body: JSON.stringify({ preferredLanguage: "ml" }) }, "preview-test");
    const started = await previewRequest<IvrState>("/api/ivr/session", { method: "POST", body: "{}" }, "preview-test");
    expect(started.prompt).toContain("ആരോഗ്യ സേവ");
    expect(started.options[0]).toContain("സമീപത്തെ");
  });
});
