# Results

Store small, reviewable outputs that support the report and presentation:

```text
results/
  figures/     # final plots included in report or slides
  tables/      # compact CSV summaries and metrics
  summaries/   # experiment conclusions in Markdown
```

Do not commit raw thermal, SEM, or height-map files here. Record the notebook, code version, data split, and metric definition for every result used in a deliverable.

## Audited final results

`final_submission/` contains the locked metrics, aligned per-track tables,
held-out predictions, and figures used by the final notebook, report, and
presentation. Tracks 8, 10, and 14 are used for grouped model selection and
calibration; Track 21 is the untouched final test condition.
