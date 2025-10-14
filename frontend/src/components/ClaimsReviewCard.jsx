/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/ClaimsReviewCard.css";

const API_BASE = "https://claims-review-backend-server.onrender.com";

/* ---------- utils ---------- */
function toPercent(n) {
  if (typeof n === "number") return Math.max(0, Math.min(100, Math.round(n)));
  const parsed = Number(String(n).replace("%", "").trim());
  if (Number.isFinite(parsed)) return Math.max(0, Math.min(100, Math.round(parsed)));
  return 0;
}

const Pill = ({ text }) => <span className="cr-pill">{text}</span>;
const Empty = ({ text = "N/A" }) => <div className="cr-empty">{text}</div>;

const copyJSON = async (obj) => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
  } catch (e) {
    console.warn("Copy failed:", e);
  }
};

/* ---------- accordion ---------- */
const Section = ({ title, subtitle, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="cr-section">
      <button
        className="cr-acc-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="cr-acc-titles">
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <span className="cr-acc-icon" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            className="cr-acc-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------- main component ---------- */
const ClaimsReviewCard = ({ open, onClose, transcript, fields }) => {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  // Drag constraints container (full viewport layer)
  const layerRef = useRef(null);
  const cardRef = useRef(null);
  const [startPos, setStartPos] = useState({ x: 24, y: 24 }); // computed on mount

  const payload = useMemo(
    () => ({
      transcript: transcript || "",
      fields: fields || {},
    }),
    [transcript, fields]
  );

  /* fetch backend when open + we have transcript */
  useEffect(() => {
    let abort = false;
    const run = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API_BASE}/claims-review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        const json = await res.json();
        if (!abort) setData(json);
      } catch (e) {
        if (!abort) setErr(e.message || "Unknown error");
      } finally {
        if (!abort) setLoading(false);
      }
    };

    if (open && payload.transcript) {
      run();
    } else if (open) {
      setLoading(false);
      setData(null);
    } else {
      setLoading(false);
    }
    return () => {
      abort = true;
    };
  }, [open, payload]);

  /* compute a nice initial position (right side, full height) without blocking fields */
  useEffect(() => {
    if (!open) return;
    const layer = layerRef.current;
    const card = cardRef.current;
    if (!layer || !card) return;

    // Place the card aligned to the right with 24px margin, 24px from top
    const vw = window.innerWidth;
    const cardWidth = Math.min(vw * 0.96, 1000);
    const x = Math.max(8, vw - cardWidth - 24);
    const y = 24;
    setStartPos({ x, y });
  }, [open]);

  if (!open) return null;

  const diagnoses = data?.diagnoses || [];
  const labs = data?.labs || [];
  const radiology = data?.radiology ?? "N/A";
  const other = data?.other_services || [];
  const notes = data?.notes || "";

  return (
    <div
      ref={layerRef}
      className="cr-layer" // NOTE: pointer-events: none (so underlying fields remain usable)
      aria-live="polite"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            ref={cardRef}
            className="cr-card" // full-height white card
            role="dialog"
            aria-modal="false"
            aria-labelledby="claims-title"
            // entry/exit animation
            initial={{ opacity: 0, scale: 0.98, x: startPos.x, y: startPos.y }}
            animate={{ opacity: 1, scale: 1, x: startPos.x, y: startPos.y }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            // draggable with constraints to the layer
            drag
            dragConstraints={layerRef}
            dragElastic={0.15}
            dragMomentum={false}
            // allow interactions on the card only
            style={{ pointerEvents: "auto" }}
          >
            {/* Header (drag handle area) */}
            <div className="cr-card-header" title="Drag to move">
              <div className="cr-drag-handle" />
              <div className="cr-title-wrap">
                <h2 id="claims-title">Claims Review</h2>
                <div className="cr-subtitle">
                  <Pill text="RAG-assisted" />
                  <Pill text="ICD-10" />
                </div>
              </div>
              <button className="cr-close" onClick={onClose} aria-label="Close">
                ✕
              </button>
            </div>

            {/* Context row (non-blocking) */}
            {payload.transcript ? (
              <div className="cr-context">
                <span className="cr-context-label">Transcript length:</span>
                <Pill text={`${payload.transcript.length} chars`} />
                {!!fields?.chiefComplaint && (
                  <>
                    <span className="cr-context-label">Chief complaint:</span>
                    <Pill
                      text={
                        String(fields.chiefComplaint).slice(0, 64) +
                        (String(fields.chiefComplaint).length > 64 ? "…" : "")
                      }
                    />
                  </>
                )}
              </div>
            ) : null}

            {/* Body (scrollable) */}
            <div className="cr-body">
              {loading && (
                <div className="cr-loading">
                  <div className="cr-spinner" />
                  <p>Analyzing transcript and retrieving clinical context…</p>
                </div>
              )}

              {!loading && err && (
                <div className="cr-error">
                  <p>
                    Could not generate claims review: <strong>{err}</strong>
                  </p>
                  <button className="cr-btn" onClick={() => window.location.reload()}>
                    Reload
                  </button>
                </div>
              )}

              {!loading && !err && (
                <>
                  <Section
                    title="Probable Diagnoses"
                    subtitle="Ranked by probability with ICD-10 suggestions"
                    defaultOpen
                  >
                    {diagnoses.length ? (
                      <div className="cr-table-wrap">
                        <table className="cr-table">
                          <thead>
                            <tr>
                              <th>Diagnosis</th>
                              <th>ICD-10</th>
                              <th>Probability</th>
                            </tr>
                          </thead>
                          <tbody>
                            {diagnoses.map((d, i) => (
                              <tr key={`${d?.name || "dx"}-${i}`}>
                                <td>{d?.name || "-"}</td>
                                <td className="cr-icd">{d?.icd10 || "-"}</td>
                                <td>
                                  <div className="cr-prob-cell">
                                    <div className="cr-prob-bar">
                                      <span
                                        className="cr-prob-fill"
                                        style={{ width: `${toPercent(d?.probability)}%` }}
                                      />
                                    </div>
                                    <span className="cr-prob-label">
                                      {toPercent(d?.probability)}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <Empty text="No diagnoses returned." />
                    )}
                  </Section>

                  <Section title="Recommended Laboratory Tests" defaultOpen>
                    {labs.length ? (
                      <ul className="cr-list">
                        {labs.map((t, i) => (
                          <li key={`${t?.name || "lab"}-${i}`}>
                            <div className="cr-list-line">
                              <span className="cr-item-name">{t?.name || "-"}</span>
                              {t?.code ? <span className="cr-item-code">{t.code}</span> : null}
                            </div>
                            {t?.rationale ? <p className="cr-item-sub">{t.rationale}</p> : null}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Empty text="No lab tests suggested." />
                    )}
                  </Section>

                  <Section title="Radiology">
                    {typeof radiology === "string" ? (
                      <Empty text={radiology} />
                    ) : Array.isArray(radiology) && radiology.length ? (
                      <ul className="cr-list">
                        {radiology.map((r, i) => (
                          <li key={`${r?.name || "img"}-${i}`}>
                            <div className="cr-list-line">
                              <span className="cr-item-name">{r?.name || "-"}</span>
                              {r?.modality ? (
                                <span className="cr-item-code">{r.modality}</span>
                              ) : null}
                            </div>
                            {r?.rationale ? <p className="cr-item-sub">{r.rationale}</p> : null}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Empty text="N/A" />
                    )}
                  </Section>

                  <Section title="Other Services">
                    {other.length ? (
                      <ul className="cr-list">
                        {other.map((s, i) => (
                          <li key={`${s?.name || "svc"}-${i}`}>
                            <div className="cr-list-line">
                              <span className="cr-item-name">{s?.name || "-"}</span>
                              {s?.category ? (
                                <span className="cr-item-code">{s.category}</span>
                              ) : null}
                            </div>
                            {s?.rationale ? <p className="cr-item-sub">{s?.rationale}</p> : null}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Empty text="No additional services suggested." />
                    )}
                  </Section>

                  {!!notes && (
                    <Section title="Notes">
                      <div className="cr-notes">{notes}</div>
                    </Section>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="cr-footer">
              <button className="cr-btn cr-btn-ghost" onClick={() => copyJSON(data)}>
                Copy JSON
              </button>
              <button className="cr-btn cr-btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClaimsReviewCard;

