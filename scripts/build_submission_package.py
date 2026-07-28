"""Assemble the reviewed FMRG submission ZIP without raw data."""

from __future__ import annotations

import hashlib
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "deliverables/submission/NSF_CHUDS_Final_Submission.zip"
ARCHIVE_ROOT = "NSF_CHUDS_Final_Submission"

FILES = {
    "deliverables/submission/README_SUBMISSION.md": "README_SUBMISSION.md",
    "deliverables/report/FMRG_Final_Report_Audited.pdf": "01_Final_Report.pdf",
    "notebooks/03_final_submission_audited.ipynb": "02_Executable_Notebook.ipynb",
    "deliverables/presentation/FMRG_Final_Submission_Audited.pptx": "03_Presentation_Deck.pptx",
    "requirements.txt": "requirements.txt",
    "results/improved_submission/metrics.json":
        "results/improved_submission/metrics.json",
    "results/improved_submission/outer_fold_predictions.csv":
        "results/improved_submission/outer_fold_predictions.csv",
    "results/improved_submission/figures/nested_outer_predictions.png":
        "results/improved_submission/figures/nested_outer_predictions.png",
    "results/improved_submission/figures/before_after_scorecard.png":
        "results/improved_submission/figures/before_after_scorecard.png",
}


def main():
    missing = [relative for relative in FILES if not (ROOT / relative).is_file()]
    if missing:
        raise FileNotFoundError(f"Missing submission files: {missing}")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(OUTPUT, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for relative, destination in FILES.items():
            archive.write(
                ROOT / relative,
                arcname=f"{ARCHIVE_ROOT}/{destination}",
            )

    digest = hashlib.sha256(OUTPUT.read_bytes()).hexdigest()
    print(f"{OUTPUT}\nsha256 {digest}")


if __name__ == "__main__":
    main()
