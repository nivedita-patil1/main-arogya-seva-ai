import type { AshaResource, Eligibility, LanguageCode, Scheme } from "./arogyaApi";

type SchemeLabels = { names: Record<number, string>; categories: Record<string, string>; states: Record<string, string> };

const schemeLabels: Partial<Record<LanguageCode, SchemeLabels>> = {
  hi: { names: { 1: "आयुष्मान भारत – प्रधानमंत्री जन आरोग्य योजना", 2: "जननी सुरक्षा योजना", 3: "आयुष्मान भारत आरोग्य कर्नाटक" }, categories: { "Health assurance": "स्वास्थ्य सुरक्षा", "Maternal health": "मातृ स्वास्थ्य" }, states: { "All India": "संपूर्ण भारत", Karnataka: "कर्नाटक" } },
  kn: { names: { 1: "ಆಯುಷ್ಮಾನ್ ಭಾರತ್ – ಪ್ರಧಾನ ಮಂತ್ರಿ ಜನ ಆರೋಗ್ಯ ಯೋಜನೆ", 2: "ಜನನಿ ಸುರಕ್ಷಾ ಯೋಜನೆ", 3: "ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಆರೋಗ್ಯ ಕರ್ನಾಟಕ" }, categories: { "Health assurance": "ಆರೋಗ್ಯ ಭದ್ರತೆ", "Maternal health": "ತಾಯಂದಿರ ಆರೋಗ್ಯ" }, states: { "All India": "ಎಲ್ಲಾ ಭಾರತ", Karnataka: "ಕರ್ನಾಟಕ" } },
  ml: { names: { 1: "ആയുഷ്മാൻ ഭാരത് – പ്രധാനമന്ത്രി ജൻ ആരോഗ്യ യോജന", 2: "ജനനി സുരക്ഷാ യോജന", 3: "ആയുഷ്മാൻ ഭാരത് ആരോഗ്യ കർണാടക" }, categories: { "Health assurance": "ആരോഗ്യ പരിരക്ഷ", "Maternal health": "മാതൃ ആരോഗ്യം" }, states: { "All India": "ഇന്ത്യ മുഴുവൻ", Karnataka: "കർണാടക" } },
  ta: { names: { 1: "ஆயுஷ்மான் பாரத் – பிரதம மந்திரி ஜன் ஆரோக்கிய யோஜனா", 2: "ஜனனி சுரக்ஷா யோஜனா", 3: "ஆயுஷ்மான் பாரத் ஆரோக்கிய கர்நாடகா" }, categories: { "Health assurance": "சுகாதாரப் பாதுகாப்பு", "Maternal health": "தாய்மை சுகாதாரம்" }, states: { "All India": "இந்தியா முழுவதும்", Karnataka: "கர்நாடகா" } },
  te: { names: { 1: "ఆయుష్మాన్ భారత్ – ప్రధాన మంత్రి జన ఆరోగ్య యోజన", 2: "జనని సురక్ష యోజన", 3: "ఆయుష్మాన్ భారత్ ఆరోగ్య కర్ణాటక" }, categories: { "Health assurance": "ఆరోగ్య భద్రత", "Maternal health": "మాతృ ఆరోగ్యం" }, states: { "All India": "భారతదేశమంతా", Karnataka: "కర్ణాటక" } },
};

const resourceCategories: Partial<Record<LanguageCode, Record<string, string>>> = {
  hi: { "Community awareness": "सामुदायिक जागरूकता", Training: "प्रशिक्षण", "Emergency guidance": "आपात मार्गदर्शन" },
  kn: { "Community awareness": "ಸಮುದಾಯ ಜಾಗೃತಿ", Training: "ತರಬೇತಿ", "Emergency guidance": "ತುರ್ತು ಮಾರ್ಗದರ್ಶನ" },
  ml: { "Community awareness": "സമൂഹ ബോധവൽക്കരണം", Training: "പരിശീലനം", "Emergency guidance": "അടിയന്തര മാർഗനിർദേശം" },
  ta: { "Community awareness": "சமூக விழிப்புணர்வு", Training: "பயிற்சி", "Emergency guidance": "அவசர வழிகாட்டல்" },
  te: { "Community awareness": "సామాజిక అవగాహన", Training: "శిక్షణ", "Emergency guidance": "అత్యవసర మార్గదర్శకం" },
};

export function localizeSchemes(rows: Scheme[], language: LanguageCode): Scheme[] {
  const labels = schemeLabels[language]; if (!labels) return rows;
  return rows.map(row => ({ ...row, name: labels.names[row.id] || row.name, category: row.category ? labels.categories[row.category] || row.category : row.category, state: row.state ? labels.states[row.state] || row.state : row.state }));
}

export function localizeResources(rows: AshaResource[], language: LanguageCode): AshaResource[] {
  const categories = resourceCategories[language]; if (!categories) return rows;
  return rows.map(row => ({ ...row, category: categories[row.category] || row.category }));
}

export function localizeEligibility(rows: Eligibility[], language: LanguageCode): Eligibility[] {
  const labels = schemeLabels[language]; if (!labels) return rows;
  return rows.map(row => ({ ...row, schemeName: labels.names[row.schemeId] || row.schemeName }));
}

function reverseValue(value: string, mappings: Record<string, string> | undefined) { return Object.entries(mappings || {}).find(([, translated]) => translated === value)?.[0] || value; }
export function schemeCategoryForApi(value: string, language: LanguageCode) { return reverseValue(value, schemeLabels[language]?.categories); }
export function resourceCategoryForApi(value: string, language: LanguageCode) { return reverseValue(value, resourceCategories[language]); }
