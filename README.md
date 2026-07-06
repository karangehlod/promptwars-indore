# TravelYarro — AI Travel Companion
*Your personal AI-powered travel curator for discovering hidden gems, authentic experiences, and rich cultural heritage in India.*

---

## 🚀 Live Demo, Video & Screenshots

### Live Web Application
Deploy is 100% green and active on Firebase Hosting:
👉 **[https://travelyarro.web.app](https://travelyarro.web.app)**

### Application Walkthrough Video
Here is a live walkthrough animation showing the onboarding layout and scrolling:

![TravelYarro Onboarding Walkthrough Video](assets/app_walkthrough.webp)

### Interface Screenshots

**Onboarding Welcome Screen:**
![Onboarding Welcome Screen](assets/onboarding_welcome.png)

**Onboarding Details Screen:**
![Onboarding Details Screen](assets/onboarding_details.png)


**itnary Details Screen:**
![itnary Details Screen](assets/itnary_details.png)

<img width="1728" height="905" alt="itnary_details" src="https://github.com/user-attachments/assets/9cb1c4ce-ea79-4231-99a3-5ef45d58c3ad" />

---

## 🏛️ System Architecture

TravelYarro is engineered following strict **SOLID, OOP, and Clean Architecture principles** in a client-only environment. The design abstracts Google Gemini AI interactions behind an interchangeable provider interface to decouple prompt engineering, Zod model validation, and user interface logic.

### Dependency Abstraction & Facade Pattern
1. **IAIProvider Interface**: Standardizes structured generation (`generateStructured`) and streaming generation (`generateStream`).
2. **GeminiProvider & MockProvider**: Implementing the same interface. `MockProvider` automatically generates mock data conforming to Zod validation rules during test cycles and mock-mode runs (`VITE_USE_MOCKS=true`).
3. **Domain Services**: Independent classes (e.g., `ItineraryService`, `RecommendationService`) responsible for prompt templates and parsing specific schemas.
4. **AgentFacade**: The single orchestrator composing all 7 domain services, exposing a unified API surface to the application's React hooks.

```mermaid

graph TD
    UI[React Components / UI] -->|useAgent Hook| Facade[AgentFacade]
    Facade -->|Composes| RecSvc[RecommendationService]
    Facade -->|Composes| GemSvc[HiddenGemService]
    Facade -->|Composes| HerSvc[HeritageService]
    Facade -->|Composes| EvtSvc[EventService]
    Facade -->|Composes| ExpSvc[ExperienceService]
    Facade -->|Composes| StorySvc[StoryService]
    Facade -->|Composes| ItinSvc[ItineraryService]
    
    RecSvc & GemSvc & HerSvc & EvtSvc & ExpSvc & StorySvc & ItinSvc -->|Depends on Abstraction| IAI[IAIProvider Interface]
    
    IAI -->|Implemented by Prod| GeminiProv[GeminiProvider]
    IAI -->|Implemented by Test/Mock| MockProv[MockProvider]
    
    GeminiProv -->|Direct API Call| GeminiAPI[Google Gemini SDK]
```

---

## 🔄 Request-Response Sequence

When a user selects items from their dashboard and generates an itinerary, the following sequence coordinates the prompt execution, JSON schema validation, and storage:

```mermaid

sequenceDiagram
    autonumber
    actor User
    participant UI as Dashboard / Itinerary View
    participant Hook as useAgent Hook
    participant Facade as AgentFacade
    participant ItinSvc as ItineraryService
    participant Queue as APIQueue Manager
    participant Provider as GeminiProvider
    participant Zod as Zod Schema Validation
    
    User->>UI: Click "Generate Magic Plan"
    UI->>Hook: trigger generateItinerary()
    Hook->>Facade: itinerary.generateItinerary(profile, selections)
    Facade->>ItinSvc: generateItinerary(profile, selections)
    ItinSvc->>ItinSvc: Compile system context & user inputs into Prompt
    ItinSvc->>Queue: enqueueRequest(prompt, ItinerarySchema)
    Note over Queue: Rotates API keys on 429 errors<br/>Applies exponential backoff
    Queue->>Provider: generateStructured(prompt, ItinerarySchema)
    Provider->>Provider: Call Google Gemini SDK
    Provider->>Zod: parse(responseJson)
    alt Zod validation succeeds
        Zod-->>Provider: Valid Itinerary Object
        Provider-->>Queue: Valid Itinerary Object
        Queue-->>ItinSvc: Valid Itinerary Object
        ItinSvc-->>Facade: Valid Itinerary Object
        Facade-->>Hook: Return Itinerary Object
        Hook-->>UI: Update State & Render Day Plans
        UI-->>User: Show Completed Day-by-Day Plan
    else Zod validation fails / Malformed JSON
        Zod-->>Provider: Parse Exception
        Note over Provider: Retries generation once<br/>with raw error correction feedback
        Provider-->>UI: Render Error Toast / Fallback
    end
```

---

## 🛠️ Tech Stack & CI Configuration

- **Vite & React 18** - Frontend bundler & UI library
- **Tailwind CSS v4** - Styling compiler integration (`@tailwindcss/vite`)
- **Framer Motion** - Animations and micro-interactions
- **Zustand** - Centralized state store with persistence (`localStorage`)
- **Zod** - Declares and verifies the schema structure of the LLM responses
- **Vitest & Playwright** - Unit tests & E2E smoke tests
- **Firebase Tools** - Production hosting target

### CI Validation Commands
Our GitHub Actions pipeline runs the following validation matrix:
```bash
# 1. Lint checks (oxlint)
npm run lint

# 2. Strict typechecks
npx tsc --noEmit

# 3. Unit test runs (Vitest)
npx vitest run

# 4. E2E Browser checks (Playwright)
npx playwright test

# 5. Production bundles build
npm run build
```

---

## ⚙️ Local Development

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd promptwars-indore
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_key_one,your_key_two
   VITE_USE_MOCKS=false
   ```
   *Note: Support for comma-separated key rotation is built in!*

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start local Server**:
   ```bash
   npm run dev
   ```

---

## 📜 License
MIT License
