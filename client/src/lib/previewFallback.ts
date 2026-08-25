import type { AshaResource, ChatMessage, ChatResponse, Conversation, Eligibility, IvrState, Medicine, Scheme, SessionProfile } from "./arogyaApi";
import { getIvrPresentation, type IvrCopyState } from "./ivrCopy";
import { selectedLanguageHealthReply } from "./localizedHealthReply";

const officialSchemes: Scheme[] = [
  { id: 1, name: "Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana", category: "Health assurance", state: "All India", description: "A government health-assurance programme. Use the official directory to check current, location-specific criteria and enrolment routes.", benefits: "The official portal describes hospitalisation-cover benefits for eligible beneficiaries; verify the current scope directly with the programme.", documents: "Identity and eligibility documents may be requested by the official service.", enrolmentInfo: "Check eligibility and enrolment through the official myScheme directory.", sourceUrl: "https://www.myscheme.gov.in/schemes/ab-pmjay" },
  { id: 2, name: "Janani Suraksha Yojana", category: "Maternal health", state: "All India", description: "A National Health Mission maternal-health programme relevant when pregnancy and programme conditions are present.", benefits: "Review current maternity support and institutional-delivery guidance through the National Health Mission.", documents: "Contact a public health facility or ASHA worker for locally required documents.", enrolmentInfo: "Use the official National Health Mission information and a local public-health facility for next steps.", sourceUrl: "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309" },
  { id: 3, name: "Ayushman Bharat Arogya Karnataka", category: "Health assurance", state: "Karnataka", description: "A Karnataka state health-assurance programme whose official objective is to extend universal health coverage to residents of Karnataka.", benefits: "The official portal describes primary, specified secondary, and tertiary healthcare benefits; confirm current scope through the official service.", documents: "The official portal describes Aadhaar and household-card enrollment routes; confirm current requirements with an authorised centre.", enrolmentInfo: "Use the official Karnataka Arogya portal or an authorised enrolment centre for current verification and enrolment steps.", sourceUrl: "https://arogya.karnataka.gov.in/" },
];

const ashaResources: AshaResource[] = [
  { id: 1, title: "Community Process – ASHA", category: "Community awareness", summary: "Official National Health Systems Resource Centre page for ASHA community-process resources and programme context.", sourceUrl: "https://nhsrcindia.org/practice-areas/cpc-phc/community-process-asha", publisher: "National Health Systems Resource Centre" },
  { id: 2, title: "ASHA learning and certification portal", category: "Training", summary: "Official portal for ASHA learning, training, and certification information.", sourceUrl: "https://asha.nios.ac.in/", publisher: "National Institute of Open Schooling" },
  { id: 3, title: "Emergency referral guidance", category: "Emergency guidance", summary: "For immediate danger, severe breathing difficulty, heavy bleeding, seizures, unconsciousness, or severe chest pain, arrange urgent emergency care rather than waiting for online guidance.", sourceUrl: "https://www.india.gov.in/", publisher: "National Portal of India" },
];

