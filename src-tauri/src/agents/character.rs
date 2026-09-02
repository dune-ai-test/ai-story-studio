//! Character Agent.
//!
//! Suggests and expands characters, relationships, motivations, and arcs.

use crate::agents::{project_context, AgentOutput, AgentRequest, stub};
use crate::llm::LlmClient;
use crate::models::AgentKind;
use serde_json::json;

pub async fn run(client: &LlmClient, req: &AgentRequest) -> AgentOutput {
    let ctx = project_context(&req.project);
    let user = req.user_input.clone().unwrap_or_else(|| {
        "Suggest and expand the cast, their relationships, motivations, and character arcs.".to_string()
    });

    if client.is_enabled() {
        if let Ok(text) = client.chat(AgentKind::Character.system_prompt(), &format!("{ctx}\n\nUser request: {user}")).await {
            return AgentOutput {
                agent: AgentKind::Character.label().to_string(),
                summary: "Character Agent suggested the cast.".to_string(),
                content: json!({ "raw": text, "user_input": user }),
                stub: false,
            };
        }
    }

    stub(
        AgentKind::Character,
        "Character Agent suggested the cast (stub — configure an LLM key for real generation).",
        json!({
            "suggestions": [
                {
                    "name": "Maya Bennett",
                    "role": "Protagonist",
                    "age": "34",
                    "appearance": "Tall, dark hair, always carries an old leather satchel.",
                    "personality": "Curious, guarded, methodical.",
                    "background": "Left town at 18 and never quite returned until now.",
                    "motivation": "To understand why her friend vanished.",
                    "goal": "Find the truth about Daniel's disappearance.",
                    "fear": "That the truth will cost her the last of her family.",
                    "strengths": ["Persistent", "Observant", "Empathetic"],
                    "weaknesses": ["Avoids confrontation", "Trusts too easily"],
                    "arc": "From guarded skeptic to someone willing to risk her peace for the truth.",
                    "relationships": [
                        {"character_id": "daniel", "label": "Childhood friends", "current": "Distrustful"}
                    ]
                },
                {
                    "name": "Daniel Reyes",
                    "role": "Antagonist",
                    "age": "34",
                    "appearance": "Lanky, wears thick glasses, speaks softly.",
                    "personality": "Reserved, secretive, deeply loyal.",
                    "background": "Stayed in town and took over the family hardware store.",
                    "motivation": "Protect a secret he has kept for twenty years.",
                    "goal": "Keep the past buried.",
                    "fear": "Being exposed and losing the town's respect.",
                    "strengths": ["Patient", "Calm under pressure"],
                    "weaknesses": ["Hides things rather than explains them"],
                    "arc": "From guarded protector to someone forced to confess."
                }
            ],
            "user_input": user
        }),
    )
}