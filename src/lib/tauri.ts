//! Thin wrapper around Tauri's `invoke`. Lets us mock commands in tests
//! and keeps call sites clean.

import { invoke } from "@tauri-apps/api/core";

export const tauri = {
  // Project / persistence
  createProject: (title: string) => invoke<any>("create_project", { title }),
  loadProject: (id: string) => invoke<any>("load_project", { id }),
  saveProject: (project: any) => invoke<any>("save_project", { project }),
  newEmptyProject: () => invoke<any>("new_empty_project"),

  // Versions
  snapshotProject: (project: any, label: string) =>
    invoke<any>("snapshot_project", { project, label }),
  listVersions: (projectId: string) =>
    invoke<any>("list_versions", { project_id: projectId }),
  restoreVersion: (projectId: string, versionId: string) =>
    invoke<any>("restore_version", { project_id: projectId, version_id: versionId }),
  compareVersions: (a: string, b: string) =>
    invoke<string>("compare_versions", { version_a: a, version_b: b }),

  // AI agents
  agentStory: (req: any) => invoke<any>("agent_story", { ...req }),
  agentCharacter: (req: any) => invoke<any>("agent_character", { ...req }),
  agentScene: (req: any) => invoke<any>("agent_scene", { ...req }),
  agentDialogue: (req: any) => invoke<any>("agent_dialogue", { ...req }),
  agentCaption: (req: any) => invoke<any>("agent_caption", { ...req }),
  agentEditor: (req: any) => invoke<any>("agent_editor", { ...req }),
  setLlmConfig: (config: any) => invoke<void>("set_llm_config", { config }),
  getLlmConfig: () => invoke<any>("get_llm_config"),

  // Export
  exportWord: (project: any, options: any) =>
    invoke<Uint8Array>("export_word", { project, options }),
  exportPdf: (project: any, options: any) =>
    invoke<Uint8Array>("export_pdf", { project, options }),
  exportPlainText: (project: any) =>
    invoke<string>("export_plain_text", { project }),
  exportMarkdown: (project: any) =>
    invoke<string>("export_markdown", { project }),
  wordCount: (project: any) => invoke<any>("word_count", { project }),
};

export type TauriApi = typeof tauri;