function key(sessionKey: string, suffix: string) { return `arogya-preview-${suffix}-${sessionKey}`; }
function read<T>(storageKey: string, fallback: T): T { try { const value = localStorage.getItem(storageKey); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } }
function write<T>(storageKey: string, value: T) { localStorage.setItem(storageKey, JSON.stringify(value)); }
function body(init: RequestInit) { return init.body ? JSON.parse(String(init.body)) as Record<string, any> : {}; }
function now() { return new Date().toISOString(); }
type PreviewIvrState = IvrCopyState;
function previewIvrResponse(id: number, state: PreviewIvrState, language: SessionProfile["preferredLanguage"]): IvrState {
  const presentation = getIvrPresentation(language, state);
  return { id, state, prompt: presentation.prompt, options: presentation.options, ended: state === "ENDED" };
}
function previewHealthReply(message: string) {
  const concern = message.trim();
  if (/\b(chest pain|trouble breathing|difficulty breathing|shortness of breath|unconscious|fainting|seizure|heavy bleeding|coughing blood|suicid|self harm)\b/i.test(concern)) {
    return `I’m sorry you are dealing with this. **This may need urgent in-person assessment rather than online self-care.** Seek emergency help now for chest pain, trouble breathing, fainting, seizures, heavy bleeding, coughing blood, loss of consciousness, or thoughts of harming yourself. In India, call **112** or **108** where available, or ask someone nearby to help you reach emergency care.\n\nI’m an AI, not a medical professional, so I cannot assess the cause or tell you it is safe to wait. If it is safe to reply while help is being arranged, say whether the person is awake and breathing normally, but do not delay seeking care.`;
  }
  if (/\bfever|temperature|feverish\b/i.test(message)) {
    return `I’m an AI, not a medical professional — treat this as informed general guidance, not a diagnosis.\n\nFor an adult, a temperature of **38°C (100.4°F) or above** is usually considered a fever. If you otherwise feel stable, practical steps are:\n\n1. **Rest and drink fluids regularly.** Water, oral rehydration solution, soup, or other non-alcoholic fluids are reasonable choices. Aim to pass pale urine; dark urine, very little urine, or marked thirst can signal dehydration.\n2. **Wear light clothing and keep the room comfortably cool.** Avoid ice baths or heavy blankets that make you shiver.\n3. **Check your temperature and symptoms periodically.** The number matters, but breathing, alertness, hydration, pain, and how quickly you are worsening matter too.\n4. **For discomfort, consider only a fever medicine that is normally safe for you, following the product label or a pharmacist’s advice.** Ask a clinician or pharmacist first if you are pregnant, have kidney/liver disease, stomach ulcers, take blood thinners, or take several medicines.\n\n**Contact a clinician promptly** if the temperature reaches **39.4°C (103°F) or higher**, lasts more than **3 days**, or is getting worse. Seek urgent help now for trouble breathing, chest pain, confusion, a seizure, fainting, a stiff neck, a severe headache, a widespread rash, persistent vomiting, or inability to keep fluids down. In India, call **112** or **108** for an emergency.\n\nIf you tell me your age, measured temperature, how long it has lasted, and any other symptoms (for example cough, sore throat, rash, pain, or breathing difficulty), I can help you think through the next safest step.`;
  }
  if (/\bpain|ache|aching|hurt|injur|headache|migraine|backache|stomachache\b/i.test(concern)) {
    return `I’m an AI, not a medical professional — this is general information, not a diagnosis. **Pain can have many causes**, so the safest next step depends on where it is, how severe it is, and how it started.\n\nFor now, avoid activities that clearly worsen the pain, rest the affected area when practical, and keep a note of when it started and what makes it better or worse. Do not start, stop, or change prescribed medicines based only on this chat.\n\n**Please arrange prompt clinical advice** for pain that is severe, sudden, worsening, follows a significant injury, lasts more than a few days, or is stopping normal activity. Seek urgent help now for chest pain, severe abdominal pain, a sudden “worst-ever” headache, weakness or numbness on one side, confusion, fainting, or trouble breathing. In India, call **112** or **108** for an emergency.\n\nTell me the pain location, severity from 0–10, when it started, whether there was an injury, and any fever, swelling, vomiting, weakness, rash, or breathing difficulty.`;
  }
  if (/\bcough|cold|sore throat|runny nose|blocked nose|flu\b/i.test(concern)) {
    return `I’m an AI, not a medical professional — this is general information, not a diagnosis. For a cough, cold, or sore throat, practical comfort measures can include rest, regular fluids, warm drinks if they are comfortable for you, and avoiding smoke or other throat irritants.\n\nMonitor for changes rather than relying on this message alone. **Contact a clinician promptly** if symptoms are getting worse, last longer than expected, you have a high-risk condition, or there is a fever that persists. Seek urgent care now for trouble breathing, blue/grey lips, chest pain, confusion, severe dehydration, or coughing blood. In India, call **112** or **108** for an emergency.\n\nTell me your age group, how long the cough has lasted, whether you have fever or wheeze, and whether you have any breathing difficulty.`;
  }
  if (/\bvomi(t|ting)|diarrh|loose motion|stomach upset|nausea|food poison\b/i.test(concern)) {
    return `I’m an AI, not a medical professional — this is general information, not a diagnosis. With vomiting, diarrhoea, or stomach upset, **preventing dehydration is important**. Take frequent small sips of safe fluids; oral rehydration solution can be useful when tolerated. Keep track of urine output, dizziness, and whether fluids stay down.\n\nSeek urgent medical help for blood in vomit or stool, severe or increasing abdominal pain, confusion, fainting, a very dry mouth with little urine, persistent vomiting that prevents fluids, or signs of severe dehydration. Children, older adults, pregnant people, and people with chronic illness may need advice sooner. In India, call **112** or **108** for immediate danger.\n\nTell me how long this has been happening, whether there is fever or severe pain, and whether you can keep fluids down.`;
  }
  const summary = concern ? concern.slice(0, 120).replace(/[\n\r]+/g, " ") : "a health concern";
  return `I’m an AI, not a medical professional — this is general information, not a diagnosis. I can see you are asking about **“${summary}”**. To give more useful general guidance, tell me when it started, the body area or main symptom, how severe it feels, your age group, and what makes it better or worse.\n\nPlease include any warning signs such as breathing difficulty, chest pain, severe or increasing pain, confusion, fainting, dehydration, rash, persistent vomiting, pregnancy, or a recent injury. For immediate danger in India, call **112** or **108**.`;
}

