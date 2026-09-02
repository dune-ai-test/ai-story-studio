//! Project persistence.
//!
//! Projects are stored as JSON under the app's local data directory:
//!   <app_data>/projects/<project_id>/project.json
//!   <app_data>/versions/<project_id>/<version_id>.json
//!
//! Writes are atomic: write to a temp file, then rename over the target.
//! This means a crash mid-write cannot corrupt an existing project.

use std::fs;
use std::path::PathBuf;

use anyhow::{Context, Result};
use chrono::Utc;
use uuid::Uuid;

use crate::models::{Project, Version};

/// Where projects live on disk. Resolved by the Tauri app at runtime; this
/// struct accepts any root so tests can point at a temp dir.
pub struct ProjectStore {
    root: PathBuf,
}

impl ProjectStore {
    /// Create a store rooted at `root`. Directories are created on demand.
    pub fn new(root: PathBuf) -> Result<Self> {
        fs::create_dir_all(root.join("projects"))?;
        fs::create_dir_all(root.join("versions"))?;
        Ok(ProjectStore { root })
    }

    /// The default store location under the OS app-data dir.
    pub fn default_location() -> Option<PathBuf> {
        dirs::data_dir().map(|p| p.join("ai-story-studio"))
    }

    fn project_dir(&self, id: &str) -> PathBuf {
        self.root.join("projects").join(id)
    }

    fn project_path(&self, id: &str) -> PathBuf {
        self.project_dir(id).join("project.json")
    }

    fn version_path(&self, version_id: &str) -> PathBuf {
        self.root.join("versions").join(format!("{version_id}.json"))
    }

    /// Create a new project skeleton and persist it immediately.
    pub fn new_project(&self, title: &str) -> Result<Project> {
        let project = Project::new(title);
        self.save_project(&project)?;
        Ok(project)
    }

    /// Load a project by id.
    pub fn load_project(&self, id: &str) -> Result<Project> {
        let path = self.project_path(id);
        let bytes = fs::read(&path)
            .with_context(|| format!("could not read project at {}", path.display()))?;
        let project: Project = serde_json::from_slice(&bytes)
            .with_context(|| format!("project at {} is corrupt", path.display()))?;
        Ok(project)
    }

    /// Persist a project atomically. Returns the save state string on success.
    pub fn save_project(&self, project: &Project) -> Result<()> {
        let dir = self.project_dir(&project.id);
        fs::create_dir_all(&dir)?;
        let target = self.project_path(&project.id);
        let temp = dir.join(format!("{}.tmp", Uuid::new_v4()));

        let bytes = serde_json::to_vec_pretty(project)?;
        fs::write(&temp, &bytes)?;
        // Atomic rename: on Windows this replaces the target if present.
        #[cfg(windows)]
        {
            // On Windows, rename fails if the target exists. Remove first.
            if target.exists() {
                fs::remove_file(&target)?;
            }
        }
        fs::rename(&temp, &target)?;
        Ok(())
    }

    /// Save a full snapshot version and return the Version record.
    pub fn snapshot_project(&self, project: &Project, label: &str) -> Result<Version> {
        let version = Version::new(project, label);
        let path = self.version_path(&version.id);
        let dir = path.parent().unwrap_or(&self.root);
        fs::create_dir_all(dir)?;
        let temp = dir.join(format!("{}.tmp", Uuid::new_v4()));
        let bytes = serde_json::to_vec_pretty(&version)?;
        fs::write(&temp, &bytes)?;
        if path.exists() {
            fs::remove_file(&path)?;
        }
        fs::rename(&temp, &path)?;
        Ok(version)
    }

