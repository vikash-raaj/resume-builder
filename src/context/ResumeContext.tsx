import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { DEFAULT_SECTION_ORDER } from "../utils/sectionOrder";

const DRAFT_KEY = "resume_builder_draft";

type PersonalInfo = {
  photo: string | null;
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phone: string;
  city: string;
  postalCode: string;
  address: string;
  country: string;
  website: string;
  linkedin: string;
  location: string;
};

type PersonalDetails = {
  nationality: string;
  dob: string;
  visaStatus: string;
  maritalStatus: string;
};

// Entry shapes (experience items, education items, etc.) vary per form and
// aren't codified here yet — that's a larger follow-up than converting this
// context file. `any[]` keeps this incremental conversion honest about that.
export type ResumeData = {
  personalInfo: PersonalInfo;
  summary: string;
  experience: any[];
  education: any[];
  skills: any[];
  certifications: any[];
  languages: any[];
  websites: any[];
  personalDetails: PersonalDetails;
  projects: any[];
  volunteer: any[];
  awards: any[];
  hobbies: string;
  courses: any[];
  references: any[];
  internships: any[];
  publications: any[];
  customSection: { title: string; content: string };
  enabledBlocks: string[];
  sectionOrder: string[];
  template: string;
  accentColor: string;
  title: string;
  language: string;
  [key: string]: unknown;
};

const defaultResume: ResumeData = {
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
  // "Extra block" sections toggled on from the Finish step — kept out of the
  // resume until the user adds one, but always persisted once they do.
  projects: [],
  volunteer: [],
  awards: [],
  hobbies: "",
  courses: [],
  references: [],
  internships: [],
  publications: [],
  customSection: { title: "", content: "" },
  enabledBlocks: [],
  sectionOrder: DEFAULT_SECTION_ORDER,
  template: "riga",
  accentColor: "",
  title: "",
  language: "en",
};

function loadDraft(): ResumeData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const draft = JSON.parse(raw);
      return { ...defaultResume, ...draft };
    }
  } catch {}
  return null;
}

function saveDraft(resume: ResumeData) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(resume));
  } catch {}
}

type ResumeContextValue = {
  resume: ResumeData;
  setResume: React.Dispatch<React.SetStateAction<ResumeData>>;
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
  updateSummary: (summary: string) => void;
  updateExperience: (experience: any[]) => void;
  updateEducation: (education: any[]) => void;
  updateSkills: (skills: any[]) => void;
  updateCertifications: (certifications: any[]) => void;
  updateLanguages: (languages: any[]) => void;
  updateWebsites: (websites: any[]) => void;
  updatePersonalDetails: (data: Partial<PersonalDetails>) => void;
  setTemplate: (template: string) => void;
  setAccentColor: (accentColor: string) => void;
  setTitle: (title: string) => void;
  setLanguage: (language: string) => void;
  setSectionOrder: (sectionOrder: string[]) => void;
  setEnabledBlocks: (enabledBlocks: string[]) => void;
};

const ResumeContext = createContext<ResumeContextValue | null>(null);

export function ResumeProvider({ children, initial }: { children: ReactNode; initial?: Partial<ResumeData> | null }) {
  const [resume, setResume] = useState<ResumeData>(() => {
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
  const lsTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(lsTimer.current);
    lsTimer.current = setTimeout(() => saveDraft(resume), 500);
    return () => clearTimeout(lsTimer.current);
  }, [resume]);

  const updatePersonalInfo = (data: Partial<PersonalInfo>) =>
    setResume((r) => ({ ...r, personalInfo: { ...r.personalInfo, ...data } }));

  const updateSummary = (summary: string) => setResume((r) => ({ ...r, summary }));
  const updateExperience = (experience: any[]) => setResume((r) => ({ ...r, experience }));
  const updateEducation = (education: any[]) => setResume((r) => ({ ...r, education }));
  const updateSkills = (skills: any[]) => setResume((r) => ({ ...r, skills }));
  const updateCertifications = (certifications: any[]) => setResume((r) => ({ ...r, certifications }));
  const updateLanguages = (languages: any[]) => setResume((r) => ({ ...r, languages }));
  const updateWebsites = (websites: any[]) => setResume((r) => ({ ...r, websites }));
  const updatePersonalDetails = (data: Partial<PersonalDetails>) =>
    setResume((r) => ({ ...r, personalDetails: { ...r.personalDetails, ...data } }));
  const setTemplate = (template: string) => setResume((r) => ({ ...r, template }));
  const setAccentColor = (accentColor: string) => setResume((r) => ({ ...r, accentColor }));
  const setTitle = (title: string) => setResume((r) => ({ ...r, title }));
  const setLanguage = (language: string) => setResume((r) => ({ ...r, language }));
  const setSectionOrder = (sectionOrder: string[]) => setResume((r) => ({ ...r, sectionOrder }));
  const setEnabledBlocks = (enabledBlocks: string[]) => setResume((r) => ({ ...r, enabledBlocks }));

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
        setLanguage,
        setSectionOrder,
        setEnabledBlocks,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export const useResume = () => useContext(ResumeContext) as ResumeContextValue;
