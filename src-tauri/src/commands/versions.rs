//! Version history Tauri commands.

use crate::models::Project;
use crate::storage::ProjectStore;
use std::sync::MutexGuard;

type Store<'a> = MutexGuard<'a, ProjectStore>;

/// Save a full snapshot of the current project as a new version.
#[tauri::command]
pub async fn snapshot_project(
    store: tauri::State<'_, std::sync::Mutex<ProjectStore>>,
    project: Project,
    label: String,
) -> Result<crate::models::Version, String> {
    let store = store.lock().unwrap();
    store.snapshot_project(&project, &label).map_err(|e| e.to_string())
}

/// List all saved versions for a project, newest first.
#[tauri::command]
pub async fn list_versions(
    store: tauri::State<'_, std::sync::Mutex<ProjectStore>>,
    project_id: String,
) -> Result<Vec<crate::models::Version>, String> {
    let store = store.lock().unwrap();
    store.list_versions(&project_id).map_err(|e| e.to_string())
}

/// Restore a project to a saved version (creates a new editable copy).
#[tauri::command]
pub async fn restore_version(
    store: tauri::State<'_, std::sync::Mutex<ProjectStore>>,
    project_id: String,
    version_id: String,
) -> Result<Project, String> {
    let store = store.lock().unwrap();
    store.restore_version(&project_id, &version_id).map_err(|e| e.to_string())
}

/// Return a textual diff between two versions.
#[tauri::command]
pub async fn compare_versions(
    store: tauri::State<'_, std::sync::Mutex<ProjectStore>>,
    version_a: String,
    version_b: String,
) -> Result<String, String> {
    let store = store.lock().unwrap();
    store.compare_versions(&version_a, &version_b).map_err(|e| e.to_string())
}