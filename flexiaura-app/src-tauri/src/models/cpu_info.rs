
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CpuInfo {
    pub cpu_name: String,
    pub cpu_usage: f32,
    pub core_count: usize,
    pub frequency: u64,
}
