import { AIChatBox, type Message } from "@/components/AIChatBox";
import { MapView } from "@/components/Map";
import { QuickControlPanel } from "@/components/QuickControlPanel";
import { SectionNavigation } from "@/components/SectionNavigation";
import {
  arogyaApi,
  type AshaResource,
  type ChatMessage,
  type Conversation,
  type Eligibility,
  type Facility,
  type IvrState,
  type LanguageCode,
  type Medicine,
  type Scheme,
  type SessionProfile,
} from "@/lib/arogyaApi";
import { getHeaderProfileLabel } from "@/lib/profileDisplay";
import { getIvrDestination } from "@/lib/ivrRouting";
import { getIvrKeypadLabel, type IvrInputKey } from "@/lib/ivrCopy";
import {
  localizeEligibility,
  localizeResources,
  localizeSchemes,
  resourceCategoryForApi,
  schemeCategoryForApi,
} from "@/lib/referenceTranslations";
import { dictionaries } from "@/i18n/dictionaries";
import { controlLabels } from "@/i18n/controlLabels";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  HeartPulse,
  Hospital,
  Languages,
  LocateFixed,
  MapPin,
  Mic,
  Phone,
  Pill,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Square,
  Stethoscope,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type NavId =
  | "home"
  | "assistant"
  | "hospitals"
  | "medicines"
  | "schemes"
  | "asha"
  | "ivr"
  | "profile";

const languageLabels: Record<LanguageCode, string> = {
  en: "English",
  hi: "हिन्दी",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  ta: "தமிழ்",
  te: "తెలుగు",
};
const languageSpeech: Record<LanguageCode, string> = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  ta: "ta-IN",
  te: "te-IN",
};
const ivrInputKeys: IvrInputKey[] = ["1", "2", "3", "4", "back", "repeat", "0", "end"];
const moduleCards = [
  {
    id: "assistant" as const,
    icon: Bot,
  },
  {
    id: "hospitals" as const,
    icon: Hospital,
  },
  {
    id: "medicines" as const,
    icon: Pill,
  },
  {
    id: "schemes" as const,
    icon: ShieldCheck,
  },
];

