
use std::path::PathBuf;
use std::sync::Mutex;

pub type ApprovedDirectories = Mutex<Vec<PathBuf>>;

pub fn approve_directory(
    path: &str,
    approved: &ApprovedDirectories,
) -> Result<String, String> {
    let canonical_path = std::fs::canonicalize(path)
        .map_err(|error| format!("Invalid directory: {error}"))?;

    if !canonical_path.is_dir() {
        return Err("Selected path is not a directory.".to_string());
    }

    let mut directories = approved
        .lock()
        .map_err(|_| "Permission lock failed.".to_string())?;

    if !directories.contains(&canonical_path) {
        directories.push(canonical_path.clone());
    }

    Ok(canonical_path.to_string_lossy().into_owned())
}

pub fn is_directory_approved(
    path: &str,
    approved: &ApprovedDirectories,
) -> Result<bool, String> {
    let canonical_path = std::fs::canonicalize(path)
        .map_err(|error| format!("Invalid path: {error}"))?;

    let directories = approved
        .lock()
        .map_err(|_| "Permission lock failed.".to_string())?;

    Ok(directories.iter().any(|root| canonical_path.starts_with(root)))
}
