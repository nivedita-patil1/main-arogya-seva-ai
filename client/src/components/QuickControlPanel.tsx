import type { AshaResource, Medicine, Scheme } from "@/lib/arogyaApi";
import type { LanguageCode } from "@/lib/arogyaApi";
import { controlLabels } from "@/i18n/controlLabels";
import { CheckCircle2, Edit3, SlidersHorizontal, Volume2 } from "lucide-react";
import { useState } from "react";

type Props = {
  autoRead: boolean;
  onAutoReadChange: (value: boolean) => void;
  medicines: Medicine[];
  onEditMedicine: (medicine: Medicine) => void;
  schemes: Scheme[];
  schemeCategory: string;
  schemeState: string;
  onSchemeCategoryChange: (value: string) => void;
  onSchemeStateChange: (value: string) => void;
  onApplySchemeFilters: () => void;
  resources: AshaResource[];
  resourceCategory: string;
  onResourceCategoryChange: (value: string) => void;
  onApplyResourceFilters: () => void;
  language: LanguageCode;
};

export function QuickControlPanel(props: Props) {
  const copy = controlLabels[props.language];
  const [medicineId, setMedicineId] = useState("");
  const [schemeId, setSchemeId] = useState("");
  const selectedScheme = props.schemes.find(scheme => String(scheme.id) === schemeId);
  const categories = Array.from(new Set(props.schemes.map(scheme => scheme.category).filter((category): category is string => Boolean(category))));
  const resourceCategories = Array.from(new Set(props.resources.map(resource => resource.category).filter(Boolean)));

  return (
    <section className="mx-auto mt-4 max-w-7xl px-4 md:px-6" aria-label={copy.panel}>
      <details className="glass-panel group p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-violet-100">
          <span className="inline-flex items-center gap-2"><SlidersHorizontal className="size-4 text-cyan-200"/> {copy.panel}</span>
          <span className="text-[11px] font-medium text-violet-200 group-open:hidden">{copy.open}</span>
        </summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
            <p className="text-xs font-bold">{copy.assistantPreference}</p>
            <button onClick={() => props.onAutoReadChange(!props.autoRead)} className={`mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-xs font-bold ${props.autoRead ? "border-cyan-200/40 bg-cyan-300/15 text-cyan-100" : "border-white/15 bg-white/5 text-violet-100"}`}><Volume2 className="size-3.5"/>{copy.autoRead}: {props.autoRead ? copy.on : copy.off}</button>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
            <p className="text-xs font-bold">{copy.editMedicine}</p>
            <select value={medicineId} onChange={event => setMedicineId(event.target.value)} className="field-select mt-3"><option value="">{copy.selectMedicine}</option>{props.medicines.map(medicine => <option key={medicine.id} value={medicine.id}>{medicine.name}</option>)}</select>
            <button disabled={!medicineId} onClick={() => { const medicine = props.medicines.find(item => String(item.id) === medicineId); if (medicine) props.onEditMedicine(medicine); }} className="glass-button mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold disabled:opacity-40"><Edit3 className="size-3.5"/>{copy.editRecord}</button>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
            <p className="text-xs font-bold">{copy.filterSchemes}</p>
            <select value={props.schemeCategory} onChange={event => props.onSchemeCategoryChange(event.target.value)} className="field-select mt-3"><option value="">{copy.allCategories}</option>{categories.map(category => <option key={category} value={category}>{category}</option>)}</select>
            <input value={props.schemeState} onChange={event => props.onSchemeStateChange(event.target.value)} className="field-input" placeholder={copy.stateExample} />
            <button onClick={props.onApplySchemeFilters} className="glass-button mt-2 min-h-9 rounded-lg px-3 text-xs font-bold">{copy.applyFilters}</button>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[.04] p-3">
            <p className="text-xs font-bold">{copy.filterResources}</p>
            <select value={props.resourceCategory} onChange={event => props.onResourceCategoryChange(event.target.value)} className="field-select mt-3"><option value="">{copy.allCategories}</option>{resourceCategories.map(category => <option key={category} value={category}>{category}</option>)}</select>
            <button onClick={props.onApplyResourceFilters} className="glass-button mt-2 min-h-9 rounded-lg px-3 text-xs font-bold">{copy.applyCategory}</button>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-[#0c0b20]/45 p-3">
          <label className="text-xs font-bold">{copy.viewDetail}<select value={schemeId} onChange={event => setSchemeId(event.target.value)} className="field-select mt-2"><option value="">{copy.selectScheme}</option>{props.schemes.map(scheme => <option key={scheme.id} value={scheme.id}>{scheme.name}</option>)}</select></label>
          {selectedScheme && <div className="mt-3 grid gap-2 text-xs leading-5 text-violet-100 md:grid-cols-3"><p><b className="text-cyan-100">{copy.benefits}:</b> {selectedScheme.benefits || copy.seeOfficialBenefits}</p><p><b className="text-cyan-100">{copy.documents}:</b> {selectedScheme.documents || copy.checkOfficial}</p><p><a href={selectedScheme.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-cyan-200 hover:underline"><CheckCircle2 className="size-3.5"/>{copy.openOfficialSource}</a></p></div>}
        </div>
      </details>
    </section>
  );
}
