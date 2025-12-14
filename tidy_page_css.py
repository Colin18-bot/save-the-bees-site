from pathlib import Path
import re

CSS_PATH = Path("css/style.css")
BACKUP_PATH = Path("css/style.BACKUP_BEFORE_TIDY.css")

# Matches your extracted headers exactly
EXTRACT_HDR = re.compile(r"/\*\s*----\s*Extracted from:\s*(.*?)\s*----\s*\*/\s*", re.IGNORECASE)

def main():
    css = CSS_PATH.read_text(encoding="utf-8", errors="ignore")

    # Backup once per run
    if not BACKUP_PATH.exists():
        BACKUP_PATH.write_text(css, encoding="utf-8")

    # Split into segments, capturing the filename in the header
    parts = EXTRACT_HDR.split(css)
    if len(parts) == 1:
        print("No 'Extracted from' sections found. Nothing to tidy.")
        return

    # parts structure: [before, file1, block1, file2, block2, ...]
    before = parts[0].rstrip() + "\n"
    extracted = []
    for i in range(1, len(parts), 2):
        fname = parts[i].strip()
        block = parts[i + 1].strip("\n")
        extracted.append((fname, block))

    # Sort extracted blocks by filename for readability
    extracted.sort(key=lambda x: x[0].lower())

    # Build a clean extracted section (content unchanged)
    out = [before]
    out.append("\n\n/* =====================================================\n")
    out.append("   Page-specific extracted CSS (grouped for readability)\n")
    out.append("   (No selector/value changes — formatting only)\n")
    out.append("   ===================================================== */\n\n")

    for fname, block in extracted:
        out.append(f"/* === PAGE: {fname} === */\n")
        out.append(block.rstrip() + "\n\n")

    # Final small cleanup: collapse 3+ blank lines to 2
    result = re.sub(r"\n{3,}", "\n\n", "".join(out)).rstrip() + "\n"
    CSS_PATH.write_text(result, encoding="utf-8")

    print("Done. Grouped extracted CSS blocks and cleaned spacing/comments only.")
    print(f"Backup saved to: {BACKUP_PATH}")

if __name__ == "__main__":
    main()
