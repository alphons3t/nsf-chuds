# NSF Future Manufacturing Data Challenge — compliance crosswalk

Official requirements reviewed July 27, 2026:

- Final materials: https://sites.google.com/tamu.edu/nsf-future-data-challenge/final-report-materials
- Competition rules: https://sites.google.com/tamu.edu/nsf-future-data-challenge/competition-rules
- Challenge prompt: https://sites.google.com/tamu.edu/nsf-future-data-challenge/the-challenge

This crosswalk identifies where each requirement is addressed. It documents
coverage; it does not promise a particular judge score.

## Submission-format requirements

| Requirement | Status | Evidence |
|---|---|---|
| One ZIP file | Met | `NSF_CHUDS_Final_Submission.zip` contains one root folder. |
| Final report in PDF | Met | `01_Final_Report.pdf`. |
| Report no longer than 3 pages | Met | Three US-Letter pages. |
| Minimum 10 pt Arial | Met | Report styles use Arial at 10 pt or larger. |
| One-inch margins all around | Met | Report page template uses 1-inch margins on every side. |
| Executable code, not only raw source | Met | `02_Executable_Notebook.ipynb` is an executed notebook with sequential execution counts and no cell errors. Reproduction source and tests are also included. |
| Presentation slide deck | Met | `03_Presentation_Deck.pptx` is the editable ten-slide deck; a PDF copy is also included. |

## Required report content

| Required content | Where addressed |
|---|---|
| Executive summary | Report page 1, “Executive summary.” |
| Problem formulation and methodology | Report pages 1–2; notebook sections “Protocol,” “Leakage audit,” and “Model.” |
| Generative AI disclosure | Report page 1; notebook and `README_SUBMISSION.md`. The disclosure is tool-neutral and states the work assisted, human review, and measurement boundary. |
| Predicted local track variation | Report pages 2–3; deck slides 6–8; outer-fold prediction CSV and prediction figure. |
| Predicted local width and/or boundaries | Report pages 2–3; deck slides 5 and 7; `outer_fold_predictions.csv` contains center, positive width, and reconstructed left/right boundaries. |
| Variation descriptors | Report pages 2–3; saved metrics include residual correlation, predicted/measured variation-scale ratio, roughness error, and waviness error. |
| Profilometer comparison | Report pages 2–3; all headline scores compare untouched outer-track predictions with profilometer-derived width and boundaries. |
| Uncertainty estimate | Report page 3; deck slide 8; nested conditional conformal intervals and difficulty-stratified width/coverage are saved in `metrics.json`. |
| Conclusion connecting thermal behavior and geometry | Report page 3; deck slides 8–10. |

## Review criteria

| Criterion | Evidence and honest scope |
|---|---|
| Accuracy of predicted local geometry | Nested leave-one-track-out width MAE is 0.1484 mm and center MAE is 0.1224 mm. The outer test unit is a whole track. |
| Ability to capture spatial variation | Predictions are indexed in physical x, not reduced to one track mean. The predicted/measured local width standard-deviation ratio improves from 0.214 to 0.323, but the model still underestimates variation. Residual correlation is 0.0859 and track-balanced R-squared remains negative (-0.1345); these limitations are disclosed. |
| Width/boundary accuracy | Width MAE is 0.1484 mm; mean left/right boundary MAE is 0.1419 mm. Joint center plus log-width prediction guarantees positive widths and ordered boundaries. |
| Robustness across laser powers | Tracks 8, 10, 14, and 21 are each held out once, so no track contributes labels to its own prediction or selection. Per-track width MAE ranges from 0.1129 to 0.2008 mm. With only four tracks, this is evidence across the provided conditions, not proof of broad power extrapolation. |
| Quality of uncertainty | Nested conditional conformal intervals reach 93.51% empirical coverage at 0.780 mm mean width. Width expands from 0.629 mm in easy regions to 0.944 mm in difficult regions. Calibration uses training tracks only. |
| Interpretability | Condition-level hot area, maximum temperature, thermal mass, and cooling-tail summaries predict the baseline. Pool shape, gradients, asymmetry, velocity, persistence, and 5/10/20-frame history predict local center and log-width residuals. Associations are predictive, not causal. |
| Process- versus substrate-driven variation | Thermal process descriptors are modeled. Genuine pre-process substrate measurements are unavailable, and post-process SEM is excluded from candidates because it is unavailable at prediction time. Therefore the submission does not claim that substrate effects have been identified; registered pre-process surface measurements are the stated next experiment. |

## Leakage and future-information statement

The primary model is an **offline completed-sequence model** used after the
thermal scan finishes. Later thermal frames are valid inputs to this declared
offline task; they are not geometry labels. The current-and-past-only causal
ablation is reported separately for online potential.

Nested leave-one-track-out validation keeps the outer track untouched during
model choice, feature-family choice, preprocessing choice, and interval
calibration. Tests confirm that changing held-out geometry labels does not
change predictions or selected candidates. A separate future-frame
perturbation test confirms that later thermal frames cannot change an earlier
causal-ablation prediction. No held-out geometry, test-track labels, or
post-process SEM enters prediction or model selection.