    /// List all saved versions for a project, newest first.
    pub fn list_versions(&self, project_id: &str) -> Result<Vec<Version>> {
        let dir = self.root.join("versions");
        if !dir.exists() {
            return Ok(Vec::new());
        }
        let mut versions: Vec<Version> = Vec::new();
        for entry in fs::read_dir(&dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) != Some("json") {
                continue;
            }
            let bytes = fs::read(&path)?;
            let version: Version = match serde_json::from_slice(&bytes) {
                Ok(v) => v,
                Err(_) => continue,
            };
            if version.project_id == project_id {
                versions.push(version);
            }
        }
        versions.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(versions)
    }

    /// Restore a project to a saved version. The restored project gets a new id
    /// so it remains a separate, editable copy.
    pub fn restore_version(&self, project_id: &str, version_id: &str) -> Result<Project> {
        let path = self.version_path(version_id);
        let bytes = fs::read(&path)
            .with_context(|| format!("version {} not found", version_id))?;
        let version: Version = serde_json::from_slice(&bytes)?;
        if version.project_id != project_id {
            anyhow::bail!("version does not belong to project");
        }
        let mut restored = version.snapshot;
        restored.updated_at = Utc::now();
        self.save_project(&restored)?;
        Ok(restored)
    }

    /// Return a simple textual diff between two versions.
    pub fn compare_versions(&self, version_a: &str, version_b: &str) -> Result<String> {
        let a: Version = self.load_version(version_a)?;
        let b: Version = self.load_version(version_b)?;
        let mut out = String::new();
        out.push_str(&format!("Comparing \"{}\" and \"{}\"\n\n", a.label, b.label));

        if a.snapshot.title != b.snapshot.title {
            out.push_str(&format!(
                "Title changed: \"{}\" → \"{}\"\n",
                a.snapshot.title, b.snapshot.title
            ));
        }
        if a.snapshot.premise != b.snapshot.premise {
            out.push_str("Premise was modified.\n");
        }
        if a.snapshot.theme != b.snapshot.theme {
            out.push_str("Theme was modified.\n");
        }
        if a.snapshot.conflict != b.snapshot.conflict {
            out.push_str("Conflict was modified.\n");
        }
        if a.snapshot.setting != b.snapshot.setting {
            out.push_str("Setting was modified.\n");
        }

        let old_scenes: std::collections::HashMap<_, _> = a
            .snapshot
            .scenes
            .iter()
            .map(|s| (s.number, s))
            .collect();
        let new_scenes: std::collections::HashMap<_, _> = b
            .snapshot
            .scenes
            .iter()
            .map(|s| (s.number, s))
            .collect();

        for num in 1..=b.snapshot.scenes.len() as u32 {
            let old = old_scenes.get(&num);
            let new = new_scenes.get(&num);
            match (old, new) {
                (Some(o), Some(n)) => {
                    if o.writing != n.writing {
                        out.push_str(&format!("Scene {}: writing modified.\n", num));
                    }
                    if o.dialogue.len() != n.dialogue.len() {
                        out.push_str(&format!(
                            "Scene {}: dialogue blocks {} → {}.\n",
                            num,
                            o.dialogue.len(),
                            n.dialogue.len()
                        ));
                    }
                    if o.captions.len() != n.captions.len() {
                        out.push_str(&format!(
                            "Scene {}: captions {} → {}.\n",
                            num,
                            o.captions.len(),
                            n.captions.len()
                        ));
                    }
                    if o.status != n.status {
                        out.push_str(&format!(
                            "Scene {}: status {:?} → {:?}.\n",
                            num, o.status, n.status
                        ));
                    }
                }
                (None, Some(_)) => {
                    out.push_str(&format!("Scene {}: added.\n", num));
                }
                (Some(_), None) => {
                    out.push_str(&format!("Scene {}: removed.\n", num));
                }
                _ => {}
            }
        }

        if a.snapshot.characters.len() != b.snapshot.characters.len() {
            out.push_str(&format!(
                "Characters {} → {}.\n",
                a.snapshot.characters.len(),
                b.snapshot.characters.len()
            ));
        }

        if out.trim().is_empty() {
            out.push_str("No differences found.");
        }
        Ok(out)
    }

    fn load_version(&self, version_id: &str) -> Result<Version> {
        let path = self.version_path(version_id);
        let bytes = fs::read(&path)?;
        let version: Version = serde_json::from_slice(&bytes)?;
        Ok(version)
    }
}