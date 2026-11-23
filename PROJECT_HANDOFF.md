# FlexiAura — Project Handoff

> Updated: 2026-11-23 (Asia/Calcutta)
> Source of product requirements: the user-provided PRD v2.0, reproduced in full below.
> This progress snapshot is based on repository files and Git history at the date above. Planned requirements are not evidence of implemented features.

## Project at a glance

FlexiAura is intended to be a lightweight desktop AI companion represented by a floating pixel-art black cat. The PRD describes a Windows-first Tauri desktop app, with a React UI, Rust native commands, and a planned Node.js AI/voice backend. The longer-term scope includes chat, voice, permission-controlled desktop tools, file assistance, user-requested screen analysis, settings, and contextual panels.

## Current implementation snapshot

### Implemented and visible in the current source

- Desktop shell: Tauri 2 with a single 800 x 600 window (`flexiaura-app/src-tauri/tauri.conf.json`).
- Frontend: React 19 and Vite using JavaScript modules (`flexiaura-app/package.json`).
- Rust/Tauri commands registered in `src-tauri/src/lib.rs`: `greet`, `get_system_info`, `get_memory_info`, and `get_cpu_info`.
- System information flow: React calls a frontend service, which invokes Rust and displays OS, architecture, hostname, and app status.
- Memory flow: Rust uses `sysinfo` to collect total, used, and available memory and calculates a usage percentage. The frontend service invokes the command, and `App.jsx` displays RAM values in GB and percent.
- CPU flow: Rust uses `sysinfo` to read processor name, average per-core usage, logical processor count, and frequency. The Tauri command and frontend invocation service are wired into `App.jsx`, which displays these values and errors. The UI fetches CPU and RAM information on startup and refreshes them every two seconds; manual refresh buttons are also present.
- The greet form remains a Rust/React connectivity demo.
- Tauri default capability grants core and opener defaults.

### In progress / integration gaps

- CPU and RAM monitoring are visible in the developer test page and auto-refresh every two seconds. Loading states and stale-request handling are not implemented.
- `cpu_service.rs` blocks its command thread for 500 ms between CPU refreshes to obtain a usage measurement. Since the UI polls CPU and RAM every two seconds, consider whether the blocking measurement and polling interval are appropriate for responsiveness and resource use.
- The current screen is still a developer test page rather than the intended companion product UI.

### Not implemented in the inspected source

No pixel cat UI/animation, small floating transparent window behavior, drag-to-move behavior, chat UI, AI provider/backend, voice input/output, conversation persistence, file manager, screen capture/vision, action confirmation/permissions, settings UI, or contextual panels were found. Treat those as PRD requirements and roadmap items, not completed features.

### Repository and recent history

- Latest Git commit: `6d8c966` - `memory fuction achived,working on CPU info`.
- Previous commits include `58bbe2e` (`dependencies and progress files`), `b482909` (system info split into parts and built), and `a30a990` (Rust/React connection and system info retrieval).
- The working tree currently has uncommitted changes in `PROJECT_HANDOFF.md` and `flexiaura-app/src/App.jsx`; preserve these edits when continuing work. The current App.jsx changes include automatic RAM/CPU polling and CPU display.
- Relevant modules include frontend system-control services for system, memory, and CPU data; Rust commands, services, and serializable models for the same categories.
- `README.md` at the repository root is only a project title. The app README remains the default Tauri + React template.
- Rust build artifacts under `src-tauri/target` are generated output, not feature implementation.

## Architecture as implemented today

```text
React UI (src/App.jsx)
  +-- system, memory, CPU UI -> frontend services -> Tauri invoke -> Rust commands -> Rust services/models
      (memory and CPU are fetched on startup and every two seconds)
```

The PRD's Node.js backend, WebSocket/event layer, and most feature folders do not exist in the current repository tree. Current package dependencies show no AI, voice, or Node backend integration. Keep this distinction explicit when planning work.

## Suggested next steps

1. Review the automatic CPU/RAM polling interval and CPU measurement approach; add loading/error feedback where useful.
2. Replace the developer test page with the first product UI milestone: the companion window and cat interaction described in the PRD.
3. Add a compact chat UI and provider-neutral AI service after deciding where the planned Node.js backend fits into the current Tauri architecture.
4. Before adding desktop actions, define allowlisted tools, input validation, explicit confirmation for sensitive actions, and Tauri capability boundaries. Do not execute arbitrary AI-generated shell commands.
5. Add voice, file access, and user-triggered screen analysis as separate modules with clear privacy indications and permissions.
6. Refresh this snapshot after meaningful implementation changes, grounding status claims in current source or recorded decisions.
## Guidance for AI collaborators

- Read this handoff first, then inspect the relevant source files before editing.
- The PRD below is the product intent; it does not mean every described module or behavior exists.
- Preserve the current React + Vite + Tauri 2 + Rust stack unless the user explicitly changes it. Node.js is mentioned in the PRD as the planned AI backend, but no such backend is currently present.
- Prefer small, feature-based modules and avoid putting all product logic in `App.jsx`.
- Keep secrets out of frontend code and version control. Never turn AI output into unrestricted shell execution.
- Check `git status` before making changes so existing edits remain intact.

---

# Product Requirements Document (source text)

The following is the complete PRD supplied by the project owner. Preserve its requirements as the product reference; see the progress snapshot above for what is currently evidenced in code.
# FlexiAura — Product Requirements Document (PRD)

**Version:** 2.0
**Project Name:** FlexiAura
**Project Type:** AI-Powered Desktop Companion
**Status:** Active Development
**Primary Platform:** Windows
**Target Platforms:** Windows, Linux, macOS
**Frontend:** React 19 + Vite + JavaScript
**Desktop Framework:** Tauri 2
**Desktop Backend:** Rust
**AI Backend:** Node.js
**Team Size:** 3 members

---

# 1. Project Overview

FlexiAura is a lightweight, AI-powered desktop companion designed to bring intelligent assistance directly to a user's desktop.

