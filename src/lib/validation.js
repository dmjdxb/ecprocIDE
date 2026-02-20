/**
 * Validation Rules for ecproc
 * 
 * Two categories:
 * - PV (Parameter Validation): Hard errors that will fail execution
 * - DR (Domain Rules): Warnings for best practices
 */

import { TECHNIQUES } from './techniques';

// Validation result levels
export const LEVEL = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

/**
 * Validate a single step
 * @param {Object} step - Step object with technique and params
 * @returns {Array} Array of validation issues
 */
export function validateStep(step) {
  const issues = [];
  const tech = TECHNIQUES[step.technique];
  
  if (!tech) {
    issues.push({
      level: LEVEL.ERROR,
      code: 'PV000',
      message: `Unknown technique: ${step.technique}`,
    });
    return issues;
  }

  // === CV Validation ===
  if (step.technique === 'cv') {
    const { vertex1_V, vertex2_V, scan_rate_mV_s, cycles } = step.params;
    
    // PV001: Scan rate upper limit
    if (scan_rate_mV_s > 10000) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV001',
        message: 'Scan rate exceeds instrument limit (10 V/s)',
        param: 'scan_rate_mV_s',
      });
    }
    
    // PV002: Scan rate lower limit
    if (scan_rate_mV_s > 0 && scan_rate_mV_s < 0.1) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV002',
        message: 'Scan rate too slow (<0.1 mV/s) — may cause drift artifacts',
        param: 'scan_rate_mV_s',
      });
    }
    
    // PV003: Positive cycles
    if (cycles < 1) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV003',
        message: 'At least 1 cycle required',
        param: 'cycles',
      });
    }
    
    // PV004: Distinct vertices
    if (vertex1_V !== null && vertex2_V !== null && parseFloat(vertex1_V) === parseFloat(vertex2_V)) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV004',
        message: 'Vertex potentials must differ',
        param: 'vertex1_V',
      });
    }
    
    // DR010: Step size vs scan rate
    // (scan_rate_mV_s / sample_rate) should give reasonable resolution
    
    // DR011: Minimum cycles for steady-state
    if (cycles >= 1 && cycles < 3) {
      issues.push({
        level: LEVEL.WARNING,
        code: 'DR011',
        message: 'Consider ≥3 cycles for reproducible steady-state response',
        param: 'cycles',
      });
    }
  }

  // === EIS Validation ===
  if (step.technique === 'eis') {
    const { f_start_Hz, f_end_Hz, amplitude_mV } = step.params;
    
    // PV005: Frequency order
    if (f_start_Hz !== null && f_end_Hz !== null && parseFloat(f_start_Hz) <= parseFloat(f_end_Hz)) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV005',
        message: 'Start frequency must be greater than end frequency',
        param: 'f_start_Hz',
      });
    }
    
    // PV006: Upper frequency limit
    if (f_start_Hz > 10000000) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV006',
        message: 'Start frequency exceeds 10 MHz (instrument limit)',
        param: 'f_start_Hz',
      });
    }
    
    // PV007: Lower frequency limit
    if (f_end_Hz < 0.000001) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV007',
        message: 'End frequency below 1 µHz (impractical)',
        param: 'f_end_Hz',
      });
    }
    
    // PV008: Positive amplitude
    if (amplitude_mV <= 0) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV008',
        message: 'Amplitude must be positive',
        param: 'amplitude_mV',
      });
    }
    
    // PV009: Amplitude upper limit
    if (amplitude_mV > 100) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV009',
        message: 'Amplitude exceeds 100 mV — will violate linearity assumption',
        param: 'amplitude_mV',
      });
    }
    
    // DR005: Linearity warning
    if (amplitude_mV > 10 && amplitude_mV <= 100) {
      issues.push({
        level: LEVEL.WARNING,
        code: 'DR005',
        message: 'Amplitude >10 mV may introduce nonlinear artifacts in impedance spectra',
        param: 'amplitude_mV',
      });
    }
  }

  // === OCP Validation ===
  if (step.technique === 'ocp') {
    const { duration_s } = step.params;
    
    // PV011: Positive duration
    if (duration_s <= 0) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV011',
        message: 'Duration must be positive',
        param: 'duration_s',
      });
    }
    
    // DR004: Minimum duration for stability
    if (duration_s > 0 && duration_s < 30) {
      issues.push({
        level: LEVEL.WARNING,
        code: 'DR004',
        message: 'OCP duration <30s may not allow electrode equilibration',
        param: 'duration_s',
      });
    }
  }

  // === CA/CP Validation ===
  if (step.technique === 'ca' || step.technique === 'cp') {
    const { duration_s, potential_V, current_mA } = step.params;
    
    // PV011: Positive duration
    if (duration_s <= 0) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV011',
        message: 'Duration must be positive',
        param: 'duration_s',
      });
    }
    
    // PV010: Potential limits
    if (step.technique === 'ca' && Math.abs(potential_V) > 10) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV010',
        message: 'Potential outside ±10 V range',
        param: 'potential_V',
      });
    }
    
    // DR001: Solvent window warning
    if (step.technique === 'ca' && Math.abs(potential_V) > 2.5) {
      issues.push({
        level: LEVEL.WARNING,
        code: 'DR001',
        message: 'High potential may exceed aqueous solvent stability window',
        param: 'potential_V',
      });
    }
    
    // DR009: Current density warning (need electrode area context)
    if (step.technique === 'cp' && Math.abs(current_mA) > 100) {
      issues.push({
        level: LEVEL.WARNING,
        code: 'DR009',
        message: 'High current — verify electrode area can support this current density',
        param: 'current_mA',
      });
    }
  }

  // === LSV Validation ===
  if (step.technique === 'lsv') {
    const { start_V, end_V, scan_rate_mV_s } = step.params;
    
    // PV001/PV002: Scan rate limits (same as CV)
    if (scan_rate_mV_s > 10000) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV001',
        message: 'Scan rate exceeds 10 V/s',
        param: 'scan_rate_mV_s',
      });
    }
    
    if (scan_rate_mV_s > 0 && scan_rate_mV_s < 0.1) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV002',
        message: 'Scan rate too slow (<0.1 mV/s)',
        param: 'scan_rate_mV_s',
      });
    }
    
    // PV010: Potential limits
    if (Math.abs(start_V) > 10 || Math.abs(end_V) > 10) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV010',
        message: 'Potential outside ±10 V range',
        param: Math.abs(start_V) > 10 ? 'start_V' : 'end_V',
      });
    }
  }

  // === Purge Validation ===
  if (step.technique === 'purge') {
    const { duration_min } = step.params;
    
    if (duration_min < 1) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV011',
        message: 'Purge duration must be at least 1 minute',
        param: 'duration_min',
      });
    }
    
    // DR007: Minimum purge time for saturation
    if (duration_min >= 1 && duration_min < 10) {
      issues.push({
        level: LEVEL.WARNING,
        code: 'DR007',
        message: 'Purge <10 min may not achieve full gas saturation',
        param: 'duration_min',
      });
    }
  }

  // === Generic Param Type Validation ===
  Object.entries(step.params).forEach(([key, value]) => {
    const paramDef = tech.params[key];
    if (!paramDef) return;
    
    // Check min/max if defined
    if (paramDef.min !== undefined && value < paramDef.min) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV000',
        message: `${paramDef.label} below minimum (${paramDef.min})`,
        param: key,
      });
    }
    if (paramDef.max !== undefined && value > paramDef.max) {
      issues.push({
        level: LEVEL.ERROR,
        code: 'PV000',
        message: `${paramDef.label} above maximum (${paramDef.max})`,
        param: key,
      });
    }
  });

  return issues;
}

