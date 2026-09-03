//! AI agent Tauri commands.
//!
//! Six agents (Story, Character, Scene, Dialogue, Caption, Editor) share the
//! project as context. Each returns structured suggestions that the frontend
//! renders for the user to accept, reject, or edit manually.
//!
//! Agents never silently apply major edits.

use crate::agents;
use crate::llm::{self, LlmClient};
use crate::models::{AgentKind, LlmConfig, Project};

use serde::{Deserialize, Serialize};

/// Input for an agent call. Carries enough context to run the agent.
#[derive(Debug, Clone, Deserialize)]
pub struct AgentRequest {
    pub project: Project,
    pub scene_id: Option<String>,
    pub user_input: Option<String>,
    pub selection: Option<String>,
}

/// Output from an agent call.
#[derive(Debug, Clone, Serialize)]
pub struct AgentResponse {
    pub agent: String,
    pub summary: String,
    pub content: serde_json::Value,
    pub stub: bool,
}

/// Run a specific agent with the given request.
async fn run_agent(kind: AgentKind, req: AgentRequest) -> AgentResponse {
    let client = llm::client_from_config();
    // Convert the Tauri-facing AgentRequest into the internal agents::AgentRequest
    let inner = crate::agents::AgentRequest {
        project: req.project,
        scene_id: req.scene_id,
        user_input: req.user_input,
        selection: req.selection,
    };
    let output = agents::run(kind, &client, &inner).await;
    AgentResponse {
        agent: output.agent,
        summary: output.summary,
        content: output.content,
        stub: output.stub,
    }
}

/// Story Agent — premise, theme, conflict, setting, story arc.
#[tauri::command]
pub async fn agent_story(req: AgentRequest) -> Result<AgentResponse, String> {
    Ok(run_agent(AgentKind::Story, req).await)
}

/// Character Agent — characters, relationships, motivations.
#[tauri::command]
pub async fn agent_character(req: AgentRequest) -> Result<AgentResponse, String> {
    Ok(run_agent(AgentKind::Character, req).await)
}

/// Scene Agent — scene structure and prose.
#[tauri::command]
pub async fn agent_scene(req: AgentRequest) -> Result<AgentResponse, String> {
    Ok(run_agent(AgentKind::Scene, req).await)
}

/// Dialogue Agent — character voice and conversations.
#[tauri::command]
pub async fn agent_dialogue(req: AgentRequest) -> Result<AgentResponse, String> {
    Ok(run_agent(AgentKind::Dialogue, req).await)
}

/// Caption Agent — accessible text captions.
#[tauri::command]
pub async fn agent_caption(req: AgentRequest) -> Result<AgentResponse, String> {
    Ok(run_agent(AgentKind::Caption, req).await)
}

/// Editor Agent — continuity, grammar, pacing, structure.
#[tauri::command]
pub async fn agent_editor(req: AgentRequest) -> Result<AgentResponse, String> {
    Ok(run_agent(AgentKind::Editor, req).await)
}

/// Update the LLM configuration (base url, model, api key, enabled).
#[tauri::command]
pub async fn set_llm_config(config: LlmConfig) -> Result<(), String> {
    llm::set_config(config).map_err(|e| e.to_string())
}

/// Return the current LLM configuration (api key redacted).
#[tauri::command]
pub async fn get_llm_config() -> Result<LlmConfig, String> {
    let mut cfg = llm::get_config().map_err(|e| e.to_string())?;
    cfg.api_key = cfg.api_key.map(|_| "***".to_string());
    Ok(cfg)
}