import { describe, expect, it } from "vitest";
import { getIvrDestination } from "./ivrRouting";

describe("IVR destination routing", () => {
  it("maps each guided IVR branch to the appropriate public section", () => {
    expect(getIvrDestination("HOSPITAL_LOCATOR")).toMatchObject({ sectionId: "hospitals" });
    expect(getIvrDestination("HEALTH_SCHEMES")).toMatchObject({ sectionId: "schemes" });
    expect(getIvrDestination("AI_ASSISTANT")).toMatchObject({ sectionId: "assistant" });
    expect(getIvrDestination("MEDICINE_REMINDER")).toMatchObject({ sectionId: "medicines" });
  });

  it("does not route a main-menu or completed call state", () => {
    expect(getIvrDestination("MAIN_MENU")).toBeUndefined();
    expect(getIvrDestination("ENDED")).toBeUndefined();
  });
});
