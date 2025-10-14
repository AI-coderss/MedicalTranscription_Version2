/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import "../styles/ClaimsReviewCard.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5050";

function toPercent(n) {
  if (typeof n === "number") return Math.max(0, Math.min(100, Math.round(n)));
  const parsed = Number(String(n).replace("%", "").trim());
  if (Number.isFinite(parsed)) return Math.max(0, Math.min(100, Math.round(parsed)));
  return 0;
}

const SectionHeader = ({ title, subtitle }) => (
  <div className="claims-section-header">
    <h3>{title}</h3>
    {subtitle ? <p>{subtitle}</p> : null}
  </div>
);

const Pill = ({ text }) => <span className="claims-pill">{text}</span>;

const Empty = ({ text = "N/A" }) => (
  <div className="claims-empty">{text}</div>
);

const copyJSON = async (obj) => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
  } catch (e) {
    console.warn("Copy failed:", e);
  }
};

const ClaimsReviewCard = ({ open, onClose, transcript, fields }) => {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  const payload = useMemo(() => {
    return {
      transcript: transcript || "",
      fields: fields || {},
    };
  }, [transcript, fields]);

  useEffect(() => {
    let abort = false;

    const fetchData = async () => {
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
      fetchData();
    } else {
      setLoading(false);
    }

    return () => {
      abort = true;
    };
  }, [open, payload]);

  if (!open) return null;

  const diagnoses = data?.diagnoses || [];
  const labs = data?.labs || [];
  const radiology = data?.radiology ?? "N/A";
  const other = data?.other_services || [];
  const notes = data?.notes || "";

  return (
    <div className="claims-backdrop" role="dialog" aria-modal="true" aria-labelledby="claims-title">
      <div className="claims-card">
        <div className="claims-card-header">
          <div className="claims-title-wrap">
            <h2 id="claims-title">Claims Review</h2>
            <div className="claims-subtitle">
              <Pill text="RAG-assisted" />
              <Pill text="ICD-10" />
            </div>
          </div>
          <button className="claims-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Transcript summary pill row */}
        {payload.transcript ? (
          <div className="claims-context">
            <span className="claims-context-label">Transcript length:</span>
            <Pill text={`${payload.transcript.length} chars`} />
            {!!fields?.chiefComplaint && (
              <>
                <span className="claims-context-label">Chief complaint:</span>
                <Pill text={String(fields.chiefComplaint).slice(0, 64) + (String(fields.chiefComplaint).length > 64 ? "…" : "")} />
              </>
            )}
          </div>
        ) : null}

        {/* Loading / error states */}
        {loading && (
          <div className="claims-loading">
            <div className="claims-spinner" />
            <p>Analyzing transcript and retrieving clinical context…</p>
          </div>
        )}
        {!loading && err && (
          <div className="claims-error">
            <p>Could not generate claims review: <strong>{err}</strong></p>
            <button onClick={() => window.location.reload()}>Reload</button>
          </div>
        )}

        {!loading && !err && (
          <>
            {/* Diagnoses table */}
            <section className="claims-section claims-section--diagnosis" data-section="diagnosis">
              <SectionHeader
                title="Probable Diagnoses"
                subtitle="Ranked by probability with ICD-10 suggestions"
              />
              {diagnoses.length ? (
                <div className="claims-table-wrap">
                  <table className="claims-table">
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
                          <td>{d?.icd10 || "-"}</td>
                          <td>
                            <div className="prob-cell">
                              <div className="prob-bar">
                                <span
                                  className="prob-fill"
                                  style={{ width: `${toPercent(d?.probability)}%` }}
                                />
                              </div>
                              <span className="prob-label">{toPercent(d?.probability)}%</span>
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
            </section>

            {/* Labs */}
            <section className="claims-section claims-section--labs" data-section="labs">
              <SectionHeader title="Recommended Laboratory Tests" />
              {labs.length ? (
                <ul className="claims-list">
                  {labs.map((t, i) => (
                    <li key={`${t?.name || "lab"}-${i}`}>
                      <div className="list-line">
                        <span className="item-name">{t?.name || "-"}</span>
                        {t?.code ? <span className="item-code">{t.code}</span> : null}
                      </div>
                      {t?.rationale ? <p className="item-sub">{t.rationale}</p> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty text="No lab tests suggested." />
              )}
            </section>

            {/* Radiology */}
            <section className="claims-section claims-section--radiology" data-section="radiology">
              <SectionHeader title="Radiology" />
              {typeof radiology === "string" ? (
                <Empty text={radiology} />
              ) : Array.isArray(radiology) && radiology.length ? (
                <ul className="claims-list">
                  {radiology.map((r, i) => (
                    <li key={`${r?.name || "img"}-${i}`}>
                      <div className="list-line">
                        <span className="item-name">{r?.name || "-"}</span>
                        {r?.modality ? <span className="item-code">{r.modality}</span> : null}
                      </div>
                      {r?.rationale ? <p className="item-sub">{r.rationale}</p> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty text="N/A" />
              )}
            </section>

            {/* Other services */}
            <section className="claims-section claims-section--other" data-section="other-services">
              <SectionHeader title="Other Services" />
              {other.length ? (
                <ul className="claims-list">
                  {other.map((s, i) => (
                    <li key={`${s?.name || "svc"}-${i}`}>
                      <div className="list-line">
                        <span className="item-name">{s?.name || "-"}</span>
                        {s?.category ? <span className="item-code">{s.category}</span> : null}
                      </div>
                      {s?.rationale ? <p className="item-sub">{s.rationale}</p> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty text="No additional services suggested." />
              )}
            </section>

            {/* Notes / Disclaimers */}
            {!!notes && (
              <section className="claims-section claims-section--notes" data-section="notes">
                <SectionHeader title="Notes" />
                <div className="claims-notes">{notes}</div>
              </section>
            )}

            <div className="claims-actions">
              <button className="btn-secondary" onClick={() => copyJSON(data)}>
                Copy JSON
              </button>
              <button className="btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClaimsReviewCard;