function toUiMessage(message: ChatMessage): Message {
  return { role: message.role, content: message.content };
}
function scrollToModule(id: NavId) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const continuityToken = trpc.continuity.token.useMutation();
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [activeSection, setActiveSection] = useState<NavId>("home");
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [loadingService, setLoadingService] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<
    number | undefined
  >();
  const [chatLoading, setChatLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicineForm, setMedicineForm] = useState({
    name: "",
    dosage: "",
    instructions: "",
    reminderTimes: ["08:00"],
  });
  const [savingMedicine, setSavingMedicine] = useState(false);
  const [editingMedicineId, setEditingMedicineId] = useState<number | null>(
    null
  );
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [schemeSearch, setSchemeSearch] = useState("");
  const [schemeCategory, setSchemeCategory] = useState("");
  const [schemeState, setSchemeState] = useState("");
  const [schemeDetailId, setSchemeDetailId] = useState<number | null>(null);
  const [eligibility, setEligibility] = useState<Eligibility[]>([]);
  const [eligibilityForm, setEligibilityForm] = useState({
    age: "",
    annualIncome: "",
    state: "Karnataka",
    gender: "",
    familySize: "",
  });
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [resources, setResources] = useState<AshaResource[]>([]);
  const [resourceSearch, setResourceSearch] = useState("");
  const [resourceCategory, setResourceCategory] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "locating" | "ready" | "denied" | "error"
  >("idle");
  const [facilityType, setFacilityType] = useState("hospital");
  const [distance, setDistance] = useState("10000");
  const [lastCoordinates, setLastCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [ivr, setIvr] = useState<IvrState | null>(null);
  const [ivrDuration, setIvrDuration] = useState(0);
  const t = dictionaries[language];
  const c = controlLabels[language];
  const moduleCopy = {
    assistant: { title: t.nav.Assistant, text: c.moduleAssistant },
    hospitals: { title: t.nearby, text: c.moduleCare },
    medicines: { title: t.medicine, text: c.moduleMedicine },
    schemes: { title: t.schemes, text: c.moduleSchemes },
  };

  const chatMessages = useMemo(() => messages, [messages]);

  const reportError = (error: unknown) => {
    const message = error instanceof Error ? error.message : t.serviceOffline;
    setServiceError(message);
    toast.error(message);
  };

  const loadSessionData = async () => {
    setLoadingService(true);
    try {
      const [session, history, medicineRows, schemeRows, resourceRows] =
        await Promise.all([
          arogyaApi.getSession(),
          arogyaApi.conversations(),
          arogyaApi.medicines(),
          arogyaApi.schemes(),
          arogyaApi.ashaResources(),
        ]);
      setProfile(session);
      setLanguage(session.preferredLanguage);
      setConversations(history);
      setMedicines(medicineRows);
      setSchemes(localizeSchemes(schemeRows, session.preferredLanguage));
      setResources(localizeResources(resourceRows, session.preferredLanguage));
      setServiceError(null);
    } catch (error) {
      reportError(error);
    } finally {
      setLoadingService(false);
    }
  };

  useEffect(() => {
    void loadSessionData();
  }, []);
  useEffect(() => {
    const ids: NavId[] = [
      "home",
      "assistant",
      "hospitals",
      "medicines",
      "schemes",
      "asha",
      "ivr",
      "profile",
    ];
    const observer = new IntersectionObserver(
      entries => {
        const current = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActiveSection(current.target.id as NavId);
      },
      { rootMargin: "-22% 0px -62% 0px", threshold: [0.1, 0.4, 0.7] }
    );
    ids.forEach(
      id =>
        document.getElementById(id) &&
        observer.observe(document.getElementById(id)!)
    );
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!ivr || ivr.ended) return;
    const timer = window.setInterval(
      () => setIvrDuration(value => value + 1),
      1000
    );
    return () => window.clearInterval(timer);
  }, [ivr]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  useEffect(() => {
    if (!ivr || ivr.ended) return;
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT"
      )
        return;
      if (["0", "1", "2", "3", "4"].includes(event.key)) {
        event.preventDefault();
        void ivrInput(event.key);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [ivr]);

  const changeLanguage = async (next: LanguageCode) => {
    setLanguage(next);
    try {
      const updated = await arogyaApi.updateSession({
        preferredLanguage: next,
      });
      const [schemeRows, resourceRows] = await Promise.all([
        arogyaApi.schemes(),
        arogyaApi.ashaResources(),
      ]);
      setProfile(updated);
      setSchemes(localizeSchemes(schemeRows, next));
      setResources(localizeResources(resourceRows, next));
      setServiceError(null);
    } catch (error) {
      reportError(error);
    }
  };

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not available in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*_`]/g, ""));
    utterance.lang = languageSpeech[language];
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => window.speechSynthesis?.cancel();

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(
        "Voice input is not supported by this browser. You can continue by typing."
      );
      return;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = languageSpeech[language];
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = (event: any) => {
      setIsListening(false);
      recognitionRef.current = null;
      toast.error(
        event.error === "not-allowed"
          ? "Microphone permission was denied. You can type your question instead."
          : "Voice input could not be started. Please try again."
      );
    };
    recognition.onresult = (event: any) =>
      setDraft(event.results[0][0].transcript);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const sendMessage = async (text: string) => {
    setChatLoading(true);
    const optimistic: Message = { role: "user", content: text };
    setMessages(current => [...current, optimistic]);
    try {
      const response = await arogyaApi.sendMessage(
        text,
        language,
        activeConversation
      );
      const viewMessages = response.messages.map(toUiMessage);
      setMessages(viewMessages);
      setActiveConversation(response.conversationId);
      setServiceError(null);
      const latestAssistant = viewMessages
        .filter(message => message.role === "assistant")
        .at(-1);
      if (autoRead && latestAssistant) speak(latestAssistant.content);
      const history = await arogyaApi.conversations();
      setConversations(history);
    } catch (error) {
      setMessages(current => current.slice(0, -1));
      reportError(error);
    } finally {
      setChatLoading(false);
    }
  };

  const openConversation = async (conversation: Conversation) => {
    try {
      const history = await arogyaApi.history(conversation.id);
      setActiveConversation(conversation.id);
      setMessages(history.map(toUiMessage));
      scrollToModule("assistant");
    } catch (error) {
      reportError(error);
    }
  };

  const saveMedicine = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingMedicine(true);
    try {
      const medicine = await arogyaApi.saveMedicine(
        {
          ...medicineForm,
          reminderTimes: medicineForm.reminderTimes.filter(Boolean),
        },
        editingMedicineId || undefined
      );
      setMedicines(current =>
        editingMedicineId
          ? current.map(row => (row.id === medicine.id ? medicine : row))
          : [medicine, ...current]
      );
      setMedicineForm({
        name: "",
        dosage: "",
        instructions: "",
        reminderTimes: ["08:00"],
      });
      setEditingMedicineId(null);
      setServiceError(null);
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      toast.success("Medicine saved to your session.");
    } catch (error) {
      reportError(error);
    } finally {
      setSavingMedicine(false);
    }
  };

  const saveDose = async (id: number, action: "taken" | "snooze") => {
    try {
      await arogyaApi.updateDose(id, action);
      toast.success(
        action === "taken" ? "Dose marked as taken." : "Dose snoozed."
      );
    } catch (error) {
      reportError(error);
    }
  };
  const removeMedicine = async (id: number) => {
    try {
      await arogyaApi.deleteMedicine(id);
      setMedicines(rows => rows.filter(row => row.id !== id));
    } catch (error) {
      reportError(error);
    }
  };
  const editMedicine = (medicine: Medicine) => {
    setEditingMedicineId(medicine.id);
    setMedicineForm({
      name: medicine.name,
      dosage: medicine.dosage,
      instructions: medicine.instructions || "",
      reminderTimes: medicine.reminderTimes.map(time => time.slice(0, 5)),
    });
    scrollToModule("medicines");
  };

  const searchSchemes = async () => {
    try {
      const rows = await arogyaApi.schemes({
        q: schemeSearch,
        category: schemeCategoryForApi(schemeCategory, language),
        state: schemeState,
      });
      setSchemes(localizeSchemes(rows, language));
    } catch (error) {
      reportError(error);
    }
  };
  const checkEligibility = async (event: React.FormEvent) => {
    event.preventDefault();
    setCheckingEligibility(true);
    try {
      const results = await arogyaApi.assessEligibility({
        age: Number(eligibilityForm.age),
        annualIncome: Number(eligibilityForm.annualIncome),
        state: eligibilityForm.state,
        gender: eligibilityForm.gender || undefined,
        familySize: Number(eligibilityForm.familySize),
      });
      setEligibility(localizeEligibility(results, language));
    } catch (error) {
      reportError(error);
    } finally {
      setCheckingEligibility(false);
    }
  };
  const searchResources = async () => {
    try {
      const rows = await arogyaApi.ashaResources({
        q: resourceSearch,
        category: resourceCategoryForApi(resourceCategory, language),
      });
      setResources(localizeResources(rows, language));
    } catch (error) {
      reportError(error);
    }
  };

  const findFacilities = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      toast.error("Location services are not supported in this browser.");
      return;
    }
    setLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async position => {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        try {
          const results = await arogyaApi.nearby(
            coordinates.lat,
            coordinates.lng,
            facilityType,
            Number(distance)
          );
          setFacilities(results);
          setLastCoordinates({
            lat: coordinates.lat + Math.random() * 0.000000001,
            lng: coordinates.lng,
          });
          setLocationStatus("ready");
        } catch (error) {
          setLocationStatus("error");
          reportError(error);
        }
      },
      error => {
        setLocationStatus(
          error.code === error.PERMISSION_DENIED ? "denied" : "error"
        );
        toast.error(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. You can still use another map app to search manually."
            : "We could not retrieve your location. Please try again."
        );
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const startIvr = async () => {
    try {
      const state = await arogyaApi.startIvr();
      setIvr(state);
      setIvrDuration(0);
      speak(state.prompt);
    } catch (error) {
      reportError(error);
    }
  };
  const ivrInput = async (input: string) => {
    if (!ivr) return;
    try {
      const state = await arogyaApi.ivrInput(ivr.id, input);
      setIvr(state);
      speak(state.prompt);
      const destination = getIvrDestination(state.state);
      if (destination) {
        setActiveSection(destination.sectionId);
        scrollToModule(destination.sectionId);
        toast.success(`Opening ${destination.label}.`);
      }
    } catch (error) {
      reportError(error);
    }
  };
  const saveProfile = async () => {
    try {
      const next = await arogyaApi.updateSession({
        name: profile?.name,
        age: profile?.age,
        gender: profile?.gender,
        phone: profile?.phone,
        state: profile?.state,
        familySize: profile?.familySize,
        annualIncome: profile?.annualIncome,
      });
      setProfile(next);
      toast.success("Optional profile saved to this anonymous session.");
    } catch (error) {
      reportError(error);
    }
  };
  const linkContinuity = async () => {
    try {
      const linked = await continuityToken.mutateAsync();
      const next = await arogyaApi.updateSession({
        continuityToken: linked.token,
      });
      setProfile(next);
      toast.success("Signed-in continuity has been linked to this session.");
    } catch (error) {
      reportError(error);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#15110E] text-[#FFF7ED] selection:bg-[#E8CDB0] selection:text-[#241811]">
      <div className="cosmos-backdrop" aria-hidden="true">
        <span className="star star-one" />
        <span className="star star-two" />
        <span className="star star-three" />
        <span className="nebula nebula-one" />
        <span className="nebula nebula-two" />
      </div>
      <SectionNavigation
        activeId={activeSection}
        language={language}
        onNavigate={id => {
          setActiveSection(id as NavId);
          scrollToModule(id as NavId);
        }}
      />
      <header className="sticky top-0 z-40 px-3 pt-3 md:px-6">
        <div className="glass-shell mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-5">
          <button
            onClick={() => {
              setActiveSection("home");
              scrollToModule("home");
            }}
            className="flex min-w-0 items-center gap-2 text-left"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#BE8B64] to-[#E8CDB0] shadow-[0_0_22px_rgba(201,141,99,.35)]">
              <HeartPulse className="size-5 text-[#241811]" />
            </span>
            <span className="hidden leading-tight sm:block">
              <b className="font-display block tracking-wide">Arogya Seva AI</b>
              <span className="text-[10px] text-[#E8CDB0]">
                Smart care, human clarity
              </span>
            </span>
          </button>
          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {(
              [
                "Home",
                "Assistant",
                "Hospitals",
                "Medicines",
                "Schemes",
                "ASHA",
                "IVR",
              ] as const
            ).map(item => (
              <button
                key={item}
                onClick={() =>
                  scrollToModule(
                    item === "Home"
                      ? "home"
                      : item === "Assistant"
                        ? "assistant"
                        : item === "Hospitals"
                          ? "hospitals"
                          : item === "Medicines"
                            ? "medicines"
                            : item === "Schemes"
                              ? "schemes"
                              : item === "ASHA"
                                ? "asha"
                                : "ivr"
                  )
                }
                className="rounded-lg px-2 py-2 text-xs font-medium text-[#E9D6C1] transition hover:bg-[#F2DCC5]/10 hover:text-[#FFEAD4]"
              >
                {t.nav[item]}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <label className="relative">
              <Languages className="pointer-events-none absolute left-2 top-2.5 size-3.5 text-[#E8CDB0]" />
              <select
                value={language}
                onChange={event =>
                  void changeLanguage(event.target.value as LanguageCode)
                }
                aria-label="Select language"
                className="h-9 rounded-lg border border-[#F2DDC7]/18 bg-[#F2DDC5]/8 pl-7 pr-2 text-xs text-[#FFF7ED] outline-none focus:ring-2 focus:ring-[#DFB188]"
              >
                <option className="bg-[#2A211B]" value="en">
                  English
                </option>
                <option className="bg-[#2A211B]" value="hi">
                  हिन्दी
                </option>
                <option className="bg-[#2A211B]" value="kn">
                  ಕನ್ನಡ
                </option>
                <option className="bg-[#2A211B]" value="ml">
                  മലയാളം
                </option>
                <option className="bg-[#2A211B]" value="ta">
                  தமிழ்
                </option>
                <option className="bg-[#2A211B]" value="te">
                  తెలుగు
                </option>
              </select>
            </label>
            <button
              onClick={() => {
                setActiveSection("profile");
                scrollToModule("profile");
              }}
              className="hidden rounded-lg border border-[#F2DDC7]/18 px-3 py-2 text-xs font-semibold text-[#FFF7ED] hover:bg-[#F2DCC5]/10 sm:block"
            >
              {getHeaderProfileLabel(profile, isAuthenticated, user?.name)}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 xl:pl-24">
        <QuickControlPanel
          language={language}
          autoRead={autoRead}
          onAutoReadChange={setAutoRead}
          medicines={medicines}
          onEditMedicine={editMedicine}
          schemes={schemes}
          schemeCategory={schemeCategory}
          schemeState={schemeState}
          onSchemeCategoryChange={setSchemeCategory}
          onSchemeStateChange={setSchemeState}
          onApplySchemeFilters={() => void searchSchemes()}
          resources={resources}
          resourceCategory={resourceCategory}
          onResourceCategoryChange={setResourceCategory}
          onApplyResourceFilters={() => void searchResources()}
        />
        {serviceError && (
          <div className="mx-auto mt-4 flex max-w-5xl items-center gap-3 rounded-2xl border border-amber-300/40 bg-amber-100/10 px-4 py-3 text-sm text-amber-50">
            <AlertTriangle className="size-5 shrink-0 text-amber-300" />
            <p className="flex-1">{serviceError}</p>
            <button
              onClick={() => void loadSessionData()}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20"
            >
              <RefreshCw className="size-3.5" /> {t.retry}
            </button>
          </div>
        )}

        <section
          id="home"
          className="scroll-mt-24 px-4 pb-16 pt-16 md:px-6 md:pb-24 md:pt-24"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.06fr_.94fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-200/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#2FD8C9]" />
                {t.heroEyebrow}
              </div>
              <h1 className="font-display max-w-4xl text-5xl font-semibold leading-[1.03] tracking-tight text-white md:text-7xl">
                {t.heroTitle}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-violet-100 md:text-lg">
                {t.heroBody}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => scrollToModule("assistant")}
                  className="glow-button inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-bold text-[#14122B]"
                >
                  <Sparkles className="size-4" />
                  {t.talk}
                  <ChevronRight className="size-4" />
                </button>
                <button
                  onClick={() => scrollToModule("hospitals")}
                  className="glass-button inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white"
                >
                  <MapPin className="size-4 text-cyan-200" />
                  {t.findCare}
                </button>
              </div>
              <div className="mt-8 flex max-w-xl items-start gap-3 rounded-2xl border border-white/10 bg-[#0b0a1e]/45 p-4">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-cyan-200" />
                <p className="text-xs leading-5 text-violet-100">
                  {t.disclaimer}
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="glass-panel hero-orbital-card relative overflow-hidden p-6 md:p-8">
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
                <div className="mb-8 flex items-center justify-between">
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wider text-cyan-100">
                    HEALTH COMPASS
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-cyan-100">
                    <span className="size-2 rounded-full bg-cyan-300 animate-pulse" />
                    ONLINE
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <HeartPulse className="mb-5 size-7 text-cyan-200" />
                    <p className="text-xs text-violet-200">Guidance</p>
                    <p className="mt-1 text-xl font-bold text-white">
                      Text-first
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <Languages className="mb-5 size-7 text-violet-200" />
                    <p className="text-xs text-violet-200">Language</p>
                    <p className="mt-1 text-xl font-bold text-white">
                      3 choices
                    </p>
                  </div>
                  <div className="col-span-2 rounded-2xl border border-cyan-200/15 bg-gradient-to-r from-cyan-300/10 to-violet-400/15 p-4">
                    <p className="text-xs text-violet-100">
                      Designed for clarity, not diagnosis.
                    </p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full w-[72%] rounded-full bg-gradient-to-r from-violet-400 to-cyan-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-14 grid max-w-7xl gap-3 sm:grid-cols-3">
            <div className="glass-panel flex items-center gap-3 p-4">
              <Stethoscope className="size-5 text-cyan-200" />
              <div>
                <b className="block text-sm">Public access</b>
                <span className="text-xs text-violet-200">
                  No account is required
                </span>
              </div>
            </div>
            <div className="glass-panel flex items-center gap-3 p-4">
              <Volume2 className="size-5 text-cyan-200" />
              <div>
                <b className="block text-sm">Voice supported</b>
                <span className="text-xs text-violet-200">
                  Speech input and read-aloud
                </span>
              </div>
            </div>
            <div className="glass-panel flex items-center gap-3 p-4">
              <ShieldCheck className="size-5 text-cyan-200" />
              <div>
                <b className="block text-sm">Safety-forward</b>
                <span className="text-xs text-violet-200">
                  Emergency escalation included
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 md:px-6">
          <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-4">
            {moduleCards.map(card => (
              <button
                key={card.id}
                onClick={() => scrollToModule(card.id)}
                className="glass-panel group text-left p-5 transition duration-200 hover:-translate-y-1 hover:border-cyan-200/45"
              >
                <div className="mb-6 grid size-11 place-items-center rounded-xl bg-gradient-to-br from-violet-400/25 to-cyan-300/25">
                  <card.icon className="size-5 text-cyan-100" />
                </div>
                    <h2 className="font-display text-lg font-semibold">
                      {moduleCopy[card.id].title}
                    </h2>
                <p className="mt-2 text-sm leading-6 text-violet-100">
                      {moduleCopy[card.id].text}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-cyan-200">
                      {c.explore}{" "}
                  <ChevronRight className="size-3.5 transition group-hover:translate-x-1" />
                </span>
              </button>
            ))}
          </div>
        </section>

        <section
          aria-label="Emergency guidance"
          className="mx-auto mb-20 max-w-7xl px-4 md:px-6"
        >
          <div className="emergency-panel flex flex-col gap-5 rounded-3xl p-6 md:flex-row md:items-center md:p-8">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#FF6B6B] text-[#301426] shadow-[0_0_28px_rgba(255,107,107,.48)]">
              <AlertTriangle className="size-6" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl font-semibold">
                {t.emergency}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-rose-50">
                {t.emergencyBody}
              </p>
            </div>
            <a
              href="tel:112"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#FF6B6B] px-5 text-sm font-bold text-[#301426] transition hover:brightness-110"
            >
              <Phone className="size-4" />
              {c.callEmergency}
            </a>
          </div>
        </section>

        <section id="assistant" className="scroll-mt-24 px-4 pb-20 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="section-heading">
              <span className="section-number">01</span>
              <div>
                <p className="eyebrow">Conversation support</p>
                <h2>{t.nav.Assistant}</h2>
              </div>
            </div>
            <div className="mt-7 grid gap-5 xl:grid-cols-[250px_1fr]">
              <aside className="glass-panel h-fit p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">{t.history}</h3>
                  <button
                    onClick={() => {
                      setMessages([]);
                      setActiveConversation(undefined);
                    }}
                    className="rounded-lg border border-white/15 px-2 py-1 text-[11px] font-semibold hover:bg-white/10"
                  >
                    {t.newChat}
                  </button>
                </div>
                <div className="mt-3 space-y-1">
                  {conversations.length ? (
                    conversations.map(conversation => (
                      <button
                        key={conversation.id}
                        onClick={() => void openConversation(conversation)}
                        className={`w-full rounded-xl px-3 py-2.5 text-left text-xs transition ${activeConversation === conversation.id ? "bg-cyan-300/15 text-cyan-100" : "text-violet-100 hover:bg-white/10"}`}
                      >
                        <span className="block truncate font-semibold">
                          {conversation.title}
                        </span>
                        <span className="mt-1 block text-[10px] opacity-65">
                          {new Date(
                            conversation.updatedAt
                          ).toLocaleDateString()}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="py-6 text-center text-xs text-violet-200">
                      Your conversations will appear here.
                    </p>
                  )}
                </div>
              </aside>
              <div className="glass-panel overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-cyan-200/10">
                      <Bot className="size-5 text-cyan-200" />
                    </span>
                    <div>
                      <h3 className="font-display font-semibold">
                        {c.guide}
                      </h3>
                      <p className="text-xs text-violet-200">{t.disclaimer}</p>
                    </div>
                  </div>
                  <button
                    onClick={stopSpeaking}
                    className="glass-button inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold"
                  >
                    <Square className="size-3" /> {t.stop}
                  </button>
                </div>
                <AIChatBox
                  messages={chatMessages}
                  onSendMessage={message => void sendMessage(message)}
                  isLoading={chatLoading}
                  inputValue={draft}
                  onInputValueChange={setDraft}
                  onVoiceInput={startVoiceInput}
                  isListening={isListening}
                  voiceInputLabel={language === "hi" ? "आवाज़ से प्रश्न पूछें" : "Start voice input"}
                  stopListeningLabel={language === "hi" ? "सुनना बंद करें" : "Stop listening"}
                    placeholder={isListening ? t.listening : c.assistantPlaceholder}
                    emptyStateMessage={c.assistantEmpty}
                  suggestedPrompts={language === "en" ? [
                    "I have fever and cough. What general steps should I take?",
                    "How can I prepare for a clinic visit?",
                    "Explain a medicine label in simple words.",
                  ] : []}
                  height="560px"
                  className="rounded-none border-0 bg-transparent shadow-none"
                  renderMessageActions={message =>
                    message.role === "assistant" ? (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => speak(message.content)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-bold text-cyan-100 hover:bg-white/10"
                        >
                          <Play className="size-3" />
                          {t.speak}
                        </button>
                        <button
                          onClick={stopSpeaking}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-bold text-violet-100 hover:bg-white/10"
                        >
                          <Square className="size-3" />
                          {t.stop}
                        </button>
                      </div>
                    ) : null
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <section id="hospitals" className="scroll-mt-24 px-4 pb-20 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="section-heading">
              <span className="section-number">02</span>
              <div>
                <p className="eyebrow">{c.liveLocation}</p>
                <h2>{t.nearby}</h2>
              </div>
            </div>
            <div className="mt-7 grid gap-5 lg:grid-cols-[360px_1fr]">
              <div className="glass-panel h-fit p-5">
                <p className="text-sm leading-6 text-violet-100">
                  {c.locationNotice}
                </p>
                <label className="mt-5 block text-xs font-bold text-violet-100">
                  {c.facilityType}
                  <select
                    value={facilityType}
                    onChange={event => setFacilityType(event.target.value)}
                    className="field-select mt-2"
                  >
                    <option value="hospital">{c.hospital}</option>
                    <option value="doctor">{c.clinic}</option>
                    <option value="pharmacy">{c.pharmacy}</option>
                  </select>
                </label>
                <label className="mt-4 block text-xs font-bold text-violet-100">
                  {c.distance}
                  <select
                    value={distance}
                    onChange={event => setDistance(event.target.value)}
                    className="field-select mt-2"
                  >
                    <option value="5000">{c.within5}</option>
                    <option value="10000">{c.within10}</option>
                    <option value="25000">{c.within25}</option>
                  </select>
                </label>
                <button
                  onClick={findFacilities}
                  disabled={locationStatus === "locating"}
                  className="glow-button mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-[#14122B]"
                >
                  <LocateFixed className="size-4" />
                  {locationStatus === "locating"
                    ? c.findingCare
                    : t.allowLocation}
                </button>
                {locationStatus === "denied" && (
                  <p className="mt-4 text-xs leading-5 text-amber-100">
                    {c.locationDenied}
                  </p>
                )}
              </div>
              <div className="glass-panel min-h-[500px] overflow-hidden p-2">
                <MapView
                  key={
                    lastCoordinates
                      ? `${lastCoordinates.lat}-${lastCoordinates.lng}`
                      : "initial"
                  }
                  initialCenter={
                    lastCoordinates || { lat: 20.5937, lng: 78.9629 }
                  }
                  initialZoom={lastCoordinates ? 12 : 5}
                  onMapReady={map => {
                    facilities.forEach(
                      facility =>
                        new google.maps.marker.AdvancedMarkerElement({
                          map,
                          position: {
                            lat: facility.latitude,
                            lng: facility.longitude,
                          },
                          title: facility.name,
                        })
                    );
                  }}
                  className="h-[496px] overflow-hidden rounded-2xl"
                />
              </div>
            </div>
            {facilities.length > 0 && (
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {facilities.map(facility => (
                  <article key={facility.id} className="glass-panel p-4">
                    <div className="flex gap-3">
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-cyan-300/10">
                        <Hospital className="size-4 text-cyan-200" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {facility.name}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-violet-100">
                          {facility.address || c.addressUnavailable}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-violet-200">
                      <span>{facility.distanceKm} {c.kmAway}</span>
                      <span className="capitalize">{facility.primaryType}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {facility.phone && (
                        <a
                          href={`tel:${facility.phone}`}
                          className="glass-button inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-lg text-xs font-bold"
                        >
                          <Phone className="size-3.5" />
                          {t.call}
                        </a>
                      )}
                      <a
                        href={facility.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-cyan-300/15 text-xs font-bold text-cyan-100 hover:bg-cyan-300/25"
                      >
                        <MapPin className="size-3.5" />
                        {t.directions}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="medicines" className="scroll-mt-24 px-4 pb-20 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="section-heading">
              <span className="section-number">03</span>
              <div>
                <p className="eyebrow">{c.persistentRoutine}</p>
                <h2>{t.medicine}</h2>
              </div>
            </div>
            <div className="mt-7 grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
              <form onSubmit={saveMedicine} className="glass-panel p-5">
                <h3 className="font-display text-xl font-semibold">
                  {t.addMedicine}
                </h3>
                <p className="mt-2 text-xs leading-5 text-violet-200">
                  {c.savedRecords}
                </p>
                <label className="field-label">
                  {c.medicineName}
                  <input
                    required
                    value={medicineForm.name}
                    onChange={event =>
                      setMedicineForm(form => ({
                        ...form,
                        name: event.target.value,
                      }))
                    }
                    className="field-input"
                    placeholder="Vitamin D"
                  />
                </label>
                <label className="field-label">
                  {t.dosage}
                  <input
                    required
                    value={medicineForm.dosage}
                    onChange={event =>
                      setMedicineForm(form => ({
                        ...form,
                        dosage: event.target.value,
                      }))
                    }
                    className="field-input"
                    placeholder="1 tablet"
                  />
                </label>
                <label className="field-label">
                  {c.instructions}
                  <textarea
                    value={medicineForm.instructions}
                    onChange={event =>
                      setMedicineForm(form => ({
                        ...form,
                        instructions: event.target.value,
                      }))
                    }
                    className="field-input min-h-20 resize-y"
                    placeholder={c.clinicianNotes}
                  />
                </label>
                <div className="field-label">
                  {t.time}
                  {medicineForm.reminderTimes.map((time, index) => (
                    <div key={index} className="mt-2 flex gap-2">
                      <input
                        type="time"
                        required
                        value={time}
                        onChange={event =>
                          setMedicineForm(form => ({
                            ...form,
                            reminderTimes: form.reminderTimes.map(
                              (item, itemIndex) =>
                                itemIndex === index ? event.target.value : item
                            ),
                          }))
                        }
                        className="field-input mt-0"
                      />
                      {medicineForm.reminderTimes.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setMedicineForm(form => ({
                              ...form,
                              reminderTimes: form.reminderTimes.filter(
                                (_, itemIndex) => itemIndex !== index
                              ),
                            }))
                          }
                          className="rounded-lg px-3 text-xs text-rose-200 hover:bg-white/10"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setMedicineForm(form => ({
                        ...form,
                        reminderTimes: [...form.reminderTimes, "20:00"],
                      }))
                    }
                    className="mt-2 text-xs font-bold text-cyan-200 hover:underline"
                  >
                    + {c.addTime}
                  </button>
                </div>
                <button
                  disabled={savingMedicine}
                  className="glow-button mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-[#14122B]"
                >
                  <CalendarClock className="size-4" />
                  {savingMedicine ? c.saving : t.save}
                </button>
              </form>
              <div className="space-y-3">
                {medicines.length ? (
                  medicines.map(medicine => (
                    <article
                      key={medicine.id}
                      className="glass-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                    >
                      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-400/15">
                        <Pill className="size-5 text-violet-100" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-semibold">
                          {medicine.name}{" "}
                          <span className="text-sm font-normal text-cyan-200">
                            {medicine.dosage}
                          </span>
                        </h3>
                        <p className="mt-1 text-sm text-violet-100">
                          {medicine.instructions ||
                            c.noInstructions}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {medicine.reminderTimes.map(time => (
                            <span
                              key={time}
                              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-violet-100"
                            >
                              <Clock3 className="size-3 text-cyan-200" />
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => void saveDose(medicine.id, "taken")}
                          className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-cyan-300/15 px-3 text-xs font-bold text-cyan-100 hover:bg-cyan-300/25"
                        >
                          <CheckCircle2 className="size-3.5" />
                          {t.taken}
                        </button>
                        <button
                          onClick={() => void saveDose(medicine.id, "snooze")}
                          className="glass-button min-h-10 rounded-lg px-3 text-xs font-bold"
                        >
                          {t.snooze}
                        </button>
                        <button
                          onClick={() => void removeMedicine(medicine.id)}
                          className="min-h-10 rounded-lg px-3 text-xs font-bold text-rose-200 hover:bg-white/10"
                        >
                          {c.remove}
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="glass-panel grid min-h-48 place-items-center p-6 text-center">
                    <div>
                      <Pill className="mx-auto size-7 text-violet-200" />
                      <p className="mt-3 text-sm text-violet-100">
                        {t.noResults} Add your first medicine reminder.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="schemes" className="scroll-mt-24 px-4 pb-20 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="section-heading">
              <span className="section-number">04</span>
              <div>
                <p className="eyebrow">Official-source guidance</p>
                <h2>{t.schemes}</h2>
              </div>
            </div>
            <div className="mt-7 grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
              <div>
                <div className="glass-panel mb-4 flex gap-2 p-3">
                  <input
                    value={schemeSearch}
                    onChange={event => setSchemeSearch(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === "Enter") void searchSchemes();
                    }}
                    className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-violet-300"
                    placeholder={c.filterSchemes}
                  />
                  <button
                    onClick={() => void searchSchemes()}
                    className="glass-button rounded-lg px-3 text-xs font-bold"
                  >
                    {c.search}
                  </button>
                </div>
                <div className="grid gap-3">
                  {schemes.map(scheme => (
                    <article key={scheme.id} className="glass-panel p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-[10px] font-bold text-cyan-100">
                            {scheme.category || "Healthcare"}
                          </span>
                          <h3 className="mt-3 font-display text-xl font-semibold">
                            {scheme.name}
                          </h3>
                        </div>
                        <span className="text-xs text-violet-200">
                          {scheme.state}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-violet-100">
                        {scheme.description}
                      </p>
                      <p className="mt-3 text-xs leading-5 text-violet-200">
                        {scheme.enrolmentInfo}
                      </p>
                      <a
                        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-200 hover:underline"
                        href={scheme.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {c.officialSource} <ChevronRight className="size-3.5" />
                      </a>
                    </article>
                  ))}
                </div>
              </div>
              <form
                onSubmit={checkEligibility}
                className="glass-panel h-fit p-5"
              >
                <h3 className="font-display text-xl font-semibold">
                  {t.eligibility}
                </h3>
                <p className="mt-2 text-xs leading-5 text-violet-200">
                  This is preliminary guidance only. The official authority must
                  determine eligibility and documents.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <label className="field-label">
                    {c.age}
                    <input
                      required
                      min="0"
                      max="120"
                      type="number"
                      value={eligibilityForm.age}
                      onChange={event =>
                        setEligibilityForm(form => ({
                          ...form,
                          age: event.target.value,
                        }))
                      }
                      className="field-input"
                    />
                  </label>
                  <label className="field-label">
                    {c.annualIncome}
                    <input
                      required
                      min="0"
                      type="number"
                      value={eligibilityForm.annualIncome}
                      onChange={event =>
                        setEligibilityForm(form => ({
                          ...form,
                          annualIncome: event.target.value,
                        }))
                      }
                      className="field-input"
                    />
                  </label>
                  <label className="field-label">
                    {c.state}
                    <input
                      required
                      value={eligibilityForm.state}
                      onChange={event =>
                        setEligibilityForm(form => ({
                          ...form,
                          state: event.target.value,
                        }))
                      }
                      className="field-input"
                    />
                  </label>
                  <label className="field-label">
                    {c.familySize}
                    <input
                      required
                      min="1"
                      type="number"
                      value={eligibilityForm.familySize}
                      onChange={event =>
                        setEligibilityForm(form => ({
                          ...form,
                          familySize: event.target.value,
                        }))
                      }
                      className="field-input"
                    />
                  </label>
                  <label className="field-label sm:col-span-2">
                    {c.gender}
                    <select
                      value={eligibilityForm.gender}
                      onChange={event =>
                        setEligibilityForm(form => ({
                          ...form,
                          gender: event.target.value,
                        }))
                      }
                      className="field-select"
                    >
                      <option value="">{c.preferNot}</option>
                      <option value="female">{c.female}</option>
                      <option value="male">{c.male}</option>
                      <option value="other">{c.other}</option>
                    </select>
                  </label>
                </div>
                <button
                  disabled={checkingEligibility}
                  className="glow-button mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-[#14122B]"
                >
                  <CircleHelp className="size-4" />
                  {checkingEligibility ? c.checking : t.checkEligibility}
                </button>
                {eligibility.length > 0 && (
                  <div className="mt-5 space-y-3">
                    {eligibility.map(result => (
                      <div
                        key={result.schemeId}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <b className="text-sm">{result.schemeName}</b>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${result.status === "NOT_ELIGIBLE" ? "bg-rose-400/15 text-rose-100" : "bg-cyan-300/15 text-cyan-100"}`}
                          >
                            {result.status.replaceAll("_", " ")}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-violet-100">
                          {result.reason}
                        </p>
                        <a
                          href={result.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-[11px] font-bold text-cyan-200 hover:underline"
                        >
                          {c.openOfficialSource}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

        <section
          id="scheme-details"
          className="scroll-mt-24 px-4 pb-20 md:px-6"
        >
          <div className="mx-auto max-w-7xl">
            <div className="glass-panel p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <p className="eyebrow">Official programme record</p>
                  <h3 className="font-display text-2xl font-semibold">
                    {c.viewDetail}
                  </h3>
                  <p className="mt-2 text-sm text-violet-100">
                    Review benefits and document guidance before opening the
                    official source for final verification.
                  </p>
                </div>
                <select
                  value={schemeDetailId ?? ""}
                  onChange={event =>
                    setSchemeDetailId(Number(event.target.value))
                  }
                  className="field-select mt-0 max-w-md"
                >
                  <option value="">{c.selectScheme}</option>
                  {schemes.map(scheme => (
                    <option key={scheme.id} value={scheme.id}>
                      {scheme.name}
                    </option>
                  ))}
                </select>
              </div>
              {schemeDetailId &&
                schemes.find(scheme => scheme.id === schemeDetailId) &&
                (() => {
                  const scheme = schemes.find(
                    item => item.id === schemeDetailId
                  )!;
                  return (
                    <div className="mt-5 grid gap-4 rounded-2xl border border-white/10 bg-white/[.045] p-4 md:grid-cols-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-100">
                          {c.benefits}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-violet-100">
                          {scheme.benefits ||
                            "See the official source for current benefits."}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-100">
                          {c.documents}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-violet-100">
                          {scheme.documents ||
                            "Confirm current documents with the official authority."}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-100">
                          Enrolment guidance
                        </p>
                        <p className="mt-2 text-sm leading-6 text-violet-100">
                          {scheme.enrolmentInfo}
                        </p>
                        <a
                          href={scheme.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex text-xs font-bold text-cyan-200 hover:underline"
                        >
                          {c.openOfficialSource}
                        </a>
                      </div>
                    </div>
                  );
                })()}
            </div>
          </div>
        </section>
        <section id="asha" className="scroll-mt-24 px-4 pb-20 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="section-heading">
              <span className="section-number">05</span>
              <div>
                <p className="eyebrow">Community health reference</p>
                <h2>{t.asha}</h2>
              </div>
            </div>
            <div className="glass-panel mt-7 p-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={resourceSearch}
                  onChange={event => setResourceSearch(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === "Enter") void searchResources();
                  }}
                  className="field-input mt-0 flex-1"
                  placeholder={c.resourceSearch}
                />
                <button
                  onClick={() => void searchResources()}
                  className="glass-button min-h-11 rounded-xl px-4 text-xs font-bold"
                >
                  {c.searchResources}
                </button>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {resources.map(resource => (
                  <article
                    key={resource.id}
                    className="rounded-2xl border border-white/10 bg-white/[.045] p-4"
                  >
                    <span className="rounded-full bg-violet-400/15 px-2.5 py-1 text-[10px] font-bold text-violet-100">
                      {resource.category}
                    </span>
                    <h3 className="mt-3 font-display text-lg font-semibold">
                      {resource.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-violet-100">
                      {resource.summary}
                    </p>
                    <p className="mt-3 text-[11px] text-violet-200">
                      {resource.publisher}
                    </p>
                    <a
                      href={resource.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-200 hover:underline"
                    >
                      {c.openResource} <ChevronRight className="size-3.5" />
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="ivr" className="scroll-mt-24 px-4 pb-20 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="section-heading">
              <span className="section-number">06</span>
              <div>
                <p className="eyebrow">Accessible interaction</p>
                <h2>{t.ivr}</h2>
              </div>
            </div>
            <div className="mt-7 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
              <div className="glass-panel p-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-bold text-cyan-100">
                  <Phone className="size-3.5" /> {c.simulatedCall}
                </span>
                <h3 className="mt-5 font-display text-3xl font-semibold">
                  {c.ivrTitle}
                </h3>
                <p className="mt-4 text-sm leading-6 text-violet-100">
                  {c.ivrDescription}
                </p>
                {!ivr || ivr.ended ? (
                  <button
                    onClick={() => void startIvr()}
                    className="glow-button mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-bold text-[#14122B]"
                  >
                    <Phone className="size-4" />
                    {t.startIvr}
                  </button>
                ) : (
                  <div className="mt-7 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <Clock3 className="size-4 text-cyan-200" />
                    <span className="text-sm font-bold">
                      {String(Math.floor(ivrDuration / 60)).padStart(2, "0")}:
                      {String(ivrDuration % 60).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-violet-200">
                      {ivr.state}
                    </span>
                  </div>
                )}
              </div>
              <div className="glass-panel p-5">
                <div className="rounded-2xl border border-white/10 bg-[#0c0b20]/60 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-cyan-100">
                      {ivr?.state || c.ready}
                    </span>
                    <button
                      onClick={() => ivr && speak(ivr.prompt)}
                      disabled={!ivr}
                      className="glass-button inline-flex size-9 items-center justify-center rounded-lg"
                      aria-label={c.repeatIvr}
                    >
                      <Volume2 className="size-4" />
                    </button>
                  </div>
                  <p className="mt-6 min-h-20 font-display text-xl leading-8">
                    {ivr?.prompt || c.startIvrPrompt}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {ivr?.options.map(option => (
                      <span
                        key={option}
                        className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-violet-100"
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {ivrInputKeys.map(key => {
                    const label = getIvrKeypadLabel(language, key);
                    return (
                      <button
                        disabled={!ivr || ivr.ended}
                        key={key}
                        onClick={() => void ivrInput(key)}
                        aria-label={label}
                        className="min-h-12 rounded-xl border border-white/15 bg-white/5 text-sm font-bold text-white transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="profile" className="scroll-mt-24 px-4 pb-24 md:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="section-heading">
              <span className="section-number">07</span>
              <div>
                <p className="eyebrow">Private convenience</p>
                <h2>{t.profile}</h2>
              </div>
            </div>
            <div className="glass-panel mt-7 p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <h3 className="font-display text-xl font-semibold">
                    {c.useWithoutAccount}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100">
                    This optional profile stays linked to the anonymous device
                    session to pre-fill future forms. It is not a medical record
                    and it is not an authentication requirement.
                  </p>
                </div>
                {!isAuthenticated ? (
                  <button
                    onClick={startLogin}
                    className="glass-button inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold"
                  >
                    <ShieldCheck className="size-4 text-cyan-200" />
                    {c.optionalSignIn}
                  </button>
                ) : profile?.continuityConnected ? (
                  <span className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-cyan-200/25 bg-cyan-300/10 px-4 text-xs font-bold text-cyan-100">
                    <CheckCircle2 className="size-4" />
                    Continuity linked
                  </span>
                ) : (
                  <button
                    onClick={() => void linkContinuity()}
                    disabled={continuityToken.isPending}
                    className="glass-button inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold"
                  >
                    <ShieldCheck className="size-4 text-cyan-200" />
                    {continuityToken.isPending
                      ? "Linking…"
                      : "Link signed-in session"}
                  </button>
                )}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <label className="field-label">
                  {c.name}
                  <input
                    value={profile?.name || ""}
                    onChange={event =>
                      setProfile(value => ({
                        ...(value || {
                          sessionKey: "",
                          preferredLanguage: language,
                          continuityConnected: false,
                        }),
                        name: event.target.value,
                      }))
                    }
                    className="field-input"
                  />
                </label>
                <label className="field-label">
                  {c.age}
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={profile?.age || ""}
                    onChange={event =>
                      setProfile(value => ({
                        ...(value || {
                          sessionKey: "",
                          preferredLanguage: language,
                          continuityConnected: false,
                        }),
                        age: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      }))
                    }
                    className="field-input"
                  />
                </label>
                <label className="field-label">
                  {c.state}
                  <input
                    value={profile?.state || ""}
                    onChange={event =>
                      setProfile(value => ({
                        ...(value || {
                          sessionKey: "",
                          preferredLanguage: language,
                          continuityConnected: false,
                        }),
                        state: event.target.value,
                      }))
                    }
                    className="field-input"
                  />
                </label>
                <label className="field-label">
                  {c.familySize}
                  <input
                    type="number"
                    min="1"
                    value={profile?.familySize || ""}
                    onChange={event =>
                      setProfile(value => ({
                        ...(value || {
                          sessionKey: "",
                          preferredLanguage: language,
                          continuityConnected: false,
                        }),
                        familySize: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      }))
                    }
                    className="field-input"
                  />
                </label>
              </div>
              <button
                onClick={() => void saveProfile()}
                className="glow-button mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-[#14122B]"
              >
                <CheckCircle2 className="size-4" />
                {t.save}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-[#0b0a1d]/75 px-4 py-10 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-300">
              <HeartPulse className="size-5 text-[#14122B]" />
            </span>
            <div>
              <b className="font-display">Arogya Seva AI</b>
              <p className="mt-1 text-xs text-violet-200">
                General information. Not medical diagnosis.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-violet-200">
            <button onClick={() => void changeLanguage("en")}>English</button>
            <button onClick={() => void changeLanguage("hi")}>हिन्दी</button>
            <button onClick={() => void changeLanguage("kn")}>ಕನ್ನಡ</button>
            <a
              className="font-bold text-rose-200 hover:text-rose-100"
              href="tel:112"
            >
              Emergency: 112
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
