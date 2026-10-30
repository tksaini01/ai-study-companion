# StudyPulse AI — Intelligent Study Companion 🎓✨

A responsive, production-ready AI Study Companion web application built with **Next.js (App Router)**, **TypeScript**, **Vanilla CSS**, **Google Gemini API**, and **Firebase**.

---

## 🌟 Key Features

1. **📊 Student Dashboard**:
   - Comprehensive learning analytics: active study documents, flashcard mastery percentage, average quiz score, daily study streak with animated flame, and live activity log.
   - Active study material hero banner with estimated reading times and 1-click learning triggers.

2. **📄 PDF Notes Ingestion & Library**:
   - Drag-and-drop PDF uploader with automatic text parsing and metadata extraction via `pdf-parse`.
   - Manual notes editor & paste interface with tag management.
   - 1-click pre-loaded course samples (Computer Science, Biology, World History) for instant zero-friction testing.
   - Note search, word counter, and document viewer.

3. **⚡ Interactive MCQ Quiz Arena**:
   - Custom quiz generator with configurable difficulty (*Easy*, *Medium*, *Hard*) and question count (5, 10, 15).
   - Real-time countdown timer and visual progress tracking.
   - Instant explanation mode highlighting correct answers with conceptual hints.
   - Scorecard with percentage grades, confetti celebration (`canvas-confetti`), and question-by-question mistake review.

4. **🗂️ 3D Active Recall Flashcards**:
   - Interactive 3D flip card animations using CSS perspective transforms.
   - Spaced repetition rating: *🔴 Need Practice*, *🟡 Almost*, and *🟢 Mastered!*.
   - Filter by mastery status, random card shuffle, and keyboard navigation (`Space` to flip, `Arrow` keys to navigate).

5. **💡 Topic Explanations & Deep Dive**:
   - Structured concept breakdown: Academic Overview, Core Principles, **ELI5 (Explain Like I'm 5)** real-world analogies, Memory Mnemonics, and Key Terminology glossary.
   - Self-check conceptual questions with revealable answers.

6. **🤖 24/7 AI Study Tutor Chat**:
   - Contextual chat grounded directly in the currently active study note.
   - Quick prompt chips (*"Explain simpler"*, *"Real world analogy"*, *"Common exam traps"*, *"Practice problems"*).

7. **⚙️ In-App Settings & Cloud Sync**:
   - In-app Gemini API key and model selector (`gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`) with real-time test connection button.
   - Optional Firebase Firestore and Cloud Storage integration.
   - Built-in intelligent fallback engine so every single feature operates 100% out of the box even before entering external keys!

---

## 🚀 Quick Start

### 1. Installation

```bash
cd ai-study-companion
npm install
```

### 2. Configuration (Optional)

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

You can also paste your Gemini API key directly into the application via the **Settings (⚙️)** modal in the top navbar.

### 3. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build

```bash
npm run build
npm run start
```

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── gemini/route.ts      # Gemini AI proxy (MCQs, flashcards, explanations, tutor chat)
│   │   └── parse-pdf/route.ts   # Server-side PDF extraction via pdf-parse
│   ├── globals.css              # Ultra-premium Vanilla CSS design system
│   ├── layout.tsx               # Root layout, fonts & ToastProvider
│   └── page.tsx                 # Main application state orchestrator
├── components/
│   ├── DashboardView.tsx        # Student learning dashboard
│   ├── NotesUploadView.tsx      # PDF drag-and-drop & note viewer
│   ├── McqQuizView.tsx          # MCQ generator, quiz player & scorecard
│   ├── FlashcardsView.tsx       # 3D interactive flashcards
│   ├── TopicExplanationView.tsx # Structured concept breakdowns & ELI5
│   ├── AiTutorChatView.tsx      # Interactive Gemini study tutor
│   ├── Navbar.tsx               # Header with active note switcher & indicators
│   ├── Sidebar.tsx              # Responsive navigation & streak widget
│   ├── SettingsModal.tsx        # API key & Firebase configuration
│   └── Toast.tsx                # Toast notification system
└── lib/
    ├── types.ts                 # TypeScript interfaces and contracts
    ├── storage.ts               # Local-first persistence & stats engine
    ├── sampleData.ts            # Preloaded high-yield course materials
    ├── gemini.ts                # Gemini generative AI service & fallback
    └── firebase.ts              # Firebase Firestore & Storage sync
```

---

## 🎨 Design System

- **Palette**: Obsidian slate (`#07090e`), Indigo/Violet gradients (`#6366f1` / `#8b5cf6`), Cyan (`#06b6d4`), Emerald (`#10b981`), Amber (`#f59e0b`).
- **Typography**: `Outfit` for display headings and `Inter` for body copy.
- **Glassmorphism**: Backdrop blur with subtle border highlights and radial ambient background glows.
- **Micro-animations**: Smooth hover transitions, pulsing streak flame, and 3D flip card transforms.