Unlike traditional AI assistants that require a browser, website, or large application window, FlexiAura will exist as a small, floating desktop companion that can be accessed whenever needed.

The assistant will be represented by a minimal pixel-art black cat with a white outline. The cat will remain on the desktop in an idle or sleeping state and can be activated through user interaction.

Upon activation, the companion will wake up and provide access to an AI assistant interface supporting text-based conversations, voice interactions, contextual assistance, and selected desktop operations.

FlexiAura aims to create a natural, interactive, and non-intrusive desktop AI experience.

The application is designed to be modular, allowing different features to be developed independently and integrated into a unified desktop assistant.

---

# 2. Problem Statement

Most AI assistants are accessed through websites, browser tabs, or standalone application windows. This creates interruptions in a user's workflow and requires unnecessary navigation for simple tasks.

Users frequently need to:

- Switch between applications to access AI assistance.
- Type queries that could be communicated through voice.
- Perform repetitive computer operations manually.
- Search for information while working across multiple applications.
- Interact with AI tools that lack desktop integration.
- Access assistance without interrupting their current workflow.

FlexiAura addresses these problems by providing a persistent desktop companion that can be activated quickly and assist users through natural language interaction.

The assistant aims to reduce workflow interruptions while making AI assistance more accessible and practical.

---

# 3. Product Vision

To develop a lightweight, intelligent, cross-platform desktop AI companion that integrates conversational AI, voice interaction, contextual assistance, and permission-controlled desktop automation into one natural desktop experience.

FlexiAura should feel like an assistant that lives on the desktop, rather than an application the user has to repeatedly open.

---

# 4. Goals and Objectives

## 4.1 Primary Goals

- Develop a floating desktop AI companion.
- Create a pixel-art cat as the assistant's visual identity.
- Allow the companion to be moved freely across the desktop.
- Implement click-based activation.
- Provide an integrated AI chat interface.
- Support voice-based interaction.
- Enable controlled computer operations.
- Provide screen-based contextual assistance.
- Maintain a modular and maintainable codebase.
- Enable development by three team members in parallel.
- Design the architecture for future Windows, Linux, and macOS support.

## 4.2 Secondary Goals

- Support customizable assistant behavior.
- Add conversation history.
- Allow configurable AI providers.
- Support local AI models in the future.
- Implement contextual panels for structured AI responses.
- Add user-configurable permissions.
- Provide future workflow automation.

## 4.3 Non-Goals for the Initial MVP

The initial version will not aim to implement:

- Fully autonomous computer control.
- Unrestricted shell or terminal execution.
- Advanced agent swarms.
- Cloud user accounts or multi-user synchronization.
- Mobile applications.
- Complex persistent AI memory.
- Full desktop surveillance or continuous screen monitoring.
- Background recording without explicit user awareness.

---

# 5. Target Users

## Primary Users

- Students
- Developers
- Software engineers
- Researchers
- Technology enthusiasts
- Productivity-oriented computer users

## User Requirements

Users should be able to:

- Access AI assistance quickly.
- Ask questions through text or voice.
- Get responses without switching to a browser.
- Perform supported computer operations.
- Analyze screen content when explicitly requested.
- Access file-related assistance.
- Control assistant permissions.
- Customize selected settings.
- Interact with a minimal desktop companion.

---

# 6. Product Design Philosophy

FlexiAura must follow these design principles.

### 6.1 Minimal

The companion should take up minimal screen space and avoid unnecessary UI elements.

### 6.2 Non-Intrusive

The assistant should not interfere with applications, gameplay, meetings, coding, or normal desktop work.

### 6.3 Desktop-Native

FlexiAura must behave like an installed desktop application and not a website.

### 6.4 Modular

Each feature must be isolated and independently maintainable.

### 6.5 Secure

System operations must go through validated tools and permission controls.

### 6.6 Responsive

The UI must respond quickly to clicks, movement, typing, voice activation, and state changes.

### 6.7 Extensible

The architecture must support future features without requiring major restructuring.

---

# 7. UI/UX Requirements

## 7.1 Desktop Companion — Pixel Cat

The pixel-art cat is the central visual identity of FlexiAura.

### Visual Requirements

- Pixel-art black cat.
- Clearly visible white outline/border.
- Transparent background.
- Minimal and clean appearance.
- Calm and friendly personality.
- Suitable for a floating desktop window.
- No orb or sphere-based assistant design.

### Behavior Requirements

- Remains on the desktop when idle.
- Can be dragged to different screen positions.
- Supports a sleeping idle state.
- Wakes up when clicked.
- Displays different visual states depending on assistant activity.
- Returns to idle when the assistant is dismissed.
- Should not obstruct the user's workflow.

## 7.2 Companion States

The companion should support the following states:

| State            | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| Sleeping         | Cat appears asleep when inactive                           |
| Idle             | Cat is awake but not performing an action                  |
| Awake            | Cat is activated and ready for interaction                 |
| Listening        | Capturing user voice input                                 |
| Thinking         | AI is processing the request                               |
| Responding       | AI response is being delivered                             |
| Executing        | A desktop tool is being executed                           |
| Confirmation     | Waiting for user approval                                  |
| Error            | An operation failed                                        |
| Hidden/Minimized | Companion is temporarily hidden or minimized, if supported |

State transitions should be managed consistently rather than handled independently inside unrelated UI components.

## 7.3 Companion Interaction

- Click to activate.
- Drag to move.
- Visual feedback on interaction.
- Smooth state transitions.
- Optional animations or sounds.
- Position persistence may be added later.

## 7.4 Chat Interface

The chat panel appears when the companion is activated.

It should contain:

- Message history.
- User message bubbles.
- AI response bubbles.
- Text input.
- Send button.
- Voice interaction button.
- Listening indicator.
- Thinking indicator.
- Error feedback.
- Close/minimize controls.
- Tool-action confirmation when needed.

The chat interface should remain compact and visually consistent with the cat companion.

## 7.5 Contextual Panels

Contextual panels will be used to display structured information from AI responses or tool results.

