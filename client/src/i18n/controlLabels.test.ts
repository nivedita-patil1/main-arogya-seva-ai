import { describe, expect, it } from "vitest";
import { controlLabels } from "./controlLabels";

describe("public control labels", () => {
  it("provides a complete selected-language control catalog for every supported locale", () => {
    for (const language of ["en", "hi", "kn", "ml", "ta", "te"] as const) {
      const copy = controlLabels[language];
      expect(copy.panel).toBeTruthy();
      expect(copy.assistantPlaceholder).toBeTruthy();
      expect(copy.repeatIvr).toBeTruthy();
      expect(copy.openOfficialSource).toBeTruthy();
      expect(copy.moduleAssistant).toBeTruthy();
    }
  });

  it("uses Hindi labels for key public controls rather than English fallbacks", () => {
    expect(controlLabels.hi.openOfficialSource).toBe("आधिकारिक स्रोत खोलें");
    expect(controlLabels.hi.repeatIvr).toBe("आईवीआर संदेश फिर से सुनें");
    expect(controlLabels.hi.moduleCare).toContain("स्थान");
  });
});
