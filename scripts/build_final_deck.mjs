import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FileBlob,
  PresentationFile,
} from "@oai/artifact-tool";

process.on("uncaughtException", (error) => {
  console.error(`SHORT_ERROR: ${error.message}`);
  process.exit(1);
});
process.on("unhandledRejection", (error) => {
  console.error(`SHORT_ERROR: ${error?.message ?? error}`);
  process.exit(1);
});

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspace = path.join(root, "tmp/artifacts/final_deck");
// Template-following QA can pass tmp/artifacts/improved_deck/template-starter.pptx;
// the committed source template remains the clean-checkout fallback.
const starter = process.env.FMRG_TEMPLATE_STARTER
  ? path.resolve(root, process.env.FMRG_TEMPLATE_STARTER)
  : path.join(
      root,
      "deliverables/presentation/FMRG_Final_Template_Starter.pptx",
    );
const output = path.join(
  root,
  "deliverables/presentation/FMRG_Final_Submission_Audited.pptx",
);
const resultImage = path.join(
  root,
  "results/improved_submission/figures/nested_outer_predictions.png",
);
const importanceImage = path.join(
  root,
  "results/improved_submission/figures/before_after_scorecard.png",
);

const presentation = await PresentationFile.importPptx(await FileBlob.load(starter));
const inventory = (await fs.readFile(
  path.join(root, "scripts/final_deck_template_inventory.ndjson"),
  "utf8",
))
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line));

async function findOne(slideNumber, oldText) {
  const records = inventory.filter(
    (record) => record.slide === slideNumber && record.text?.includes(oldText),
  );
  if (records.length !== 1) {
    throw new Error(`Expected one inventory record on slide ${slideNumber} for ${oldText}; found ${records.length}`);
  }
  const slide = presentation.slides.getItem(slideNumber - 1);
  const matches = slide.shapes.items.filter((shape) => shape.name === records[0].name);
  if (matches.length !== 1) {
    throw new Error(`Expected one match on slide ${slideNumber} for ${oldText}; found ${matches.length}`);
  }
  return matches[0];
}

async function rewrite(slideNumber, oldText, newText) {
  const target = await findOne(slideNumber, oldText);
  target.text.replace(oldText, newText);
}

async function forceRewrite(slideNumber, oldText, newText) {
  const target = await findOne(slideNumber, oldText);
  target.text.set(newText);
}

function clampShapeHeight(slideNumber, shapeName, height) {
  const slide = presentation.slides.getItem(slideNumber - 1);
  const matches = slide.shapes.items.filter((shape) => shape.name === shapeName);
  if (matches.length !== 1) {
    throw new Error(
      `Expected one shape named ${shapeName} on slide ${slideNumber}; found ${matches.length}`,
    );
  }
  const shape = matches[0];
  shape.position = { ...shape.position, height };
}

