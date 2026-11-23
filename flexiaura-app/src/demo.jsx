import React from "react";
import ReactDOM from "react-dom/client";
import { AssistantPanel } from "./features/ai-assistant";
import "./demo.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <main className="demo-page">
      <header className="demo-header">
        <h1>FlexiAura AI Demo</h1>
        <p>
          Basic chat and voice test frontend. The backend must be running on
          http://localhost:3000.
        </p>
      </header>

      <AssistantPanel />

      <footer className="demo-footer">
        <p>
          Text input works in any browser. Voice input and speech output require
          Web Speech API support and microphone permission.
        </p>
      </footer>
    </main>
  </React.StrictMode>,
);
