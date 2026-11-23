# FlexiAura Voice Workflow (Member 2)

## Overview

Voice interaction has two independent parts:

1. Speech-to-Text (STT): microphone input becomes text, which is sent to `/api/ai/chat`.
2. Text-to-Speech (TTS): the AI response is optionally spoken aloud.

The prototype uses the browser-native Web Speech API. No microphone audio is uploaded by this module, and the backend only reports voice capability status.

## Frontend Files

```text
flexiaura-app/src/features/voice/
├── components/
│   ├── VoiceButton.jsx
│   ├── VoiceVisualizer.jsx
│   └── ListeningIndicator.jsx
├── hooks/
│   ├── useSpeechRecognition.js
│   └── useTextToSpeech.js
├── services/
│   └── voiceService.js
└── index.js
```

The integrated chat and voice panel lives at:

```text
flexiaura-app/src/features/ai-assistant/components/AssistantPanel.jsx
```

## Speech-to-Text Flow

```text
User clicks Voice input
  -> browser asks for microphone permission
  -> SpeechRecognition starts
  -> interim results appear while speaking
  -> final transcript fills the message input
  -> user sends the text to /api/ai/chat
```

Rules:

- The browser asks for microphone permission before recording.
- The UI shows a clear `Listening...` indicator while the microphone is active.
- The user can stop listening at any time with the same button.
- Interim text is displayed but only final text is placed in the message box.
- Microphone denial, missing microphone, no speech and network errors produce readable messages.
- If speech recognition is unsupported, the input remains usable and a note is shown.

## Text-to-Speech Flow

```text
AI response arrives
  -> "Speak AI replies aloud" is enabled
  -> SpeechSynthesis speaks the response
  -> user can mute or stop playback
```

Rules:

- Voice output is off by default and controlled by the user.
- Starting a new spoken response cancels the previous one.
- Muting stops current playback and prevents new playback.
- Leaving the panel stops speech synthesis.
- Unsupported environments show an error instead of crashing.

## Browser Support

Web Speech API support depends on the runtime:

- Chromium-based browsers usually support speech recognition and synthesis.
- Tauri's WebView2 may not expose `SpeechRecognition` on every system.
- When STT is unavailable, use typed input.
- TTS availability is checked separately from STT availability.

If a cloud provider is needed later, implement it behind `voiceService.js` and `backend/src/modules/voice/speechProcessor.js` rather than coupling it to the AI engine.

## Backend Voice Status

`GET /api/voice/status` reports which providers are active. The default response uses:

- STT provider: `web-speech-api` (browser mode, no backend upload).
- TTS provider: `web-speech-api` (browser mode).
- Cloud mode only when `SPEECH_PROVIDER` and `SPEECH_API_KEY` are configured.

No audio upload endpoint exists in the prototype.

## Integrated Usage

`AssistantPanel` combines:

- `useAssistant` for chat and session state.
- `useSpeechRecognition` for microphone input.
- `useTextToSpeech` for spoken replies.
- `ThinkingIndicator` for loading feedback.
- Error banners for AI, speech and playback failures.

The panel is mounted in `App.jsx` without changing the AI contract. It can also be reused elsewhere:

```jsx
import { AssistantPanel } from "./features/ai-assistant";

<AssistantPanel />
```

## Testing Checklist

- Microphone permission granted, denied and dismissed.
- Voice input produces text in the message box.
- Text-only chat works when speech is unsupported.
- AI reply is displayed even when voice output is disabled.
- Spoken reply starts only when enabled.
- Mute and stop controls interrupt playback.
- Backend unavailable produces a readable error.
- Multiple sessions do not mix messages.
