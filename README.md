<p align="center">
  <h1 align="center">DayOne — AI-Powered Expert Knowledge Capture & Gamified Micro-Learning</h1>
  <p align="center">
    <strong>Upload one training video. Get a complete Duolingo-style course with 15 interactive challenge types — instantly.</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Gemini-2.0_Flash-4285F4?logo=google" alt="Gemini" />
    <img src="https://img.shields.io/badge/Three.js-R3F-black?logo=three.js" alt="Three.js" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwindcss" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Supabase-Sync-3FCF8E?logo=supabase" alt="Supabase" />
  </p>
</p>

---

> **Winner — Vibeathon Hackathon**

## The Problem

10,000+ manufacturing workers retire every day, taking decades of undocumented expertise with them. Training replacements takes 6+ months of shadowing — a $1 trillion knowledge crisis with no scalable solution.

## The Solution

DayOne captures expert knowledge from a single training video using **Gemini 2.0 Flash multimodal analysis**, then transforms it into gamified micro-learning that cuts onboarding from months to days.

**One video in → full interactive course out.** No content authoring. No instructional design. No manual work.

## Demo

[![Watch the Demo](https://img.youtube.com/vi/Fdi2PzHZV8M/maxresdefault.jpg)](https://youtu.be/Fdi2PzHZV8M)

> **[Watch the Demo Video →](https://youtu.be/Fdi2PzHZV8M)**

## What It Generates

From a single video upload, Gemini 2.0 Flash analyzes every frame and produces:

- **Swipeable micro-learning cards** with real video frames
- **Multiple-choice quizzes** with confidence tracking
- **Drag-to-reorder** sequence challenges
- **Timed flash recall** challenges
- **Text-input** spot-the-detail checks
- **Wire-connect simulations** — interactive circuit/process wiring
- **Dial calibration simulations** — set values within tolerances
- **Animated video flipbooks** — real extracted frames as step-by-step walkthroughs
- **Rotatable 3D equipment models** with clickable hotspots
- **Tacit knowledge cues** — sounds, textures, smells that experts use instinctively
- **AI mentor Q&A** with video-timestamped citations that jump to the exact moment

**15 distinct interactive challenge types from a single upload.** Every card includes the actual video frame from the moment it teaches.

## Quick Start

```bash
git clone https://github.com/CalebMorse06/DayOne.git
cd DayOne
npm install
cp .env.example .env.local   # Add your GEMINI_API_KEY
npm run dev                   # → http://localhost:3000
```

**No API key?** The app ships with pre-analyzed demo content. Click **"Try Demo"** on the landing page to explore all 15 challenge types immediately.

## How It Works

### 1. Multimodal Knowledge Extraction
We don't just transcribe — we extract what makes an **expert** different from a novice:
- **Environmental cues**: machine sounds, visual patterns, material textures
- **Measurements & tolerances**: exact specs with instruments and acceptable ranges
- **Common mistakes**: what new hires get wrong and why
- **Critical checkpoints**: where errors cascade into expensive failures
- **Tacit knowledge**: judgment calls that aren't in any manual

### 2. Client-Side Video Frame Extraction
Real frames are extracted directly from the uploaded video using canvas-based capture:
- Each card shows the exact video frame from its timestamp
- Animated video cards extract 8 sequential frames for flipbook walkthroughs
- Course thumbnails are auto-generated from video content
- All processing happens client-side — no server storage needed

### 3. Strict AI-to-UI Schema Enforcement
Gemini's JSON output is validated through **Zod schemas** before rendering. The prompt enforces mandatory minimums (8+ cards, 4+ quizzes, 2+ simulations) so every course ships complete.

## Architecture

```
app/
  api/analyze/         → Video → Gemini 2.0 Flash → Zod-validated module
  api/ask/             → Q&A with full module context → cited answers
  api/tts/             → AI voice narration
  courses/builder/     → Upload → analyze → frame extraction → preview
  courses/[id]/learn/  → Card stack with all 15 interactive types
  courses/[id]/ask/    → AI mentor with video timestamp citations
  manager/             → Enterprise workforce readiness dashboard

components/
  learn/               → CardStack, MicroCard, QuizCard, FlashCard,
                         SequenceCard, SpotDetailCard, SimulationCard,
                         AnimatedVideoCard, Model3DCard, TacitCueCard,
                         CertificationCard, SmartReview, XPBar
  capture/             → VideoUploader, AnalysisProgress, ModulePreview
  ask/                 → ChatInterface, VideoTimestamp (clickable)
  analytics/           → MasteryScore, DifficultyHeatmap, VelocityChart

lib/
  gemini.ts            → Gemini API client (file upload + multimodal analysis)
  prompts.ts           → System prompts with mandatory content minimums
  schemas.ts           → Zod validation schemas for all content types
  types.ts             → Full TypeScript type coverage
  video-frames.ts      → Client-side frame extraction (canvas + seek)
  video-store.ts       → IndexedDB persistence for uploaded videos
  store.ts             → localStorage state + Supabase sync
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| AI Engine | Google Gemini 2.0 Flash (Multimodal Video Analysis) |
| 3D | Three.js + React Three Fiber + Drei |
| Animation | Framer Motion (swipe gestures, transitions, drag-to-reorder) |
| Validation | Zod (strict schema enforcement on AI output) |
| Styling | Tailwind CSS |
| Voice | ElevenLabs TTS (optional) |
| Storage | IndexedDB (videos) + localStorage (offline-first) + Supabase (cloud sync) |

## Key Routes

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — courses, XP, stats |
| `/courses/builder` | Upload video → AI generates course |
| `/courses/[id]/learn` | Full learning experience with all challenge types |
| `/courses/[id]/ask` | AI mentor Q&A with video citations |
| `/manager` | Manager Control Tower — completion rates, compliance |

## Environment Variables

```bash
# Required
GEMINI_API_KEY=           # Google Gemini 2.0 Flash API key

# Optional
NEXT_PUBLIC_SUPABASE_URL= # Supabase project URL (for cloud sync)
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon key
ELEVENLABS_API_KEY=       # ElevenLabs API key (for voice narration)
```

## Built With

Built at the **Vibeathon Hackathon** — where we turned one idea and 48 hours into a platform that can capture a lifetime of expertise from a single video.
