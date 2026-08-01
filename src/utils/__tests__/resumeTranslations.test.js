import { describe, it, expect } from 'vitest';
import { getTranslations, RESUME_LANGUAGES } from '../resumeTranslations';

describe('getTranslations', () => {
  it('returns English strings for "en"', () => {
    const t = getTranslations('en');
    expect(t.experience).toBe('Work Experience');
    expect(t.volunteer).toBe('Volunteer Work');
  });

  it('falls back to English for an unknown language code', () => {
    expect(getTranslations('xx')).toEqual(getTranslations('en'));
  });

  it('falls back to English for keys a translated language has not defined yet', () => {
    // Spanish defines "experience" but not the newer "volunteer"/"awards" keys —
    // those must still resolve to English instead of coming back undefined.
    const es = getTranslations('es');
    expect(es.experience).toBe('Experiencia Laboral');
    expect(es.volunteer).toBe('Volunteer Work');
    expect(es.awards).toBe('Awards & Honors');
  });

  it('every listed resume language resolves to a usable translation object', () => {
    for (const { code } of RESUME_LANGUAGES) {
      const t = getTranslations(code);
      expect(t.experience).toBeTruthy();
      expect(t.volunteer).toBeTruthy();
    }
  });
});
