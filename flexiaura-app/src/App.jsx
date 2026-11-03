
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getSystemInfo } from "./features/system-control/services/systemService";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [systemInfo, setSystemInfo] = useState(null);
  const [error, setError] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  async function fetchSystemInfo() {
    try {
      setError("");
      const info = await getSystemInfo();
      setSystemInfo(info);
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <main className="container">
      <h1>FlexiAura</h1>
      <p>AI Desktop Assistant</p>

      <section>
        <h2>Rust Connection Test</h2>

        <button onClick={fetchSystemInfo}>
          Get System Information
        </button>

        {systemInfo && (
          <div>
            <p>Operating System: {systemInfo.operatingSystem}</p>
            <p>Architecture: {systemInfo.architecture}</p>
            <p>Hostname: {systemInfo.hostname}</p>
            <p>App Status: {systemInfo.appStatus}</p>
          </div>
        )}

        {error && <p>Error: {error}</p>}
      </section>

      <hr />

      <section>
        <h2>Greet Test</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            greet();
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Enter a name..."
          />
          <button type="submit">Greet</button>
        </form>

        <p>{greetMsg}</p>
      </section>
    </main>
  );
}

export default App;
