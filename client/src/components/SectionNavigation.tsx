import React from "react";
import { Bot, HeartPulse, Hospital, PhoneCall, Pill, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import type { LanguageCode } from "@/lib/arogyaApi";
import { dictionaries } from "@/i18n/dictionaries";

export const sectionNavigation = [
  { id: "home", labelKey: "Home", Icon: HeartPulse },
  { id: "assistant", labelKey: "Assistant", Icon: Bot },
  { id: "hospitals", labelKey: "Hospitals", Icon: Hospital },
  { id: "medicines", labelKey: "Medicines", Icon: Pill },
  { id: "schemes", labelKey: "Schemes", Icon: ShieldCheck },
  { id: "asha", labelKey: "ASHA", Icon: UsersRound },
  { id: "ivr", labelKey: "IVR", Icon: PhoneCall },
  { id: "profile", labelKey: "Profile", Icon: UserRound },
] as const;

type Props = {
  activeId: string;
  onNavigate: (id: string) => void;
  language?: LanguageCode;
};

export function createSectionNavigationHandler(onNavigate: (id: string) => void, id: string) {
  return () => onNavigate(id);
}

export function SectionNavigation({ activeId, onNavigate, language = "en" }: Props) {
  const navigationCopy = dictionaries[language].nav;
  const renderItem = (item: typeof sectionNavigation[number], compact = false) => {
    const active = activeId === item.id;
    const label = navigationCopy[item.labelKey];
    return <button key={item.id} type="button" title={label} aria-label={label} aria-current={active ? "page" : undefined} data-active={active ? "true" : "false"} onClick={createSectionNavigationHandler(onNavigate, item.id)} className={compact ? `inline-flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[10px] font-bold transition ${active ? "bg-[#E8CDB0] text-[#241811] shadow-[0_0_18px_rgba(201,141,99,.30)]" : "text-[#F1DDC8] hover:bg-[#F2DCC5]/10 hover:text-[#FFEAD4]"}` : `group grid size-12 place-items-center rounded-2xl border transition ${active ? "border-[#F4D9BD]/75 bg-[#E8CDB0] text-[#241811] shadow-[0_0_20px_rgba(201,141,99,.32)]" : "border-[#F2DDC7]/12 bg-[#211A15]/88 text-[#F1DDC8] hover:border-[#E8CDB0]/45 hover:bg-[#F2DCC5]/10 hover:text-[#FFEAD4]"}`}>
      <item.Icon className="size-4" />
      {compact && <span className="max-w-14 truncate leading-none">{label.replace(" ", "\n")}</span>}
    </button>;
  };

  return <>
    <aside aria-label="Section navigation" className="fixed left-4 top-24 z-30 hidden w-14 flex-col gap-2 rounded-3xl border border-[#F2DDC7]/12 bg-[#211A15]/88 p-1.5 shadow-[0_18px_50px_rgba(8,6,4,.46)] backdrop-blur-xl xl:flex">
      {sectionNavigation.map(item => renderItem(item))}
    </aside>
    <nav aria-label="Quick section navigation" className="fixed inset-x-3 bottom-16 z-50 overflow-x-auto rounded-2xl border border-[#F2DDC7]/16 bg-[#211A15]/95 p-1.5 shadow-[0_18px_50px_rgba(8,6,4,.52)] backdrop-blur-xl sm:bottom-3 xl:hidden">
      <div className="flex min-w-max items-center justify-between gap-1">{sectionNavigation.map(item => renderItem(item, true))}</div>
    </nav>
  </>;
}
