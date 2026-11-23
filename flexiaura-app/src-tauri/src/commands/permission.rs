
use tauri::State;

use crate::services::permission_service::{
    self,
    ApprovedDirectories,
};

#[tauri::command]
pub fn approve_directory(
    path: String,
    approved: State<'_, ApprovedDirectories>,
) -> Result<String, String> {
    permission_service::approve_directory(&path, &approved)
}
