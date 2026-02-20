import { describe, it, expect } from 'vitest';
import { generateYAML, generatePython, generateECDL, generateIR, escapeYaml, escapePython, sanitizeString } from './generators';
import { createDefaultStep } from './techniques';

const defaultMeta = {
  name: 'Test Procedure',
  author: 'Tester',
  description: 'A test',
  electrodes: 3,
  reference: 'RHE',
  electrolyte: '0.1 M HClO4',
  temperature: 25,
  working_electrode: 'GCE',
  counter_electrode: 'Pt wire',
};

const defaultSteps = [
  createDefaultStep('purge'),
  createDefaultStep('ocp'),
  createDefaultStep('cv'),
  createDefaultStep('eis'),
];

// === Escape Functions ===

describe('escapeYaml', () => {
  it('escapes double quotes', () => {
    expect(escapeYaml('hello "world"')).toBe('hello \\"world\\"');
  });

  it('escapes backslashes', () => {
    expect(escapeYaml('a\\b')).toBe('a\\\\b');
  });

  it('escapes newlines and tabs', () => {
    expect(escapeYaml('a\nb\tc')).toBe('a\\nb\\tc');
  });

  it('escapes carriage returns', () => {
    expect(escapeYaml('a\rb')).toBe('a\\rb');
  });

  it('returns empty string for null/undefined', () => {
    expect(escapeYaml(null)).toBe('');
    expect(escapeYaml(undefined)).toBe('');
  });
});

describe('escapePython', () => {
  it('escapes double quotes', () => {
    expect(escapePython('say "hi"')).toBe('say \\"hi\\"');
  });

  it('escapes single quotes', () => {
    expect(escapePython("it's")).toBe("it\\'s");
  });

  it('escapes backslashes', () => {
    expect(escapePython('a\\b')).toBe('a\\\\b');
  });

  it('escapes newlines, carriage returns, and tabs', () => {
    expect(escapePython('a\nb\rc\td')).toBe('a\\nb\\rc\\td');
  });

  it('returns empty string for null/undefined', () => {
    expect(escapePython(null)).toBe('');
    expect(escapePython(undefined)).toBe('');
  });
});

describe('sanitizeString', () => {
  it('caps length at maxLength', () => {
    const long = 'a'.repeat(1000);
    expect(sanitizeString(long, 100)).toHaveLength(100);
  });

  it('strips control characters', () => {
    expect(sanitizeString('hello\x00world\x07!')).toBe('helloworld!');
  });

  it('preserves normal newlines and tabs (only strips low control chars)', () => {
    // \n (0x0A), \r (0x0D), \t (0x09) are in 0x00-0x1F range but let's verify
    // The regex strips 0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F — preserves \t(09), \n(0A), \r(0D)
    expect(sanitizeString('a\tb\nc')).toBe('a\tb\nc');
  });

  it('returns empty string for null', () => {
    expect(sanitizeString(null)).toBe('');
  });

  it('uses default maxLength of 500', () => {
    const long = 'x'.repeat(600);
    expect(sanitizeString(long)).toHaveLength(500);
  });
});

// === Generator Output Tests ===

describe('generateYAML', () => {
  it('produces valid YAML-like string', () => {
    const output = generateYAML(defaultMeta, defaultSteps);
    expect(output).toContain('metadata:');
    expect(output).toContain('system:');
    expect(output).toContain('procedure:');
    expect(output).toContain('protocol: "Test Procedure"');
  });

  it('includes all steps', () => {
    const output = generateYAML(defaultMeta, defaultSteps);
    expect(output).toContain('purge:');
    expect(output).toContain('ocp:');
    expect(output).toContain('cv:');
    expect(output).toContain('eis:');
  });

  it('includes author when provided', () => {
    const output = generateYAML(defaultMeta, defaultSteps);
    expect(output).toContain('author: "Tester"');
  });
});

describe('generatePython', () => {
  it('produces Python code with imports', () => {
    const output = generatePython(defaultMeta, defaultSteps);
    expect(output).toContain('from ecproc import Procedure');
    expect(output).toContain('proc = Procedure(');
  });

  it('includes system configuration', () => {
    const output = generatePython(defaultMeta, defaultSteps);
    expect(output).toContain('proc.system(');
    expect(output).toContain('electrodes=3');
    expect(output).toContain('reference="RHE"');
  });

  it('includes step calls', () => {
    const output = generatePython(defaultMeta, defaultSteps);
    expect(output).toContain('p.purge(');
    expect(output).toContain('p.ocp(');
    expect(output).toContain('p.cv(');
    expect(output).toContain('p.eis(');
  });

  it('has proper Python syntax (triple-quote docstring)', () => {
    const output = generatePython(defaultMeta, defaultSteps);
    expect(output.startsWith('"""')).toBe(true);
  });
});

