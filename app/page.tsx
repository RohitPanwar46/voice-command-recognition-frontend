"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const RECORD_MS = 2000;

const COMMANDS = [
  "yes", "no", "up", "down", "left", "right", "on", "off", "stop", "go",
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
];

type Prediction = {
  label: string;
  confidence: number;
  top3: { label: string; confidence: number }[];
};

export default function Home() {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Render's free tier spins the backend down when idle, so the first real
  // request can take 20-30s. We fire a harmless "wake up" ping the moment
  // the page loads, so by the time the user actually records something,
  // the server has had a head start (or is already warm).
  useEffect(() => {
    fetch(`${API_URL}/health`).catch(() => {
      // Ignore errors here - this is just a warm-up ping, not a real
      // request. If it fails, the actual /predict call will surface
      // the real error to the user anyway.
    });
  }, []);

  const startRecording = async () => {
    setError(null);
    setResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await sendToBackend(blob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);

      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
        setRecording(false);
      }, RECORD_MS);
    } catch (err) {
      setError("Microphone access denied or unavailable.");
    }
  };

  const sendToBackend = async (blob: Blob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data: Prediction = await res.json();
      setResult(data);
    } catch (err) {
      setError("Could not reach the prediction server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>
      {/* ---------- Hero / Predictor ---------- */}
      <section style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}>
          Voice Command Recognition
        </h1>
        <p style={{ opacity: 0.6, fontSize: "0.95rem", marginBottom: "2rem" }}>
          A CNN trained from scratch to recognize spoken commands in real time
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <button
            onClick={startRecording}
            disabled={recording || loading}
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              border: "none",
              cursor: recording || loading ? "not-allowed" : "pointer",
              background: recording
                ? "#e74c3c"
                : loading
                ? "#555"
                : "linear-gradient(135deg, #2c7be5, #1a56db)",
              color: "white",
              fontSize: "1rem",
              fontWeight: 600,
              boxShadow: recording
                ? "0 0 0 8px rgba(231,76,60,0.25)"
                : "0 4px 20px rgba(44,123,229,0.4)",
              transition: "all 0.2s ease",
            }}
          >
            {recording ? "Recording..." : loading ? "Thinking..." : "🎤 Record"}
          </button>

          <p style={{ fontSize: "0.8rem", opacity: 0.45, maxWidth: 380 }}>
            ⏳ First request may take 20-30s to wake up the free-tier server -
            every request after that is fast.
          </p>

          {error && <p style={{ color: "#e74c3c", maxWidth: 320 }}>{error}</p>}

          {result && (
            <div
              style={{
                background: "#1a1d24",
                border: "1px solid #2a2e37",
                borderRadius: 16,
                padding: "1.5rem 2rem",
                minWidth: 260,
              }}
            >
              <p style={{ opacity: 0.6, fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                PREDICTION
              </p>
              <h2 style={{ fontSize: "2rem", margin: "0 0 0.25rem 0" }}>{result.label}</h2>
              <p style={{ opacity: 0.7, marginBottom: "1rem" }}>
                {(result.confidence * 100).toFixed(1)}% confidence
              </p>

              <div style={{ textAlign: "left" }}>
                {result.top3.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                      opacity: idx === 0 ? 1 : 0.5,
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span>{item.label}</span>
                    <span>{(item.confidence * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------- Commands you can say ---------- */}
      <section style={{ marginBottom: "3.5rem" }}>
        <h3 style={{ fontSize: "1rem", opacity: 0.7, marginBottom: "0.9rem", textAlign: "center" }}>
          Try saying one of these
        </h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            justifyContent: "center",
          }}
        >
          {COMMANDS.map((word) => (
            <span
              key={word}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: 999,
                background: "#1a1d24",
                border: "1px solid #2a2e37",
                fontSize: "0.85rem",
                opacity: 0.85,
                textTransform: "capitalize",
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </section>

      {/* ---------- Model Performance ---------- */}
      <section>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "0.3rem", textAlign: "center" }}>
          Model Performance
        </h3>
        <p style={{ opacity: 0.55, fontSize: "0.85rem", textAlign: "center", marginBottom: "2rem" }}>
          2D CNN trained on MFCC features - 93%+ test accuracy across 22 classes
        </p>

        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.8rem", opacity: 0.6, marginBottom: "0.5rem" }}>
            Training curves (accuracy &amp; loss)
          </p>
          <img
            src="/cnn_training_curves.png"
            alt="CNN training curves"
            style={{ width: "100%", borderRadius: 12, border: "1px solid #2a2e37" }}
          />
        </div>

        <div>
          <p style={{ fontSize: "0.8rem", opacity: 0.6, marginBottom: "0.5rem" }}>
            Confusion matrix (raw counts &amp; normalized recall)
          </p>
          <img
            src="/confusion_matrix_cnn.png"
            alt="CNN confusion matrix"
            style={{ width: "100%", borderRadius: 12, border: "1px solid #2a2e37" }}
          />
        </div>
      </section>
    </main>
  );
}