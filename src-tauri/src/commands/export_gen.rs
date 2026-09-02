//! Word (.docx) and PDF (.pdf) manuscript generation.
//!
//! Both are fully offline: no external Office dependency on the user's
//! machine. Word uses the `docx` crate; PDF uses `printpdf`.

use crate::models::{Project, ExportOptions};
use anyhow::{Context, Result};

/// Build a .docx document from the project and return its bytes.
pub fn build_docx(project: &Project, options: &ExportOptions) -> Result<Vec<u8>> {
    use docx::document::Document;
    use docx::document::Paragraph;
    use docx::paragraph::Spacing;

    let mut doc = Document::new();

    if options.include_title_page {
        doc = doc.add(Paragraph::new().style("Title").add(&project.title));
        if options.include_author_name {
            doc = doc.add(Paragraph::new().style("Subtitle").add("By an Author"));
        }
        doc = doc.add(Paragraph::new().spacing(Spacing::new().line(240)));
    }

    if options.include_toc {
        doc = doc.add(Paragraph::new().style("Heading1").add("Table of Contents"));
    }

    if options.include_character_notes && !project.characters.is_empty() {
        doc = doc.add(Paragraph::new().style("Heading1").add("Characters"));
        for c in &project.characters {
            let mut line = format!("{} — {}", c.name, c.role.as_deref().unwrap_or(""));
            if let Some(arc) = &c.arc {
                line.push_str(&format!(" ({})", arc));
            }
            doc = doc.add(Paragraph::new().add(line));
        }
    }

    for scene in &project.scenes {
        if options.include_scene_headings {
            doc = doc.add(
                Paragraph::new()
                    .style("Heading1")
                    .add(format!("Scene {}: {}", scene.number, scene.title)),
            );
        } else {
            doc = doc.add(
                Paragraph::new()
                    .style("Heading1")
                    .add(format!("Scene {}: {}", scene.number, scene.title)),
            );
        }

        if !scene.writing.trim().is_empty() {
            doc = doc.add(Paragraph::new().add(&scene.writing));
        }

        for d in &scene.dialogue {
            let mut p = Paragraph::new();
            p = p.add(format!("{}: {}", d.character_id.to_uppercase(), d.text));
            if let Some(ctx) = &d.action_context {
                p = p.add(format!(" [{}]", ctx));
            }
            doc = doc.add(p);
        }

        if options.include_captions && !scene.captions.is_empty() {
            doc = doc.add(Paragraph::new().style("Heading2").add("Captions"));
            for cap in &scene.captions {
                doc = doc.add(Paragraph::new().add(&cap.text));
            }
        }
    }

    let bytes = doc.build().context("failed to build docx")?;
    Ok(bytes)
}

/// Build a PDF document from the project and return its bytes.
pub fn build_pdf(project: &Project, options: &ExportOptions) -> Result<Vec<u8>> {
    use printpdf::{PdfDocument, PdfDocumentEmptyExt, PdfParagraph, PdfText};

    let mut doc = PdfDocument::new(&project.title);
    let font = doc.add_font(printpdf::builtins::DejaVuSerif::normal());
    let bold = doc.add_font(printpdf::builtins::DejaVuSerif::bold());

    let mut page = doc.add_page(PdfParagraph::new(&font, 12.0), None);
    page = page.add_text(&bold, 18.0, &project.title);

    if options.include_title_page {
        if options.include_author_name {
            page = page.add_text(&font, 12.0, "By an Author");
        }
    }

    for scene in &project.scenes {
        page = page.add_text(&bold, 14.0, &format!("Scene {}: {}", scene.number, scene.title));

        if !scene.writing.trim().is_empty() {
            page = page.add_text(&font, 12.0, &scene.writing);
        }

        for d in &scene.dialogue {
            page = page.add_text(
                &bold,
                12.0,
                &format!("{}: {}", d.character_id.to_uppercase(), d.text),
            );
        }

        if options.include_captions && !scene.captions.is_empty() {
            page = page.add_text(&bold, 12.0, "Captions");
            for cap in &scene.captions {
                page = page.add_text(&font, 12.0, &cap.text);
            }
        }
    }

    let bytes = doc.save().context("failed to build pdf")?;
    Ok(bytes)
}

/// Render the manuscript as a plain-text string.
pub fn render_plain_text(project: &Project) -> String {
    let mut out = String::new();
    out.push_str(&project.title);
    out.push_str("\n\n");
    if let Some(p) = &project.premise {
        out.push_str(p);
        out.push_str("\n\n");
    }
    for scene in &project.scenes {
        out.push_str(&format!("Scene {}: {}\n\n", scene.number, scene.title));
        if !scene.writing.trim().is_empty() {
            out.push_str(&scene.writing);
            if !scene.writing.ends_with('\n') {
                out.push('\n');
            }
            out.push('\n');
        }
        for d in &scene.dialogue {
            out.push_str(&format!("[{}]: {}\n", d.character_id, d.text));
        }
        if !scene.dialogue.is_empty() {
            out.push('\n');
        }
    }
    out
}

/// Render the manuscript as a Markdown string.
pub fn render_markdown(project: &Project) -> String {
    let mut out = String::new();
    out.push_str(&format!("# {}\n\n", project.title));
    if let Some(p) = &project.premise {
        out.push_str(&format!("> {}\n\n", p));
    }
    for scene in &project.scenes {
        out.push_str(&format!("## Scene {}: {}\n\n", scene.number, scene.title));
        if !scene.writing.trim().is_empty() {
            out.push_str(&scene.writing);
            if !scene.writing.ends_with('\n') {
                out.push('\n');
            }
            out.push('\n');
        }
        for d in &scene.dialogue {
            out.push_str(&format!("**{}**: {}\n\n", d.character_id, d.text));
        }
    }
    out
}

/// Validate export options against the project (e.g. warn if no scenes).
pub fn validate(project: &Project, options: &ExportOptions) -> Result<()> {
    if project.scenes.is_empty() {
        anyhow::bail!("Cannot export a project with no scenes.");
    }
    if options.include_toc && project.scenes.len() > 50 {
        anyhow::bail!("TOC requested but the project is too large.");
    }
    Ok(())
}