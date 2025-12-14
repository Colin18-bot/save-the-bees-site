import re
from pathlib import Path
from datetime import datetime

# ---- CONFIG ----
SITE_ROOT = Path(".")                 # run from inside save-the-bees-site
STYLE_CSS_PATH = SITE_ROOT / "css" / "style.css"
HTML_EXTENSIONS = {".html", ".htm"}
# ----------------

style_block_re = re.compile(
    r"<style\b[^>]*>(.*?)</style>",
    re.IGNORECASE | re.DOTALL
)

def main():
    if not STYLE_CSS_PATH.exists():
        raise FileNotFoundError(f"Can't find stylesheet: {STYLE_CSS_PATH}")

    moved_blocks = 0
    extracted_chunks = []

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    extracted_chunks.append(
        "\n\n/* =====================================================\n"
        f"   Embedded CSS extracted from root HTML ({timestamp})\n"
        "   ===================================================== */\n"
    )

    # 🔒 ONLY html files in root directory
    html_files = [
        p for p in SITE_ROOT.iterdir()
        if p.is_file() and p.suffix.lower() in HTML_EXTENSIONS
    ]

    for html_path in sorted(html_files):
        html_text = html_path.read_text(encoding="utf-8", errors="ignore")
        blocks = style_block_re.findall(html_text)

        if not blocks:
            continue

        extracted_chunks.append(
            f"\n\n/* ---- Extracted from: {html_path.name} ---- */\n"
        )

        for b in blocks:
            css = b.strip()
            if css:
                extracted_chunks.append(css + "\n")
                moved_blocks += 1

        # Remove only <style> blocks
        new_html = style_block_re.sub("", html_text)
        html_path.write_text(new_html, encoding="utf-8")

    if moved_blocks:
        with STYLE_CSS_PATH.open("a", encoding="utf-8") as f:
            f.write("".join(extracted_chunks))

        print(f"Done. Moved {moved_blocks} <style> block(s).")
        print("✔ Only root-level HTML processed.")
        print("✔ Subfolders untouched.")
    else:
        print("No embedded <style> blocks found in root HTML files.")

if __name__ == "__main__":
    main()