export async function previewRequest<T>(path: string, init: RequestInit, sessionKey: string): Promise<T> {
  const route = path.split("?")[0];
  const params = new URLSearchParams(path.split("?")[1] || "");
  const method = init.method || "GET";
  const profileKey = key(sessionKey, "profile");
  const defaultProfile: SessionProfile = { sessionKey, preferredLanguage: "en", continuityConnected: false };

  if (route === "/api/session/me") {
    const profile = read(profileKey, defaultProfile);
    if (method === "PUT") { const next = { ...profile, ...body(init), sessionKey, continuityConnected: profile.continuityConnected }; write(profileKey, next); return next as T; }
    return profile as T;
  }
  if (route === "/api/medicines") {
    const storageKey = key(sessionKey, "medicines"); const medicines = read<Medicine[]>(storageKey, []);
    if (method === "POST") { const input = body(init); const next: Medicine = { id: Date.now(), name: input.name, dosage: input.dosage, instructions: input.instructions, active: true, reminderTimes: input.reminderTimes || [] }; write(storageKey, [next, ...medicines]); return next as T; }
    return medicines as T;
  }
  if (route.startsWith("/api/medicines/")) {
    const storageKey = key(sessionKey, "medicines"); const medicines = read<Medicine[]>(storageKey, []); const id = Number(route.split("/")[3]);
    if (method === "DELETE") { write(storageKey, medicines.filter(medicine => medicine.id !== id)); return undefined as T; }
    if (method === "PUT") { const input = body(init); const next = medicines.map(medicine => medicine.id === id ? { ...medicine, ...input } : medicine); write(storageKey, next); return next.find(medicine => medicine.id === id) as T; }
    return { status: route.endsWith("taken") ? "TAKEN" : "SNOOZED" } as T;
  }
  if (route === "/api/schemes") {
    const category = params.get("category") || ""; const state = params.get("state") || ""; const query = (params.get("q") || "").toLowerCase();
    return officialSchemes.filter(scheme => (!category || scheme.category === category) && (!state || scheme.state === "All India" || (scheme.state || "").toLowerCase() === state.toLowerCase()) && (!query || `${scheme.name} ${scheme.category}`.toLowerCase().includes(query))) as T;
  }
  if (route.startsWith("/api/schemes/") && route !== "/api/schemes/eligibility") return officialSchemes.find(scheme => scheme.id === Number(route.split("/")[3])) as T;
  if (route === "/api/schemes/eligibility") {
    const input = body(init); return officialSchemes.map(scheme => ({ schemeId: scheme.id, schemeName: scheme.name, status: scheme.state === "All India" || scheme.state?.toLowerCase() === String(input.state || "").toLowerCase() ? "POSSIBLY_ELIGIBLE" : "NOT_ELIGIBLE", reason: "Preview guidance only. Confirm current eligibility and documents with the official authority.", sourceUrl: scheme.sourceUrl })) as Eligibility[] as T;
  }
  if (route === "/api/asha/resources") { const query = (params.get("q") || "").toLowerCase(); const category = params.get("category") || ""; return ashaResources.filter(resource => (!category || resource.category === category) && (!query || `${resource.title} ${resource.summary}`.toLowerCase().includes(query))) as T; }
  if (route === "/api/chat/conversations") return read<Conversation[]>(key(sessionKey, "conversations"), []) as T;
  if (route.startsWith("/api/chat/conversations/")) return read<ChatMessage[]>(key(sessionKey, `conversation-${route.split("/")[4]}`), []) as T;
  if (route === "/api/chat/messages") {
    const input = body(init); const language = (input.language || "en") as SessionProfile["preferredLanguage"]; const id = Number(input.conversationId || Date.now()); const messagesKey = key(sessionKey, `conversation-${id}`); const existing = read<ChatMessage[]>(messagesKey, []); const user: ChatMessage = { id: Date.now(), role: "user", content: input.message, language, createdAt: now() }; const assistant: ChatMessage = { id: Date.now() + 1, role: "assistant", content: selectedLanguageHealthReply(String(input.message || ""), language) || previewHealthReply(String(input.message || "")), language, createdAt: now() }; const messages = [...existing, user, assistant]; write(messagesKey, messages); const conversations = read<Conversation[]>(key(sessionKey, "conversations"), []).filter(conversation => conversation.id !== id); write(key(sessionKey, "conversations"), [{ id, title: String(input.message).slice(0, 64), updatedAt: now() }, ...conversations]); return { conversationId: id, messages, safetyNotice: "General health information only; not a diagnosis." } as ChatResponse as T;
  }
  if (route === "/api/ivr/session") { const state = previewIvrResponse(Date.now(), "MAIN_MENU", read(profileKey, defaultProfile).preferredLanguage); write(key(sessionKey, "ivr"), state); return state as T; }
  if (route.startsWith("/api/ivr/session/")) {
    const id = Number(route.split("/")[4]); const input = String(body(init).input || "").toLowerCase(); const language = read(profileKey, defaultProfile).preferredLanguage; const current = read<IvrState>(key(sessionKey, "ivr"), previewIvrResponse(id, "MAIN_MENU", language));
    const nextState: PreviewIvrState = input === "0" || input === "end" ? "ENDED" : input === "back" ? "MAIN_MENU" : input === "repeat" ? current.state as PreviewIvrState : current.state === "MAIN_MENU" ? ({ "1": "HOSPITAL_LOCATOR", "2": "HEALTH_SCHEMES", "3": "AI_ASSISTANT", "4": "MEDICINE_REMINDER" } as Record<string, PreviewIvrState>)[input] || "MAIN_MENU" : "MAIN_MENU";
    const state = previewIvrResponse(id, nextState, language); write(key(sessionKey, "ivr"), state); return state as T;
  }
  if (route === "/api/hospitals/nearby") return [] as T;
  throw new Error("This action requires the live Java service.");
}
