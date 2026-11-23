
use crate::services::application_service;

#[tauri::command]
pub fn launch_application(app_id: String) -> Result<String, String> {
    application_service::launch_application(&app_id)
}
