
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getSystemInfo } from "./features/system-control/services/systemService";
import "./App.css";
import { getMemoryInfo } from "./features/system-control/services/memoryService";
import { getCpuInfo } from "./features/system-control/services/cpuService";

function App() {
  //System info and Greet
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
  
  //Memory Service
  const [memoryInfo, setMemoryInfo] = useState(null);
  const [memoryError, setMemoryError] = useState("");

  async function fetchMemoryInfo() {
    try {
      setMemoryError("");
      const info = await getMemoryInfo();
      setMemoryInfo(info);
    } catch (error) {
      setMemoryError(String(error));
    }
  }

  //CPU Service
  const [cpuInfo, setCpuInfo] = useState(null);
  const [cpuError, setCpuError] = useState("");

  async function fetchCpuInfo() {
    try {
      setCpuError("");
      const info = await getCpuInfo();
      setCpuInfo(info);
    } catch (error) {
      setCpuError(String(error));
    }
  }

  useEffect(() => {
    // Fetch information immediately when the app opens
    fetchMemoryInfo();
    fetchCpuInfo();

    // Automatically refresh every 2 seconds
    const intervalId = setInterval(() => {
      fetchMemoryInfo();
      fetchCpuInfo();
    }, 2000);

    // Stop monitoring when the component is removed
    return () => {
      clearInterval(intervalId);
    };
  }, []);

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

      <section>
        <h2>RAM Monitoring</h2>

        <button onClick={fetchMemoryInfo}>
          Check RAM Usage
        </button>

        {memoryInfo && (
          <div>
            <p>
              Total RAM: {(memoryInfo.totalMemory / 1024 ** 3).toFixed(2)} GB
            </p>

            <p>
              Used RAM: {(memoryInfo.usedMemory / 1024 ** 3).toFixed(2)} GB
            </p>

            <p>
              Available RAM: {(memoryInfo.availableMemory / 1024 ** 3).toFixed(2)} GB
            </p>

            <p>
              RAM Usage: {memoryInfo.usagePercentage.toFixed(2)}%
            </p>
          </div>
        )}

        {memoryError && <p>Error: {memoryError}</p>}
      </section>

      
      <hr />

      <section>
        <h2>CPU Monitoring</h2>

        <button onClick={fetchCpuInfo}>
          Check CPU Usage
        </button>

        {cpuInfo && (
          <div>
            <p>CPU Name: {cpuInfo.cpuName}</p>
            <p>CPU Usage: {cpuInfo.cpuUsage.toFixed(2)}%</p>
            <p>Logical Processors: {cpuInfo.coreCount}</p>
            <p>Frequency: {(cpuInfo.frequency / 1000).toFixed(2)} GHz</p>
          </div>
        )}

        {cpuError && <p>Error: {cpuError}</p>}
      </section>

      
    </main>
  );
}

export default App;
