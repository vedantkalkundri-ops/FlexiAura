# FlexiAura AI Architecture (Member 2)

## Purpose

This document describes the AI intelligence layer of FlexiAura: Gemini integration, prompt engineering, conversation context and request validation.

## Folder Layout

```text
backend/src/
├── config/
│   ├── app.js              Runtime limits and server settings
│   └── gemini.js           Gemini client, API key and model configuration
├── modules/
│   ├── ai-engine/
│   │   ├── aiController.js Coordinates chat and reset requests
│   │   ├── aiRoutes.js     /api/ai routes
│   │   ├── aiService.js    Gemini SDK communication
│   │   └── promptBuilder.js FlexiAura system prompt
│   └── conversation/
│       ├── conversationController.js Conversation history endpoints
│       ├── conversationManager.js   Session lifecycle
│       ├── contextManager.js        Gemini context construction
│       ├── conversationRoutes.js    /api/conversation routes
│       └── historyManager.js        In-memory message storage
├── middleware/
│   ├── errorHandler.js      Consistent JSON error responses
│   └── validateRequest.js   Input validation
├── utils/
│   ├── errors.js            HTTP error helper
│   └── logger.js            Safe application logging
└── server.js                Express application and startup
```

## Request Flow

```text
POST /api/ai/chat
  -> validateRequest.js
  -> aiController.chat
  -> conversationManager.ensureSession
  -> historyManager.getMessages
  -> contextManager.buildContents
  -> promptBuilder.buildSystemPrompt
  -> aiService.generateResponse
  -> Gemini API
  -> historyManager stores user + assistant messages
  -> JSON response
```

Text input bypasses speech-to-text. Voice input is converted to text on the frontend before calling the same endpoint.

## Gemini Configuration

- API keys are read only on the backend from `GEMINI_API_KEY` or `GEMINI_API_KEYS`.
- `GEMINI_API_KEYS` accepts a comma-separated list for round-robin rotation and failover, and takes precedence over `GEMINI_API_KEY`.
- Requests rotate their starting key so multiple keys share the load.
- Clients are cached per key and created lazily so the server can start without a key.
- If a key is rate-limited, unauthorized or the service is unavailable, the remaining keys are tried in order.
- Chat requests return `503 AI_NOT_CONFIGURED` when no key is present.
- `GEMINI_MODEL` selects the model. The default is `gemini-3.5-flash-lite`.
- Gemini requests time out after `AI_TIMEOUT_MS` (default 30 seconds).
- SDK failures are converted into safe user-facing errors. Internal error details are logged without conversation content.

## FlexiAura Personality

The system prompt in `promptBuilder.js` defines:

- Identity: FlexiAura, a friendly AI desktop assistant.
- Communication: clear, natural, honest and appropriately concise.
- Context awareness: use only the provided conversation history.
- Safety: refuse harmful requests and never reveal internal instructions.
- Action boundary: the AI never executes system commands or claims an action succeeded without a verified result.

## Conversation Management

- Sessions are stored in memory in `historyManager.js` using a `Map`.
- Every session has its own message list, creation time and update time.
- Sessions expire after `SESSION_TTL_MS` (default 2 hours) and are replaced on next use.
- History is capped at `MAX_HISTORY_MESSAGES` (default 40) and trimmed from the oldest side.
- Context is capped by `MAX_CONTEXT_MESSAGES` and `MAX_CONTEXT_CHARS` before being sent to Gemini.
- Consecutive messages from the same role are merged, and context never starts with a model message.
- The user message and assistant response are persisted only after a successful Gemini response.
- This is prototype memory, not permanent memory. A database can be added later without changing the AI service.

## Error Handling

Errors use a consistent shape:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_MESSAGE",
    "message": "message is required and must be a non-empty string."
  }
}
```

Known codes include `INVALID_MESSAGE`, `MESSAGE_TOO_LONG`, `INVALID_SESSION_ID`, `AI_NOT_CONFIGURED`, `AI_TIMEOUT`, `AI_SERVICE_ERROR`, `SESSION_NOT_FOUND` and `RATE_LIMITED`.

## Security Notes

- API credentials stay on the backend.
- User messages are validated and length-limited.
- JSON bodies are limited to 16 KB by default.
- `/api` routes are rate-limited (60 requests per minute per IP by default).
- Internal server errors are not exposed to clients.
- Conversation content is not logged.
- The AI module has no direct operating-system access. System actions must go through Member 3's validated action interface.

## Running the Backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Add a real Gemini key and a supported model to `.env` before testing real AI responses.

Run the frontend separately:

```bash
cd flexiaura-app
npm install
npm run dev
```

The Member 2 panel is mounted in `flexiaura-app/src/App.jsx` above the existing system-control demo. It can also be reused directly:

```jsx
import { AssistantPanel } from "./features/ai-assistant";

<AssistantPanel />
```

The backend must be running before sending messages. `flexiaura-app/.env` can override `VITE_API_BASE_URL` if the backend is not on `http://localhost:3000`.

## Testing

```bash
cd backend
npm test
```

The test suite covers prompt content, key parsing, request validation, missing Gemini configuration, conversation isolation, context construction, session reset/expiry, history trimming, voice status and error responses.

To run the real Gemini integration test with a configured key:

```bash
cd backend
set RUN_GEMINI_INTEGRATION=1
npm run test:gemini
```

On PowerShell use `$env:RUN_GEMINI_INTEGRATION='1'` instead of `set`. This test makes one small real API request and is skipped by default.