Examples:

- Search results.
- System information.
- File information.
- Screen analysis.
- Action confirmations.
- Summaries.
- Structured output.

Tables or larger panels should open only when the information requires them. The UI should avoid displaying large panels for simple conversational responses.

---

# 8. Functional Requirements

## 8.1 Companion Feature

**FR-COMP-01:** Display a floating pixel-art cat.

**FR-COMP-02:** The companion shall be movable using drag interaction.

**FR-COMP-03:** The companion shall support sleeping and idle states.

**FR-COMP-04:** Clicking the cat shall activate the assistant.

**FR-COMP-05:** The cat shall visually reflect the assistant's current state.

**FR-COMP-06:** The companion shall return to its idle state when the active interface is closed.

**FR-COMP-07:** The companion window shall support transparent rendering.

**FR-COMP-08:** The companion should remain above other windows where appropriate and where permitted by the operating system.

## 8.2 Chat Feature

**FR-CHAT-01:** Users shall be able to enter text prompts.

**FR-CHAT-02:** Users shall be able to send messages.

**FR-CHAT-03:** The application shall display AI responses.

**FR-CHAT-04:** The chat shall maintain context within the current conversation.

**FR-CHAT-05:** The chat shall support loading and error states.

**FR-CHAT-06:** The user shall be able to continue the conversation with follow-up messages.

**FR-CHAT-07:** The UI shall prevent duplicate requests caused by repeated sending while processing, where appropriate.

## 8.3 AI Assistant Feature

**FR-AI-01:** The application shall communicate with an AI provider through the backend.

**FR-AI-02:** API credentials shall not be exposed in frontend code.

**FR-AI-03:** AI requests shall be handled through a dedicated service layer.

**FR-AI-04:** AI provider integration should be replaceable.

**FR-AI-05:** The assistant shall support conversation context.

**FR-AI-06:** The assistant should support structured tool requests for approved desktop operations.

**FR-AI-07:** The application shall handle AI request failures gracefully.

## 8.4 Voice Feature

**FR-VOICE-01:** Users shall be able to initiate voice input.

**FR-VOICE-02:** Voice input shall be converted into text.

**FR-VOICE-03:** Transcribed text shall be usable as a chat message.

**FR-VOICE-04:** The application shall visually indicate listening state.

**FR-VOICE-05:** Users shall be able to stop voice input.

**FR-VOICE-06:** Text-to-speech may be used to deliver responses.

**FR-VOICE-07:** Voice services should be modular and replaceable.

**FR-VOICE-08:** Wake-word activation may be introduced in a later phase.

## 8.5 AI Engine

The AI engine will handle:

- User prompt processing.
- System prompt construction.
- Conversation context.
- AI provider communication.
- Response parsing.
- Tool request identification.
- Error handling.
- AI provider configuration.

## 8.6 System Control

The system-control feature will provide approved desktop operations.

Potential operations:

- Launch applications.
- Open websites.
- Retrieve system information.
- Access supported system functions.
- Execute predefined workflows.

All operations must be implemented through predefined tools, not unrestricted commands generated by the AI.

## 8.7 File Manager

The file-manager feature will support authorized file-related assistance.

Potential functionality:

- Browse permitted directories.
- Search files.
- Retrieve file metadata.
- Display file previews for supported formats.
- Open selected files or directories.
- Support future AI-assisted file analysis.

File operations involving modification or deletion must require appropriate safeguards.

## 8.8 Screen Vision

Screen vision will allow the user to request assistance based on their screen content.

Potential functionality:

- Capture a screenshot when requested.
- Display a preview before analysis when appropriate.
- Send approved captured content to the AI.
- Analyze visible content.
- Summarize a screen.
- Explain errors or UI elements.
- Answer questions about selected screen content.

Screen capture must be user-initiated or explicitly enabled through a clearly disclosed setting. Continuous screen monitoring is not part of the MVP.

## 8.9 Contextual Panels

Contextual panels provide structured UI for assistant output.

Possible components:

- Information cards.
- Result panels.
- Action panels.
- Confirmation panels.
- System information panels.
- File result panels.

The panel system should be reusable and controlled by the application's state and response type.

## 8.10 Settings

Settings should provide configuration for:

- General application behavior.
- AI provider configuration.
- Voice preferences.
- Theme preferences.
- Companion behavior.
- Permissions.
- Privacy controls.

Settings should be modular and expandable.

## 8.11 Permissions

The permission system should manage approval for potentially sensitive operations.

Examples requiring safeguards:

- File deletion.
- File modification.
- System configuration changes.
- Risky application operations.
- Potentially dangerous commands.
- Actions involving private contextual information.

The user must remain in control of operations executed by FlexiAura.

---

# 9. Feature-Based Modular Architecture

FlexiAura will use a **Feature-Based Modular Folder Structure**.

Instead of placing all components, hooks, services, and utilities in global folders, each feature will contain its own related code.

This is the official architecture for the project.

## Core Rules

1. Every feature owns its components.
2. Every feature owns its hooks.
3. Every feature owns its services.
4. Every feature owns its styles.
5. Every feature owns its utilities where applicable.
6. Feature-specific code must not be placed inside `shared/`.
7. `shared/` contains only reusable code used by multiple features.
8. Every feature should expose its public functionality through `index.js` where applicable.
9. Frontend, Node backend, and Tauri/Rust desktop layers remain logically separated.
10. Modules should communicate through defined interfaces rather than directly accessing another feature's internal files.
11. The structure must support three developers working in parallel.
12. Do not reorganize the structure without a valid architectural reason and discussion.

---

# 10. Official Project Folder Structure

The following is the approved project structure and should be used as the reference when creating new files.

