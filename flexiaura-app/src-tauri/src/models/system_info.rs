use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfo {
    pub operating_system: String,
    pub architecture: String,
    pub hostname: String,
    pub app_status: String,
}