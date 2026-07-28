# Team NSF-CHUDS — Final Resubmission

This single folder contains the three materials required by the NSF Future
Manufacturing Data Challenge:

1. `01_Final_Report.pdf` — three-page report, Arial 10 pt or larger, with
   one-inch margins.
2. `02_Executable_Notebook.ipynb` — executed Jupyter notebook with no cell
   errors.
3. `03_Presentation_Deck.pptx` — editable, self-contained ten-slide deck.

`03_Presentation_Deck.pdf` is included as a portable copy. The remaining
folders contain the analysis source, locked outer-fold results, tests, and
reproduction scripts. `RUBRIC_COMPLIANCE.md` maps every official format,
report-content, and review criterion to evidence or an explicitly disclosed
limitation.

## Primary and ablation results

The primary model is an **offline completed-sequence hierarchical model**. It
runs after the thermal scan finishes. Under nested leave-one-track-out
validation across Tracks 8, 10, 14, and 21:

- track-balanced width MAE: 0.1484 mm;
- track-balanced R-squared: -0.1345;
- worst-track width MAE: 0.2008 mm;
- mean boundary MAE: 0.1419 mm; and
- conditional conformal coverage: 93.51%.

The current-and-past-only causal ablation uses the same hierarchy with
expanding thermal summaries. It achieves 0.1566 mm MAE and -0.1816
track-balanced R-squared.

The primary model uses the completed thermal sequence. No held-out geometry,
test-track labels, or post-process SEM enters prediction or model selection.
Post-process SEM is excluded because it is unavailable at prediction time. We
do not claim instantaneous or closed-loop readiness.

## Reproduce

Install Python dependencies:

```bash
python -m pip install -r requirements.txt
```

Download the official data from Zenodo DOI `10.5281/zenodo.21285367`, then run:

```bash
PYTHONPATH=src LOKY_MAX_CPU_COUNT=1 MPLBACKEND=Agg \
  python scripts/run_improvement_experiments.py \
  --raw-dir /path/to/extracted/zenodo/data \
  --cache-dir /path/to/cache \
  --output-dir results/improved_submission
```

Run the tests:

```bash
PYTHONPATH=src python -m pytest -q
```

Repository mirrors:

- https://github.com/alphons3t/nsf-chuds
- https://github.com/joeyperez1-debug/nsfsubmit

## Generative AI disclosure

Generative AI assisted with code review, test generation, debugging, and
document layout. Team members reviewed the resulting code and materials. All
reported values come from tracked analysis code and saved outer-fold
predictions. AI did not supply or alter experimental measurements.
