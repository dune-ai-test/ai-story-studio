//! Story Agent.
//!
//! Develops premise, theme, conflict, setting, and story arc.

use crate::agents::{project_context, AgentOutput, AgentRequest, stub};
use crate::llm::LlmClient;
use crate::models::AgentKind;
use serde_json::json;

pub async fn run(client: &LlmClient, req: &AgentRequest) -> AgentOutput {
    let ctx = project_context(&req.project);
    let user = req.user_input.clone().unwrap_or_else(|| {
        "Develop the premise, theme, conflict, setting, and story arc for this story.".to_string()
    });

    if client.is_enabled() {
        if let Ok(text) = client.chat(AgentKind::Story.system_prompt(), &format!("{ctx}\n\nUser request: {user}")).await {
            return AgentOutput {
                agent: AgentKind::Story.label().to_string(),
                summary: "Story Agent developed the concept.".to_string(),
                content: json!({ "raw": text, "user_input": user }),
                stub: false,
            };
        }
    }

    // Stub response — fully usable offline.
    stub(
        AgentKind::Story,
        "Story Agent developed the concept (stub — configure an LLM key for real generation).",
        json!({
            "premise": req.project.premise.clone().unwrap_or_else(|| "A detective returns to her hometown after twenty years and discovers her childhood friend disappeared under mysterious circumstances.".to_string()),
            "theme": req.project.theme.clone().unwrap_or_else(|| "The weight of secrets we keep from the people we love.".to_string()),
            "conflict": req.project.conflict.clone().unwrap_or_else(|| "Maya must decide whether to dig up the past or let it stay buried.".to_string()),
            "setting": req.project.setting.clone().unwrap_or_else(|| "A coastal town in New England, autumn, present day.".to_string()),
            "story_arc": {
                "beginning": "Maya returns home and finds the town changed.",
                "rising_action": "She uncovers clues about her friend's disappearance.",
                "turning_point": "She learns Daniel has been hiding a photograph.",
                "climax": "Confrontation in the attic.",
                "resolution": "The truth comes out, and the town begins to heal."
            },
            "user_input": user
        }),
    )
}