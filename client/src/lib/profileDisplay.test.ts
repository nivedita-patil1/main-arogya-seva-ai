import { describe, expect, it } from "vitest";
import { getHeaderProfileLabel } from "./profileDisplay";

describe("getHeaderProfileLabel", () => {
  it("prioritizes the saved anonymous profile name over a signed-in placeholder", () => {
    expect(getHeaderProfileLabel({ sessionKey: "device-1", preferredLanguage: "en", continuityConnected: false, name: "Asha Devi" }, true, "Nisha Kumari")).toBe("Asha Devi");
  });

  it("falls back predictably when no anonymous name has been saved", () => {
    expect(getHeaderProfileLabel(null, true, "Nisha Kumari")).toBe("Nisha Kumari");
    expect(getHeaderProfileLabel(null, false)).toBe("Continue");
  });
});
