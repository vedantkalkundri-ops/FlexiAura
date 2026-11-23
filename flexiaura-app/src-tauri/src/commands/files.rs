
use crate::models::file_info::FileInfo;
use crate::services::file_service;

#[tauri::command]
pub fn list_directory(path: String) -> Result<Vec<FileInfo>, String> {
    file_service::list_directory(&path)
}
