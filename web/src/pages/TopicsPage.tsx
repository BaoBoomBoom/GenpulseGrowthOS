import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store-context";
import type { BrandIp, Platform, TopicStatus } from "../types";

export function TopicsPage() {
  const {
    topics,
    generateTopics,
    setTopicStatus,
    generateContent,
    brandFilter,
  } = useStore();
  const navigate = useNavigate();
  const [layer, setLayer] = useState<"backlog" | "selected" | "repurpose">(
    "backlog"
  );
  const [objective, setObjective] = useState("app downloads");
  const [brand, setBrand] = useState<BrandIp | "All">(
    brandFilter === "All" ? "Genpulse" : brandFilter
  );
  const [platforms, setPlatforms] = useState<Platform[]>(["TikTok", "LinkedIn"]);
  const [scope, setScope] = useState("sleep, melatonin, hormones");
  const [audience, setAudience] = useState("women 20-35 with sleep concerns");

  const filtered = topics.filter((t) => {
    if (layer === "backlog") return t.status === "backlog" || t.status === "selected";
    if (layer === "selected")
      return t.status === "selected" || t.status === "produced" || t.status === "published";
    return t.platform.length > 1;
  });

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  return (
    <>
      <header>
        <h1 className="page-title">Topic Engine</h1>
        <p className="page-desc">
          ???????????????????????Save / Generate Content /
          Archive?
        </p>
      </header>

      <div className="grid-2" style={{ marginTop: 18 }}>
        <div className="panel">
          <div className="panel-head">
            <h2>Input Panel</h2>
          </div>
          <div className="panel-body">
            <div className="field">
              <label>Objective</label>
              <select value={objective} onChange={(e) => setObjective(e.target.value)}>
                <option value="app downloads">app downloads</option>
                <option value="awareness">awareness</option>
                <option value="education">education</option>
              </select>
            </div>
            <div className="field">
              <label>Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value as BrandIp | "All")}
              >
                <option>CEO</option>
                <option>CMO</option>
                <option>Genpulse</option>
                <option>Lushair</option>
                <option>Glamskin</option>
                <option>Finegyno</option>
                <option>Dental</option>
              </select>
            </div>
            <div className="field">
              <label>Platforms</label>
              <div className="brand-filter">
                {(["TikTok", "Instagram", "X", "LinkedIn"] as Platform[]).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      className={`chip ${platforms.includes(p) ? "active" : ""}`}
                      onClick={() => togglePlatform(p)}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
            </div>
            <div className="field">
              <label>Knowledge scope</label>
              <input value={scope} onChange={(e) => setScope(e.target.value)} />
            </div>
            <div className="field">
              <label>Audience</label>
              <input value={audience} onChange={(e) => setAudience(e.target.value)} />
            </div>
            <button
              type="button"
              className="btn"
              onClick={() =>
                generateTopics({
                  objective,
                  brand,
                  platforms,
                  scope: scope.split(",").map((s) => s.trim()).filter(Boolean),
                  audience,
                })
              }
            >
              Generate topic backlog
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Generated Topics</h2>
            <div className="tabs" style={{ margin: 0 }}>
              {(
                [
                  ["backlog", "Backlog"],
                  ["selected", "This Week"],
                  ["repurpose", "Repurpose"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`tab ${layer === id ? "active" : ""}`}
                  onClick={() => setLayer(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Brand</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered
                  .slice()
                  .sort((a, b) => b.priority_score - a.priority_score)
                  .map((t) => (
                    <tr key={t.topic_id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.title}</div>
                        <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                          {t.core_angle}
                        </div>
                        <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {t.platform.map((p) => (
                            <span key={p} className="badge">
                              {p}
                            </span>
                          ))}
                          <span className={`badge ${t.evidence_level}`}>
                            {t.evidence_level}
                          </span>
                        </div>
                      </td>
                      <td>{t.brand}</td>
                      <td>
                        <strong>{t.priority_score.toFixed(1)}</strong>
                      </td>
                      <td>
                        <span className={`badge ${t.status}`}>{t.status}</span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="btn secondary"
                            onClick={() => setTopicStatus(t.topic_id, "selected")}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => {
                              generateContent(t.topic_id, t.platform);
                              navigate("/content");
                            }}
                          >
                            Generate
                          </button>
                          <button
                            type="button"
                            className="btn ghost"
                            onClick={() =>
                              setTopicStatus(t.topic_id, "archived" as TopicStatus)
                            }
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!filtered.length ? <div className="empty">No topics in this layer</div> : null}
          </div>
        </div>
      </div>
    </>
  );
}
