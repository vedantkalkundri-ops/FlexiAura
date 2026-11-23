
use sysinfo::System;

use crate::models::memory_info::MemoryInfo;

pub fn get_memory_information() -> Result<MemoryInfo, String> {
    // Initialize the system information provider
    let mut system = System::new()
        .map_err(|error| format!("Failed to initialize system: {error}"))?;

    // Refresh RAM information
    system.refresh_memory();

    // Retrieve memory values in bytes
    let total_memory = system.total_memory();
    let used_memory = system.used_memory();
    let available_memory = system.available_memory();

    // Calculate RAM usage percentage safely
    let usage_percentage = if total_memory > 0 {
        (used_memory as f64 / total_memory as f64) * 100.0
    } else {
        0.0
    };

    // Return structured memory information
    Ok(MemoryInfo {
        total_memory,
        used_memory,
        available_memory,
        usage_percentage,
    })
}
