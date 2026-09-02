//! Shared domain models for the story studio.
//!
//! These types are serialized to JSON for project persistence and sent
//! over Tauri IPC to the React frontend. The TypeScript interfaces in
//! `src/lib/models.ts` must mirror these exactly.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Top-level project. Everything in the story lives here.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Project {
    pub id: String,
    pub title: String,
    pub topic: Option<String>,
    pub genre: Option<String>,
    pub tone: Option<String>,
    pub length: Option<String>,
    pub audience: Option<String>,
    pub point_of_view: Option<String>,
    pub premise: Option<String>,
    pub theme: Option<String>,
    pub conflict: Option<String>,
    pub setting: Option<String>,
    pub story_arc: StoryArc,
    pub characters: Vec<Character>,
    pub scenes: Vec<Scene>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Project {
    pub fn new(title: &str) -> Self {
        let now = Utc::now();
        Project {
            id: Uuid::new_v4().to_string(),
            title: title.to_string(),
            topic: None,
            genre: None,
            tone: None,
            length: None,
            audience: None,
            point_of_view: None,
            premise: None,
            theme: None,
            conflict: None,
            setting: None,
            story_arc: StoryArc::default(),
            characters: Vec::new(),
            scenes: Vec::new(),
            created_at: now,
            updated_at: now,
        }
    }

    pub fn touch(&mut self) {
        self.updated_at = Utc::now();
    }
}

/// The five classic story-arc beats. All editable by the user or the Story Agent.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StoryArc {
    pub beginning: Option<String>,
    pub rising_action: Option<String>,
    pub turning_point: Option<String>,
    pub climax: Option<String>,
    pub resolution: Option<String>,
}

impl Default for StoryArc {
    fn default() -> Self {
        StoryArc {
            beginning: None,
            rising_action: None,
            turning_point: None,
            climax: None,
            resolution: None,
        }
    }
}

/// A character in the story.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Character {
    pub id: String,
    pub name: String,
    pub role: Option<String>, // Protagonist, Antagonist, Supporting, etc.
    pub age: Option<String>,
    pub appearance: Option<String>,
    pub personality: Option<String>,
    pub background: Option<String>,
    pub motivation: Option<String>,
    pub goal: Option<String>,
    pub fear: Option<String>,
    pub strengths: Option<String>,
    pub weaknesses: Option<String>,
    pub relationships: Vec<Relationship>,
    pub arc: Option<String>,
}

impl Character {
    pub fn new(name: &str) -> Self {
        Character {
            id: Uuid::new_v4().to_string(),
            name: name.to_string(),
            role: None,
            age: None,
            appearance: None,
            personality: None,
            background: None,
            motivation: None,
            goal: None,
            fear: None,
            strengths: None,
            weaknesses: None,
            relationships: Vec::new(),
            arc: None,
        }
    }
}

/// A relationship between two characters.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Relationship {
    pub character_id: String,
    pub label: String, // e.g. "Childhood friends"
    pub current: Option<String>, // e.g. "Distrustful"
}

/// A scene in the story.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Scene {
    pub id: String,
    pub number: u32,
    pub title: String,
    pub location: Option<String>,
    pub time: Option<String>,
    pub characters: Vec<String>, // character ids present in the scene
    pub purpose: Option<String>,
    pub conflict: Option<String>,
    pub mood: Option<String>,
    pub story_beat: Option<String>,
    pub writing: String,
    pub dialogue: Vec<DialogueBlock>,
    pub captions: Vec<Caption>,
    pub status: SceneStatus,
}

impl Scene {
    pub fn new(number: u32, title: &str) -> Self {
        Scene {
            id: Uuid::new_v4().to_string(),
            number,
            title: title.to_string(),
            location: None,
            time: None,
            characters: Vec::new(),
            purpose: None,
            conflict: None,
            mood: None,
            story_beat: None,
            writing: String::new(),
            dialogue: Vec::new(),
            captions: Vec::new(),
            status: SceneStatus::NotStarted,
        }
    }

