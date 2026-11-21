use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MemoryInfo {
    pub total_memory: u64,
    pub used_memory: u64,
    pub available_memory: u64,
    pub usage_percentage: f64,
}