```text
FlexiAura/
│
├── frontend/
│   ├── public/
│   │   ├── assets/
│   │   ├── icons/
│   │   └── animations/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   ├── AppRoutes.jsx
│   │   │   └── providers/
│   │   │       └── ThemeProvider.jsx
│   │   │
│   │   ├── features/
│   │   │   ├── companion/
│   │   │   │   ├── components/
│   │   │   │   │   ├── PixelCat.jsx
│   │   │   │   │   ├── CompanionWindow.jsx
│   │   │   │   │   └── CompanionStatus.jsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useCompanion.js
│   │   │   │   ├── styles/
│   │   │   │   │   └── companion.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── chat/
│   │   │   │   ├── components/
│   │   │   │   │   ├── ChatWindow.jsx
│   │   │   │   │   ├── MessageList.jsx
│   │   │   │   │   ├── MessageBubble.jsx
│   │   │   │   │   └── ChatInput.jsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useChat.js
│   │   │   │   ├── services/
│   │   │   │   │   └── chatService.js
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── voice/
│   │   │   │   ├── components/
│   │   │   │   │   ├── VoiceButton.jsx
│   │   │   │   │   ├── VoiceVisualizer.jsx
│   │   │   │   │   └── ListeningIndicator.jsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useSpeechRecognition.js
│   │   │   │   │   └── useTextToSpeech.js
│   │   │   │   ├── services/
│   │   │   │   │   └── voiceService.js
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── ai-assistant/
│   │   │   │   ├── components/
│   │   │   │   │   └── ThinkingIndicator.jsx
│   │   │   │   ├── services/
│   │   │   │   │   ├── aiService.js
│   │   │   │   │   └── contextService.js
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useAssistant.js
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── system-control/
│   │   │   │   ├── components/
│   │   │   │   │   ├── AppLauncher.jsx
│   │   │   │   │   ├── SystemInfo.jsx
│   │   │   │   │   └── ActionConfirmation.jsx
│   │   │   │   ├── services/
│   │   │   │   │   └── systemService.js
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useSystemControl.js
│   │ │   │   └── index.js
│   │   │   │
│   │   │   ├── file-manager/
│   │   │   │   ├── components/
│   │   │   │   │   ├── FileExplorer.jsx
│   │   │   │   │   ├── FilePreview.jsx
│   │   │   │   │   └── FileSearch.jsx
│   │   │   │   ├── services/
│   │   │   │   │   └── fileService.js
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── screen-vision/
│   │   │   │   ├── components/
│   │   │   │   │   └── ScreenCapturePreview.jsx
│   │   │   │   ├── services/
│   │   │   │   │   └── screenCaptureService.js
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── contextual-panels/
│   │   │   │   ├── components/
│   │   │   │   │   ├── ResultPanel.jsx
│   │   │   │   │   ├── InformationCard.jsx
│   │   │   │   │   └── ActionPanel.jsx
│   │   │   │   └── index.js
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── components/
│   │   │       │   ├── SettingsWindow.jsx
│   │   │       │   ├── GeneralSettings.jsx
│   │   │       │   └── PermissionSettings.jsx
│   │   │       ├── services/
│   │   │       │   └── settingsService.js
│   │   │       └── index.js
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Loader.jsx
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── styles/
│   │   │       ├── global.css
│   │   │       └── variables.css
│   │   │
│   │   └── assets/
│   │       ├── images/
│   │       └── fonts/
│   │
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── ai-engine/
│   │   │   │   ├── aiController.js
│   │   │   │   ├── aiService.js
│   │   │   │   ├── promptBuilder.js
│   │   │   │   └── contextManager.js
│   │   │   │
│   │   │   ├── voice/
│   │   │   │   ├── voiceHandler.js
│   │   │   │   └── speechProcessor.js
│   │   │   │
│   │   │   ├── system-control/
│   │   │   │   ├── systemController.js
│   │   │   │   ├── appLauncher.js
│   │   │   │   └── systemInfo.js
│   │   │   │
│   │   │   ├── file-manager/
│   │   │   │   ├── fileController.js
│   │   │   │   └── fileService.js
│   │   │   │
│   │   │   ├── screen-vision/
│   │   │   │   ├── captureController.js
│   │   │   │   └── visionService.js
│   │   │   │
│   │   │   ├── permissions/
│   │   │   │   ├── permissionManager.js
│   │   │   │   └── actionValidator.js
│   │   │   │
│   │   │   └── conversation/
│   │   │       ├── conversationManager.js
│   │   │       └── historyManager.js
│   │   │
│   │   ├── core/
│   │   │   ├── server.js
│   │   │   ├── websocket.js
│   │   │   ├── eventManager.js
│   │   │   └── config.js
│   │   │
│   │   ├── shared/
│   │   │   ├── middleware/
│   │   │   ├── validators/
│   │   │   ├── utils/
│   │   │   └── constants/
│   │   │
│   │   └── index.js
│   │
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands/
│   │   │   ├── window.rs
│   │   │   ├── system.rs
│   │   │   ├── files.rs
│   │   │   └── permissions.rs
│   │   ├── services/
│   │   └── lib.rs
│   │
│   ├── capabilities/
│   ├── icons/
│   └── tauri.conf.json
│
├── docs/
│   ├── architecture/
│   ├── diagrams/
│   ├── literature-survey/
│   ├── presentations/
│   └── reports/
│
├── tests/
│   ├── integration/
│   └── system/
│
├── .gitignore
├── README.md
└── LICENSE
```

**This structure is the architectural reference.** Additional files may be added inside the appropriate feature folders as the project evolves, but existing feature boundaries should be respected.

---

# 11. Feature Responsibilities

## 11.1 Companion (`companion/`)

Responsible for the desktop cat and its interaction.

Includes:

- PixelCat.
- Companion window.
- Companion status.
- Idle animation.
- Awake animation.
- Drag functionality.
- Click activation.
- State management.
- Companion-related styles.

## 11.2 Chat (`chat/`)

Responsible for the conversational UI.

Includes:

- Chat window.
- Message list.
- Message bubbles.
- Chat input.
- Message submission.
- Displaying responses.
- Chat UI state.
- Chat service.

## 11.3 Voice (`voice/`)

Responsible for voice input and output.

Includes:

