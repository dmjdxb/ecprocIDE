/**
 * Electrochemical Techniques Library
 * Complete definitions for all ecproc-supported techniques
 */

export const TECHNIQUES = {
  // === Potential Measurements ===
  ocp: {
    id: 'ocp',
    name: 'Open Circuit Potential',
    abbrev: 'OCP',
    category: 'measurement',
    description: 'Measures the resting electrode potential when no current flows. Used to establish equilibrium baseline.',
    mlDescription: 'Records voltage at zero current over time. Output: potential vs time series.',
    params: {
      duration_s: { 
        label: 'Duration', 
        type: 'number',
        default: 60, 
        unit: 's', 
        min: 1,
        max: 86400,
        help: 'Measurement duration. Typical: 30-300s for equilibration.' 
      },
      stability_mV_min: { 
        label: 'Stability criterion', 
        type: 'number',
        default: 1, 
        unit: 'mV/min', 
        min: 0.1,
        max: 100,
        help: 'Stop early when potential drift drops below this rate.' 
      },
      sample_rate_Hz: {
        label: 'Sample rate',
        type: 'number',
        default: 1,
        unit: 'Hz',
        min: 0.1,
        max: 1000,
        help: 'Data acquisition frequency.'
      },
    }
  },

  // === Voltammetric Techniques ===
  cv: {
    id: 'cv',
    name: 'Cyclic Voltammetry',
    abbrev: 'CV',
    category: 'voltammetry',
    description: 'Sweeps potential in a triangle waveform between two vertices. The workhorse technique for probing redox reactions and surface processes.',
    mlDescription: 'Input: potential range, scan rate, cycles. Output: current vs potential curves (voltammograms).',
    params: {
      vertex1_V: { 
        label: 'Lower vertex', 
        type: 'number',
        default: 0.05, 
        unit: 'V vs RHE', 
        min: -3,
        max: 3,
        help: 'Lower potential limit (typically cathodic).' 
      },
      vertex2_V: { 
        label: 'Upper vertex', 
        type: 'number',
        default: 1.2, 
        unit: 'V vs RHE', 
        min: -3,
        max: 3,
        help: 'Upper potential limit (typically anodic).' 
      },
      scan_rate_mV_s: { 
        label: 'Scan rate', 
        type: 'number',
        default: 50, 
        unit: 'mV/s', 
        min: 0.1,
        max: 10000,
        help: 'Speed of potential sweep. Typical: 10-100 mV/s. Faster = less resolution but quicker.' 
      },
      cycles: { 
        label: 'Cycles', 
        type: 'integer',
        default: 3, 
        unit: '', 
        min: 1,
        max: 1000000,
        help: 'Number of complete sweeps. Use ≥3 for reproducible steady-state.' 
      },
      start_potential_V: {
        label: 'Start potential',
        type: 'number',
        default: null,
        unit: 'V vs RHE',
        min: -3,
        max: 3,
        help: 'Initial potential. If null, starts at OCP.'
      },
      ir_compensation: {
        label: 'iR compensation',
        type: 'boolean',
        default: false,
        help: 'Correct for solution resistance. Requires prior EIS measurement.'
      },
    }
  },

  lsv: {
    id: 'lsv',
    name: 'Linear Sweep Voltammetry',
    abbrev: 'LSV',
    category: 'voltammetry',
    description: 'One-directional potential sweep. Used for measuring catalytic activity (ORR, OER, HER polarization curves).',
    mlDescription: 'Input: start/end potentials, scan rate. Output: current vs potential curve.',
    params: {
      start_V: { 
        label: 'Start potential', 
        type: 'number',
        default: 1.0, 
        unit: 'V vs RHE',
        min: -3,
        max: 3, 
        help: 'Initial potential.' 
      },
      end_V: { 
        label: 'End potential', 
        type: 'number',
        default: 0.2, 
        unit: 'V vs RHE',
        min: -3,
        max: 3, 
        help: 'Final potential.' 
      },
      scan_rate_mV_s: { 
        label: 'Scan rate', 
        type: 'number',
        default: 5, 
        unit: 'mV/s',
        min: 0.1,
        max: 10000, 
        help: 'Slower rates (1-10 mV/s) give more accurate kinetics but take longer.' 
      },
      ir_compensation: {
        label: 'iR compensation',
        type: 'boolean',
        default: false,
        help: 'Correct for solution resistance.'
      },
    }
  },

  dpv: {
    id: 'dpv',
    name: 'Differential Pulse Voltammetry',
    abbrev: 'DPV',
    category: 'voltammetry',
    description: 'Applies small voltage pulses superimposed on a linear ramp. Higher sensitivity than CV for detecting trace analytes.',
    mlDescription: 'Input: potential range, pulse parameters. Output: differential current vs potential.',
    params: {
      start_V: { label: 'Start potential', type: 'number', default: 0.0, unit: 'V', min: -3, max: 3, help: 'Initial potential.' },
      end_V: { label: 'End potential', type: 'number', default: 1.0, unit: 'V', min: -3, max: 3, help: 'Final potential.' },
      pulse_height_mV: { label: 'Pulse height', type: 'number', default: 50, unit: 'mV', min: 1, max: 250, help: 'Amplitude of voltage pulse.' },
      pulse_width_ms: { label: 'Pulse width', type: 'number', default: 50, unit: 'ms', min: 1, max: 1000, help: 'Duration of each pulse.' },
      step_height_mV: { label: 'Step height', type: 'number', default: 5, unit: 'mV', min: 0.1, max: 50, help: 'Potential increment between pulses.' },
      sample_period_ms: { label: 'Sample period', type: 'number', default: 20, unit: 'ms', min: 1, max: 500, help: 'When to sample current during pulse.' },
    }
  },

  swv: {
    id: 'swv',
    name: 'Square Wave Voltammetry',
    abbrev: 'SWV',
    category: 'voltammetry',
    description: 'Applies square wave pulses on a staircase ramp. Even higher sensitivity and faster than DPV.',
    mlDescription: 'Input: potential range, frequency, amplitude. Output: net current vs potential.',
    params: {
      start_V: { label: 'Start potential', type: 'number', default: 0.0, unit: 'V', min: -3, max: 3, help: 'Initial potential.' },
      end_V: { label: 'End potential', type: 'number', default: 1.0, unit: 'V', min: -3, max: 3, help: 'Final potential.' },
      frequency_Hz: { label: 'Frequency', type: 'number', default: 25, unit: 'Hz', min: 1, max: 500, help: 'Square wave frequency.' },
      amplitude_mV: { label: 'Amplitude', type: 'number', default: 25, unit: 'mV', min: 1, max: 250, help: 'Square wave amplitude.' },
      step_height_mV: { label: 'Step height', type: 'number', default: 5, unit: 'mV', min: 0.1, max: 50, help: 'Staircase step size.' },
    }
  },

  stripping: {
    id: 'stripping',
    name: 'Stripping Voltammetry',
    abbrev: 'ASV/CSV',
    category: 'voltammetry',
    description: 'Two-step technique: first deposit analyte at fixed potential, then strip via potential scan. Ultra-sensitive for trace metals.',
    mlDescription: 'Input: deposition potential/time, stripping scan params. Output: stripping peak current (analyte concentration).',
    params: {
      deposition_V: { label: 'Deposition potential', type: 'number', default: -0.8, unit: 'V', min: -3, max: 3, help: 'Potential to electrodeposit analyte.' },
      deposition_time_s: { label: 'Deposition time', type: 'number', default: 120, unit: 's', min: 1, max: 3600, help: 'How long to accumulate analyte.' },
      equilibration_s: { label: 'Equilibration', type: 'number', default: 10, unit: 's', min: 0, max: 120, help: 'Rest time after deposition.' },
      strip_start_V: { label: 'Strip start', type: 'number', default: -0.8, unit: 'V', min: -3, max: 3, help: 'Starting potential for stripping scan.' },
      strip_end_V: { label: 'Strip end', type: 'number', default: 0.3, unit: 'V', min: -3, max: 3, help: 'Ending potential for stripping scan.' },
      scan_rate_mV_s: { label: 'Scan rate', type: 'number', default: 50, unit: 'mV/s', min: 1, max: 1000, help: 'Stripping scan rate.' },
    }
  },

  // === Impedance ===
  eis: {
    id: 'eis',
    name: 'Electrochemical Impedance Spectroscopy',
    abbrev: 'EIS',
    category: 'impedance',
    description: 'Measures AC response across frequency range. Reveals solution resistance (Ru), charge transfer resistance, and double-layer capacitance.',
    mlDescription: 'Input: frequency range, AC amplitude. Output: Nyquist/Bode plots (impedance vs frequency).',
    params: {
      f_start_Hz: { 
        label: 'Start frequency', 
        type: 'number',
        default: 100000, 
        unit: 'Hz',
        min: 0.000001,
        max: 10000000, 
        help: 'High frequency limit. Typical: 100 kHz.' 
      },
      f_end_Hz: { 
        label: 'End frequency', 
        type: 'number',
        default: 0.1, 
        unit: 'Hz',
        min: 0.000001,
        max: 10000000, 
        help: 'Low frequency limit. Typical: 0.1-1 Hz. Lower = longer measurement.' 
      },
      amplitude_mV: { 
        label: 'AC amplitude', 
        type: 'number',
        default: 10, 
        unit: 'mV',
        min: 1,
        max: 100, 
        help: 'Perturbation size. Keep ≤10 mV for linear response.' 
      },
      dc_potential_V: { 
        label: 'DC potential', 
        type: 'string',
        default: 'OCP', 
        unit: 'V or OCP', 
        help: 'Bias potential during measurement. Use "OCP" for open circuit.' 
      },
      points_per_decade: {
        label: 'Points/decade',
        type: 'integer',
        default: 10,
        unit: '',
        min: 1,
        max: 50,
        help: 'Number of frequency points per decade. More = smoother spectra but slower.'
      },
    }
  },

  // === Chronoamperometry/Chronopotentiometry ===
  ca: {
    id: 'ca',
    name: 'Chronoamperometry',
    abbrev: 'CA',
    category: 'chronomethod',
    description: 'Holds potential constant while measuring current vs time. Used for durability testing and diffusion coefficient measurement.',
    mlDescription: 'Input: fixed potential, duration. Output: current vs time curve.',
    params: {
      potential_V: { 
        label: 'Applied potential', 
        type: 'number',
        default: 1.5, 
        unit: 'V vs RHE',
        min: -3,
        max: 3, 
        help: 'Fixed potential to apply.' 
      },
      duration_s: { 
        label: 'Duration', 
        type: 'number',
        default: 3600, 
        unit: 's',
        min: 1,
        max: 604800, 
        help: 'Measurement time. Can be hours/days for durability testing.' 
      },
      sample_rate_Hz: {
        label: 'Sample rate',
        type: 'number',
        default: 1,
        unit: 'Hz',
        min: 0.001,
        max: 1000,
        help: 'Data acquisition frequency.'
      },
    }
  },

  cp: {
    id: 'cp',
    name: 'Chronopotentiometry',
    abbrev: 'CP',
    category: 'chronomethod',
    description: 'Holds current constant while measuring potential vs time. Galvanostatic mode. Used for battery cycling and electrolysis.',
    mlDescription: 'Input: fixed current, duration. Output: potential vs time curve.',
    params: {
      current_mA: { 
        label: 'Applied current', 
        type: 'number',
        default: 10, 
        unit: 'mA',
        min: -1000,
        max: 1000, 
        help: 'Fixed current to apply. Positive = anodic, negative = cathodic.' 
      },
      duration_s: { 
        label: 'Duration', 
        type: 'number',
        default: 3600, 
        unit: 's',
        min: 1,
        max: 604800, 
        help: 'Measurement time.' 
      },
      voltage_limits_V: {
        label: 'Voltage limits',
        type: 'string',
        default: '-0.5 to 2.0',
        unit: 'V',
        help: 'Safety cutoff potentials (min to max).'
      },
    }
  },

  gcd: {
    id: 'gcd',
    name: 'Galvanostatic Charge-Discharge',
    abbrev: 'GCD',
    category: 'chronomethod',
    description: 'Charges and discharges at constant current between voltage limits. Standard for battery/supercapacitor characterization.',
    mlDescription: 'Input: current, voltage limits, cycles. Output: charge/discharge curves, capacity.',
    params: {
      current_mA: { label: 'Current', type: 'number', default: 10, unit: 'mA', min: 0.001, max: 1000, help: 'Charge/discharge current.' },
      upper_V: { label: 'Upper voltage', type: 'number', default: 1.0, unit: 'V', min: -3, max: 5, help: 'Charged state voltage limit.' },
      lower_V: { label: 'Lower voltage', type: 'number', default: 0.0, unit: 'V', min: -3, max: 5, help: 'Discharged state voltage limit.' },
      cycles: { label: 'Cycles', type: 'integer', default: 5, unit: '', min: 1, max: 10000, help: 'Number of charge-discharge cycles.' },
    }
  },

  cc: {
    id: 'cc',
    name: 'Coulometry / Charge Counting',
    abbrev: 'CC',
    category: 'chronomethod',
    description: 'Integrates current over time to measure total charge passed. Used for determining reaction stoichiometry.',
    mlDescription: 'Input: potential or current hold, duration. Output: cumulative charge (Coulombs).',
    params: {
      mode: { label: 'Control mode', type: 'select', default: 'potentiostatic', options: ['potentiostatic', 'galvanostatic'], help: 'Fixed potential or fixed current.' },
      setpoint: { label: 'Setpoint', type: 'number', default: 1.0, unit: 'V or mA', min: -10, max: 10, help: 'Fixed potential (V) or current (mA) depending on mode.' },
      duration_s: { label: 'Duration', type: 'number', default: 600, unit: 's', min: 1, max: 86400, help: 'Integration time.' },
      cutoff_C: { label: 'Charge cutoff', type: 'number', default: null, unit: 'C', min: 0, max: 10000, help: 'Stop when this charge is reached (optional).' },
    }
  },

  // === Auxiliary ===
  purge: {
    id: 'purge',
    name: 'Gas Purge',
    abbrev: 'Purge',
    category: 'auxiliary',
    description: 'Saturates electrolyte with specified gas. Required before ORR (O₂), HER (N₂/Ar), or CO₂RR (CO₂) measurements.',
    mlDescription: 'Preparation step. No electrochemical output. Ensures defined gas atmosphere.',
    params: {
      gas: { 
        label: 'Gas', 
        type: 'select',
        default: 'N2', 
        options: ['N2', 'O2', 'Ar', 'H2', 'CO2', 'air'],
        help: 'Gas to bubble through electrolyte.' 
      },
      duration_min: { 
        label: 'Duration', 
        type: 'number',
        default: 20, 
        unit: 'min',
        min: 1,
        max: 120, 
        help: 'Time to reach saturation. Typical: 15-30 min for aqueous solutions.' 
      },
      flow_rate_mL_min: {
        label: 'Flow rate',
        type: 'number',
        default: 50,
        unit: 'mL/min',
        min: 1,
        max: 500,
        help: 'Gas flow rate through frit.'
      },
    }
  },
};

// Technique categories for grouping in UI
export const TECHNIQUE_CATEGORIES = {
  measurement: { label: 'Potential Measurement', techniques: ['ocp'] },
  voltammetry: { label: 'Voltammetry', techniques: ['cv', 'lsv', 'dpv', 'swv', 'stripping'] },
  impedance: { label: 'Impedance', techniques: ['eis'] },
  chronomethod: { label: 'Chronomethods', techniques: ['ca', 'cp', 'gcd', 'cc'] },
  auxiliary: { label: 'Auxiliary', techniques: ['purge'] },
};

// Create a default step for a technique
export function createDefaultStep(techniqueId) {
  const tech = TECHNIQUES[techniqueId];
  if (!tech) throw new Error(`Unknown technique: ${techniqueId}`);
  
  const params = {};
  Object.entries(tech.params).forEach(([key, config]) => {
    params[key] = config.default;
  });
  
  return {
    id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    technique: techniqueId,
    params,
    tag: '',
  };
}
