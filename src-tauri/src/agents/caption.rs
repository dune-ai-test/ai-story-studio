//! Caption Agent.
//!
//! Creates accessible text captions for each scene and dialogue sequence.
//! This is a text-writing feature, NOT video subtitle production.

use crate::agents::{project_context, find_scene, AgentOutput, AgentRequest, stub};
use crate::llm::LlmClient;
use crate::models::AgentKind;
use serde_json::json;

pub async fn run(client: &LlmClient, req: &AgentRequest) -> AgentOutput {
    let ctx = project_context(&req.project);
    let scene = find_scene(&req.project, &req.scene_id);
    let scene_ctx = match scene {
        Some(s) => format!(
            "Scene {}: {}\nWriting:\n{}\nDialogue:\n{}",
            s.number,
            s.title,
            s.writing,
            s.dialogue
                .iter()
                .map(|d| format!("- {}: {}", d.character_id, d.text))
                .collect::<Vec<_>>()
                .join("\n")
        ),
        None => "No scene selected.".to_string(),
    };

    let user = req.user_input.clone().unwrap_or_else(|| {
        "Create accessible text captions for this scene and dialogue sequence.".to_string()
    });

    if client.is_enabled() {
        let prompt = format!("{ctx}\n\n{scene_ctx}\n\nUser request: {user}");
        if let Ok(text) = client.chat(AgentKind::Caption.system_prompt(), &prompt).await {
            return AgentOutput {
                agent: AgentKind::Caption.label().to_string(),
                summary: "Caption Agent suggested captions.".to_string(),
                content: json!({ "raw": text, "scene_id": req.scene_id, "user_input": user }),
                stub: false,
            };
        }
    }

    stub(
        AgentKind::Caption,
        "Caption Agent suggested captions (stub — configure an LLM key for real generation).",
        json!({
            "scene_id": req.scene_id,
            "captions": [
                {"order": 1, "text": "Maya enters the attic, flashlight in hand.", "speaker": null},
                {"order": 2, "text": "A floorboard creaks beneath her.", "speaker": null},
                {"order": 3, "text": "MAYA: You knew she was here.", "speaker": "maya"},
                {"order": 4, "text": "DANIEL: I knew she had been here. That's not the same thing.", "speaker": "daniel"},
                {"order": 5, "text": "MAYA: Then why didn't you tell me?", "speaker": "maya"}
            ],
            "user_input": user
        }),
    )
}