- Voice button.
- Voice visualizer.
- Listening indicator.
- Speech recognition.
- Text-to-speech.
- Voice state management.
- Voice service abstraction.

## 11.4 AI Assistant (`ai-assistant/`)

Responsible for frontend integration with AI functionality.

Includes:

- Assistant hooks.
- AI frontend service.
- Context service.
- Thinking indicator.
- AI request and response handling.
- Assistant state.

## 11.5 System Control (`system-control/`)

Responsible for approved desktop operations.

Includes:

- Application launching.
- System information.
- Supported system actions.
- Action confirmation UI.
- Frontend system-control service.
- System-control hooks.

## 11.6 File Manager (`file-manager/`)

Responsible for file-related assistance.

Includes:

- File explorer.
- File preview.
- File search.
- Authorized file access.
- File-related UI and services.

## 11.7 Screen Vision (`screen-vision/`)

Responsible for screen capture and visual analysis.

Includes:

- Screen capture preview.
- Screen capture service.
- Capture requests.
- AI vision processing integration.

## 11.8 Contextual Panels (`contextual-panels/`)

Responsible for structured information displayed outside normal chat bubbles.

Includes:

- Result panel.
- Information cards.
- Action panels.
- Contextual display components.

## 11.9 Settings (`settings/`)

Responsible for application preferences and configuration UI.

Includes:

- General settings.
- Permission settings.
- User preferences.
- Settings service.
- Future AI and voice configuration interfaces.

---

# 12. Backend Architecture

The backend will use Node.js and a modular architecture.

It will be responsible for AI processing, conversation management, voice processing integrations, desktop-operation orchestration, screen-vision workflows, permission validation, and communication between the frontend and backend.

## 12.1 AI Engine (`ai-engine/`)

Responsibilities:

- AI provider communication.
- Prompt construction.
- Context management.
- Request processing.
- Response parsing.
- Tool-call interpretation.
- Error handling.

Files:

- `aiController.js`
- `aiService.js`
- `promptBuilder.js`
- `contextManager.js`

## 12.2 Voice (`voice/`)

Responsibilities:

- Voice request handling.
- Speech processing.
- Speech-to-text integration.
- Text-to-speech integration, where backend processing is required.

Files:

- `voiceHandler.js`
- `speechProcessor.js`

## 12.3 System Control (`system-control/`)

Responsibilities:

- Validated system-operation orchestration.
- Application launching.
- System information retrieval.
- Supported system actions.

Files:

- `systemController.js`
- `appLauncher.js`
- `systemInfo.js`

## 12.4 File Manager (`file-manager/`)

Responsibilities:

- File requests.
- Authorized file access.
- File search and metadata.
- File-related processing.

Files:

- `fileController.js`
- `fileService.js`

## 12.5 Screen Vision (`screen-vision/`)

Responsibilities:

- Screen capture request handling.
- Vision processing.
- Sending authorized screen data to AI.
- Handling vision results.

Files:

- `captureController.js`
- `visionService.js`

## 12.6 Permissions (`permissions/`)

Responsibilities:

- Permission checking.
- Action validation.
- Tool allowlisting.
- Approval workflow.
- Enforcement of security rules.

Files:

- `permissionManager.js`
- `actionValidator.js`

## 12.7 Conversation (`conversation/`)

Responsibilities:

- Current conversation state.
- Message history.
- Conversation context.
- Session lifecycle.
- Context delivery to AI.

Files:

- `conversationManager.js`
- `historyManager.js`

---

# 13. Core Backend Infrastructure

The `core/` directory contains backend infrastructure shared by backend modules.

### server.js

- Initializes the Node.js server.
- Configures middleware.
- Registers routes.
- Starts backend services.

### websocket.js

- Establishes WebSocket communication.
- Handles real-time events.
- Supports communication between the frontend and backend.

### eventManager.js

- Manages application events.
- Provides a centralized event-handling mechanism where needed.

### config.js

- Handles backend configuration.
- Reads environment variables.
- Provides validated configuration values.

---

# 14. Tauri and Rust Desktop Layer

The `src-tauri/` directory provides native desktop integration.

It is responsible for:

- Window management.
- Transparent windows.
- Desktop positioning.
- Native commands.
- OS-specific functionality.
- Secure frontend-to-native communication.
- Permissions and capability configuration.

## Commands

### `window.rs`

Responsible for native window-related operations.

Examples:

- Companion window behavior.
- Positioning.
- Window configuration.
- Supported window interactions.

### `system.rs`

Responsible for approved native system operations.

### `files.rs`

Responsible for native file operations that require desktop integration.

### `permissions.rs`

Responsible for permission-related native integration, where applicable.

### Rust Layer Principles

- Keep Rust focused on native desktop capabilities.
- Do not unnecessarily duplicate frontend logic in Rust.
- Do not bypass permission validation.
- Expose only required native commands.
- Maintain strict Tauri capabilities.
- Keep cross-platform behavior in mind.

---

# 15. Communication Architecture

FlexiAura uses distinct layers that communicate through defined interfaces.

## Frontend

React is responsible for:

- UI rendering.
- User interactions.
- Companion state.
- Chat state.
- Voice UI.
- Contextual panels.
- Settings UI.

## Node.js Backend

Node.js is responsible for:

- AI requests.
- Prompt and context management.
- Conversation orchestration.
- Backend modules.
- WebSocket communication.
- Validating AI tool requests.
- Managing workflows.

## Tauri/Rust

Tauri and Rust are responsible for:

- Native window functionality.
- Desktop integration.
- Approved OS operations.
- Secure native commands.

### Communication Flow

```text
User
  │
  ▼
React Frontend
  │
  ├── Companion / Chat / Voice / Panels
  │
  ▼
Application Orchestration
  │
  ├── AI Assistant
  ├── Voice
  ├── System Control
  ├── File Manager
  ├── Screen Vision
  └── Permissions
  │
  ▼
Node.js Backend
  │
  ├── AI Engine
  ├── Conversation
  ├── Tool Validation
  └── WebSocket Events
  │
  ▼
Validated Desktop Operations
  │
  ▼
Tauri / Rust Native Layer
  │
  ▼
Operating System
```

