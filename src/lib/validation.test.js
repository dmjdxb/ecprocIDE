import { describe, it, expect } from 'vitest';
import { validateStep, validateProcedure, summarizeIssues, isValid, LEVEL } from './validation';
import { createDefaultStep } from './techniques';

// === PV Error Rules ===

describe('validateStep — PV error rules', () => {
  it('PV000: unknown technique returns error', () => {
    const step = { technique: 'nonexistent', params: {} };
    const issues = validateStep(step);
    expect(issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'PV000', level: LEVEL.ERROR })])
    );
  });

  it('PV000: generic min/max violation', () => {
    const step = createDefaultStep('ocp');
    step.params.duration_s = 0.01; // below min of 1
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'PV000' && i.level === LEVEL.ERROR)).toBe(true);
  });

  it('PV001: CV scan rate exceeds 10 V/s', () => {
    const step = createDefaultStep('cv');
    step.params.scan_rate_mV_s = 15000;
    const issues = validateStep(step);
    expect(issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'PV001' })])
    );
  });

  it('PV001: LSV scan rate exceeds 10 V/s', () => {
    const step = createDefaultStep('lsv');
    step.params.scan_rate_mV_s = 15000;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'PV001')).toBe(true);
  });

  it('PV002: CV scan rate too slow', () => {
    const step = createDefaultStep('cv');
    step.params.scan_rate_mV_s = 0.05;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'PV002')).toBe(true);
  });

  it('PV002: LSV scan rate too slow', () => {
    const step = createDefaultStep('lsv');
    step.params.scan_rate_mV_s = 0.05;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'PV002')).toBe(true);
  });

  it('PV003: CV cycles < 1', () => {
    const step = createDefaultStep('cv');
    step.params.cycles = 0;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'PV003')).toBe(true);
  });

  it('PV004: CV identical vertices', () => {
    const step = createDefaultStep('cv');
    step.params.vertex1_V = 0.5;
    step.params.vertex2_V = 0.5;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'PV004')).toBe(true);
  });

  it('PV005: EIS start freq <= end freq', () => {
    const step = createDefaultStep('eis');
    step.params.f_start_Hz = 0.1;
    step.params.f_end_Hz = 100;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'PV005')).toBe(true);
  });

  it('PV006: EIS start freq > 10 MHz', () => {
    const step = createDefaultStep('eis');
    step.params.f_start_Hz = 20000000;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'PV006')).toBe(true);
  });

  it('PV007: EIS end freq < 1 µHz', () => {
    const step = createDefaultStep('eis');
    step.params.f_end_Hz = 0.0000001;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'PV007')).toBe(true);
  });

  it('PV008: EIS amplitude <= 0', () => {
    const step = createDefaultStep('eis');
    step.params.amplitude_mV = -5;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'PV008')).toBe(true);
  });

  it('PV009: EIS amplitude > 100 mV', () => {
    const step = createDefaultStep('eis');
    step.params.amplitude_mV = 150;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'PV009')).toBe(true);
  });

  it('PV010: CA potential outside ±10 V', () => {
    const step = createDefaultStep('ca');
    step.params.potential_V = 15;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'PV010')).toBe(true);
  });

  it('PV010: LSV potential outside ±10 V', () => {
    const step = createDefaultStep('lsv');
    step.params.start_V = 12;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'PV010')).toBe(true);
  });

  it('PV011: OCP duration <= 0', () => {
    const step = createDefaultStep('ocp');
    step.params.duration_s = -1;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'PV011')).toBe(true);
  });

  it('PV011: CA duration <= 0', () => {
    const step = createDefaultStep('ca');
    step.params.duration_s = 0;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'PV011')).toBe(true);
  });

  it('PV011: Purge duration < 1 min', () => {
    const step = createDefaultStep('purge');
    step.params.duration_min = 0.5;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'PV011')).toBe(true);
  });

  it('no errors for valid default CV step', () => {
    const step = createDefaultStep('cv');
    const issues = validateStep(step);
    const errors = issues.filter(i => i.level === LEVEL.ERROR);
    expect(errors).toHaveLength(0);
  });

  it('no errors for valid default EIS step', () => {
    const step = createDefaultStep('eis');
    const issues = validateStep(step);
    const errors = issues.filter(i => i.level === LEVEL.ERROR);
    expect(errors).toHaveLength(0);
  });
});