async function imageBytes(path) {
  const bytes = await fs.readFile(path);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

async function replaceImage(slideNumber, imageName, path, alt) {
  const slide = presentation.slides.getItem(slideNumber - 1);
  const matches = slide.images.items.filter((image) => image.name === imageName);
  if (matches.length !== 1) {
    throw new Error(`Expected one image named ${imageName} on slide ${slideNumber}; found ${matches.length}`);
  }
  const image = matches[0];
  const oldFrame = image.frame;
  const oldCrop = image.crop;
  const oldFit = image.fit;
  const oldGeometry = image.geometry;
  const oldBorderRadius = image.borderRadius;
  const oldRotation = image.rotation;
  const oldFlipHorizontal = image.flipHorizontal;
  const oldFlipVertical = image.flipVertical;
  const oldLockAspectRatio = image.lockAspectRatio;
  image.replace({
    blob: await imageBytes(path),
    contentType: "image/png",
    alt,
    ...(oldFit ? { fit: oldFit } : {}),
  });
  image.frame = oldFrame;
  image.crop = oldCrop;
  image.geometry = oldGeometry;
  image.borderRadius = oldBorderRadius;
  image.rotation = oldRotation;
  image.flipHorizontal = oldFlipHorizontal;
  image.flipVertical = oldFlipVertical;
  image.lockAspectRatio = oldLockAspectRatio;
}

const edits = [
  [1, "NSF FUTURE MANUFACTURING DATA CHALLENGE  |  FINALIST PRESENTATION", "NSF FUTURE MANUFACTURING DATA CHALLENGE  |  FINAL SUBMISSION"],
  [1, "Predicting DED track geometry\nvia multi-modal sensor fusion", "Predicting local DED track width\nfrom thermal history"],
  [1, "Fusing in-situ thermal history with substrate surface awareness to predict local track height", "Offline completed-sequence hierarchy with a causal ablation"],
  [1, "Team Submission\nJuly 31, 2026   |   github.com/alphons3t/nsf-chuds", "Team NSF-CHUDS\nJuly 31, 2026   |   Reproduced from the official Zenodo release"],

  [2, "Can we predict part geometry during printing?", "Can thermal history predict local geometry after printing?"],
  [2, "▪  Directed Energy Deposition (DED) builds metal parts track by track — but final geometry varies along every track.\n▪  In-situ sensors watch the melt pool in real time; post-process metrology reveals what was actually built — hours later.\n▪  The challenge: connect what the camera sees during printing to the local geometric variation measured after printing.\n▪  If we can do this, we unlock real-time quality prediction and closed-loop control for metal additive manufacturing.", "▪  A DED track is not a uniform line: width and both boundaries vary along x.\n▪  Thermal frames record the moving melt pool; profilometry records the final geometry.\n▪  The modeling task is local: map each frame and short history to the matching segment.\n▪  A credible result must generalize across laser power and quantify uncertainty."],
  [2, "Predict local track height along the laser path from in-situ monitoring data", "Predict local width and boundary position from thermal history"],
  [2, "Ground truth:  leveled 3D profilometer height maps\nInputs:  thermal video + SEM substrate imagery\nScope:  4 tracks spanning different laser powers & scan speeds", "Ground truth:  center, width, and boundaries from profilometry\nInputs:  completed thermal sequence only\nEvaluation:  four nested leave-one-track-out outer tests"],

  [3, "Three sensors, three languages: time, texture, and space", "Three modalities, one physical x-axis, four untouched outer tests"],
  [3, "In-situ melt pool dynamics", "400 active frames per track"],
  [3, "–  400 frames per track  ·  50 fps\n–  14 µm/pixel  ·  5.6 × 5.6 mm field of view\n–  Captures melt pool length, width, area\n–  Lives in the TIME domain", "–  50 fps at 10 mm/s = 0.2 mm per frame\n–  Size, bounding box, intensity, gradients\n–  Asymmetry, deltas, lags, rolling history\n–  Lives in the TIME domain"],
  [3, "Substrate surface morphology", "Post-process SEM audit"],
  [3, "–  Tiled .tif images along each track\n–  Reveals gouges, texture & roughness\n–  Used only outside the track (no leakage)\n–  Lives in the TEXTURE domain", "–  Available imagery is post-process\n–  Unavailable at frame-time inference\n–  Excluded from predictive candidates\n–  No causal substrate claim"],
  [3, "Post-process ground truth", "Local width and boundaries"],
  [3, "–  Bruker/Wyko full-field height maps\n–  x, y in mm  ·  z resolved to nanometers\n–  Defines the true deposited track height\n–  Lives in the SPACE domain", "–  Robust cross-track substrate detrending\n–  Connected 30%-height boundary crossings\n–  0.40 mm physical smoothing window\n–  Missing acquisition gaps stay excluded"],
  [3, "The core difficulty:  these modalities share no common coordinate system — dynamic video frames must be fused with static spatial maps before any model can learn.", "Every track is untouched once; model, feature family, preprocessing, and calibration are selected only inside the other three tracks."],

  [4, "From three raw sensors to one physical dataset", "From raw frames to leakage-safe nested predictions"],
  [4, "Level", "Extract"],
  [4, "Fit & subtract a 2D plane from the raw 3D scan to isolate true track height", "Detrend each cross-section and find connected left/right crossings"],
  [4, "Align", "Align"],
  [4, "Map 400 thermal frames onto the 20–100 mm spatial axis of the track", "Use physical x in mm; never normalized row position"],
  [4, "Engineer", "Decompose"],
  [4, "Build thermal-history and substrate-awareness features at each location", "Separate condition baseline from local center/log-width residuals"],
  [4, "Predict", "Test"],
  [4, "Train a Random Forest on 4 tracks to predict local track height", "Hold out each track once; select candidates inside the other three"],
  [4, "Why this matters:  every downstream feature is expressed in physical millimeter coordinates along the track — the model learns physics, not sensor artifacts.\nGenerative AI (LLM) was used transparently as a collaborative coding tool: designing the leveling math, debugging dataframe alignment, and refining visualizations.", "Audit rule: no held-out geometry, test-track labels, or post-process SEM enters prediction or selection. The primary model is offline; the causal ablation forbids future frames."],

  [5, "Building a common coordinate system", "Ground truth first: robust boundaries, then physical alignment"],
  [5, "STEP 1 — MATHEMATICAL 3D LEVELING", "STEP 1 - LOCAL GEOMETRY EXTRACTION"],
  [5, "Recover the true track from a tilted, warped substrate", "Measure one connected bead in every valid cross-section"],
  [5, "▪  Raw profilometer scans carry significant planar tilt.\n▪  We isolate the bare substrate edges (non-track regions) and fit a 2D plane via linear regression.\n▪  Subtracting the fitted plane levels the substrate to ≈ 0, exposing the true deposited height — our ground truth.", "▪  Interpolate missing y pixels only within each cross-section.\n▪  Fit substrate slope outside the bead shoulders.\n▪  Locate connected 30%-of-peak crossings around the central maximum.\n▪  Smooth left and right boundaries over 0.40 mm."],
  [5, "STEP 2 — SPATIAL–TEMPORAL ALIGNMENT", "STEP 2 - PHYSICAL TIME-SPACE ALIGNMENT"],
  [5, "Fuse video time with physical space", "Match each thermal frame to measured x in millimeters"],
  [5, "▪  Melt pool length, width & area extracted from each thermal frame by intensity thresholding (value = 2000).\n▪  Constant scan speed (10 mm/s @ 50 fps) → each frame advances 0.2 mm along the track.\n▪  Linear interpolation maps all 400 frames onto the 20–100 mm coordinates of the leveled height profile.", "▪  Detect laser shutoff; retain the prior 400 active frames.\n▪  Extract hot components above a fixed 1500 K threshold.\n▪  Convert time to x at 10 mm/s and 50 fps.\n▪  Reject frames >0.10 mm from valid profilometry."],

  [6, "Feature engineering: physical memory and context", "Separate condition width from local variation"],
  [6, "THERMAL HISTORY", "CAUSAL MULTISCALE HISTORY"],
  [6, "DED is a continuous thermal process — not independent frames", "Describe the pool now, then summarize how it arrived"],
  [6, "▪  Rolling averages of melt pool dimensions over 5- and 10-frame windows.\n▪  These act as a proxy for heat accumulation and cooling rate at each point along the path.\n▪  Captures the longitudinal variation a single frame cannot see.", "▪  Pool axes, temperature, mass, gradients, and asymmetry.\n▪  Cooling-tail decay, centroid velocity, and shape change.\n▪  5-, 10-, and 20-frame slopes, persistence, and changes.\n▪  Robust local normalization isolates within-track departures."],
  [6, "SUBSTRATE AWARENESS", "CONSTRAINED NESTED MODEL"],
  [6, "The surface the laser lands on shapes what it builds", "Predict a track baseline, then local residuals"],
  [6, "▪  Localized SEM intensity and SEM roughness matrices extracted from masked SEM imagery.\n▪  Quantifies the topographical foundation prior to deposition — gouges, texture, reflectivity.\n▪  Track region masked out to strictly avoid output leakage.", "▪  Full-sequence summaries predict baseline center + log-width.\n▪  Frame history jointly predicts center + log-width residuals.\n▪  exp(log-width) keeps width positive; boundaries stay ordered.\n▪  Causal ablation swaps in expanding summaries."],

  [7, "The model tracks real variation across four recipes", "Offline four-track MAE falls 20.7%"],
  [7, "EXHIBIT 1 — ACTUAL VS PREDICTED TRACK HEIGHT", "EXHIBIT 1 - FOUR UNTOUCHED OUTER TRACKS"],
  [7, "21.18 µm\nMean Absolute Error", "148 µm\nTrack-balanced MAE"],
  [7, "0.41  R²\nheld-out test data", "20.7% lower\nvs. direct Ridge"],
  [7, "▪  Random Forest Regressor — 150 estimators, max depth 12, 80/20 train–test split.\n▪  Trained jointly on Tracks 8, 10, 14 & 21 to generalize across laser powers and scan speeds.\n▪  Captures longitudinal variation via thermal rolling averages and constrains boundaries via melt pool width.\n▪  Validated directly against leveled profilometer ground truth in physical µm.", "▪  Track-balanced width MAE: 0.187 → 0.148 mm.\n▪  Worst-track MAE: 0.308 → 0.201 mm.\n▪  Mean boundary MAE: 0.180 → 0.142 mm.\n▪  Track-balanced R²: -0.55 → -0.13."],

  [8, "The substrate — not the melt pool — drives prediction", "Local scaling recovers variation and sharpens uncertainty"],
  [8, "EXHIBIT 2 — RANDOM FOREST FEATURE IMPORTANCE", "EXHIBIT 2 - BEFORE / AFTER SCORECARD"],
  [8, "WHAT THE FOREST LEARNED", "WHAT CHANGED"],
  [8, "SEM intensity is the single most dominant feature", "Condition baseline + local residual wins"],
  [8, "1.  Substrate texture governs heat dissipation and liquid metal flow.\n2.  Thermal history (rolling melt pool areas) ranks next — heat buildup matters.\n3.  Instantaneous melt pool size alone is the weakest signal.", "1.  Predicted variation grows from 21% to 32% of measured scale.\n2.  Conditional intervals cover 93.5% at 0.780 mm mean width.\n3.  Global intervals cover 94.9% but are wider at 0.877 mm.\n4.  Width expands from 0.629 mm easy to 0.944 mm hard."],

  [9, "Limitations & uncertainty: physics pushes back", "Improved, but not ready for closed-loop control"],
  [9, "▪  Thermal warping: the metal substrate bows during printing, so a perfectly rigid 2D plane fit cannot capture all deformation.\n▪  Deep gouges in the substrate produce some negative ground-truth heights (down to −40 µm) after leveling.\n▪  Model uncertainty grows in regions of extreme substrate deformation — exactly where the plane assumption weakens.\n▪  R² = 0.41 reflects genuine stochasticity in DED, not just model error — a meaningful signal in a noisy physical process.", "▪  Primary R² improves from -0.55 to -0.13 but remains negative.\n▪  Primary mode is offline after the thermal scan completes.\n▪  Causal ablation: 0.157 mm MAE and -0.18 R².\n▪  Post-process SEM is excluded from prediction.\n▪  No closed-loop or causal substrate claim."],
  [9, "IF WE HAD MORE TIME", "WHAT WOULD CLOSE THE GAP"],
  [9, "–  Replace the rigid plane with a flexible spline / polynomial surface to absorb warping.\n–  Quantify prediction intervals per location (e.g., quantile forests).\n–  Extend from height to full width & boundary-position descriptors.\n–  Validate across additional tracks and unseen laser recipes.", "–  Add more powers, plates, repeats, and substrate pre-scans.\n–  Register SEM before processing rather than infer substrate from post-scan tiles.\n–  Calibrate intervals by laser-power regime or hierarchical conformal methods.\n–  Predict a full contour distribution, not only center plus width."],

  [10, "Thermal monitoring alone is not enough", "Separate the condition, then learn the variation"],
  [10, "Fusion is the answer", "Four-track accuracy"],
  [10, "Only by combining thermal history with substrate surface awareness can DED geometry be predicted reliably.", "Width MAE falls 20.7%; worst-track error falls 34.8%; boundary MAE falls 21.1%."],
  [10, "Physics-grounded pipeline", "Physical consistency"],
  [10, "Automated 3D leveling + spatial–temporal alignment turned three incompatible sensors into one physical dataset.", "Positive width and one shared center reconstruct ordered left/right boundaries."],
  [10, "Quantified & validated", "Useful uncertainty"],
  [10, "MAE of 21.18 µm and R² of 0.41 against leveled profilometer ground truth, generalized over 4 laser recipes.", "Conditional intervals reach 93.5% and expand in difficult regions."],
  [10, "“The foundation a part is built on matters as much as the energy used to build it.”", "“Condition shifts and local variation are different problems.”"],
  [10, "Thank you — Questions?    |    github.com/alphons3t/nsf-chuds", "Questions?  |  github.com/alphons3t/nsf-chuds  |  github.com/joeyperez1-debug/nsfsubmit\nGenerative AI assisted code review, testing, debugging, and layout; measurements were not created or altered by AI."],
];

for (const [slide, oldText, newText] of edits) {
  await rewrite(slide, oldText, newText);
}

// artifact-tool's rich-text replacement is a no-op for a few inherited,
// multi-run text boxes. Set those frames explicitly so stale audit claims
// cannot survive the template import.
await forceRewrite(
  1,
  "Team Submission\nJuly 31, 2026   |   github.com/alphons3t/nsf-chuds",
  "Team NSF-CHUDS\nJuly 31, 2026   |   Nested four-track outer validation",
);
await forceRewrite(
  2,
  "▪  Directed Energy Deposition (DED) builds metal parts track by track — but final geometry varies along every track.",
  "A DED track is not a uniform line: width and both boundaries vary along x.\nThermal frames record the moving melt pool; profilometry records final geometry.\nThe modeling task maps a frame and its causal history to the matching local segment.\nA credible result must generalize across laser power and quantify uncertainty.",
);
await forceRewrite(
  2,
  "Ground truth:  leveled 3D profilometer height maps",
  "Ground truth: center, width, and boundaries from profilometry\nInputs: completed thermal sequence only\nEvaluation: four nested leave-one-track-out outer tests",
);
await forceRewrite(
  3,
  "–  400 frames per track  ·  50 fps",
  "400 active frames per track at 50 fps.\n10 mm/s scan speed gives 0.2 mm per frame.\nSize, temperature, gradients, and asymmetry.\nCausal history lives in the TIME domain.",
);
await forceRewrite(
  3,
  "–  Tiled .tif images along each track",
  "Available imagery is post-process.\nUnavailable at frame-time inference.\nExcluded from predictive candidates.\nNo causal substrate claim.",
);
await forceRewrite(
  3,
  "–  Bruker/Wyko full-field height maps",
  "Robust cross-track substrate detrending.\nConnected 30%-height boundary crossings.\n0.40 mm physical smoothing window.\nMissing acquisition gaps remain excluded.",
);
await forceRewrite(
  4,
  "Why this matters:  every downstream feature is expressed in physical millimeter coordinates along the track",
  "Audit rule: no held-out geometry, test-track labels, or post-process SEM enters prediction or selection. The primary model is offline; the causal ablation forbids future frames.",
);
await forceRewrite(
  5,
  "▪  Raw profilometer scans carry significant planar tilt.",
  "Interpolate missing y pixels only within each cross-section.\nFit substrate slope outside the bead shoulders.\nLocate connected 30%-of-peak crossings around the central maximum.\nSmooth left and right boundaries over 0.40 mm.",
);
await forceRewrite(
  5,
  "▪  Melt pool length, width & area extracted from each thermal frame",
  "Detect laser shutoff; retain the prior 400 active frames.\nExtract hot components above a fixed 1500 K threshold.\nConvert time to x at 10 mm/s and 50 fps.\nReject frames more than 0.10 mm from valid profilometry.",
);
await forceRewrite(
  6,
  "▪  Rolling averages of melt pool dimensions over 5- and 10-frame windows.",
  "Pool axes, temperature, mass, gradients, and asymmetry.\nCooling-tail decay, centroid velocity, and shape change.\n5-, 10-, and 20-frame slopes, persistence, and changes.\nRobust local normalization isolates within-track departures.",
);
await forceRewrite(
  6,
  "▪  Localized SEM intensity and SEM roughness matrices extracted from masked SEM imagery.",
  "Full-sequence summaries predict baseline center and log-width.\nFrame history jointly predicts center and log-width residuals.\nexp(log-width) keeps width positive; boundaries stay ordered.\nCausal ablation swaps in expanding summaries.",
);
await forceRewrite(7, "21.18 µm\nMean Absolute Error", "148 µm\nTrack-balanced MAE");
await forceRewrite(7, "0.41  R²\nheld-out test data", "20.7% lower\nvs. direct Ridge");
await forceRewrite(
  7,
  "▪  Random Forest Regressor — 150 estimators, max depth 12, 80/20 train–test split.",
  "Track-balanced width MAE: 0.187 → 0.148 mm.\nWorst-track MAE: 0.308 → 0.201 mm.\nMean boundary MAE: 0.180 → 0.142 mm.\nTrack-balanced R²: -0.55 → -0.13.",
);
await forceRewrite(
  9,
  "▪  Thermal warping: the metal substrate bows during printing",
  "Primary R² improves from -0.55 to -0.13 but remains negative.\nPrimary mode is offline after the thermal scan completes.\nCausal ablation: 0.157 mm MAE and -0.18 R².\nPost-process SEM is excluded from prediction.\nNo closed-loop or causal substrate claim.",
);
await forceRewrite(
  8,
  "1.  Substrate texture governs heat dissipation and liquid metal flow.",
  "1. Predicted variation grows from 21% to 32% of measured scale.\n2. Conditional intervals cover 93.5% at 0.780 mm mean width.\n3. Global intervals cover 94.9% but are wider at 0.877 mm.\n4. Width expands from 0.629 mm easy to 0.944 mm hard.",
);
await forceRewrite(
  9,
  "–  Replace the rigid plane with a flexible spline / polynomial surface to absorb warping.",
  "Add more powers, plates, repeats, and substrate pre-scans.\nRegister SEM before processing instead of inferring substrate from post-scan tiles.\nCalibrate intervals by laser-power regime or hierarchical conformal methods.\nPredict a full contour distribution, not only center plus width.",
);

await replaceImage(
  7,
  "Picture 7",
  resultImage,
  "Measured and nested outer-fold predicted local width for Tracks 8, 10, 14, and 21",
);
await replaceImage(
  8,
  "Picture 7",
  importanceImage,
  "Before and after scorecard for four-track accuracy and spatial fidelity",
);

// The inherited template uses oversized body containers that extend below
// the canvas even though their visible text does not. Clamp those bounds so
// PowerPoint and automated QA agree with the rendered layout.
for (const [slideNumber, shapeName, height] of [
  [3, "TextBox 7", 300],
  [3, "TextBox 10", 300],
  [3, "TextBox 14", 300],
  [5, "TextBox 8", 280],
  [5, "TextBox 12", 280],
  [6, "TextBox 8", 280],
  [6, "TextBox 12", 280],
  [7, "TextBox 12", 260],
]) {
  clampShapeHeight(slideNumber, shapeName, height);
}

const notes = [
  "Opening: the model separates condition-level geometry from local variation and evaluates every track as untouched once.",
  "Challenge framing: local geometry is a spatial signal; useful predictions must preserve width and boundary variation across power conditions.",
  "Data: all modalities are registered to physical x; the outer unit is the whole experimental track.",
  "Pipeline: each outer track is excluded from feature, model, preprocessing, and calibration choices.",
  "Geometry: connected profilometry boundaries define positive local width; thermal frames advance 0.2 mm each.",
  "Modeling: completed-sequence summaries predict condition baselines; frame history predicts local residuals. The primary mode is offline.",
  "Result: offline four-track width MAE improves 20.7%, worst-track MAE 34.8%, and boundary MAE 21.1%.",
  "Uncertainty: conditional intervals are selected for the primary model; a separate causal ablation tests online potential.",
  "Limitations: R2 remains negative, only four tracks are available, and no causal substrate claim is supported.",
  "Close: separating the condition shift from local variation is the main transferable modeling insight. Generative AI assisted code review, testing, debugging, and layout; team members reviewed the outputs, and AI did not create or alter measurements.",
];
const sources = [
  "https://doi.org/10.5281/zenodo.21285367",
  "https://arxiv.org/abs/2607.07965",
  "results/improved_submission/metrics.json",
  "results/improved_submission/outer_fold_predictions.csv",
];
for (let index = 0; index < presentation.slides.items.length; index += 1) {
  const slide = presentation.slides.getItem(index);
  slide.speakerNotes.textFrame.setText(
    `${notes[index]}\n\n[Sources]\n${sources.map((source) => `- ${source}`).join("\n")}\n[/Sources]`,
  );
  slide.speakerNotes.setVisible(true);
}

await fs.mkdir(path.dirname(output), { recursive: true });
await fs.mkdir(workspace, { recursive: true });
const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(output);

for (let index = 0; index < presentation.slides.items.length; index += 1) {
  const slide = presentation.slides.getItem(index);
  const stem = `final-slide-${String(index + 1).padStart(2, "0")}`;
  const png = await presentation.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(`${workspace}/${stem}.png`, new Uint8Array(await png.arrayBuffer()));
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(`${workspace}/${stem}.layout.json`, await layout.text());
}
const montage = await presentation.export({ format: "webp", montage: true, scale: 1 });
await fs.writeFile(`${workspace}/final-montage.webp`, new Uint8Array(await montage.arrayBuffer()));
