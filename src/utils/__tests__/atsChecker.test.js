import { describe, it, expect } from 'vitest';
import { getATSScore } from '../atsChecker';

const emptyResume = { personalInfo: {}, experience: [], education: [], skills: [] };

const fullResume = {
  personalInfo: {
    firstName: 'Jordan', lastName: 'Rivera', email: 'jordan@example.com', phone: '555-0100',
    city: 'Austin', country: 'USA', jobTitle: 'Senior Engineer', linkedin: 'linkedin.com/in/jordan',
  },
  summary: 'A'.repeat(120),
  experience: [
    { description: 'Led a team and achieved a 25% increase in throughput.' },
    { description: 'Built and deployed automated pipelines, reduced costs by $10k.' },
  ],
  education: [{ degree: 'B.S. Computer Science' }],
  skills: ['React', 'Node', 'SQL', 'AWS', 'Docker', 'Kubernetes'],
};

describe('getATSScore', () => {
  it('scores an empty resume low and lists issues for every missing field', () => {
    const result = getATSScore(emptyResume);
    expect(result.score).toBe(0);
    expect(result.label).toBe('Needs Work — Major gaps found');
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.passing).toEqual([]);
  });

  it('scores a complete resume highly and reports passing checks', () => {
    const result = getATSScore(fullResume);
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.label).toBe('Excellent — ATS Ready');
    expect(result.passing).toContain('Email address included');
    expect(result.passing.some((p) => p.includes('Quantified achievements'))).toBe(true);
  });

  it('clamps the score between 0 and 100', () => {
    const result = getATSScore(fullResume);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('handles missing personalInfo/experience/education/skills gracefully', () => {
    expect(() => getATSScore({})).not.toThrow();
    const result = getATSScore({});
    expect(result.score).toBe(0);
  });
});
