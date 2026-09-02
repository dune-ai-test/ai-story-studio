# AI Story Writing Studio

A Windows desktop application for **AI-assisted written-story creation**.

The product is a **story-writing studio**, not a media-generation platform. The
user works through a guided workflow:

**Home → Topic → Story → Characters → Scenes → Dialogue → Captions → Draft → Review → Export**

AI agents assist throughout, but the user stays in control of the written content.
The final output is a complete manuscript exported as **Microsoft Word or PDF**.

## Tech stack

- **Rust** backend via **Tauri 2** — project persistence, version history,
  autosave, six AI agents, and Word/PDF export.
- **React + TypeScript + Tailwind** frontend — all UI rendering.
- Ships as a single `.exe` / `.msi` on Windows. No runtime install needed.

## Build

This app is built on **GitHub Actions**, not locally. Push to `main` and the
workflow in `.github/workflows/build.yml` compiles the Rust backend and the
frontend, then produces a Windows installer artifact you can download.

### Build locally (contributors only)

```bash
# Frontend
npm install
npm run build

# Tauri dev mode (hot reload)
npm run tauri:dev

# Production build
npm run tauri:build
```

Requires: Node 22+, Rust 1.77+ (stable), and a Windows machine for final binaries.

## Project structure

```
src-tauri/          # Rust backend (models, storage, agents, export commands)
src/                # React frontend (pages, components, design system)
.github/workflows/  # CI: builds the Windows installer on push
```

## AI agents

Six agents share context across the project: Story, Character, Scene, Dialogue,
Caption, and Editor. They return suggestions — the user always remains the
author. Configure an LLM provider in Settings (OpenAI-compatible); without a key
the app runs fully offline using stub responses.

## License

TBD.