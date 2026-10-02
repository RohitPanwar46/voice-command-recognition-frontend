const challenges = [
  {
    title: "Class imbalance was silently hurting rare words",
    body:
      "Early Random Forest baselines looked fine on paper (70% accuracy), but a per-class confusion matrix revealed the real story: recall for rare words like 'learn' was 22% while common words hit 89% - a near-perfect correlation with how many training samples each word had. I redesigned the label scheme into Command + Unknown + Silence (matching the dataset's own intended use), balanced every class to the same size, and the correlation disappeared.",
  },
  {
    title: "Fixing overfitting without losing accuracy",
    body:
      "The first CNN hit 97% train accuracy but only 92% validation, with validation loss trending upward - classic overfitting. Fixed it with L2 regularization, SpatialDropout2D after each conv block, and SpecAugment-style on-the-fly augmentation (random time/frequency masking + noise) applied only during training via a tf.data pipeline - pushing validation accuracy up while closing the train/val gap.",
  },
  {
    title: "Real-time audio needed its own pipeline, not just a sliding window",
    body:
      "A naive 'classify every 250ms' approach fed the model partial words and random noise, producing overconfident wrong predictions. Replaced it with an energy-based Voice Activity Detector: two-stage calibration (measures actual room noise + the user's actual speaking volume), a 300ms pre-buffer to catch quiet onset consonants like the 'f' in 'four', and dynamic (not fixed-amount) silence trimming so word endings never get cut off.",
  },
  {
    title: "Diagnosing a 'the model is wrong' bug that wasn't a bug",
    body:
      "Live predictions were consistently wrong in ways offline test accuracy didn't explain. Rather than guessing, I ran the exact inference code against real held-out test files first - 29/30 correct, ruling out a code bug. That isolated the real cause: a domain shift between the dataset's accent distribution and real-world speakers, confirmed systematically before touching a single line of model code.",
  },
  {
    title: "Closing the accent gap without a personalized model",
    body:
      "Recording my own voice would have overfit to one person. Instead I sourced accent-diverse clips from the Multilingual Spoken Words Corpus (built on globally-crowdsourced Common Voice data), capped per-word additions to avoid re-introducing imbalance, and retrained on the merged dataset - improving generalization rather than personalizing to a single speaker.",
  },
  {
    title: "Shipping it: a format mismatch between browser audio and the model",
    body:
      "The deployed API kept failing to decode browser-recorded audio even with ffmpeg installed. The real cause: librosa's ffmpeg fallback only activates for real file paths, not in-memory byte streams - so uploads had to be written to a temp file first before decoding would work at all.",
  },
];

const stack = [
  { label: "Signal processing", value: "Librosa - MFCC feature extraction (13 coefficients)" },
  { label: "Modeling", value: "TensorFlow/Keras - 2D CNN with BatchNorm, SpatialDropout, L2" },
  { label: "Data", value: "Google Speech Commands v0.02 + MSWC (accent diversity)" },
  { label: "Backend", value: "FastAPI, Dockerized, deployed on Render" },
  { label: "Frontend", value: "Next.js, deployed on Vercel" },
];

export default function About() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>
      <section style={{ marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>About this project</h1>
        <p style={{ opacity: 0.7, lineHeight: 1.6 }}>
          A voice command recognition system built from first principles -
          starting at raw audio waveforms and ending at a deployed, real-time
          web app. The goal was never just "train a model that works" but to
          understand and justify every decision along the way: why MFCCs,
          why a CNN over classical ML, why the label scheme changed twice,
          and why "the model is wrong" usually means "go check your
          assumptions first."
        </p>
      </section>

      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1.2rem" }}>Tech stack</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {stack.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                padding: "0.7rem 1rem",
                background: "#1a1d24",
                border: "1px solid #2a2e37",
                borderRadius: 10,
                fontSize: "0.88rem",
              }}
            >
              <span style={{ opacity: 0.55 }}>{item.label}</span>
              <span style={{ textAlign: "right" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.3rem" }}>
          Challenges along the way
        </h2>
        <p style={{ opacity: 0.55, fontSize: "0.88rem", marginBottom: "1.5rem" }}>
          The interesting part of any ML project is rarely the first working
          model - it's everything that breaks afterward.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {challenges.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: "1.1rem 1.3rem",
                background: "#1a1d24",
                border: "1px solid #2a2e37",
                borderRadius: 14,
              }}
            >
              <h3 style={{ fontSize: "0.98rem", marginBottom: "0.5rem" }}>
                {idx + 1}. {item.title}
              </h3>
              <p style={{ fontSize: "0.87rem", opacity: 0.65, lineHeight: 1.6, margin: 0 }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
