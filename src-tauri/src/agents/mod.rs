//! AI agent registry.
//!
//! Six agents share the project as context. Each returns structured output
//! the frontend renders as suggestions. Agents never silently apply edits.
//!
//! When no LLM API key is configured, agents return stub content so the app
//! is fully demonstrable offline.

mod caption;
mod character;
mod dialogue;
mod editor;
mod scene;
mod story;

use crate::llm::LlmClient;
use crate::models::{AgentKind, Project};
use serde_json::Value;

/// Input to an agent call.
pub struct AgentRequest {
    pub project: Project,
    pub scene_id: Option<String>,
    pub user_input: Option<String>,
    pub selection: Option<String>,
}

/// Output from an agent call.
pub struct AgentOutput {
    pub agent: String,
    pub summary: String,
    pub content: Value,
    pub stub: bool,
}

/// Run a specific agent.
pub async fn run(kind: AgentKind, client: &LlmClient, req: &AgentRequest) -> AgentOutput {
    match kind {
        AgentKind::Story => story::run(client, req).await,
        AgentKind::Character => character::run(client, req).await,
        AgentKind::Scene => scene::run(client, req).await,
        AgentKind::Dialogue => dialogue::run(client, req).await,
        AgentKind::Caption => caption::run(client, req).await,
        AgentKind::Editor => editor::run(client, req).await,
    }
}

/// Build a stub response so the UI works without an LLM.
pub fn stub(kind: AgentKind, summary: &str, content: Value) -> AgentOutput {
    AgentOutput {
        agent: kind.label().to_string(),
        summary: summary.to_string(),
        content,
        stub: true,
    }
}

/// Resolve a scene by id from the project, if present.
pub fn find_scene<'a>(project: &'a Project, scene_id: &Option<String>) -> Option<&'a crate::models::Scene> {
    match scene_id {
        Some(id) => project.scenes.iter().find(|s| s.id == *id),
        None => project.scenes.first(),
    }
}

/// Build the shared context string agents read from.
pub fn project_context(project: &Project) -> String {
    let mut out = String::new();
    out.push_str(&format!("Title: {}\n", project.title));
    if let Some(p) = &project.premise {
        out.push_str(&format!("Premise: {}\n", p));
    }
    if let Some(t) = &project.theme {
        out.push_str(&format!("Theme: {}\n", t));
    }
    if let Some(c) = &project.conflict {
        out.push_str(&format!("Conflict: {}\n", c));
    }
    if let Some(s) = &project.setting {
        out.push_str(&format!("Setting: {}\n", s));
    }
    out.push_str(&format!("Characters: {}\n", project.characters.len()));
    for c in &project.characters {
        out.push_str(&format!("- {} ({:?})\n", c.name, c.role));
    }
    out.push_str(&format!("Scenes: {}\n", project.scenes.len()));
    for s in &project.scenes {
        out.push_str(&format!("- Scene {}: {}\n", s.number, s.title));
    }
    out
}