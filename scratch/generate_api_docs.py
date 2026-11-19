import os
import subprocess
import markdown
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

WORKSPACE_DIR = r"C:\Users\hp\OneDrive\Desktop\KISS Vocational Training Management System"
MD_PATH = os.path.join(WORKSPACE_DIR, "08 Documentation", "API_DOCUMENTATION.md")
HTML_PATH = os.path.join(WORKSPACE_DIR, "scratch", "API_DOCUMENTATION.html")
PDF_PATH_DOCS = os.path.join(WORKSPACE_DIR, "08 Documentation", "API_DOCUMENTATION.pdf")
PDF_PATH_ROOT = os.path.join(WORKSPACE_DIR, "API_DOCUMENTATION.pdf")
DOCX_PATH_DOCS = os.path.join(WORKSPACE_DIR, "08 Documentation", "API_DOCUMENTATION.docx")
DOCX_PATH_ROOT = os.path.join(WORKSPACE_DIR, "API_DOCUMENTATION.docx")

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

def generate_html_and_pdf():
    with open(MD_PATH, "r", encoding="utf-8") as f:
        md_text = f.read()

    # Convert Markdown to HTML
    html_body = markdown.markdown(md_text, extensions=['tables', 'fenced_code', 'toc'])

    # Style badges in HTML
    html_body = html_body.replace("<code>POST</code>", "<span class='badge badge-post'>POST</span>")
    html_body = html_body.replace("<code>GET</code>", "<span class='badge badge-get'>GET</span>")
    html_body = html_body.replace("<code>PUT</code>", "<span class='badge badge-put'>PUT</span>")
    html_body = html_body.replace("<code>DELETE</code>", "<span class='badge badge-del'>DELETE</span>")

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>KV-TMS RESTful API Specification</title>
<style>
    @page {{
        size: A4;
        margin: 18mm 14mm 18mm 14mm;
        @bottom-right {{
            content: "Page " counter(page);
            font-size: 9pt;
            color: #64748b;
        }}
    }}
    body {{
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
        line-height: 1.5;
        font-size: 10pt;
        background-color: #ffffff;
        margin: 0;
        padding: 0;
    }}
    .header-banner {{
        background: linear-gradient(135deg, #006837 0%, #1e3a8a 100%);
        color: #ffffff;
        padding: 24px;
        border-radius: 8px;
        margin-bottom: 24px;
        border-bottom: 4px solid #fcb900;
    }}
    .header-banner h1 {{
        margin: 0 0 6px 0;
        font-size: 20pt;
        font-weight: 800;
        color: #ffffff;
    }}
    .header-banner p {{
        margin: 4px 0;
        font-size: 10.5pt;
        opacity: 0.95;
    }}
    h1 {{
        color: #006837;
        font-size: 16pt;
        border-bottom: 2px solid #006837;
        padding-bottom: 4px;
        margin-top: 24px;
        margin-bottom: 12px;
        page-break-after: avoid;
    }}
    h2 {{
        color: #1e3a8a;
        font-size: 13pt;
        margin-top: 18px;
        margin-bottom: 8px;
        page-break-after: avoid;
    }}
    h3 {{
        color: #334155;
        font-size: 11pt;
        margin-top: 14px;
        margin-bottom: 6px;
        page-break-after: avoid;
    }}
    h4 {{
        color: #475569;
        font-size: 10pt;
        margin-top: 10px;
        margin-bottom: 4px;
        page-break-after: avoid;
    }}
    p, li {{
        font-size: 9.5pt;
        color: #334155;
    }}
    table {{
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0 16px 0;
        font-size: 8.5pt;
        page-break-inside: auto;
    }}
    tr {{
        page-break-inside: avoid;
        page-break-after: auto;
    }}
    thead {{
        display: table-header-group;
    }}
    th {{
        background-color: #006837;
        color: #ffffff;
        font-weight: 700;
        text-align: left;
        padding: 6px 8px;
        border: 1px solid #00522c;
    }}
    td {{
        padding: 5px 8px;
        border: 1px solid #cbd5e1;
        vertical-align: top;
    }}
    tbody tr:nth-child(even) {{
        background-color: #f8fafc;
    }}
    code {{
        font-family: Consolas, "Courier New", monospace;
        font-size: 8.5pt;
        background-color: #f1f5f9;
        color: #0f172a;
        padding: 1px 4px;
        border-radius: 4px;
        border: 1px solid #e2e8f0;
    }}
    pre {{
        background-color: #0f172a;
        color: #f8fafc;
        padding: 10px 12px;
        border-radius: 6px;
        font-family: Consolas, "Courier New", monospace;
        font-size: 8pt;
        overflow-x: auto;
        page-break-inside: avoid;
        margin: 8px 0;
    }}
    pre code {{
        background: transparent;
        color: #f8fafc;
        padding: 0;
        border: none;
    }}
    .badge {{
        font-weight: 700;
        font-size: 7.5pt;
        padding: 2px 6px;
        border-radius: 4px;
        display: inline-block;
        color: #ffffff;
        font-family: Consolas, monospace;
    }}
    .badge-get {{ background-color: #0284c7; }}
    .badge-post {{ background-color: #16a34a; }}
    .badge-put {{ background-color: #d97706; }}
    .badge-del {{ background-color: #dc2626; }}
    hr {{
        border: 0;
        height: 1px;
        background-color: #e2e8f0;
        margin: 18px 0;
    }}
    .footer-note {{
        margin-top: 30px;
        padding-top: 10px;
        border-top: 1px solid #cbd5e1;
        font-size: 8pt;
        color: #64748b;
        text-align: center;
    }}
</style>
</head>
<body>
<div class="header-banner">
    <h1>KISS VOCATIONAL TRAINING MANAGEMENT SYSTEM (KV-TMS)</h1>
    <p><strong>RESTful API Specification & Developer Integration Reference Manual</strong></p>
    <p>Version 1.0.0 Enterprise • Spring Boot 3.3 / Java 17 / MySQL 8.0 / React 18</p>
</div>

{html_body}

<div class="footer-note">
    Official Enterprise Documentation &bull; Kalinga Institute of Social Sciences (KISS Deemed to be University) &bull; Confidential & Proprietary
</div>
</body>
</html>
"""

    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(full_html)
    print("Generated styled HTML:", HTML_PATH)

    # Use Edge headless to generate PDF
    cmd = [
        EDGE_PATH,
        "--headless",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        "--no-pdf-header-footer",
        f"--print-to-pdf={PDF_PATH_DOCS}",
        HTML_PATH
    ]
    subprocess.run(cmd, check=True)
    print("Generated PDF at:", PDF_PATH_DOCS)

    # Copy to root as well
    if os.path.exists(PDF_PATH_DOCS):
        with open(PDF_PATH_DOCS, "rb") as src, open(PDF_PATH_ROOT, "wb") as dst:
            dst.write(src.read())
        print("Copied PDF to root at:", PDF_PATH_ROOT)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=80, bottom=80, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def generate_docx():
    doc = docx.Document()

    # Set standard 0.75-inch margins
    for section in doc.sections:
        section.top_margin = Inches(0.7)
        section.bottom_margin = Inches(0.7)
        section.left_margin = Inches(0.7)
        section.right_margin = Inches(0.7)

    # Title
    title = doc.add_paragraph()
    r_title = title.add_run("KISS VOCATIONAL TRAINING MANAGEMENT SYSTEM (KV-TMS)")
    r_title.bold = True
    r_title.font.size = Pt(20)
    r_title.font.color.rgb = RGBColor(0, 104, 55) # KISS Green

    subtitle = doc.add_paragraph()
    r_sub = subtitle.add_run("RESTful API Specification & Developer Integration Reference Manual")
    r_sub.bold = True
    r_sub.font.size = Pt(13)
    r_sub.font.color.rgb = RGBColor(30, 58, 138)

    meta = doc.add_paragraph()
    r_meta = meta.add_run("Version: 1.0.0 Enterprise Release | Base URL: http://localhost:8080/api/v1 | Protocol: HTTP/REST/JSON")
    r_meta.italic = True
    r_meta.font.size = Pt(9.5)
    r_meta.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_paragraph("―" * 55)

    with open(MD_PATH, "r", encoding="utf-8") as f:
        lines = f.readlines()

    in_table = False
    table_lines = []

    in_code = False
    code_lines = []

    for line in lines:
        raw = line.rstrip("\n")

        # Code block handling
        if raw.startswith("```"):
            if in_code:
                # Flush code block
                in_code = False
                p = doc.add_paragraph()
                p.paragraph_format.left_indent = Inches(0.2)
                p.paragraph_format.space_before = Pt(4)
                p.paragraph_format.space_after = Pt(4)
                code_text = "\n".join(code_lines)
                r = p.add_run(code_text)
                r.font.name = "Consolas"
                r.font.size = Pt(8.5)
                r.font.color.rgb = RGBColor(15, 23, 42)
                code_lines = []
            else:
                in_code = True
                code_lines = []
            continue

        if in_code:
            code_lines.append(raw)
            continue

        # Table handling
        if raw.startswith("|") and raw.endswith("|"):
            if not in_table:
                in_table = True
                table_lines = []
            table_lines.append(raw)
            continue
        else:
            if in_table:
                in_table = False
                # Render table
                valid_rows = [r for r in table_lines if not set(r.replace("|", "").strip()).issubset({"-", " ", ":"})]
                if valid_rows:
                    num_cols = len([c for c in valid_rows[0].split("|")[1:-1]])
                    t = doc.add_table(rows=len(valid_rows), cols=num_cols)
                    t.alignment = WD_TABLE_ALIGNMENT.CENTER
                    for row_idx, r_text in enumerate(valid_rows):
                        cols = [c.strip() for c in r_text.split("|")[1:-1]]
                        for col_idx, cell_value in enumerate(cols):
                            if col_idx < num_cols:
                                cell = t.cell(row_idx, col_idx)
                                cell.text = cell_value
                                for p in cell.paragraphs:
                                    p.paragraph_format.space_before = Pt(2)
                                    p.paragraph_format.space_after = Pt(2)
                                    for run in p.runs:
                                        run.font.size = Pt(8.5)
                                        if row_idx == 0:
                                            run.bold = True
                                            run.font.color.rgb = RGBColor(255, 255, 255)
                                        else:
                                            run.font.color.rgb = RGBColor(30, 41, 59)
                                if row_idx == 0:
                                    set_cell_background(cell, "006837")
                                else:
                                    if row_idx % 2 == 0:
                                        set_cell_background(cell, "F8FAFC")
                                set_cell_margins(cell, top=60, bottom=60, left=90, right=90)
                    doc.add_paragraph()
                table_lines = []

        # Heading 1
        if raw.startswith("# "):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(4)
            r = p.add_run(raw[2:].strip())
            r.bold = True
            r.font.size = Pt(15)
            r.font.color.rgb = RGBColor(0, 104, 55)

        # Heading 2
        elif raw.startswith("## "):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(3)
            r = p.add_run(raw[3:].strip())
            r.bold = True
            r.font.size = Pt(12.5)
            r.font.color.rgb = RGBColor(30, 58, 138)

        # Heading 3
        elif raw.startswith("### "):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(raw[4:].strip())
            r.bold = True
            r.font.size = Pt(11)
            r.font.color.rgb = RGBColor(51, 65, 85)

        # Heading 4
        elif raw.startswith("#### "):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(raw[5:].strip())
            r.bold = True
            r.font.size = Pt(10)
            r.font.color.rgb = RGBColor(71, 85, 105)

        # Horizontal Rule
        elif raw.strip() in ["---", "***", "___"]:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(6)
            r = p.add_run("―" * 55)
            r.font.color.rgb = RGBColor(203, 213, 225)

        # List item
        elif raw.strip().startswith("- ") or raw.strip().startswith("* "):
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(raw.strip()[2:])
            r.font.size = Pt(9.5)

        # Regular text
        elif raw.strip():
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(3)
            r = p.add_run(raw.strip())
            r.font.size = Pt(9.5)
            r.font.color.rgb = RGBColor(30, 41, 59)

    doc.save(DOCX_PATH_DOCS)
    print("Generated DOCX at:", DOCX_PATH_DOCS)

    # Copy to root as well
    with open(DOCX_PATH_DOCS, "rb") as src, open(DOCX_PATH_ROOT, "wb") as dst:
        dst.write(src.read())
    print("Copied DOCX to root at:", DOCX_PATH_ROOT)

if __name__ == "__main__":
    generate_html_and_pdf()
    generate_docx()
    print("ALL API DOCUMENTATION FILES (.MD, .PDF, .DOCX) GENERATED SUCCESSFULLY!")
