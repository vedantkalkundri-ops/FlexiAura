import {
  selectFolder,
  getDirectoryContents,
  approveDirectory
} from "./features/system-control/services/fileService.js";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getSystemInfo } from "./features/system-control/services/systemService";
import { AssistantPanel } from "./features/ai-assistant";
import "./App.css";
import { getMemoryInfo } from "./features/system-control/services/memoryService";
import { getCpuInfo } from "./features/system-control/services/cpuService";
import { launchApplication } from "./features/system-control/services/applicationService";

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

  //launch application
  const [applicationStatus, setApplicationStatus] = useState("");
  const [applicationError, setApplicationError] = useState("");

  async function handleLaunchApplication(appId) {
    try {
      setApplicationError("");
      setApplicationStatus("");

      const result = await launchApplication(appId);
      setApplicationStatus(result);
    } catch (error) {
      setApplicationError(String(error));
    }
  }

  //fileServices
  const [selectedFolder, setSelectedFolder] = useState("");
  const [files, setFiles] = useState([]);
  const [fileManagerError, setFileManagerError] = useState("");
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  async function handleSelectFolder() {
    try {
      setFileManagerError("");

      const folderPath = await selectFolder();

      // User cancelled the folder picker
      if (!folderPath) {
        return;
      }

      setIsLoadingFiles(true);

      const approvedPath = await approveDirectory(folderPath);

      const contents = await getDirectoryContents(approvedPath);

      setSelectedFolder(folderPath);
      setFiles(contents);
    } catch (error) {
      setFileManagerError(String(error));
      setFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  }

  async function navigateToFolder(path) {
    try {
      setFileManagerError("");
      setIsLoadingFiles(true);

      const contents = await getDirectoryContents(path);

      setSelectedFolder(path);
      setFiles(contents);
    } catch (error) {
      setFileManagerError(String(error));
    } finally {
      setIsLoadingFiles(false);
    }
  }

  async function navigateBack() {
    if (!selectedFolder) return;

    const parentPath = selectedFolder.replace(/[\\/]+$/, "");

    const lastSeparator = Math.max(
      parentPath.lastIndexOf("\\"),
      parentPath.lastIndexOf("/")
    );

    if (lastSeparator < 0) return;

    const parent = parentPath.substring(0, lastSeparator) || parentPath.substring(0, 1);

    await navigateToFolder(parent);
  }

  return (
    <main className="container">
      <h1>FlexiAura</h1>
      <p>AI Desktop Assistant</p>

      {/* SYSTEM INFO */}

      <section>
        <AssistantPanel />
      </section>

      <hr />

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

      {/* GREET*/}

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

      {/* RAM MONITORING */}

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

      {/* CPU MONITORING */}
      
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

      <hr />

      {/* application control */}

      <section>
        <h2>Application Control</h2>

        <button onClick={() => handleLaunchApplication("notepad")}>
          Open Notepad
        </button>

        <button onClick={() => handleLaunchApplication("calculator")}>
          Open Calculator
        </button>

        {applicationStatus && (
          <p>{applicationStatus}</p>
        )}

        {applicationError && (
          <p>Error: {applicationError}</p>
        )}
      </section>

      <hr />

      {/* File manager */}

      <section>
        <h2>File Manager</h2>

        <button onClick={handleSelectFolder}>
          Browse Folder
        </button>

        {selectedFolder && (
          <div>
            <button onClick={navigateBack}>
              ← Back
            </button>

            <p>Current Location: {selectedFolder}</p>
          </div>
        )}

        {selectedFolder && (
          <div>
            <h3>Selected Folder</h3>
            <p>{selectedFolder}</p>
          </div>
        )}

        {isLoadingFiles && <p>Loading files...</p>}

        {files.length > 0 && (
          <div>
            <h3>Folder Contents</h3>

            {files.map((file) => (
              <div key={file.path}>
                <p>
                  {file.isDirectory ? "📁" : "📄"}{" "}

                  {file.isDirectory ? (
                    <button onClick={() => navigateToFolder(file.path)}>
                      {file.name}
                    </button>
                  ) : (
                    file.name
                  )}
                </p>

                {!file.isDirectory && (
                  <small>
                    Size: {file.size} bytes
                  </small>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedFolder && files.length === 0 && !isLoadingFiles && (
          <p>This folder is empty.</p>
        )}

        {fileManagerError && (
          <p>Error: {fileManagerError}</p>
        )}
      </section>

    </main>
  );
}

export default App;
