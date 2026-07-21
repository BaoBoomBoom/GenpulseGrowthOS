import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AgentChat } from "../components/AgentChat";
import { useStore } from "../store-context";
import type { BrandId, Platform } from "../types";

export function CreativePage() {
  const {
    allTopics,
    brands,
    creativeBriefs,
    content,
    creativeBriefFromTopic,
    creativeGeneratePlatforms,
    brandFilter,
  } = useStore();
  const navigate = useNavigate();
  const [topicId, setTopicId] = useState(allTopics[0]?.topic_id ?? "");
  const [brand, setBrand] = useState<BrandId | "">(
    brandFilter === "All" ? allTopics[0]?.brand ?? "CEO" : brandFilter
  );
  const [platforms, setPlatforms] = useState<Platform[]>([
    "TikTok",
    "Instagram",
    "X",
    "LinkedIn",
  ]);

  const topic = allTopics.find((t) => t.topic_id === topicId);
  const profile = brands.find((b) => b.id === (brand || topic?.brand));
  const briefs = useMemo(
    () =>
      creativeBriefs.filter(
        (b) => brandFilter === "All" || b.brand === brandFilter
      ),
    [creativeBriefs, brandFilter]
  );
  const latestBrief = briefs[0];

  function toggle(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  return (
    <>
      <header>
        <h1 className="page-title">AI Creative Director</h1>
        <p className="page-desc">
          Not a caption machine. Locks brand personality, chooses format, sets creative
          direction and visual language, and decides how one theme performs across
          platforms — the brain of style and expression.
        </p>
      </header>

      <div className="agent-layout" style={{ marginTop: 18 }}>
        <AgentChat
          agent="creative"
          placeholders={[
            "Lock a brief for CEO TikTok",
            "How should this theme play on LinkedIn vs TikTok?",
            "Unify visual language for Lushair",
          ]}
        />

        <div className="agent-main">
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-head">
              <h2>Creative desk</h2>
            </div>
            <div className="panel-body">
              <div className="grid-2">
                <div className="field">
                  <label>Topic</label>
                  <select
                    value={topicId}
                    onChange={(e) => {
                      setTopicId(e.target.value);
                      const t = allTopics.find((x) => x.topic_id === e.target.value);
                      if (t) setBrand(t.brand);
                    }}
                  >
                    {allTopics.map((t) => (
                      <option key={t.topic_id} value={t.topic_id}>
                        [{t.evidence_score}] {t.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Brand personality</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value as BrandId)}
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {profile ? (
                <div className="brand-voice-box">
                  <div>
                    <strong>{profile.id}</strong> · {profile.goal} · CTA {profile.cta}
                  </div>
                  <div className="muted-sm" style={{ marginTop: 6 }}>
                    {profile.tone}
                  </div>
                  <div className="muted-sm" style={{ marginTop: 6 }}>
                    Prompt seed: {profile.prompt_beginning}
                  </div>
                </div>
              ) : null}

              {topic && topic.evidence_score < 60 ? (
                <div className="callout warn" style={{ marginTop: 12 }}>
                  Scientist gate: evidence score {topic.evidence_score}. Soften claims or
                  re-score before hard science lines.
                </div>
              ) : null}

              <div className="field" style={{ marginTop: 12 }}>
                <label>Platforms</label>
                <div className="chip-row">
                  {(
                    [
                      "TikTok",
                      "Instagram",
                      "X",
                      "LinkedIn",
                      "Pinterest",
                    ] as Platform[]
                  ).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`chip ${platforms.includes(p) ? "active" : ""}`}
                      onClick={() => toggle(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="row-actions">
                <button
                  type="button"
                  className="btn secondary"
                  disabled={!topicId}
                  onClick={() =>
                    creativeBriefFromTopic(topicId, brand || undefined)
                  }
                >
                  Generate creative brief
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={!topicId || !platforms.length}
                  onClick={() => {
                    creativeGeneratePlatforms(topicId, platforms);
                    navigate("/agents/creative");
                  }}
                >
                  Multi-platform rewrite
                </button>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="panel">
              <div className="panel-head">
                <h2>Latest brief</h2>
              </div>
              <div className="panel-body">
                {latestBrief ? (
                  <>
                    <div style={{ fontWeight: 600 }}>
                      {latestBrief.brand} · {latestBrief.format}
                    </div>
                    <p>{latestBrief.angle}</p>
                    <div className="muted-sm">{latestBrief.visual_language}</div>
                    <h3 className="h3-tight">Platform plays</h3>
                    <ul>
                      {Object.entries(latestBrief.platform_plays).map(([p, v]) => (
                        <li key={p}>
                          <strong>{p}</strong>: {v}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="empty">No brief yet</div>
                )}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h2>Recent assets</h2>
              </div>
              <div className="panel-body" style={{ paddingTop: 8 }}>
                {content.slice(0, 6).map((c) => (
                  <div key={c.content_id} className="list-item" style={{ cursor: "default" }}>
                    <div style={{ fontWeight: 600 }}>{c.title}</div>
                    <div className="chip-row" style={{ marginTop: 6 }}>
                      <span className="badge">{c.platform}</span>
                      <span className={`badge ${c.status}`}>{c.status}</span>
                    </div>
                    {c.creative_direction ? (
                      <div className="muted-sm" style={{ marginTop: 6 }}>
                        {c.creative_direction}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
