# DayOne — AI-Powered Expert Knowledge Capture & Gamified Micro-Learning

> **Upload one training video. Get a complete Duolingo-style course with 15 interactive challenge types — instantly.**

DayOne solves the $1 trillion knowledge crisis in manufacturing: 10,000+ workers retire daily, taking decades of undocumented expertise with them. We capture that knowledge from a single training video using Gemini 2.0 Flash multimodal analysis, then transform it into gamified micro-learning that cuts onboarding from 6 months to days.

## What Makes DayOne Different

**One video in → full interactive course out.** No content authoring. No instructional design. No manual work.

Gemini 2.0 Flash analyzes every frame and generates:

- Swipeable micro-learning cards with real video frames
- Multiple-choice quizzes with confidence tracking
- Drag-to-reorder sequence challenges
- Timed flash recall challenges
- Text-input spot-the-detail checks
- Interactive wire-connect simulations
- Dial calibration simulations with tolerances
- Animated video flipbook walkthroughs (real frames from the uploaded video)
- Rotatable 3D equipment models with clickable hotspots
- Tacit knowledge cues (sounds, textures, smells experts use instinctively)
- AI mentor Q&A with video-timestamped citations

**15 distinct interactive challenge types from a single upload.** Every card includes the actual video frame from the moment it teaches.

## Quick Start

```bash
npm install
cp .env.example .env.local   # Add your GEMINI_API_KEY
npm run dev                   # → http://localhost:3000
```

**No API key?** The app ships with pre-analyzed demo content. Click "Try Demo" on the landing page.

## Core Innovation

### Multimodal Knowledge Extraction
We don't just transcribe — we extract what makes an **expert** different from a novice:
- **Environmental cues**: machine sounds, visual patterns, material textures
- **Measurements & tolerances**: exact specs with instruments and acceptable ranges
- **Common mistakes**: what new hires get wrong and why
- **Critical checkpoints**: where errors cascade into expensive failures
- **Tacit knowledge**: judgment calls that aren't in any manual

### Client-Side Video Frame Extraction
Real frames are extracted directly from the uploaded video using canvas-based capture:
- Each micro-learning card shows the exact video frame from its timestamp
- Animated video cards extract 8 sequential frames for flipbook walkthroughs
- Course thumbnails are auto-generated from video content
- All processing happens client-side — no server storage needed

### Strict AI-to-UI Schema Enforcement
Gemini's JSON output is validated through Zod schemas before rendering. The prompt enforces mandatory minimums (8+ cards, 4+ quizzes, 2+ simulations, etc.) so every course ships complete.

## Architecture

```
app/
  api/analyze/         → Video → Gemini 2.0 Flash → Zod-validated module
  api/ask/             → Q&A with full module context → cited answers
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
| Storage | IndexedDB (video files) + localStorage (offline-first) + Supabase (cloud sync) |

## Key Routes

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — courses, XP, stats |
| `/courses/builder` | Upload video → AI generates course |
| `/courses/[id]/learn` | Full learning experience with all challenge types |
| `/courses/[id]/ask` | AI mentor Q&A with video citations |
| `/manager` | Manager Control Tower — completion rates, compliance |

## License

Built for the Vibeathon hackathon.