The exact communication method may vary by feature. WebSockets are intended for real-time communication, while Tauri commands are intended for native desktop operations.

The architecture must avoid unnecessary communication paths and clearly define which layer is responsible for each action.

---

# 16. Three-Member Team Division

FlexiAura is designed to be developed by three members working in parallel.

## Member 1 — Frontend & Companion Development

### Assigned Features

- `frontend/src/features/companion/`
- `frontend/src/features/chat/`
- `frontend/src/features/contextual-panels/`

### Responsibilities

- Pixel cat UI.
- Companion window interactions.
- Dragging and positioning.
- Idle and wake animations.
- Chat UI.
- Message display.
- Input handling.
- Contextual panels.
- Frontend integration.

### Deliverables

- Functional companion UI.
- Chat interface.
- Reusable contextual panels.
- Frontend integration-ready components.

---

## Member 2 — AI & Voice Development

### Assigned Features

- `frontend/src/features/ai-assistant/`
- `frontend/src/features/voice/`
- `backend/src/modules/ai-engine/`
- `backend/src/modules/voice/`
- `backend/src/modules/conversation/`

### Responsibilities

- AI provider integration.
- Prompt engineering.
- AI service.
- Context handling.
- Conversation management.
- Voice recognition.
- Text-to-speech.
- AI request and response handling.
- Voice and AI modularity.

### Deliverables

- Functional AI service.
- AI communication.
- Voice input.
- Voice output, where supported.
- Conversation context.
- Backend integration interfaces.

---

## Member 3 — System Integration & Security

### Assigned Features

- `frontend/src/features/system-control/`
- `frontend/src/features/file-manager/`
- `frontend/src/features/screen-vision/`
- `backend/src/modules/system-control/`
- `backend/src/modules/file-manager/`
- `backend/src/modules/screen-vision/`
- `backend/src/modules/permissions/`
- `src-tauri/`

### Responsibilities

- Desktop integration.
- System control.
- Application launching.
- File access.
- Screen capture.
- Native Tauri commands.
- Permission management.
- Action validation.
- Security testing.
- OS compatibility.

### Deliverables

- Approved desktop-operation tools.
- Native command integration.
- Permission validation.
- File-management capabilities.
- Screen-vision integration.
- Security safeguards.

---

# 17. Team Collaboration Rules

To reduce merge conflicts:

1. Each member should primarily work within their assigned feature directories.
2. Shared files should not be modified without coordinating with the team.
3. Changes to `App.jsx`, `main.jsx`, global styles, backend entry points, or configuration files should be coordinated.
4. Every feature should expose a public interface through its `index.js` when applicable.
5. Other features should consume public exports rather than importing internal implementation files.
6. Feature dependencies should be communicated before implementation.
7. Each member should test their feature independently before integration.
8. Integration should happen regularly instead of waiting until the end.
9. Do not create duplicate AI, voice, permission, or system services in different features.
10. Use Git branches or feature branches for parallel development.

---

# 18. Technology Stack

## 18.1 Current Technologies

| Technology | Purpose                                    |
| ---------- | ------------------------------------------ |
| Tauri 2    | Desktop application framework              |
| React 19   | Frontend UI                                |
| Vite       | Frontend build tool and development server |
| JavaScript | Frontend programming language              |
| Rust       | Native desktop backend                     |
| Node.js    | AI and application backend                 |
| npm        | Package management                         |
| WebSockets | Real-time communication                    |
| CSS        | Styling and animation                      |

## 18.2 Potential Integrations

| Technology                     | Purpose                          |
| ------------------------------ | -------------------------------- |
| Gemini API or another provider | Conversational AI                |
| Ollama                         | Potential local AI model support |
| Speech recognition provider    | Speech-to-text                   |
| TTS engine                     | Voice output                     |
| Native Tauri plugins           | Desktop integration              |
| Computer vision models         | Screen understanding             |

These are potential integrations and not all are finalized.

---

# 19. Security and Privacy Requirements

Security must be implemented at the architectural level.

## 19.1 AI Security

- API keys must never be exposed in frontend code.
- Secrets must be kept outside version control.
- AI responses must not be trusted as executable instructions.
- Tool requests must be validated before execution.
- Prompt injection must not bypass application permissions.

## 19.2 Desktop Operation Security

- No unrestricted terminal execution.
- No unrestricted shell access.
- No arbitrary command execution based solely on AI output.
- Tools must be explicitly registered and allowlisted.
- Tool inputs must be validated.
- Destructive actions must require confirmation.
- Execution must be logged where appropriate.
- Errors must be handled without exposing sensitive data.

## 19.3 Privacy

- Screen capture must be transparent and permission-based.
- Microphone usage must be clearly indicated.
- User data should not be sent unnecessarily.
- Voice data should not be retained unnecessarily.
- Contextual access must be limited to the user's intended action.
- The assistant should not continuously monitor the screen by default.

## 19.4 Permission Model

Example permission levels:

| Level   | Description                                       |
| ------- | ------------------------------------------------- |
| Level 0 | No desktop access                                 |
| Level 1 | Read-only approved information                    |
| Level 2 | Non-destructive approved actions                  |
| Level 3 | Sensitive actions requiring explicit confirmation |

The permission model should be configurable and refined during implementation.

---

# 20. Non-Functional Requirements

## Performance

- Low idle CPU usage.
- Minimal memory footprint.
- Efficient rendering.
- No unnecessary background polling.
- No blocking UI during AI requests.

## Responsiveness

- Smooth drag interaction.
- Fast UI state transitions.
- Immediate feedback for user actions.
- Non-blocking operations.

## Reliability

- Graceful AI failures.
- Graceful voice failures.
- Safe tool failure handling.
- Recoverable errors.
- Stable long-running application behavior.

## Maintainability

