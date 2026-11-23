
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

export async function selectFolder() {
  try {
    const selectedPath = await open({
      directory: true,
      multiple: false,
      title: "Select a folder for FlexiAura"
    });

    return selectedPath;
  } catch (error) {
    console.error("Folder selection failed:", error);
    throw error;
  }
}

export async function getDirectoryContents(path) {
  try {
    return await invoke("list_directory", { path });
  } catch (error) {
    console.error("Failed to read directory:", error);
    throw error;
  }
}

export async function approveDirectory(path) {
  try {
    return await invoke("approve_directory", { path });
  } catch (error) {
    console.error("Directory approval failed:", error);
    throw error;
  }
}
