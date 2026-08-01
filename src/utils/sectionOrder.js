// Single source of truth for the reorderable "core" resume sections, shared
// between FinishStep (drag UI) and the templates (render order) so old
// resumes saved before `sectionOrder` existed still render consistently.
export const DEFAULT_SECTION_ORDER = [
  'personalInfo', 'experience', 'education', 'skills', 'summary', 'languages', 'personalDetails',
];
