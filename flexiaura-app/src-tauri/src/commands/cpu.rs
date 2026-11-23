
use crate::models::cpu_info::CpuInfo;
use crate::services::cpu_service;

#[tauri::command]
pub fn get_cpu_info() -> Result<CpuInfo, String> {
    cpu_service::get_cpu_information()
}