- Feature-based folder architecture.
- Clear module interfaces.
- Separate frontend and backend responsibilities.
- Avoid unnecessary dependencies.
- Keep feature code isolated.

## Scalability

The application should be able to support additional AI providers, tools, desktop integrations, voice features, and platform-specific functionality without major restructuring.

## Compatibility

The initial implementation targets Windows. Future compatibility is planned for Linux and macOS.

---

# 21. Development Roadmap

## Phase 1 — Desktop Foundation

- [x] Tauri application created.
- [x] React and Vite configured.
- [x] Rust environment installed.
- [x] Windows build environment working.
- [x] Release build successfully compiled.
- [ ] Implement transparent companion window.
- [ ] Implement floating desktop behavior.
- [ ] Implement cat display.
- [ ] Implement dragging.
- [ ] Implement idle state.

## Phase 2 — Companion UI

- [ ] Create pixel-art cat assets.
- [ ] Create companion component.
- [ ] Implement sleeping state.
- [ ] Implement awake state.
- [ ] Implement click-to-wake.
- [ ] Implement state transitions.
- [ ] Connect companion to chat activation.

## Phase 3 — Chat UI

- [ ] Create chat window.
- [ ] Create message list.
- [ ] Create message bubbles.
- [ ] Create input component.
- [ ] Implement send action.
- [ ] Implement loading state.
- [ ] Implement error state.
- [ ] Connect chat with AI service.

## Phase 4 — AI Backend

- [ ] Set up backend project.
- [ ] Implement server.
- [ ] Configure environment variables.
- [ ] Implement AI provider service.
- [ ] Implement prompt builder.
- [ ] Implement context manager.
- [ ] Implement conversation manager.
- [ ] Connect frontend and backend.
- [ ] Implement WebSocket events as needed.
- [ ] Add error handling.

## Phase 5 — Voice

- [ ] Implement speech recognition.
- [ ] Add listening state.
- [ ] Connect transcription to chat.
- [ ] Implement voice visualizer.
- [ ] Implement text-to-speech.
- [ ] Add voice settings.
- [ ] Investigate wake-word activation.

## Phase 6 — System Control

- [ ] Implement system tool registry.
- [ ] Implement application launching.
- [ ] Implement system information retrieval.
- [ ] Add action confirmation.
- [ ] Implement validation.
- [ ] Integrate Tauri commands.
- [ ] Add permission management.
- [ ] Test desktop operations.

## Phase 7 — File Manager

- [ ] Implement authorized directory access.
- [ ] Implement file search.
- [ ] Implement file metadata.
- [ ] Implement file previews.
- [ ] Implement safe file operations.
- [ ] Add file permission safeguards.

## Phase 8 — Screen Vision

- [ ] Implement user-triggered screen capture.
- [ ] Implement capture preview.
- [ ] Integrate vision model.
- [ ] Implement screen analysis.
- [ ] Connect results to chat/contextual panels.
- [ ] Test privacy and permission controls.

## Phase 9 — Contextual Panels & Settings

- [ ] Implement information cards.
- [ ] Implement result panels.
- [ ] Implement action panels.
- [ ] Implement settings window.
- [ ] Implement general settings.
- [ ] Implement permission settings.
- [ ] Implement AI/voice configuration as needed.

## Phase 10 — Testing and Release

- [ ] Unit tests.
- [ ] Feature tests.
- [ ] Integration tests.
- [ ] Desktop operation security tests.
- [ ] Performance testing.
- [ ] Long-session stability testing.
- [ ] Build installer.
- [ ] Prepare project documentation.

## Phase 11 — Cross-Platform Expansion

- [ ] Test Linux compatibility.
- [ ] Implement Linux-specific integrations.
- [ ] Test macOS compatibility.
- [ ] Implement macOS-specific integrations.
- [ ] Test native window behavior.
- [ ] Prepare platform-specific builds.

---

# 22. MVP Scope

The initial MVP should focus on delivering a functional desktop companion.

## Required MVP Features

1. Standalone desktop application.
2. Floating transparent window.
3. Pixel-art black cat with white outline.
4. Movable companion.
5. Sleeping idle state.
6. Click-to-wake.
7. Chat interface.
8. AI text interaction.
9. Conversation context.
10. Thinking indicator.
11. Error handling.
12. Basic voice input, if feasible within MVP timeline.
13. Basic application launching, if feasible.
14. Modular architecture.

## Prioritization

**Must Have**

- Companion.
- Desktop interaction.
- Chat UI.
- AI connection.

**Should Have**

- Voice input.
- Text-to-speech.
- Basic system control.

**Could Have**

- Screen vision.
- File manager.
- Contextual panels.
- Custom settings.

**Future**

- Wake word.
- Local AI.
- Advanced automation.
- Persistent memory.
- Plugin ecosystem.

---

# 23. Testing Strategy

## Unit Testing

Test isolated functions and modules:

- State transitions.
- Prompt construction.
- Input validation.
- Permission checks.
- Tool argument validation.
- Context management.

## Feature Testing

Test each feature independently:

- Companion dragging and state.
- Chat input and message rendering.
- AI response processing.
- Voice capture and transcription.
- File operations.
- System-control tools.
- Screen capture.

## Integration Testing

Test the connection between:

- Frontend and Node.js backend.
- Frontend and Tauri commands.
- AI engine and conversation manager.
- Tool router and permission system.
- Screen vision and AI engine.

## System Testing

Test the entire application:

- Launch.
- Companion display.
- Activation.
- Chat.
- Voice.
- Tool execution.
- Error handling.
- Exit and restart.

---

# 24. Git and Version Control Strategy

The project should use Git for collaboration.

Suggested branch structure:

- `main` — stable project version.
- `develop` — integrated development branch.
- `feature/companion` — companion work.
- `feature/chat` — chat UI.
- `feature/ai-voice` — AI and voice.
- `feature/system-integration` — system control and native integration.
- Other branches as needed.

### Commit guidelines

