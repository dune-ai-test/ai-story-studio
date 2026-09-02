//! Dialogue Agent.
//!
//! Writes and refines character dialogue with distinct voices and subtext.

use crate::agents::{project_context, find_scene, AgentOutput, AgentRequest, stub};
use crate::llm::LlmClient;
use crate::models::AgentKind;
use serde_json::json;

pub async fn run(client: &LlmClient, req: &AgentRequest) -> AgentOutput {
    let ctx = project_context(&req.project);
    let scene = find_scene(&req.project, &req.scene_id);
    let scene_ctx = match scene {
        Some(s) => format!(
            "Scene {}: {}\nCharacters present: {:?}\nExisting dialogue:\n{}",
            s.number,
            s.title,
            s.characters,
            s.dialogue
                .iter()
                .map(|d| format!("- {}: {}", d.character_id, d.text))
                .collect::<Vec<_>>()
                .join("\n")
        ),
        None => "No scene selected.".to_string(),
    };

    let user = req.user_input.clone().unwrap_or_else(|| {
        "Write natural, tense dialogue with distinct voices and subtext for this scene.".to_string()
    });

    if client.is_enabled() {
        let prompt = format!("{ctx}\n\n{scene_ctx}\n\nUser request: {user}");
        if let Ok(text) = client.chat(AgentKind::Dialogue.system_prompt(), &prompt).await {
            return AgentOutput {
                agent: AgentKind::Dialogue.label().to_string(),
                summary: "Dialogue Agent suggested dialogue.".to_string(),
                content: json!({ "raw": text, "scene_id": req.scene_id, "user_input": user }),
                stub: false,
            };
        }
    }

    stub(
        AgentKind::Dialogue,
        "Dialogue Agent suggested dialogue (stub — configure an LLM key for real generation).",
        json!({
            "scene_id": req.scene_id,
            "blocks": [
                {"character_id": "maya", "text": "You knew she was here.", "action_context": "Maya's voice is quiet, but the question lands like an accusation."},
                {"character_id": "daniel", "text": "I knew she had been here. That's not the same thing.", "action_context": "Daniel doesn't look up from the photograph."},
                {"character_id": "maya", "text": "Then why didn't you tell me?", "action_context": ""}
            ],
            "user_input": user
        }),
    )
}