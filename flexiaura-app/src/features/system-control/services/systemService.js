import { invoke } from "@tauri-apps/api/core";

export async function getSystemInfo() {
  try {
    const systemInfo = await invoke("get_system_info");
    return systemInfo;
  } catch (error) {
    console.error("Failed to retrieve system information:", error);
    throw error;
  }
}