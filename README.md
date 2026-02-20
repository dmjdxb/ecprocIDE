# ecproc IDE

**Electrochemical Procedure Editor** — The Open Faraday Language for Electrochemistry.

Convert between `.ecproc` YAML, Python SDK, and ECDL JSON formats.

Built for two audiences:
- **Electrochemists**: Design experiments with domain-specific validation
- **ML Engineers**: Get clean, standardized data in ECDL JSON format

## Features

- ✅ **12 Techniques**: OCP, CV, LSV, DPV, SWV, Stripping, EIS, CA, CP, GCD, CC, Purge
- ✅ **24 Validation Rules**: PV001-PV013 (errors) + DR001-DR011 (warnings)
- ✅ **4 Output Formats**: YAML, Python, ECDL JSON, Faraday IR
- ✅ **Parameter Help**: Tooltips explain every parameter for non-chemists
- ✅ **Real-time Validation**: Issues highlighted as you edit
- ✅ **Import/Export**: Load and save procedures

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Hosting Options

### Option 1: Static Hosting (Recommended for Public Access)

ecproc IDE is a client-side React app. No backend required.

**Vercel** (easiest):
```bash
npm install -g vercel
vercel
```

**Netlify**:
```bash
npm run build
# Drag & drop the `dist/` folder to netlify.com
```

**GitHub Pages**:
```bash
# In package.json, add: "homepage": "https://yourusername.github.io/ecproc-ide"
npm run build
# Push dist/ to gh-pages branch
```

**Any Static Server**:
```bash
npm run build
# Upload dist/ to S3, Google Cloud Storage, or any web server
```

### Option 2: Self-Hosted with ecproc Backend

For server-side validation using the actual ecproc Python package:

```bash
# 1. Build frontend
npm run build

# 2. Serve with a Python backend (example with FastAPI)
pip install fastapi uvicorn ecproc

# 3. Create backend API (see backend/ folder)
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Option 3: Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t ecproc-ide .
docker run -p 8080:80 ecproc-ide
```

### Option 4: Electron Desktop App

For offline use:

```bash
npm install electron electron-builder --save-dev
# Add electron main process (see electron/ folder)
npm run build:electron
```

## Project Structure

```
ecproc-ide/
├── src/
│   ├── App.jsx              # Main application
│   ├── lib/
│   │   ├── techniques.js    # 12 technique definitions
│   │   ├── validation.js    # 24 validation rules
│   │   └── generators.js    # YAML/Python/ECDL/IR generators
│   └── index.css            # Tailwind styles
├── public/
├── package.json
└── vite.config.js
```

## Integration with ecproc

This IDE generates files compatible with the ecproc toolchain:

```bash
# Validate generated .ecproc file
ecproc validate my_experiment.ecproc

# Run on hardware
ecproc run my_experiment.ecproc --hardware gamry_1010e

# Generate lab manual
ecproc manual my_experiment.ecproc --format pdf
```

## For Electrochemists

Every parameter is editable. The "?" tooltips explain:
- What the parameter does
- Typical values
- Instrument limits

Validation rules (PV/DR codes) match the ecproc specification:
- **Errors** (PV): Will fail execution — must fix
- **Warnings** (DR): Best practice violations — should fix

## For ML Engineers

The **ECDL tab** outputs JSON ready for your ML pipeline:

```json
{
  "ecdl_version": "1.0.0",
  "protocol": { ... },      // Experimental conditions
  "material": { ... },      // Fill after experiment
  "observation": { ... },   // Fill with measured values
  "_procedure": { ... }     // Complete procedure definition
}
```

The `_procedure` field contains the full experimental protocol for reproducibility.

## Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Type checking (if using TypeScript)
npm run typecheck
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

Apache 2.0 — ElectrocatalystAI
