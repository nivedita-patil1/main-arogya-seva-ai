import { describe, expect, it } from "vitest";
import { dictionaries } from "./dictionaries";

describe("public language dictionaries", () => {
  it("provides core navigation and emergency copy in every supported language", () => {
    for (const language of ["en", "hi", "kn", "ml", "ta", "te"] as const) {
      expect(dictionaries[language].nav.Assistant).toBeTruthy();
      expect(dictionaries[language].emergency).toBeTruthy();
      expect(dictionaries[language].disclaimer).toBeTruthy();
    }
  });
});
