
use std::fs;

use crate::models::file_info::FileInfo;

pub fn list_directory(path: &str) -> Result<Vec<FileInfo>, String> {
    let entries = fs::read_dir(path)
        .map_err(|error| format!("Unable to read directory: {error}"))?;

    let mut files = Vec::new();

    for entry in entries {
        let entry = entry
            .map_err(|error| format!("Unable to read entry: {error}"))?;

        let metadata = entry
            .metadata()
            .map_err(|error| format!("Unable to read metadata: {error}"))?;

        files.push(FileInfo {
            name: entry.file_name().to_string_lossy().into_owned(),
            path: entry.path().to_string_lossy().into_owned(),
            is_directory: metadata.is_dir(),
            size: if metadata.is_file() {
                Some(metadata.len())
            } else {
                None
            },
        });
    }

    files.sort_by(|a, b| {
        b.is_directory
            .cmp(&a.is_directory)
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(files)
}
