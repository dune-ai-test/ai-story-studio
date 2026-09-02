//! Shared TypeScript models — mirror `src-tauri/src/models.rs` exactly.
//! Keep these in sync with the Rust types.

export type SceneStatus = "NotStarted" | "InProgress" | "NeedsReview" | "Draft" | "Complete";

export interface StoryArc {
  beginning: string | null;
  rising_action: string | null;
  turning_point: string | null;
  climax: string | null;
  resolution: string | null;
}

export interface Relationship {
  character_id: string;
  label: string;
  current: string | null;
}

export interface Character {
  id: string;
  name: string;
  role: string | null;
  age: string | null;
  appearance: string | null;
  personality: string | null;
  background: string | null;
  motivation: string | null;
  goal: string | null;
  fear: string | null;
  strengths: string | null;
  weaknesses: string | null;
  relationships: Relationship[];
  arc: string | null;
}

export interface DialogueBlock {
  id: string;
  character_id: string;
  text: string;
  action_context: string | null;
  order: number;
}

export interface Caption {
  id: string;
  text: string;
  speaker: string | null;
  scene_id: string;
  order: number;
  timing_ms: number | null;
}

export interface Scene {
  id: string;
  number: number;
  title: string;
  location: string | null;
  time: string | null;
  characters: string[];
  purpose: string | null;
  conflict: string | null;
  mood: string | null;
  story_beat: string | null;
  writing: string;
  dialogue: DialogueBlock[];
  captions: Caption[];
  status: SceneStatus;
}

export interface Project {
  id: string;
  title: string;
  topic: string | null;
  genre: string | null;
  tone: string | null;
  length: string | null;
  audience: string | null;
  point_of_view: string | null;
  premise: string | null;
  theme: string | null;
  conflict: string | null;
  setting: string | null;
  story_arc: StoryArc;
  characters: Character[];
  scenes: Scene[];
  created_at: string;
  updated_at: string;
}

export interface Version {
  id: string;
  project_id: string;
  label: string;
  created_at: string;
  snapshot: Project;
}

export interface LlmConfig {
  base_url: string;
  model: string;
  api_key: string | null;
  enabled: boolean;
}

export interface ExportOptions {
  include_title_page: boolean;
  include_author_name: boolean;
  include_toc: boolean;
  include_scene_headings: boolean;
  include_character_notes: boolean;
  include_captions: boolean;
}

export interface WordCount {
  words: number;
  characters: number;
  reading_time_minutes: number;
}

export interface AgentResponse {
  agent: string;
  summary: string;
  content: unknown;
  stub: boolean;
}

export interface AgentRequest {
  project: Project;
  scene_id: string | null;
  user_input: string | null;
  selection: string | null;
}

export interface SaveResult {
  ok: boolean;
  state: string;
  message: string | null;
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  include_title_page: true,
  include_author_name: true,
  include_toc: false,
  include_scene_headings: true,
  include_character_notes: false,
  include_captions: true,
};

export function emptyProject(title = "Untitled Story"): Project {
  return {
    id: crypto.randomUUID(),
    title,
    topic: null,
    genre: null,
    tone: null,
    length: null,
    audience: null,
    point_of_view: null,
    premise: null,
    theme: null,
    conflict: null,
    setting: null,
    story_arc: {
      beginning: null,
      rising_action: null,
      turning_point: null,
      climax: null,
      resolution: null,
    },
    characters: [],
    scenes: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function sceneCompletion(scene: Scene): number {
  let total = 0;
  if (scene.writing.trim()) total++;
  if (scene.dialogue.length > 0) total++;
  if (scene.captions.length > 0) total++;
  if (scene.status === "Draft") total++;
  return Math.round((total / 4) * 100);
}