- Use descriptive commit messages.
- Commit one logical change at a time.
- Do not commit `.env` files.
- Do not commit API keys.
- Do not commit build artifacts unnecessarily.
- Review changes before merging.
- Integrate feature branches frequently.

---

# 25. Constraints and Limitations

- AI responses depend on the selected AI provider.
- Cloud AI requires network connectivity.
- Local AI performance depends on hardware.
- Voice recognition may vary by OS and provider.
- Wake-word functionality may increase CPU usage.
- Desktop integrations vary between operating systems.
- File access must respect permissions.
- Screen analysis may require transmitting captured content to an AI provider.
- Native window behavior differs between Windows, Linux, and macOS.
- Cross-platform support will require testing and platform-specific implementations.

---

# 26. Success Criteria

FlexiAura will be considered successful when the application:

- Runs as a standalone desktop application.
- Displays a floating pixel-art cat.
- Allows the cat to be moved freely.
- Supports sleeping and awake states.
- Opens an assistant interface when activated.
- Supports AI-powered conversations.
- Maintains current conversation context.
- Supports voice interaction.
- Can perform selected desktop operations.
- Uses permission-based execution.
- Handles failures gracefully.
- Maintains low idle resource usage.
- Follows the approved modular architecture.
- Supports parallel development by three members.
- Has a clear path toward cross-platform support.

---

# 27. Current Development Environment and Status

## Project Environment

| Item                    | Value                           |
| ----------------------- | ------------------------------- |
| Project Name            | FlexiAura                       |
| Root Directory          | `E:\FlexiAura`                  |
| Existing App Directory  | `E:\FlexiAura\flexiaura-app`    |
| Target New Architecture | Feature-based modular structure |
| OS                      | Windows                         |
| Desktop Framework       | Tauri 2                         |
| Frontend                | React 19                        |
| Build Tool              | Vite                            |
| Frontend Language       | JavaScript                      |
| Native Backend          | Rust                            |
| Node Version            | v24.21.0                        |
| npm Version             | v11.19.0                        |
| Rust/Cargo              | Installed and working           |
| Build Status            | Release compilation successful  |

## Completed Setup

- Project directory created.
- Tauri desktop application created.
- React frontend configured.
- Vite environment working.
- Rust toolchain installed.
- Tauri API dependencies configured.
- Windows compilation successful.
- Release executable generated.

## Important Architecture Transition

The initial application was created using the standard Tauri React template in:

`E:\FlexiAura\flexiaura-app`

The approved architecture now separates the application into:

- `frontend/`
- `backend/`
- `src-tauri/`
- `docs/`
- `tests/`

The existing application must be transitioned carefully into the approved architecture. Do not delete or recreate the existing Tauri application unnecessarily. Preserve working configuration and dependencies unless a change is required.

---

# 28. Documentation Requirements

The `docs/` directory is intended to contain project documentation.

### architecture/

- System architecture.
- Module responsibilities.
- Communication design.
- Technical decisions.

### diagrams/

- Architecture diagrams.
- Data-flow diagrams.
- Sequence diagrams.
- Feature workflows.

### literature-survey/

- Related research.
- IEEE papers.
- AI desktop assistant research.
- Voice interaction research.
- Desktop automation research.

### presentations/

- Project presentations.
- Phase presentations.
- Demo slides.

### reports/

- Project reports.
- Testing reports.
- Development documentation.

---

# 29. AI Development Instructions

Any AI model assisting with FlexiAura development must treat this document as the project's primary source of truth.

## Architecture Rules

- Follow the approved feature-based folder structure.
- Do not replace it with a generic layered frontend structure.
- Do not place feature-specific code in `shared/`.
- Keep frontend, Node.js backend, and Rust/Tauri responsibilities separate.
- Use `index.js` as feature entry points where applicable.
- Respect the three-member division of work.
- Do not arbitrarily rename features or directories.
- Do not introduce dependencies without justification.
- Do not restructure the application without discussing the reason.

## UI Rules

- The assistant is a pixel-art black cat.
- The cat must have a white outline.
- The companion must be movable.
- The companion should be minimal and non-intrusive.
- Do not use an orb design.
- Do not turn the application into a conventional web dashboard.
- Do not unnecessarily open large panels for simple answers.

## Security Rules

- Do not implement unrestricted shell execution.
- Do not allow AI responses to directly execute commands.
- Validate all tool requests.
- Require permission for sensitive operations.
- Keep secrets out of the frontend.
- Never bypass the permission system.

## Development Rules

When guiding the user through development:

1. Work one step at a time.
2. Explain the purpose of the current step.
3. Provide the exact file path.
4. Give complete code when needed.
5. Provide exact terminal commands.
6. Explain how to test the changes.
7. Wait for confirmation before proceeding to the next major step.
8. Do not assume the code was executed.
9. Troubleshoot errors before moving on.
10. Avoid giving a large number of implementation steps in one response.
11. Respect the user's existing code and project state.
12. Prefer functional, tested implementation over premature abstraction.

---

# 30. Final Project Summary

FlexiAura is a cross-platform AI desktop companion built around a floating pixel-art black cat.

The cat remains on the desktop in a sleeping or idle state. The user can activate it to access a conversational AI interface supporting text, voice, contextual assistance, and selected computer operations.

The project uses:

- **React 19 + Vite + JavaScript** for the frontend.
- **Node.js** for AI and application backend services.
- **Tauri 2 + Rust** for native desktop integration.
- **WebSockets** for real-time communication where appropriate.
- **Feature-based modular architecture** for maintainability and parallel development.

The project is divided among three team members:

1. Frontend & Companion Development.
2. AI & Voice Development.
3. System Integration & Security.

The initial goal is to build a stable MVP containing the floating cat companion, activation, chat interface, and AI interaction. Voice, system control, file manager, screen vision, contextual panels, and expanded settings will be developed incrementally.

**Core principle: Build a useful desktop companion first, then gradually evolve it into a secure, intelligent, context-aware AI assistant.**

**Keep it lightweight. Keep it modular. Keep it secure. Keep the cat.**
