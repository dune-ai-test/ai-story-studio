//! Export Tauri commands: Word (.docx), PDF, plain text, markdown.
//!
//! Export is fully offline — no external Office dependency on the user's
//! machine. Word uses the `docx` crate; PDF uses `printpdf`.

use crate::models::{Project, ExportOptions};
use crate::commands::export_gen;

/// Word count and reading time for a project.
#[derive(serde::Serialize)]
pub struct WordCount {
    pub words: usize,
    pub characters: usize,
    pub reading_time_minutes: usize,
}

/// Compute word count across all scene writing + dialogue.
pub fn compute_word_count(project: &Project) -> WordCount {
    let mut words = 0usize;
    let mut characters = 0usize;
    for scene in &project.scenes {
        words += count_words(&scene.writing);
        characters += scene.writing.chars().count();
        for d in &scene.dialogue {
            words += count_words(&d.text);
            characters += d.text.chars().count();
        }
    }
    for s in [
        &project.title,
        project.premise.as_deref().unwrap_or(""),
        project.theme.as_deref().unwrap_or(""),
        project.conflict.as_deref().unwrap_or(""),
        project.setting.as_deref().unwrap_or(""),
    ] {
        words += count_words(s);
        characters += s.chars().count();
    }
    let reading_time = (words as f64 / 220.0).ceil() as usize;
    WordCount {
        words,
        characters,
        reading_time_minutes: reading_time.max(1),
    }
}

fn count_words(s: &str) -> usize {
    s.split_whitespace().filter(|w| !w.is_empty()).count()
}

/// Generate a .docx from the project.
#[tauri::command]
pub async fn export_word(
    project: Project,
    options: ExportOptions,
) -> Result<Vec<u8>, String> {
    export_gen::build_docx(&project, &options).map_err(|e| e.to_string())
}

/// Generate a .pdf from the project.
#[tauri::command]
pub async fn export_pdf(
    project: Project,
    options: ExportOptions,
) -> Result<Vec<u8>, String> {
    export_gen::build_pdf(&project, &options).map_err(|e| e.to_string())
}

/// Render the manuscript as plain text.
#[tauri::command]
pub async fn export_plain_text(project: Project) -> Result<String, String> {
    Ok(export_gen::render_plain_text(&project))
}

/// Render the manuscript as Markdown.
#[tauri::command]
pub async fn export_markdown(project: Project) -> Result<String, String> {
    Ok(export_gen::render_markdown(&project))
}

/// Return word count + reading time for the Draft page.
#[tauri::command]
pub async fn word_count(project: Project) -> Result<WordCount, String> {
    Ok(compute_word_count(&project))
}