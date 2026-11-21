mod commands {
    pub mod system;
    pub mod memory;
    pub mod cpu;
}

mod models {
    pub mod system_info;
    pub mod memory_info;
    pub mod cpu_info;
}

mod services {
    pub mod system_service;
    pub mod memory_service;
    pub mod cpu_service;
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]

fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::system::get_system_info,
            commands::memory::get_memory_info,
            commands::cpu::get_cpu_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