    /// Completion percentage across the four work streams.
    pub fn completion(&self) -> u8 {
        let mut total = 0u32;
        if !self.writing.trim().is_empty() {
            total += 1;
        }
        if !self.dialogue.is_empty() {
            total += 1;
        }
        if !self.captions.is_empty() {
            total += 1;
        }
        if self.status == SceneStatus::Draft {
            total += 1;
        }
        ((total as f32 / 4.0) * 100.0) as u8
    }
}

/// Completion state of a scene.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SceneStatus {
    NotStarted,
    InProgress,
    NeedsReview,
    Draft,
    Complete,
}

/// A single dialogue block within a scene.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DialogueBlock {
    pub id: String,
    pub character_id: String,
    pub text: String,
    pub action_context: Option<String>,
    pub order: u32,
}

impl DialogueBlock {
    pub fn new(character_id: &str, order: u32) -> Self {
        DialogueBlock {
            id: Uuid::new_v4().to_string(),
            character_id: character_id.to_string(),
            text: String::new(),
            action_context: None,
            order,
        }
    }
}

/// An accessible text caption for a scene/dialogue sequence.
/// NOTE: this is a text-writing feature, NOT video subtitle production.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Caption {
    pub id: String,
    pub text: String,
    pub speaker: Option<String>, // character id or null for action captions
    pub scene_id: String,
    pub order: u32,
    pub timing_ms: Option<u32>, // optional, not a video timeline
}

impl Caption {
    pub fn new(scene_id: &str, order: u32) -> Self {
        Caption {
            id: Uuid::new_v4().to_string(),
            text: String::new(),
            speaker: None,
            scene_id: scene_id.to_string(),
            order,
            timing_ms: None,
        }
    }
}

/// A saved snapshot of the project for version history.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Version {
    pub id: String,
    pub project_id: String,
    pub label: String,
    pub created_at: DateTime<Utc>,
    pub snapshot: Project,
}

impl Version {
    pub fn new(project: &Project, label: &str) -> Self {
        Version {
            id: Uuid::new_v4().to_string(),
            project_id: project.id.clone(),
            label: label.to_string(),
            created_at: Utc::now(),
            snapshot: project.clone(),
        }
    }
}

/// Options controlling how a manuscript is exported.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ExportOptions {
    pub include_title_page: bool,
    pub include_author_name: bool,
    pub include_toc: bool,
    pub include_scene_headings: bool,
    pub include_character_notes: bool,
    pub include_captions: bool,
}

impl Default for ExportOptions {
    fn default() -> Self {
        ExportOptions {
            include_title_page: true,
            include_author_name: true,
            include_toc: false,
            include_scene_headings: true,
            include_character_notes: false,
            include_captions: true,
        }
    }
}

/// LLM provider configuration. Stored locally, never committed to source control.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct LlmConfig {
    pub base_url: String,
    pub model: String,
    pub api_key: Option<String>,
    pub enabled: bool,
}

impl Default for LlmConfig {
    fn default() -> Self {
        LlmConfig {
            base_url: "https://api.openai.com/v1".to_string(),
            model: "gpt-4o".to_string(),
            api_key: None,
            enabled: false,
        }
    }
}

/// The six AI agents in the studio.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum AgentKind {
    Story,
    Character,
    Scene,
    Dialogue,
    Caption,
    Editor,
}

impl AgentKind {
    pub fn label(&self) -> &'static str {
        match self {
            AgentKind::Story => "Story Agent",
            AgentKind::Character => "Character Agent",
            AgentKind::Scene => "Scene Agent",
            AgentKind::Dialogue => "Dialogue Agent",
            AgentKind::Caption => "Caption Agent",
            AgentKind::Editor => "Editor Agent",
        }
    }

    pub fn system_prompt(&self) -> &'static str {
        match self {
            AgentKind::Story => include_str!("agents/prompts/story.md"),
            AgentKind::Character => include_str!("agents/prompts/character.md"),
            AgentKind::Scene => include_str!("agents/prompts/scene.md"),
            AgentKind::Dialogue => include_str!("agents/prompts/dialogue.md"),
            AgentKind::Caption => include_str!("agents/prompts/caption.md"),
            AgentKind::Editor => include_str!("agents/prompts/editor.md"),
        }
    }
}