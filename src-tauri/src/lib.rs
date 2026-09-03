//! AI Story Writing Studio — Tauri backend entry point.
//!
//! The Rust core owns: project persistence, version history, autosave,
//! AI agent orchestration, and Word/PDF export. The React frontend owns
//! all UI rendering. They communicate through the Tauri invoke commands
//! registered below.

mod agents;
mod commands;
mod llm;
mod models;
mod storage;

use std::path::PathBuf;
use std::sync::Mutex;

/// Application entry point.
pub fn run() {
    // Create the store at setup so commands can access it via State.
    // Prefer LOCALAPPDATA on Windows, fall back to the current directory.
    let app_data = std::env::var("LOCALAPPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|_| std::env::current_dir().unwrap_or_default())
        .join("ai-story-studio");
    let store = storage::ProjectStore::new(app_data)
        .expect("could not create project store");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(Mutex::new(store))
        .invoke_handler(tauri::generate_handler![
            greet,
            // Project / persistence
            commands::project::create_project,
            commands::project::load_project,
            commands::project::save_project,
            commands::project::new_empty_project,
            // Versions
            commands::versions::snapshot_project,
            commands::versions::list_versions,
            commands::versions::restore_version,
            commands::versions::compare_versions,
            // AI agents
            commands::ai::agent_story,
            commands::ai::agent_character,
            commands::ai::agent_scene,
            commands::ai::agent_dialogue,
            commands::ai::agent_caption,
            commands::ai::agent_editor,
            commands::ai::set_llm_config,
            commands::ai::get_llm_config,
            // Export
            commands::export::export_word,
            commands::export::export_pdf,
            commands::export::export_plain_text,
            commands::export::export_markdown,
            commands::export::word_count,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {name}! Welcome to AI Story Writing Studio.")
}