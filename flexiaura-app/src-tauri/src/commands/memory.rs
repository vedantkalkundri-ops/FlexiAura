
use crate::models::memory_info::MemoryInfo;
use crate::services::memory_service;

#[tauri::command]
pub fn get_memory_info() -> Result<MemoryInfo, String> {
    memory_service::get_memory_information()
}
