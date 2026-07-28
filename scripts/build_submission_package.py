"""Assemble the reviewed FMRG submission ZIP without raw data."""

from __future__ import annotations

import hashlib
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "deliverables/submission/NSF_CHUDS_Final_Submission.zip"
ARCHIVE_ROOT = "NSF_CHUDS_Final_Submission"

RENAMED_FILES = {
    "deliverables/submission/README_SUBMISSION.md": "README_SUBMISSION.md",
    "deliverables/submission/RUBRIC_COMPLIANCE.md": "RUBRIC_COMPLIANCE.md",
    "deliverables/report/FMRG_Final_Report_Audited.pdf": "01_Final_Report.pdf",
    "notebooks/03_final_submission_audited.ipynb": "02_Executable_Notebook.ipynb",
    "deliverables/presentation/FMRG_Final_Submission_Audited.pptx": "03_Presentation_Deck.pptx",
    "deliverables/presentation/FMRG_Final_Submission_Audited.pdf": "03_Presentation_Deck.pdf",
    "README.md": "README_REPOSITORY.md",
    "deliverables/submission/REPOSITORY_URLS.txt": "REPOSITORY_URLS.txt",
}

REPRODUCIBILITY_FILES = [
    "requirements.txt",
    "pyproject.toml",
    "package.json",
    "results/improved_submission/README.md",
    "results/improved_submission/metrics.json",
    "results/improved_submission/candidate_scores.csv",
    "results/improved_submission/outer_fold_predictions.csv",
    "results/improved_submission/incumbent_outer_fold_predictions.csv",
    "results/improved_submission/figures/nested_outer_predictions.png",
    "results/improved_submission/figures/before_after_scorecard.png",
    "results/improved_submission/causal_ablation/metrics.json",
    "results/improved_submission/causal_ablation/outer_fold_predictions.csv",
    "results/improved_submission/causal_ablation/candidate_scores.csv",
    "scripts/run_final_analysis.py",
    "scripts/build_final_notebook.py",
    "scripts/build_final_report.py",
    "scripts/build_final_deck.mjs",
    "src/nsf_fmrg_data.py",
    "src/fmrg_submission/__init__.py",
    "src/fmrg_submission/geometry.py",
    "src/fmrg_submission/evaluation.py",
    "src/fmrg_submission/experiments.py",
    "src/fmrg_submission/modeling.py",
    "src/fmrg_submission/sem.py",
    "src/fmrg_submission/targets.py",
    "src/fmrg_submission/thermal.py",
    "src/fmrg_submission/uncertainty.py",
    "scripts/run_improvement_experiments.py",
    "tests/test_evaluation.py",
    "tests/test_experiments.py",
    "tests/test_geometry.py",
    "tests/test_modeling.py",
    "tests/test_sem.py",
    "tests/test_targets.py",
    "tests/test_thermal.py",
    "tests/test_uncertainty.py",
]

FILES = {
    **RENAMED_FILES,
    **{relative: relative for relative in REPRODUCIBILITY_FILES},
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
