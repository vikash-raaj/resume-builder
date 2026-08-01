import { describe, it, expect } from 'vitest';
import { getCompletenessScore } from '../completenessScore';

describe('getCompletenessScore', () => {
  it('scores an empty resume at 0 and lists everything as missing', () => {
    const result = getCompletenessScore({});
    expect(result.score).toBe(0);
    expect(result.label).toBe('Needs work');
    expect(result.color).toBe('red');
    expect(result.missing).toContain('First name');
    expect(result.missing).toContain('At least 1 work experience');
  });

  it('scores a fully-filled resume near 100 with no missing items for filled sections', () => {
    const resume = {
      personalInfo: {
        firstName: 'Jordan', lastName: 'Rivera', email: 'j@example.com', phone: '555-0100',
        jobTitle: 'Engineer', city: 'Austin', linkedin: 'linkedin.com/in/jordan', photo: 'data:image/png;base64,x',
      },
      summary: Array(35).fill('word').join(' '),
      experience: [
        { description: 'A'.repeat(40) },
        { description: 'B'.repeat(40) },
        { description: 'C'.repeat(40) },
      ],
      education: [{ degree: 'B.S.' }],
      skills: ['a', 'b', 'c', 'd', 'e'],
    };
    const result = getCompletenessScore(resume);
    expect(result.score).toBe(100);
    expect(result.label).toBe('Excellent');
    expect(result.color).toBe('emerald');
    expect(result.missing).toEqual([]);
  });

  it('never exceeds 100 even if every bucket is maxed', () => {
    const resume = {
      personalInfo: { firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '1', jobTitle: 'X', city: 'Y', linkedin: 'z', photo: 'p' },
      summary: Array(50).fill('word').join(' '),
      experience: Array(5).fill({ description: 'A'.repeat(50) }),
      education: [{ degree: 'X' }],
      skills: ['1', '2', '3', '4', '5', '6', '7'],
    };
    expect(getCompletenessScore(resume).score).toBeLessThanOrEqual(100);
  });
});
