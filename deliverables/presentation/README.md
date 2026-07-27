# Presentation deck

Keep the editable deck and exported presentation PDF in this folder.

The deck should focus on:

1. The DED geometry-prediction problem.
2. Data modalities and leakage safeguards.
3. Modeling and uncertainty approach.
4. Results across laser powers and spatial positions.
5. Interpretation of useful thermal or learned features.
6. Limitations, robustness, and next steps.

## Audited final

- `FMRG_Final_Submission_Audited.pptx` - editable ten-slide deck.
- `FMRG_Final_Submission_Audited.pdf` - exported presentation PDF.
- `FMRG_Final_Template_Starter.pptx` - audited template source used by the deck builder.

The deck reports the same locked Track 21 comparison as the final notebook and
report, including the negative held-out R² and interval under-coverage.

Rebuild the editable deck after installing the Node dependency:

```bash
npm install
npm run build:deck
```
