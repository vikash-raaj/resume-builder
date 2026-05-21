import { createContext, useContext, useEffect, useRef, useState } from "react";

const DRAFT_KEY = "resume_builder_draft";

const defaultResume = {
  personalInfo: {
    photo: null,
    firstName: "",
    lastName: "",
    jobTitle: "",
    email: "",
    phone: "",
    city: "",
    postalCode: "",
    address: "",
    country: "",
    website: "",
    linkedin: "",
    location: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
  websites: [],
  personalDetails: { nationality: "", dob: "", visaStatus: "", maritalStatus: "" },
  template: "riga",
  accentColor: "",
  title: "",
};

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const draft = JSON.parse(raw);
      if (draft.template === 'modern') draft.template = 'riga';
      return { ...defaultResume, ...draft };
    }
  } catch {}
  return null;
}

function saveDraft(resume) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(resume));
  } catch {}
}

const ResumeContext = createContext(null);

export function ResumeProvider({ children, initial }) {
  const [resume, setResume] = useState(() => {
    // Existing Firestore resume being loaded — always use it directly
    if (initial && Object.keys(initial).length > 1) {
      return { ...defaultResume, ...initial };
    }
    // Brand-new resume created from Dashboard (has a title set) — skip localStorage draft
    if (initial?.title) {
      return { ...defaultResume, ...initial };
    }
    // Fallback: try localStorage draft, else defaults
    const draft = loadDraft();
    if (draft) return draft;
    return initial ? { ...defaultResume, ...initial } : defaultResume;
  });

  // Debounced localStorage autosave
  const lsTimer = useRef(null);
  useEffect(() => {
    clearTimeout(lsTimer.current);
    lsTimer.current = setTimeout(() => saveDraft(resume), 500);
    return () => clearTimeout(lsTimer.current);
  }, [resume]);

  const updatePersonalInfo = (data) =>
    setResume((r) => ({ ...r, personalInfo: { ...r.personalInfo, ...data } }));

  const updateSummary = (summary) => setResume((r) => ({ ...r, summary }));
  const updateExperience = (experience) => setResume((r) => ({ ...r, experience }));
  const updateEducation = (education) => setResume((r) => ({ ...r, education }));
  const updateSkills = (skills) => setResume((r) => ({ ...r, skills }));
  const updateCertifications = (certifications) => setResume((r) => ({ ...r, certifications }));
  const updateLanguages = (languages) => setResume((r) => ({ ...r, languages }));
  const updateWebsites = (websites) => setResume((r) => ({ ...r, websites }));
  const updatePersonalDetails = (data) =>
    setResume((r) => ({ ...r, personalDetails: { ...r.personalDetails, ...data } }));
  const setTemplate = (template) => setResume((r) => ({ ...r, template }));
  const setAccentColor = (accentColor) => setResume((r) => ({ ...r, accentColor }));
  const setTitle = (title) => setResume((r) => ({ ...r, title }));

  return (
    <ResumeContext.Provider
      value={{
        resume,
        setResume,
        updatePersonalInfo,
        updateSummary,
        updateExperience,
        updateEducation,
        updateSkills,
        updateCertifications,
        updateLanguages,
        updateWebsites,
        updatePersonalDetails,
        setTemplate,
        setAccentColor,
        setTitle,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export const useResume = () => useContext(ResumeContext);
