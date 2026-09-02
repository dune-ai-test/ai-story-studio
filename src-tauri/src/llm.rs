//! LLM provider client.
//!
//! Wraps reqwest in a thin wrapper that the agents use. Configuration is
//! stored in a process-global Mutex so Tauri commands can read/write it
//! without passing state through every call.
//!
//! If no API key is configured, agents fall back to stub responses so the
//! app is fully usable offline.

use crate::models::LlmConfig;
use anyhow::{Context, Result};
use serde_json::{json, Value};
use std::sync::Mutex;

/// Process-global LLM configuration.
///
/// Uses OnceLock so it can be initialized lazily without const-eval constraints.
static CONFIG: std::sync::OnceLock<Mutex<LlmConfig>> = std::sync::OnceLock::new();

fn config() -> &'static Mutex<LlmConfig> {
    CONFIG.get_or_init(|| Mutex::new(LlmConfig::default()))
}

/// Read the current LLM config (copy).
pub fn get_config() -> Result<LlmConfig> {
    Ok(config().lock().unwrap().clone())
}

/// Replace the current LLM config.
pub fn set_config(config: LlmConfig) -> Result<()> {
    *config().lock().unwrap() = config;
    Ok(())
}

/// A minimal OpenAI-compatible chat client.
pub struct LlmClient {
    base_url: String,
    model: String,
    api_key: Option<String>,
    enabled: bool,
    http: reqwest::Client,
}

impl LlmClient {
    /// Build a client from the current global config.
    pub fn from_config() -> Self {
        let cfg = CONFIG.lock().unwrap().clone();
        Self {
            base_url: cfg.base_url,
            model: cfg.model,
            api_key: cfg.api_key,
            enabled: cfg.enabled,
            http: reqwest::Client::builder()
                .timeout(std::time::Duration::from_secs(60))
                .build()
                .unwrap_or_default(),
        }
    }

    pub fn is_enabled(&self) -> bool {
        self.enabled && self.api_key.is_some()
    }

    /// Send a chat completion request. Returns the assistant message text.
    pub async fn chat(&self, system: &str, user: &str) -> Result<String> {
        if !self.is_enabled() {
            anyhow::bail!("LLM is not configured");
        }

        let url = format!(
            "{}/chat/completions",
            self.base_url.trim_end_matches('/')
        );
        let body = json!({
            "model": self.model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "temperature": 0.7,
        });

        let mut req = self.http.post(&url).json(&body);
        if let Some(key) = &self.api_key {
            req = req.header("Authorization", format!("Bearer {key}"));
        }

        let resp = req.send().await.context("LLM request failed")?;
        if !resp.status().is_success() {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();
            anyhow::bail!("LLM returned {status}: {text}");
        }

        let json: Value = resp.json().await.context("LLM returned invalid JSON")?;
        let text = json["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or("")
            .to_string();
        Ok(text)
    }
}

/// Convenience constructor used by tests and stub mode.
pub fn client_from_config() -> LlmClient {
    LlmClient::from_config()
}