
use sysinfo::System;

use crate::models::cpu_info::CpuInfo;

pub fn get_cpu_information() -> Result<CpuInfo, String> {
    // Initialize system information provider
    let mut system = System::new()
        .map_err(|error| format!("Failed to initialize system: {error}"))?;

    // First CPU refresh
    system.refresh_cpu_all();

    // Wait to obtain a meaningful CPU usage measurement
    std::thread::sleep(std::time::Duration::from_millis(500));

    // Second CPU refresh
    system.refresh_cpu_all();

    let cpus = system.cpus();

    let cpu_name = cpus
        .first()
        .map(|cpu| cpu.brand().to_string())
        .unwrap_or_else(|| "Unknown".to_string());

    let cpu_usage = if cpus.is_empty() {
        0.0
    } else {
        cpus.iter()
            .map(|cpu| cpu.usage())
            .sum::<f32>() / cpus.len() as f32
    };

    let core_count = cpus.len();

    let frequency = cpus
        .first()
        .map(|cpu| cpu.frequency())
        .unwrap_or(0);

    Ok(CpuInfo {
        cpu_name,
        cpu_usage,
        core_count,
        frequency,
    })
}