/**
 * Validate procedure-level rules (sequence, context)
 * @param {Array} steps - Array of steps
 * @param {Object} metadata - Procedure metadata
 * @returns {Array} Array of validation issues
 */
export function validateProcedure(steps, _metadata) {
  const issues = [];
  
  // DR006: Conditioning before measurement
  const measurementTechs = ['lsv', 'cv', 'eis'];
  const conditioningTechs = ['cv', 'purge', 'ocp'];
  
  const firstMeasurementIndex = steps.findIndex(s => measurementTechs.includes(s.technique));
  const hasConditioningBefore = steps.slice(0, firstMeasurementIndex).some(s => conditioningTechs.includes(s.technique));
  
  if (firstMeasurementIndex > 0 && !hasConditioningBefore) {
    issues.push({
      level: LEVEL.WARNING,
      code: 'DR006',
      message: 'Consider adding conditioning (OCP, CV, or purge) before first measurement',
      stepIndex: firstMeasurementIndex,
    });
  }
  
  // DR007: Gas purge before ORR/HER (check if LSV goes to low potentials)
  const hasLSV = steps.some(s => s.technique === 'lsv');
  const hasPurge = steps.some(s => s.technique === 'purge');
  
  if (hasLSV && !hasPurge) {
    issues.push({
      level: LEVEL.WARNING,
      code: 'DR007',
      message: 'Consider adding gas purge before LSV for defined atmosphere (O₂ for ORR, N₂ for background)',
    });
  }
  
  // DR008: iR compensation without EIS
  const hasIrComp = steps.some(s => s.params.ir_compensation === true);
  const hasEIS = steps.some(s => s.technique === 'eis');
  
  if (hasIrComp && !hasEIS) {
    issues.push({
      level: LEVEL.WARNING,
      code: 'DR008',
      message: 'iR compensation enabled but no EIS measurement to determine Ru',
    });
  }
  
  // PV012/PV013: Loop count limits (if loops are added)
  // (Would need loop structure in steps)
  
  return issues;
}

/**
 * Get summary of all issues
 * @param {Array} issues - Array of validation issues
 * @returns {Object} { errors, warnings, infos }
 */
export function summarizeIssues(issues) {
  return {
    errors: issues.filter(i => i.level === LEVEL.ERROR),
    warnings: issues.filter(i => i.level === LEVEL.WARNING),
    infos: issues.filter(i => i.level === LEVEL.INFO),
  };
}

/**
 * Check if procedure is valid (no errors)
 * @param {Array} steps - Array of steps
 * @param {Object} metadata - Procedure metadata
 * @returns {boolean}
 */
export function isValid(steps, metadata) {
  const stepIssues = steps.flatMap(validateStep);
  const procIssues = validateProcedure(steps, metadata);
  const allIssues = [...stepIssues, ...procIssues];
  return !allIssues.some(i => i.level === LEVEL.ERROR);
}
