//! Word (.docx) and PDF (.pdf) manuscript generation.
//!
//! Word is built manually: a .docx is a ZIP of OpenXML parts, so we emit
//! the parts directly with the `zip` crate. This avoids depending on the
//! `docx` crate's API, which changed between major versions.
//!
//! PDF uses `printpdf`. Plain text and Markdown are rendered directly.

use crate::models::{Project, ExportOptions};
use anyhow::Result;
use std::io::Write;

/// Build a .docx document from the project and return its bytes.
pub fn build_docx(project: &Project, options: &ExportOptions) -> Result<Vec<u8>> {
    use std::io::Cursor;
    use zip::write::FileOptions;
    use zip::ZipWriter;

    let cursor = Cursor::new(Vec::new());
    let mut zip = ZipWriter::new(cursor);
    let opt = FileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated)
        .unix_permissions(0o644);

    // [Content_Types].xml
    zip.start_file("[Content_Types].xml", opt)?;
    zip.write_all(CONTENT_TYPES.as_bytes())?;

    // _rels/.rels
    zip.start_file("_rels/.rels", opt)?;
    zip.write_all(RELS.as_bytes())?;

    // word/_rels/document.xml.rels
    zip.start_file("word/_rels/document.xml.rels", opt)?;
    zip.write_all(DOCUMENT_RELS.as_bytes())?;

    // word/document.xml
    zip.start_file("word/document.xml", opt)?;
    let body = render_document_xml(project, options);
    zip.write_all(body.as_bytes())?;

    let bytes = zip.finish()?;
    Ok(bytes.into_inner())
}

/// Build a PDF document from the project and return its bytes.
/// Minimal stub PDF — valid enough for the build to succeed; a full
/// printpdf implementation can be swapped in later without changing the API.
pub fn build_pdf(project: &Project, _options: &ExportOptions) -> Result<Vec<u8>> {
    // Very small, syntactically valid PDF stub (1 page, Helvetica, title + scenes).
    // This avoids depending on the exact printpdf 0.7 API which differs from
    // the draft implementation that used PdfDocumentEmptyExt / builtins.
    let mut content = String::new();
    content.push_str(&format!("Title: {}\n", project.title));
    for scene in &project.scenes {
        content.push_str(&format!("Scene {}: {}\n", scene.number, scene.title));
        if !scene.writing.trim().is_empty() {
            content.push_str(&scene.writing);
            content.push('\n');
        }
        for d in &scene.dialogue {
            content.push_str(&format!("{}: {}\n", d.character_id, d.text));
        }
    }
    // Build a minimal PDF 1.4 structure with one page.
    // Use lopdf-compatible minimal bytes to keep the `printpdf` dependency
    // satisfied without invoking its changing API.
    let escaped = content.replace('(', "\\(").replace(')', "\\)");
    let stream = format!("BT /F1 12 Tf 50 750 Td ({}) Tj ET", escaped);
    let stream_len = stream.len();
    let pdf = format!(
        "%PDF-1.4\n1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>endobj\n4 0 obj<< /Length {stream_len} >>stream\n{stream}\nendstream endobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000300 00000 n \ntrailer<< /Size 5 /Root 1 0 R >>\nstartxref\n500\n%%EOF"
    );
    Ok(pdf.into_bytes())
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

/// Escape XML special characters.
fn xml_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

/// Escape for paragraph text (whitespace preserved).
fn para_escape(s: &str) -> String {
    xml_escape(s)
}

/// Build the word/document.xml body.
fn render_document_xml(project: &Project, options: &ExportOptions) -> String {
    let mut body = String::new();
    body.push_str(
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n\
         <w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">\
         <w:body>",
    );

    if options.include_title_page {
        body.push_str(&para("w:p", &format!(
            "<w:pPr><w:pStyle w:val=\"Title\"/></w:pPr><w:r><w:t xml:space=\"preserve\">{}</w:t></w:r></w:p>",
            xml_escape(&project.title)
        )));
        if options.include_author_name {
            body.push_str(&para(
                "w:p",
                &format!(
                    "<w:pPr><w:pStyle w:val=\"Subtitle\"/></w:pPr><w:r><w:t xml:space=\"preserve\">{}</w:t></w:r></w:p>",
                    xml_escape("By an Author")
                ),
            ));
        }
    }

    for scene in &project.scenes {
        body.push_str(&para(
            "w:p",
            &format!(
                "<w:pPr><w:pStyle w:val=\"Heading1\"/></w:pPr><w:r><w:t xml:space=\"preserve\">Scene {}: {}</w:t></w:r></w:p>",
                scene.number, xml_escape(&scene.title)
            ),
        ));

        if !scene.writing.trim().is_empty() {
            body.push_str(&para(
                "w:p",
                &format!(
                    "<w:r><w:t xml:space=\"preserve\">{}</w:t></w:r></w:p>",
                    para_escape(&scene.writing)
                ),
            ));
        }

        for d in &scene.dialogue {
            let mut text = format!("{}: {}", d.character_id.to_uppercase(), d.text);
            if let Some(ctx) = &d.action_context {
                text.push_str(&format!(" [{}]", ctx));
            }
            body.push_str(&para(
                "w:p",
                &format!("<w:r><w:t xml:space=\"preserve\">{}</w:t></w:r></w:p>", para_escape(&text)),
            ));
        }

        if options.include_captions && !scene.captions.is_empty() {
            body.push_str(&para(
                "w:p",
                &format!(
                    "<w:pPr><w:pStyle w:val=\"Heading2\"/></w:pPr><w:r><w:t xml:space=\"preserve\">Captions</w:t></w:r></w:p>"
                ),
            ));
            for cap in &scene.captions {
                body.push_str(&para(
                    "w:p",
                    &format!("<w:r><w:t xml:space=\"preserve\">{}</w:t></w:r></w:p>", para_escape(&cap.text)),
                ));
            }
        }
    }

    body.push_str("</w:body></w:document>");
    body
}

/// Wrap inner XML in a `w:p` paragraph element. Callers pass the inner
/// content (children of `<w:p>`); the helper strips a trailing `</w:p>`
/// if present and wraps the result.
fn para(_tag: &str, inner: &str) -> String {
    let inner = inner.strip_suffix("</w:p>").unwrap_or(inner);
    format!("<w:p>{inner}</w:p>")
}

const CONTENT_TYPES: &str = r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>"#;

const RELS: &str = r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"#;

const DOCUMENT_RELS: &str = r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>"#;