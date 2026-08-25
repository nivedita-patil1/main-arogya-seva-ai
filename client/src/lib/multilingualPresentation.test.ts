import { describe, expect, it } from "vitest";
import { getIvrKeypadLabel } from "./ivrCopy";
import { localizeSchemes } from "./referenceTranslations";

describe("selected-language public presentation", () => {
  it("translates the IVR navigation controls without changing their action tokens", () => {
    expect(getIvrKeypadLabel("hi", "back")).toBe("वापस");
    expect(getIvrKeypadLabel("ml", "repeat")).toBe("വീണ്ടും");
    expect(getIvrKeypadLabel("ta", "0")).toBe("0");
    expect(getIvrKeypadLabel("te", "end")).toBe("ముగించు");
  });

  it("shows translated public programme names and categories while retaining the official source URL", () => {
    const [scheme] = localizeSchemes([{ id: 1, name: "Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana", category: "Health assurance", state: "All India", description: "Official record", sourceUrl: "https://www.myscheme.gov.in/" }], "hi");
    expect(scheme).toMatchObject({ name: "आयुष्मान भारत – प्रधानमंत्री जन आरोग्य योजना", category: "स्वास्थ्य सुरक्षा", sourceUrl: "https://www.myscheme.gov.in/" });
  });
});
