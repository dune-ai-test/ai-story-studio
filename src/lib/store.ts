//! Global application state via Zustand.
//!
//! Holds the active project, save state, navigation, and the AI panel state.
//! All mutations go through Tauri commands (see `lib/tauri.ts`).

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { TauriApi } from "@/lib/tauri";
import { Project } from "@/lib/models";

export type Page =
  | "home"
  | "topic"
  | "story"
  | "characters"
  | "scenes"
  | "dialogue"
  | "captions"
  | "draft"
  | "review"
  | "export";

interface AppState {
  // Project
  project: Project | null;
  projectId: string | null;
  loading: boolean;
  error: string | null;

  // Save
  saveState: "idle" | "saving" | "saved" | "error";
  saveMessage: string | null;

  // Navigation
  page: Page;
  sidebarOpen: boolean;
  aiPanelOpen: boolean;

  // AI
  aiWorking: boolean;
  aiAgent: string | null;
  aiSummary: string | null;

  // UI
  commandOpen: boolean;
  toasts: Toast[];

  // Actions
  setProject: (p: Project | null) => void;
  setLoading: (b: boolean) => void;
  setError: (e: string | null) => void;
  setSaveState: (s: AppState["saveState"], msg?: string | null) => void;
  navigate: (page: Page) => void;
  toggleSidebar: (open?: boolean) => void;
  toggleAiPanel: (open?: boolean) => void;
  setAiWorking: (working: boolean, agent?: string | null, summary?: string | null) => void;
  openCommand: () => void;
  closeCommand: () => void;
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;

  // Async actions
  createProject: (title: string) => Promise<Project>;
  loadProject: (id: string) => Promise<Project>;
  saveProject: (p: Project) => Promise<void>;
  autosave: (p: Project) => void;
  runAgent: (api: TauriApi, req: any) => Promise<any>;
}

export interface Toast {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  timeoutMs?: number;
}

let toastId = 0;
const newToastId = () => `toast-${++toastId}`;

export const useAppStore = create<AppState>()(
  devtools((set, get) => ({
    project: null,
    projectId: null,
    loading: false,
    error: null,
    saveState: "idle",
    saveMessage: null,
    page: "home",
    sidebarOpen: true,
    aiPanelOpen: true,
    aiWorking: false,
    aiAgent: null,
    aiSummary: null,
    commandOpen: false,
    toasts: [],

    setProject: (p) => set({ project: p, projectId: p ? p.id : null }),
    setLoading: (b) => set({ loading: b }),
    setError: (e) => set({ error: e }),
    setSaveState: (s, msg = null) => set({ saveState: s, saveMessage: msg }),
    navigate: (page) => set({ page }),
    toggleSidebar: (open) =>
      set((s) => ({ sidebarOpen: open === undefined ? !s.sidebarOpen : open })),
    toggleAiPanel: (open) =>
      set((s) => ({ aiPanelOpen: open === undefined ? !s.aiPanelOpen : open })),
    setAiWorking: (working, agent = null, summary = null) =>
      set({ aiWorking: working, aiAgent: agent, aiSummary: summary }),
    openCommand: () => set({ commandOpen: true }),
    closeCommand: () => set({ commandOpen: false }),
    pushToast: (t) => {
      const id = newToastId();
      const toast: Toast = { id, ...t };
      set((s) => ({ toasts: [...s.toasts, toast] }));
      if (t.timeoutMs === undefined || t.timeoutMs > 0) {
        setTimeout(() => get().dismissToast(id), t.timeoutMs ?? 4000);
      }
    },
    dismissToast: (id) =>
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

    createProject: async (title) => {
      set({ loading: true, error: null });
      try {
        const { tauri } = await import("@/lib/tauri");
        const project = await tauri.createProject(title);
        set({ project, projectId: project.id, loading: false, page: "story" });
        get().pushToast({ type: "success", message: "Project created." });
        return project;
      } catch (e: any) {
        set({ loading: false, error: String(e) });
        get().pushToast({ type: "error", message: String(e) });
        throw e;
      }
    },

    loadProject: async (id) => {
      set({ loading: true, error: null });
      try {
        const { tauri } = await import("@/lib/tauri");
        const project = await tauri.loadProject(id);
        set({ project, projectId: project.id, loading: false, page: "home" });
        get().pushToast({ type: "success", message: "Project loaded." });
        return project;
      } catch (e: any) {
        set({ loading: false, error: String(e) });
        get().pushToast({ type: "error", message: String(e) });
        throw e;
      }
    },

    saveProject: async (p) => {
      try {
        const { tauri } = await import("@/lib/tauri");
        const res = await tauri.saveProject(p);
        if (res.ok) {
          get().setSaveState("saved", null);
        } else {
          get().setSaveState("error", res.message ?? "Couldn't save");
          get().pushToast({ type: "error", message: res.message ?? "Couldn't save" });
        }
      } catch (e: any) {
        get().setSaveState("error", String(e));
        get().pushToast({ type: "error", message: String(e) });
      }
    },

    // Debounced autosave. Safe to call on every change.
    autosave: (() => {
      let timer: ReturnType<typeof setTimeout> | null = null;
      return (p: Project) => {
        if (timer) clearTimeout(timer);
        get().setSaveState("saving");
        timer = setTimeout(() => {
          get().saveProject(p);
        }, 500);
      };
    })(),

    runAgent: async (
      _api: TauriApi,
      run: (req: any) => Promise<any>,
      req: any
    ) => {
      set({ aiWorking: true, aiAgent: "Agent", aiSummary: null });
      try {
        const res = await run(req);
        set({ aiWorking: false, aiSummary: res.summary });
        get().pushToast({ type: "success", message: res.summary });
        return res;
      } catch (e: any) {
        set({ aiWorking: false });
        get().pushToast({ type: "error", message: String(e) });
        throw e;
      }
    },
  }))
);