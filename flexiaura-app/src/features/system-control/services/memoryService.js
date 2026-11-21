import { invoke } from "@tauri-apps/api/core";

export async function getMemoryInfo() {
  try {
    return await invoke("get_memory_info");
  } catch (error) {
    console.error("Failed to retrieve memory information:", error);
    throw error;
  }
}