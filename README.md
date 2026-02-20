# ecproc IDE

**Electrochemical Procedure Editor** — The Open Faraday Language for Electrochemistry.

Design, validate, and export electrochemical experiments in `.ecproc` YAML, Python SDK, ECDL JSON, and Faraday IR formats.

Built for two audiences:
- **Electrochemists**: Design experiments with domain-specific validation and real-time feedback
- **ML Engineers**: Get clean, standardized data in ECDL JSON format for durability prediction pipelines

## What It Does

- **12 Techniques**: OCP, CV, LSV, DPV, SWV, Stripping, EIS, CA, CP, GCD, CC, Purge
- **24 Validation Rules**: PV001–PV013 (hard errors) + DR001–DR011 (best-practice warnings)
- **4 Output Formats**: `.ecproc` YAML, Python SDK, ECDL JSON, Faraday IR JSON
- **Parameter Help**: Every parameter has tooltips explaining what it does, typical values, and instrument limits
- **Real-time Validation**: Issues highlighted as you edit
- **Import/Export**: Load `.ecproc`, `.yaml`, `.yml`, and `.json` files; download in any format
- **State Persistence**: Your work is saved to localStorage automatically

## For Electrochemists

Every parameter is editable. Validation rules (PV/DR codes) match the ecproc specification:
- **Errors** (PV): Will fail execution — must fix
- **Warnings** (DR): Best practice violations — should fix

Generated files are compatible with the ecproc toolchain:

```bash
ecproc validate my_experiment.ecproc
ecproc run my_experiment.ecproc --hardware gamry_1010e
ecproc manual my_experiment.ecproc --format pdf
```

## For ML Engineers

The **ECDL tab** outputs JSON ready for your ML pipeline:

```json
{
  "ecdl_version": "1.0.0",
  "protocol": { ... },
  "material": { ... },
  "observation": { ... },
  "_procedure": { ... }
}
```

The `_procedure` field contains the full experimental protocol for reproducibility. Material and observation fields are populated after experimental execution.

## License

Apache 2.0 — ElectrocatalystAI
