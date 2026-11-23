
use std::process::Command;

pub fn launch_application(app_id: &str) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let executable = match app_id {
            "notepad" => "notepad.exe",
            "calculator" => "calc.exe",
            _ => {
                return Err("Application is not in the allowed list.".to_string());
            }
        };

        Command::new(executable)
            .spawn()
            .map_err(|error| format!("Failed to launch application: {error}"))?;

        return Ok(format!("Successfully launched {app_id}."));
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = app_id;
        Err("Application launching is not yet supported on this platform.".to_string())
    }
}
