# Experiments

Use one subfolder per reproducible modeling experiment:

```text
experiments/
  baseline-thermal-features/
    README.md
    config.json
```

An experiment README should state the hypothesis, inputs, feature or model design, train/test split, metrics, uncertainty method, generated result locations, and conclusion.

Keep reusable functions in `src/` and command-line entry points in `scripts/`. Notebooks should call that shared code instead of duplicating long model logic.
