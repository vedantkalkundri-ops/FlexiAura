
import { invoke } from "@tauri-apps/api/core";

export async function getCpuInfo() {
  try {
    return await invoke("get_cpu_info");
  } catch (error) {
    console.error("Failed to retrieve CPU information:", error);
    throw error;
  }
}
