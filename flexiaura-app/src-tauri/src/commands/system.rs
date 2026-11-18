use crate::services::system_service;

#[tauri::command]
pub fn get_system_info() -> crate::models::system_info::SystemInfo {
    system_service::get_system_information()
}