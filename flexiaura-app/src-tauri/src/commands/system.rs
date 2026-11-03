use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfo {
    pub operating_system: String,
    pub architecture: String,
    pub hostname: String,
    pub app_status: String,
}

#[tauri::command]
pub fn get_system_info() -> SystemInfo {
    let hostname = std::env::var("COMPUTERNAME")
        .or_else(|_| std::env::var("HOSTNAME"))
        .unwrap_or_else(|_| "Unknown".to_string());

    SystemInfo {
        operating_system: std::env::consts::OS.to_string(),
        architecture: std::env::consts::ARCH.to_string(),
        hostname,
        app_status: "Running".to_string(),
    }
}