// === DR Warning Rules ===

describe('validateStep — DR warning rules', () => {
  it('DR001: high CA potential', () => {
    const step = createDefaultStep('ca');
    step.params.potential_V = 3.0;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'DR001' && i.level === LEVEL.WARNING)).toBe(true);
  });

  it('DR004: OCP < 30s', () => {
    const step = createDefaultStep('ocp');
    step.params.duration_s = 10;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'DR004')).toBe(true);
  });

  it('DR005: EIS amplitude > 10 mV', () => {
    const step = createDefaultStep('eis');
    step.params.amplitude_mV = 20;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'DR005')).toBe(true);
  });

  it('DR007: purge < 10 min', () => {
    const step = createDefaultStep('purge');
    step.params.duration_min = 5;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'DR007')).toBe(true);
  });

  it('DR009: high CP current', () => {
    const step = createDefaultStep('cp');
    step.params.current_mA = 200;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'DR009')).toBe(true);
  });

  it('DR011: CV < 3 cycles', () => {
    const step = createDefaultStep('cv');
    step.params.cycles = 2;
    const issues = validateStep(step);
    expect(issues.some(i => i.code === 'DR011')).toBe(true);
  });
});

// === validateProcedure ===

describe('validateProcedure', () => {
  const meta = { name: 'Test', electrolyte: '0.1 M HClO4', temperature: 25, electrodes: 3, reference: 'RHE' };

  it('DR006: no conditioning before measurement', () => {
    const steps = [createDefaultStep('cv')];
    // Only one step, firstMeasurementIndex is 0 which is not > 0
    const issues = validateProcedure(steps, meta);
    // DR006 only fires if firstMeasurementIndex > 0
    expect(issues.some(i => i.code === 'DR006')).toBe(false);
  });

  it('DR007: LSV without purge', () => {
    const steps = [createDefaultStep('ocp'), createDefaultStep('lsv')];
    const issues = validateProcedure(steps, meta);
    expect(issues.some(i => i.code === 'DR007')).toBe(true);
  });

  it('DR008: iR compensation without EIS', () => {
    const step = createDefaultStep('cv');
    step.params.ir_compensation = true;
    const steps = [step];
    const issues = validateProcedure(steps, meta);
    expect(issues.some(i => i.code === 'DR008')).toBe(true);
  });

  it('no warnings for well-ordered default procedure', () => {
    const steps = [
      createDefaultStep('purge'),
      createDefaultStep('ocp'),
      createDefaultStep('cv'),
      createDefaultStep('eis'),
    ];
    const issues = validateProcedure(steps, meta);
    expect(issues).toHaveLength(0);
  });
});

// === summarizeIssues / isValid ===

describe('summarizeIssues', () => {
  it('groups issues correctly', () => {
    const issues = [
      { level: LEVEL.ERROR, code: 'PV001', message: 'e1' },
      { level: LEVEL.WARNING, code: 'DR001', message: 'w1' },
      { level: LEVEL.WARNING, code: 'DR002', message: 'w2' },
      { level: LEVEL.INFO, code: 'I001', message: 'i1' },
    ];
    const { errors, warnings, infos } = summarizeIssues(issues);
    expect(errors).toHaveLength(1);
    expect(warnings).toHaveLength(2);
    expect(infos).toHaveLength(1);
  });

  it('returns empty arrays for no issues', () => {
    const { errors, warnings, infos } = summarizeIssues([]);
    expect(errors).toHaveLength(0);
    expect(warnings).toHaveLength(0);
    expect(infos).toHaveLength(0);
  });
});

describe('isValid', () => {
  const meta = { name: 'Test', electrolyte: '0.1 M HClO4', temperature: 25, electrodes: 3, reference: 'RHE' };

  it('returns true for valid default procedure', () => {
    const steps = [createDefaultStep('purge'), createDefaultStep('ocp'), createDefaultStep('cv')];
    expect(isValid(steps, meta)).toBe(true);
  });

  it('returns false when step has error', () => {
    const step = createDefaultStep('cv');
    step.params.scan_rate_mV_s = 50000;
    expect(isValid([step], meta)).toBe(false);
  });
});
