import React, { useState, useRef } from 'react';
import {
  Download, Upload, Plus, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle, HelpCircle, Copy, Check,
  FileText, Code, Database, FileJson, Menu, X
} from 'lucide-react';

import { TECHNIQUES, TECHNIQUE_CATEGORIES, createDefaultStep } from './lib/techniques';
import { validateStep, validateProcedure, LEVEL, summarizeIssues } from './lib/validation';
import { generateYAML, generatePython, generateECDL, generateIR } from './lib/generators';
import { useLocalStorage } from './hooks/useLocalStorage';
import yaml from 'js-yaml';

// === Utility Components ===

const Badge = ({ level, children }) => {
  const colors = {
    error: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${colors[level]}`}>
      {children}
    </span>
  );
};

// === Parameter Input ===

const ParamInput = ({ paramKey, config, value, onChange, issue }) => {
  const [showHelp, setShowHelp] = useState(false);
  const hasIssue = issue !== undefined;
  
  const renderInput = () => {
    if (config.type === 'select') {
      return (
        <select
          value={value ?? config.default ?? ''}
          onChange={(e) => onChange(paramKey, e.target.value)}
          className={`w-full bg-slate-700 border rounded px-2 py-1.5 text-sm text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/50 ${
            hasIssue ? 'border-rose-500' : 'border-slate-600'
          }`}
        >
          {config.options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    
    if (config.type === 'boolean') {
      return (
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={value ?? config.default ?? false}
            onChange={(e) => onChange(paramKey, e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500/50"
          />
          <span className="ml-2 text-sm text-slate-300">{config.label}</span>
        </label>
      );
    }
    
    return (
      <input
        type={config.type === 'integer' ? 'number' : 'text'}
        step={config.type === 'integer' ? 1 : 'any'}
        value={value ?? ''}
        onChange={(e) => onChange(paramKey, e.target.value === '' ? null : 
          config.type === 'number' || config.type === 'integer' ? parseFloat(e.target.value) : e.target.value
        )}
        placeholder={config.default !== null ? String(config.default) : ''}
        className={`w-full bg-slate-700 border rounded px-2 py-1.5 text-sm text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/50 ${
          hasIssue ? 'border-rose-500' : 'border-slate-600'
        }`}
      />
    );
  };
  
  if (config.type === 'boolean') {
    return <div className="col-span-2">{renderInput()}</div>;
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-slate-400">
          {config.label}
          {config.unit && <span className="ml-1 text-slate-500">({config.unit})</span>}
        </label>
        <button 
          type="button"
          className="text-slate-500 hover:text-slate-300"
          onMouseEnter={() => setShowHelp(true)}
          onMouseLeave={() => setShowHelp(false)}
        >
          <HelpCircle className="w-3 h-3" />
        </button>
      </div>
      <div className="relative">
        {renderInput()}
        {showHelp && (
          <div className="absolute z-10 left-0 right-0 mt-1 p-2 bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 shadow-lg">
            {config.help}
          </div>
        )}
      </div>
      {hasIssue && (
        <p className="mt-1 text-xs text-rose-400">{issue.message}</p>
      )}
    </div>
  );
};

// === Step Editor ===

const StepEditor = ({ step, index, total, onUpdate, onRemove, onMove }) => {
  const [expanded, setExpanded] = useState(true);
  const tech = TECHNIQUES[step.technique];
  const issues = validateStep(step);
  const { errors, warnings } = summarizeIssues(issues);
  
  const getIssueForParam = (paramKey) => 
    issues.find(i => i.param === paramKey);

  return (
    <div className={`bg-slate-800 border rounded-lg overflow-hidden ${
      errors.length > 0 ? 'border-rose-500/50' : 
      warnings.length > 0 ? 'border-amber-500/30' : 'border-slate-700'
    }`}>
      {/* Header */}
      <div 
        className="flex items-center px-3 py-2 bg-slate-800/50 cursor-pointer hover:bg-slate-700/50"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-xs font-mono text-slate-500 w-8">{String(index + 1).padStart(2, '0')}</span>
        <div className="flex-1 min-w-0">
          <span className="font-medium text-slate-100">{tech.abbrev}</span>
          <span className="ml-2 text-sm text-slate-400 truncate">{tech.name}</span>
        </div>
        {step.tag && (
          <span className="mx-2 px-2 py-0.5 text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
            {step.tag}
          </span>
        )}
        <div className="flex items-center gap-2 ml-2">
          {errors.length > 0 && <Badge level="error">{errors.length}</Badge>}
          {warnings.length > 0 && <Badge level="warning">{warnings.length}</Badge>}
          {errors.length === 0 && warnings.length === 0 && (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>
      
      {expanded && (
        <>
          {/* Description */}
          <div className="px-3 py-2 border-t border-slate-700 bg-slate-900/30">
            <p className="text-xs text-slate-400">{tech.description}</p>
            <p className="text-xs text-slate-500 mt-1 italic">ML: {tech.mlDescription}</p>
          </div>
          
          {/* Parameters */}
          <div className="p-3 border-t border-slate-700 grid grid-cols-2 gap-3">
            {Object.entries(tech.params).map(([key, config]) => (
              <ParamInput
                key={key}
                paramKey={key}
                config={config}
                value={step.params[key]}
                onChange={(k, v) => onUpdate({ ...step, params: { ...step.params, [k]: v } })}
                issue={getIssueForParam(key)}
              />
            ))}
            
            {/* Tag input */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Tag
                <span className="ml-1 text-slate-500">(for ECDL output)</span>
              </label>
              <input
                type="text"
                value={step.tag || ''}
                onChange={(e) => onUpdate({ ...step, tag: e.target.value })}
                placeholder="e.g., baseline_activity"
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
          </div>
          
          {/* Validation issues */}
          {issues.length > 0 && (
            <div className="px-3 pb-3 space-y-1">
              {issues.map((issue, i) => (
                <div 
                  key={i} 
                  className={`flex items-start gap-2 text-xs px-2 py-1.5 rounded ${
                    issue.level === LEVEL.ERROR ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span><span className="font-mono">[{issue.code}]</span> {issue.message}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-700 bg-slate-900/30">
            <div className="flex gap-1">
              <button
                onClick={() => onMove(-1)}
                disabled={index === 0}
                className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ↑ Up
              </button>
              <button
                onClick={() => onMove(1)}
                disabled={index === total - 1}
                className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ↓ Down
              </button>
            </div>
            <button
              onClick={onRemove}
              className="px-2 py-1 text-xs text-rose-400 hover:text-rose-300"
            >
              Remove
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// === Add Step Menu ===

const AddStepMenu = ({ onAdd, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h3 className="font-medium text-slate-100">Add Technique</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 max-h-96 overflow-auto">
          {Object.entries(TECHNIQUE_CATEGORIES).map(([catId, cat]) => (
            <div key={catId} className="mb-4 last:mb-0">
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                {cat.label}
              </h4>
              <div className="space-y-1">
                {cat.techniques.map(techId => {
                  const tech = TECHNIQUES[techId];
                  return (
                    <button
                      key={techId}
                      onClick={() => { onAdd(techId); onClose(); }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-100">{tech.abbrev}</span>
                        <span className="text-xs text-slate-500">{tech.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{tech.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// === Code Output Panel ===

const CodeOutput = ({ format, metadata, steps }) => {
  const [copied, setCopied] = useState(false);
  
  const code = {
    yaml: () => generateYAML(metadata, steps),
    python: () => generatePython(metadata, steps),
    ecdl: () => generateECDL(metadata, steps),
    ir: () => generateIR(metadata, steps),
  }[format]();
  
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const downloadFile = () => {
    const extensions = { yaml: 'ecproc', python: 'py', ecdl: 'ecdl.json', ir: 'ir.json' };
    const mimeTypes = { yaml: 'text/yaml', python: 'text/x-python', ecdl: 'application/json', ir: 'application/json' };
    
    const blob = new Blob([code], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.name.toLowerCase().replace(/\s+/g, '_')}.${extensions[format]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-end gap-2 px-3 py-2 border-b border-slate-700">
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={downloadFile}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 rounded"
        >
          <Download className="w-3 h-3" />
          Download
        </button>
      </div>
      <pre className="flex-1 p-4 overflow-auto text-sm font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
};

// === Main App ===

export default function App() {
  // State (persisted to localStorage)
  const [metadata, setMetadata, steps, setSteps] = useLocalStorage(
    {
      name: 'ORR Catalyst Characterization',
      author: '',
      description: '',
      electrodes: 3,
      reference: 'RHE',
      electrolyte: '0.1 M HClO4',
      temperature: 25,
      working_electrode: '',
      counter_electrode: '',
    },
    [
      createDefaultStep('purge'),
      createDefaultStep('ocp'),
      createDefaultStep('cv'),
      createDefaultStep('eis'),
    ]
  );
  
  const [activeFormat, setActiveFormat] = useState('yaml');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const fileInputRef = useRef(null);

  // Handlers
  const addStep = (techniqueId) => {
    setSteps([...steps, createDefaultStep(techniqueId)]);
  };

  const updateStep = (index, newStep) => {
    const newSteps = [...steps];
    newSteps[index] = newStep;
    setSteps(newSteps);
  };

  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const moveStep = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= steps.length) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setSteps(newSteps);
  };

  // Validation summary
  const allStepIssues = steps.flatMap(validateStep);
  const procIssues = validateProcedure(steps, metadata);
  const allIssues = [...allStepIssues, ...procIssues];
  const { errors, warnings } = summarizeIssues(allIssues);

  // File handlers
  const reconstructSteps = (rawSteps) => {
    return rawSteps.map((raw) => {
      const techId = raw.technique;
      const tech = TECHNIQUES[techId];
      if (!tech) return null;
      const step = createDefaultStep(techId);
      // Map cleaned param keys back to full keys with unit suffixes
      const paramKeyMap = {};
      Object.keys(tech.params).forEach((fullKey) => {
        const cleanKey = fullKey.replace(/_[A-Za-z_]+$/, '');
        paramKeyMap[cleanKey] = fullKey;
        paramKeyMap[fullKey] = fullKey;
      });
      const params = raw.params || raw;
      Object.entries(params).forEach(([key, value]) => {
        const fullKey = paramKeyMap[key] || key;
        if (fullKey in tech.params && value !== null && value !== undefined) {
          step.params[fullKey] = value;
        }
      });
      if (raw.tag) step.tag = raw.tag;
      return step;
    }).filter(Boolean);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        const name = file.name.toLowerCase();

        if (name.endsWith('.ecproc') || name.endsWith('.yaml') || name.endsWith('.yml')) {
          const data = yaml.load(content);
          if (data && typeof data === 'object') {
            if (data.metadata || data.system) {
              setMetadata((prev) => ({
                ...prev,
                name: data.metadata?.protocol || prev.name,
                author: data.metadata?.author || prev.author,
                description: data.metadata?.description || prev.description,
                electrodes: data.system?.electrodes ?? prev.electrodes,
                reference: data.system?.reference || prev.reference,
                electrolyte: data.system?.electrolyte || prev.electrolyte,
                temperature: data.system?.temperature ?? prev.temperature,
                working_electrode: data.system?.working_electrode || prev.working_electrode,
                counter_electrode: data.system?.counter_electrode || prev.counter_electrode,
              }));
            }
            // Extract steps from procedure
            const procSteps = data.procedure?.[0]?.steps;
            if (Array.isArray(procSteps)) {
              const imported = procSteps.map((entry) => {
                const techId = Object.keys(entry).find((k) => k !== 'tag' && TECHNIQUES[k]);
                if (!techId) return null;
                const step = createDefaultStep(techId);
                const paramKeyMap = {};
                Object.keys(TECHNIQUES[techId].params).forEach((fullKey) => {
                  const cleanKey = fullKey.replace(/_[A-Za-z_]+$/, '');
                  paramKeyMap[cleanKey] = fullKey;
                  paramKeyMap[fullKey] = fullKey;
                });
                const rawParams = entry[techId] || {};
                Object.entries(rawParams).forEach(([key, value]) => {
                  if (key === 'tag') { step.tag = String(value); return; }
                  const parsed = typeof value === 'string' ? parseFloat(value) : value;
                  const fullKey = paramKeyMap[key] || key;
                  if (fullKey in TECHNIQUES[techId].params) {
                    step.params[fullKey] = isNaN(parsed) ? value : parsed;
                  }
                });
                if (entry.tag) step.tag = String(entry.tag);
                return step;
              }).filter(Boolean);
              if (imported.length > 0) setSteps(imported);
            }
          }
        } else if (name.endsWith('.json')) {
          const data = JSON.parse(content);
          if (data._procedure) {
            const proc = data._procedure;
            setMetadata((prev) => ({
              ...prev,
              name: proc.name || prev.name,
              electrodes: proc.system?.electrodes ?? prev.electrodes,
              reference: proc.system?.reference || prev.reference,
              electrolyte: proc.system?.electrolyte || prev.electrolyte,
              temperature: proc.system?.temperature_C ?? proc.system?.temperature ?? prev.temperature,
              working_electrode: proc.system?.working_electrode || prev.working_electrode,
              counter_electrode: proc.system?.counter_electrode || prev.counter_electrode,
            }));
            if (Array.isArray(proc.steps)) {
              const imported = reconstructSteps(proc.steps);
              if (imported.length > 0) setSteps(imported);
            }
          }
        }
      } catch (err) {
        console.error('Import failed:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="shrink-0 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="font-semibold tracking-tight">ecproc</span>
              <span className="text-slate-500 font-normal text-sm">IDE</span>
            </div>
            <span className="hidden sm:inline text-sm text-slate-500">|</span>
            <span className="hidden sm:inline text-sm text-slate-400">The Open Faraday Language for Electrochemistry</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Validation status */}
            <div className="hidden sm:flex items-center gap-2 mr-2">
              {errors.length > 0 ? (
                <Badge level="error">{errors.length} error{errors.length > 1 ? 's' : ''}</Badge>
              ) : warnings.length > 0 ? (
                <Badge level="warning">{warnings.length} warning{warnings.length > 1 ? 's' : ''}</Badge>
              ) : (
                <Badge level="success">Valid</Badge>
              )}
            </div>
            
            {/* File actions */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".ecproc,.yaml,.yml,.json"
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-300 hover:text-slate-100 border border-slate-600 rounded hover:bg-slate-700"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            
            {/* Mobile menu toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 text-slate-400 hover:text-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Editor */}
        <div className={`${showMobileMenu ? 'hidden' : 'flex'} sm:flex w-full sm:w-1/2 flex-col border-r border-slate-700`}>
          {/* Metadata */}
          <div className="shrink-0 p-4 border-b border-slate-700 overflow-auto max-h-64">
            <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
              Experiment Setup
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-slate-400 block mb-1">Procedure Name</label>
                <input
                  type="text"
                  value={metadata.name}
                  onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Electrolyte</label>
                <input
                  type="text"
                  value={metadata.electrolyte}
                  onChange={(e) => setMetadata({ ...metadata, electrolyte: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  placeholder="e.g., 0.1 M HClO4"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  value={metadata.temperature}
                  onChange={(e) => setMetadata({ ...metadata, temperature: parseFloat(e.target.value) || 25 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Reference Electrode</label>
                <select
                  value={metadata.reference}
                  onChange={(e) => setMetadata({ ...metadata, reference: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                >
                  <option value="RHE">RHE</option>
                  <option value="Ag/AgCl">Ag/AgCl</option>
                  <option value="SCE">SCE</option>
                  <option value="Hg/HgO">Hg/HgO</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Electrodes</label>
                <select
                  value={metadata.electrodes}
                  onChange={(e) => setMetadata({ ...metadata, electrodes: parseInt(e.target.value) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                >
                  <option value={3}>3-electrode</option>
                  <option value={2}>2-electrode</option>
                </select>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="flex-1 overflow-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Steps ({steps.length})
              </h2>
              <button
                onClick={() => setShowAddMenu(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-500/20"
              >
                <Plus className="w-3 h-3" />
                Add Step
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step, i) => (
                <StepEditor
                  key={step.id}
                  step={step}
                  index={i}
                  total={steps.length}
                  onUpdate={(s) => updateStep(i, s)}
                  onRemove={() => removeStep(i)}
                  onMove={(dir) => moveStep(i, dir)}
                />
              ))}
            </div>

            {steps.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p>No steps added yet</p>
                <button
                  onClick={() => setShowAddMenu(true)}
                  className="mt-2 text-cyan-400 hover:underline"
                >
                  Add your first step
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Output */}
        <div className={`${showMobileMenu ? 'flex' : 'hidden'} sm:flex w-full sm:w-1/2 flex-col`}>
          {/* Format tabs */}
          <div className="shrink-0 flex border-b border-slate-700">
            {[
              { id: 'yaml', label: '.ecproc', icon: FileText, desc: 'Human-readable' },
              { id: 'python', label: 'Python', icon: Code, desc: 'SDK code' },
              { id: 'ecdl', label: 'ECDL', icon: Database, desc: 'ML-ready' },
              { id: 'ir', label: 'IR', icon: FileJson, desc: 'Intermediate' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFormat(tab.id)}
                className={`flex-1 sm:flex-none px-4 py-3 text-sm border-b-2 transition-colors ${
                  activeFormat === tab.id
                    ? 'border-cyan-400 text-slate-100'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-4 h-4 inline mr-1" />
                <span className="font-medium">{tab.label}</span>
                <span className="hidden lg:inline ml-1 text-slate-500 text-xs">{tab.desc}</span>
              </button>
            ))}
          </div>

          {/* Code output */}
          <CodeOutput format={activeFormat} metadata={metadata} steps={steps} />

          {/* Help footer */}
          <div className="shrink-0 px-4 py-3 border-t border-slate-700 bg-slate-800/50">
            <p className="text-xs text-slate-500">
              {activeFormat === 'yaml' && (
                <>Validate with <code className="text-cyan-400">ecproc validate file.ecproc</code> • Execute with <code className="text-cyan-400">ecproc run file.ecproc</code></>
              )}
              {activeFormat === 'python' && (
                <>Run as Python script • Extend with custom logic • Full SDK documentation at docs.ecproc.io</>
              )}
              {activeFormat === 'ecdl' && (
                <>ML-ready JSON schema • Fill <code className="text-cyan-400">material</code> and <code className="text-cyan-400">observation</code> after experiment • Used for durability prediction</>
              )}
              {activeFormat === 'ir' && (
                <>Faraday Intermediate Representation • SI units • Machine-parseable • Internal format for compilation</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Add step modal */}
      {showAddMenu && (
        <AddStepMenu onAdd={addStep} onClose={() => setShowAddMenu(false)} />
      )}
    </div>
  );
}
