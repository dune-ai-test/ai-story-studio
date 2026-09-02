//! Project create/load/save Tauri commands.
//!
//! The frontend calls these via `invoke('create_project', ...)`.

use crate::models::Project;
use crate::storage::ProjectStore;

use serde::Serialize;

#[derive(Serialize)]
pub struct SaveResult {
    pub ok: bool,
    pub state: String, // "saved" | "saving" | "error"
    pub message: Option<String>,
}

/// Create a new project with the given title and persist it.
#[tauri::command]
pub async fn create_project(
    store: tauri::State<'_, std::sync::Mutex<ProjectStore>>,
    title: String,
) -> Result<Project, String> {
    let store = store.lock().unwrap();
    store.new_project(&title).map_err(|e| e.to_string())
}

/// Load an existing project by id.
#[tauri::command]
pub async fn load_project(
    store: tauri::State<'_, std::sync::Mutex<ProjectStore>>,
    id: String,
) -> Result<Project, String> {
    let store = store.lock().unwrap();
    store.load_project(&id).map_err(|e| e.to_string())
}

/// Save a project (autosave entry point). Returns the save state.
#[tauri::command]
pub async fn save_project(
    store: tauri::State<'_, std::sync::Mutex<ProjectStore>>,
    project: Project,
) -> Result<SaveResult, String> {
    let store = store.lock().unwrap();
    match store.save_project(&project) {
        Ok(()) => Ok(SaveResult {
            ok: true,
            state: "saved".into(),
            message: None,
        }),
        Err(e) => Ok(SaveResult {
            ok: false,
            state: "error".into(),
            message: Some(e.to_string()),
        }),
    }
}

/// Return an empty new project skeleton (not yet persisted).
#[tauri::command]
pub async fn new_empty_project() -> Result<Project, String> {
    Ok(Project::new("Untitled Story"))
}