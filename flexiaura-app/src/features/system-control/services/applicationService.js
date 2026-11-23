
import { invoke } from "@tauri-apps/api/core";

export async function launchApplication(appId) {
  try {
    return await invoke("launch_application", { appId });
  } catch (error) {
    console.error("Failed to launch application:", error);
    throw error;
  }
}
