//! Scene Agent.
//!
//! Develops scene structure, beats, and prose.

use crate::agents::{project_context, find_scene, AgentOutput, AgentRequest, stub};
use crate::llm::LlmClient;
use crate::models::AgentKind;
use serde_json::json;

pub async fn run(client: &LlmClient, req: &AgentRequest) -> AgentOutput {
    let ctx = project_context(&req.project);
    let scene = find_scene(&req.project, &req.scene_id);
    let scene_ctx = match scene {
        Some(s) => format!(
            "Scene {}: {}\nLocation: {:?}\nTime: {:?}\nCharacters: {:?}\nMood: {:?}\nCurrent writing:\n{}",
            s.number, s.title, s.location, s.time, s.characters, s.mood, s.writing
        ),
        None => "No scene selected.".to_string(),
    };

    let user = req.user_input.clone().unwrap_or_else(|| {
        "Develop this scene's structure, beats, and prose.".to_string()
    });

    if client.is_enabled() {
        let prompt = format!("{ctx}\n\n{scene_ctx}\n\nUser request: {user}");
        if let Ok(text) = client.chat(AgentKind::Scene.system_prompt(), &prompt).await {
            return AgentOutput {
                agent: AgentKind::Scene.label().to_string(),
                summary: "Scene Agent developed the scene.".to_string(),
                content: json!({ "raw": text, "scene_id": req.scene_id, "user_input": user }),
                stub: false,
            };
        }
    }

    stub(
        AgentKind::Scene,
        "Scene Agent developed the scene (stub — configure an LLM key for real generation).",
        json!({
            "scene_id": req.scene_id,
            "beats": [
                "Maya enters the attic and notices the loose floorboard.",
                "She lifts the photograph and sees faces she recognizes.",
                "She realizes Daniel has been keeping a secret."
            ],
            "prose": "The attic smelled of cedar and dust. Maya's flashlight cut a narrow beam across boxes of Christmas ornaments and yellowed newspapers. She was about to turn back when the floorboard beneath her left foot gave a soft, unmistakable creak. She knelt and pried it up. Beneath it lay a photograph, edges curled with age, faces still visible. Maya's breath caught. She knew those faces. And she knew, suddenly, that Daniel had been keeping a secret from her all these years.",
            "user_input": user
        }),
    )
}