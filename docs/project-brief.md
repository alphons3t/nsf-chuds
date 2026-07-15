# NSF Future Manufacturing Data Challenge — project brief

## Mission

This work supports NSF Grant FMRG-2328395, which advances materials-on-demand manufacturing through the convergence of manufacturing AI and materials science. The broader program combines smart manufacturing, additive manufacturing, materials genomics, and sensor technologies to improve affordable production of advanced alloys.

## Challenge problem

Predict probabilistic local geometric variation of single laser tracks in directed energy deposition (DED) from multimodal data:

- in-situ thermal image sequences,
- SEM images of surrounding substrate morphology, and
- Bruker/Wyko full-field height maps.

DED deposits wire or powder into an existing surface, melts it with an energy source such as a laser, and builds or repairs material features layer by layer. The supplied data were produced on an Optomec LENS MTS 500 hybrid manufacturing platform. Post-process characterization used a Bruker ContourGT-K white-light 3D optical profilometer and a Zeiss EVO MA10 SEM system.

## Scientific framing

The project can draw on:

1. **Shape-constrained / physics-informed machine learning** to encode physical and experimental constraints.
2. **Surprise-aware observations** to identify unexpected process behavior.
3. **Digital twins** to help safeguard extrapolation beyond observed operating conditions.
4. **Knowledge expansion** from manufacturing data, literature, process-material relationships, and graph-based representations.

## Expected predictions

The submission should model local variation along each laser path, including where applicable:

- local track width or boundary positions,
- roughness, waviness, and local boundary variance,
- quantitative comparison with profilometer-derived ground truth, and
- uncertainty estimates for predicted geometry.

## Evaluation priorities

- Accuracy of predicted local geometry.
- Ability to capture spatial track variation.
- Accuracy of width or boundary predictions.
- Robustness across laser powers.
- Quality of uncertainty estimation.
- Interpretability of thermal descriptors or learned features.
- Ability to separate process-driven from substrate-driven variation.

## Submission deliverables

- A final report PDF: maximum 3 pages, at least 10 pt Arial, 1-inch margins.
- Executable Jupyter notebook(s).
- GitHub repository link.
- Presentation deck.
- One final ZIP uploaded through the Qualtrics link.

The final report should include an executive summary; problem formulation and methodology; any use of generative AI; modeling and outcomes; limitations and uncertainty; results and visualizations; conclusion; and an appendix if needed.
