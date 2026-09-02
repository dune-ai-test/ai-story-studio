//! Editor Agent.
//!
//! Scans the manuscript for continuity, grammar, pacing, and structure issues.
//! Explains actual problems rather than giving arbitrary quality scores.

use crate::agents::{project_context, AgentOutput, AgentRequest, stub};
use crate::llm::LlmClient;
use crate::models::AgentKind;
use serde_json::json;

pub async fn run(client: &LlmClient, req: &AgentRequest) -> AgentOutput {
    let ctx = project_context(&req.project);
    let user = req.user_input.clone().unwrap_or_else(|| {
        "Scan the manuscript for continuity, grammar, pacing, and structure issues.".to_string()
    });

    if client.is_enabled() {
        let prompt = format!("{ctx}\n\nUser request: {user}");
        if let Ok(text) = client.chat(AgentKind::Editor.system_prompt(), &prompt).await {
            return AgentOutput {
                agent: AgentKind::Editor.label().to_string(),
                summary: "Editor Agent found issues.".to_string(),
                content: json!({ "raw": text, "user_input": user }),
                stub: false,
            };
        }
    }

    // Stub: surface the classic continuity example from the design spec.
    stub(
        AgentKind::Editor,
        "Editor Agent found 3 issues (stub — configure an LLM key for real generation).",
        json!({
            "issues": [
                {
                    "category": "Character Consistency",
                    "severity": "needs_review",
                    "description": "Daniel is described as 28 in Scene 2 but 31 in Scene 8.",
                    "suggested_fix": "Pick one age and update the conflicting scene.",
                    "actions": ["Fix Issue", "Edit manually", "Ignore"]
                },
                {
                    "category": "Captions",
                    "severity": "needs_review",
                    "description": "Scene 5 has completed dialogue but no captions.",
                    "suggested_fix": "Generate captions for Scene 5.",
                    "actions": ["Generate captions", "Ignore"]
                },
                {
                    "category": "Grammar",
                    "severity": "minor",
                    "description": "3 repeated phrases found across the draft.",
                    "suggested_fix": "Review and vary the repeated phrasing.",
                    "actions": ["Review", "Ignore"]
                }
            ],
            "user_input": user
        }),
    )
}