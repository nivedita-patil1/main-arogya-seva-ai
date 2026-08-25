export type IvrDestination = {
  sectionId: "hospitals" | "schemes" | "assistant" | "medicines";
  label: string;
};

const destinations: Record<string, IvrDestination> = {
  HOSPITAL_LOCATOR: { sectionId: "hospitals", label: "Nearby healthcare" },
  HEALTH_SCHEMES: { sectionId: "schemes", label: "Government schemes" },
  AI_ASSISTANT: { sectionId: "assistant", label: "AI Assistant" },
  MEDICINE_REMINDER: { sectionId: "medicines", label: "Medicine reminders" },
};

/** Maps an IVR branch returned by either backend to the matching in-app support section. */
export function getIvrDestination(state: string): IvrDestination | undefined {
  return destinations[state];
}
