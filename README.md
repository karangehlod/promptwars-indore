# TravelYarro AI Travel Companion
*Your personal AI-powered travel curator for discovering hidden gems, authentic experiences, and rich cultural heritage.*

---

## Overview

TravelYarro is a client-only, AI-powered travel planning application that curates personalized travel experiences. It leverages Google's Gemini AI to generate tailored recommendations, uncover hidden cultural gems, map out local events, and build comprehensive itineraries with precise budget analyses in INR. Built entirely on the frontend with React and Vite, TravelYarro demonstrates how to build robust, multi-stage LLM pipelines directly in the browser without needing a backend server.

---

## Features

- **Personalized Travel Dashboard:** Generates 5 parallel insights (Recommendations, Hidden Gems, Heritage, Events, Experiences).
- **Intelligent API Queue:** Handles Gemini's rate limits with exponential backoff, request deduplication, and multi-API-key rotation.
- **Storytelling Modal:** Deep dives into the narrative and history of specific locations using `gemini-2.5-pro` streaming.
- **Budget Analysis:** Strictly enforces INR limits and breaks down costs across categories.
- **Step-by-step AI Pipeline:** Features an immersive animated loading overlay using Framer Motion.
- **Responsive UI:** Built with Tailwind CSS for a beautiful, mobile-first experience.
- **Client-Only Architecture:** Completely backend-less, running entirely on the user's browser.

---

## Tech Stack

- **Vite** - Lightning-fast frontend tooling
- **React 18** - UI library
- **TypeScript** - Strict type-safety
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Global state management
- **Zod** - Schema validation for LLM structured outputs
- **Google Gemini API** - AI capabilities (`gemini-2.5-flash` & `gemini-2.5-pro`)
- **Framer Motion** - Clean page transitions and animations
- **Firebase Hosting** - Deployment target

---

## Project Structure

```text
src/
  components/
    dashboard/    # AI-curated panels (Gems, Heritage, Events)
    destination/  # Location & dates input
    itinerary/    # Timeline and Budget builder
    layout/       # App wrappers and loaders
    profile/      # Multi-step onboarding wizard
    story/        # Streaming narrative modals
  hooks/          # Custom async execution wrappers
  schemas/        # Zod validation schemas
  services/       # API clients, Agent prompt logic, Queue manager
  store/          # Zustand global state
  __tests__/      # Vitest test suites
```

---

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**: Package manager
- **Firebase CLI**: For deployment (installed via npm)

---

## Environment Variables

The application requires Google Gemini API keys to function. 
TravelYarro supports **multiple API keys** to distribute load and bypass aggressive rate limits. 

1. Get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create a `.env` file in the root of the project.
3. Add your keys as a comma-separated list:

```env
VITE_GEMINI_API_KEY=your_first_key_here,your_second_key_here
```

**⚠️ IMPORTANT:** Never hardcode your API keys directly into the source code or commit the `.env` file to public repositories.

---

## Local Setup Instructions

1. **Clone the repository:**
```bash
git clone <repo-url>
cd promptwars-indore
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

The app will now be running on `http://localhost:5173`.

---

## Build Instructions

To build the project for production:

```bash
npm run build
```
*This compiles the TypeScript code and bundles the React application into the `dist` folder.*

To preview the production build locally:

```bash
npm run preview
```
*This serves the `dist` folder on a local web server to verify everything works before deployment.*

---

## Firebase Deployment Guide

Follow these steps to deploy TravelYarro to Firebase Hosting.

### Step 1 — Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2 — Login
```bash
firebase login
```
*(This will open a browser window to authenticate with your Google account)*

### Step 3 — Initialize project
```bash
firebase init hosting
```
When prompted, answer with the following:
- What do you want to use as your public directory? **`dist`**
- Configure as a single-page app (rewrite all urls to /index.html)? **`Yes`**
- Set up automatic builds and deploys with GitHub? **`No`** (or Yes if desired)
- File dist/index.html already exists. Overwrite? **`No`**

### Step 4 — Build project
```bash
npm run build
```

### Step 5 — Deploy
```bash
firebase deploy
```
Once completed, Firebase will provide you with a live Hosting URL!

---

## Important Notes

- **Gemini API Quotas:** The free tier of Gemini has strict limits (15 RPM / 1M TPM). 
- **429 Rate Limit Warning:** If you hit the limit, the app will intercept the `429 Quota Exceeded` error and automatically apply exponential backoff (retrying at 2s, 5s, 10s).
- **Multiple API Keys:** To avoid disruptions during heavily parallelized fetching (e.g., the dashboard load), it is highly recommended to provide at least 2 comma-separated API keys in your `.env` file. The internal queue will automatically rotate them.

---

## Common Issues & Fixes

- **Missing API Key:** Ensure `VITE_GEMINI_API_KEY` is set in your `.env` file and that you restart the dev server after adding it.
- **429 Errors:** The app queues requests and will automatically retry. If the error persists, you have exhausted all keys. Wait a few minutes or add more keys to the `.env`.
- **Blank UI after deploy:** Check your browser's console. If you see CORS errors or missing keys, ensure you configured environment variables in your hosting provider (e.g., Firebase).
- **Firebase routing issues:** Ensure you answered `Yes` to the "Configure as a single-page app" question during `firebase init`.
- **Build errors:** The project enforces strict TypeScript. Run `npm run test` and `npx tsc --noEmit` locally to catch errors before building.

---

## Scripts

```json
npm run dev      # Starts the Vite development server
npm run build    # Compiles TS and builds the production bundle
npm run preview  # Previews the production bundle locally
npm run test     # Runs the Vitest test suite
```

---

## License

MIT License
