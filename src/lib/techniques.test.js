import { describe, it, expect } from 'vitest';
import { TECHNIQUES, TECHNIQUE_CATEGORIES, createDefaultStep } from './techniques';

const ALL_TECHNIQUES = Object.keys(TECHNIQUES);

describe('createDefaultStep', () => {
  it.each(ALL_TECHNIQUES)('creates valid default step for %s', (techId) => {
    const step = createDefaultStep(techId);
    expect(step.technique).toBe(techId);
    expect(step.id).toBeDefined();
    expect(step.params).toBeDefined();
    expect(step.tag).toBe('');
  });

  it('populates all params with defaults', () => {
    const step = createDefaultStep('cv');
    const tech = TECHNIQUES.cv;
    Object.entries(tech.params).forEach(([key, config]) => {
      expect(step.params).toHaveProperty(key);
      expect(step.params[key]).toBe(config.default);
    });
  });

  it('throws for unknown technique', () => {
    expect(() => createDefaultStep('fake')).toThrow('Unknown technique');
  });
});

describe('TECHNIQUE_CATEGORIES', () => {
  it('all categories reference valid techniques', () => {
    Object.values(TECHNIQUE_CATEGORIES).forEach(cat => {
      cat.techniques.forEach(techId => {
        expect(TECHNIQUES[techId]).toBeDefined();
      });
    });
  });

  it('every technique appears in exactly one category', () => {
    const allCatTechs = Object.values(TECHNIQUE_CATEGORIES).flatMap(c => c.techniques);
    ALL_TECHNIQUES.forEach(techId => {
      const count = allCatTechs.filter(t => t === techId).length;
      expect(count).toBe(1);
    });
  });

  it('categories have labels', () => {
    Object.values(TECHNIQUE_CATEGORIES).forEach(cat => {
      expect(cat.label).toBeDefined();
      expect(typeof cat.label).toBe('string');
    });
  });
});

describe('TECHNIQUES data integrity', () => {
  it('all techniques have required fields', () => {
    ALL_TECHNIQUES.forEach(techId => {
      const tech = TECHNIQUES[techId];
      expect(tech.id).toBe(techId);
      expect(tech.name).toBeDefined();
      expect(tech.abbrev).toBeDefined();
      expect(tech.category).toBeDefined();
      expect(tech.description).toBeDefined();
      expect(tech.params).toBeDefined();
    });
  });

  it('all params have label, type, and default', () => {
    ALL_TECHNIQUES.forEach(techId => {
      const tech = TECHNIQUES[techId];
      Object.entries(tech.params).forEach(([_key, config]) => {
        expect(config.label).toBeDefined();
        expect(config.type).toBeDefined();
        expect(config).toHaveProperty('default');
      });
    });
  });

  it('there are exactly 12 techniques', () => {
    expect(ALL_TECHNIQUES).toHaveLength(12);
  });

  it('technique category values match category keys', () => {
    ALL_TECHNIQUES.forEach(techId => {
      const tech = TECHNIQUES[techId];
      expect(TECHNIQUE_CATEGORIES[tech.category]).toBeDefined();
    });
  });
});