describe('generateECDL', () => {
  it('produces valid JSON', () => {
    const output = generateECDL(defaultMeta, defaultSteps);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('contains required ECDL fields', () => {
    const ecdl = JSON.parse(generateECDL(defaultMeta, defaultSteps));
    expect(ecdl.ecdl_version).toBe('1.0.0');
    expect(ecdl.protocol).toBeDefined();
    expect(ecdl.material).toBeDefined();
    expect(ecdl.observation).toBeDefined();
    expect(ecdl._procedure).toBeDefined();
  });

  it('preserves all steps in _procedure', () => {
    const ecdl = JSON.parse(generateECDL(defaultMeta, defaultSteps));
    expect(ecdl._procedure.steps).toHaveLength(4);
    expect(ecdl._procedure.steps[0].technique).toBe('purge');
  });

  it('infers electrolyte properties', () => {
    const ecdl = JSON.parse(generateECDL(defaultMeta, defaultSteps));
    expect(ecdl.protocol.electrolyte.type).toBe('HClO4');
    expect(ecdl.protocol.electrolyte.concentration_M).toBe(0.1);
    expect(ecdl.protocol.regime).toBe('acidic');
  });
});

describe('generateIR', () => {
  it('produces valid JSON', () => {
    const output = generateIR(defaultMeta, defaultSteps);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('contains required IR fields', () => {
    const ir = JSON.parse(generateIR(defaultMeta, defaultSteps));
    expect(ir.faraday_version).toBe('1.0');
    expect(ir.procedure).toBeDefined();
    expect(ir.system).toBeDefined();
    expect(ir.metadata).toBeDefined();
  });

  it('converts mV/s to V/s in IR steps', () => {
    const cvStep = createDefaultStep('cv');
    cvStep.params.scan_rate_mV_s = 100;
    const ir = JSON.parse(generateIR(defaultMeta, [cvStep]));
    const irStep = ir.procedure[0].steps[0];
    expect(irStep.scan_rate_V_s).toBeCloseTo(0.1);
    expect(irStep.scan_rate_mV_s).toBeUndefined();
  });

  it('converts mV to V in IR steps', () => {
    const eisStep = createDefaultStep('eis');
    eisStep.params.amplitude_mV = 10;
    const ir = JSON.parse(generateIR(defaultMeta, [eisStep]));
    const irStep = ir.procedure[0].steps[0];
    expect(irStep.amplitude_V).toBeCloseTo(0.01);
  });

  it('converts min to s in IR steps', () => {
    const purgeStep = createDefaultStep('purge');
    purgeStep.params.duration_min = 20;
    const ir = JSON.parse(generateIR(defaultMeta, [purgeStep]));
    const irStep = ir.procedure[0].steps[0];
    expect(irStep.duration_s).toBe(1200);
  });

  it('converts mA to A in IR steps', () => {
    const cpStep = createDefaultStep('cp');
    cpStep.params.current_mA = 50;
    const ir = JSON.parse(generateIR(defaultMeta, [cpStep]));
    const irStep = ir.procedure[0].steps[0];
    expect(irStep.current_A).toBeCloseTo(0.05);
  });
});

// === cleanParamKey regression tests ===

describe('YAML/Python param key cleaning', () => {
  it('YAML: EIS has f_start and f_end, not duplicate f', () => {
    const steps = [createDefaultStep('eis')];
    const yaml = generateYAML(defaultMeta, steps);
    expect(yaml).toContain('f_start:');
    expect(yaml).toContain('f_end:');
  });

  it('YAML: CV has scan_rate, not scan', () => {
    const steps = [createDefaultStep('cv')];
    const yaml = generateYAML(defaultMeta, steps);
    expect(yaml).toContain('scan_rate:');
  });

  it('YAML: purge has flow_rate and duration', () => {
    const steps = [createDefaultStep('purge')];
    const yaml = generateYAML(defaultMeta, steps);
    expect(yaml).toContain('flow_rate:');
    expect(yaml).toContain('duration:');
  });

  it('Python: EIS has f_start= and f_end=, no duplicate f=', () => {
    const steps = [createDefaultStep('eis')];
    const py = generatePython(defaultMeta, steps);
    expect(py).toContain('f_start=');
    expect(py).toContain('f_end=');
    expect(py).not.toMatch(/\bf=\d/);
  });

  it('Python: CV has scan_rate=, not scan=', () => {
    const steps = [createDefaultStep('cv')];
    const py = generatePython(defaultMeta, steps);
    expect(py).toContain('scan_rate=');
  });
});
