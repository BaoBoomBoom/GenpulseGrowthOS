import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AgentChat } from "../components/AgentChat";
import { PublishPlatformOrder } from "../components/PublishPlatformOrder";
import { useStore } from "../store-context";
import type { BrandId, Platform } from "../types";
import {
  PUBLISH_PLATFORM_ORDER,
  publishOrderRank,
  sortPlatformsByPublishOrder,
} from "../types";

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
  const platformChoices = sortPlatformsByPublishOrder(
    profile?.platforms?.length
      ? profile.platforms
      : PUBLISH_PLATFORM_ORDER.filter((p) => p !== "Newsletter")
  );

  function toggle(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  const generated = [...content]
    .filter((c) => brandFilter === "All" || c.brand === brandFilter)
    .sort((a, b) => publishOrderRank(a.platform) - publishOrderRank(b.platform))
    .slice(0, 12);

  return (
    <>
      <header>
        <h1 className="page-title">AI Creative Director</h1>
        <p className="page-desc">
          Not a caption machine. Locks brand personality, chooses format, sets creative
          direction and visual language, and decides how one theme performs across
          platforms — in publish order.
        </p>
      </header>

      <div style={{ marginTop: 14 }}>
        <PublishPlatformOrder
          platforms={platformChoices}
          compact
          title="生成 / 分发平台顺序"
        />
      </div>

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
                <label>Platforms（按发布顺序编号）</label>
                <div className="chip-row">
                  {platformChoices.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`chip ${platforms.includes(p) ? "active" : ""}`}
                      onClick={() => toggle(p)}
                    >
                      <span className="chip-rank">{publishOrderRank(p)}</span>
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
                    creativeGeneratePlatforms(
                      topicId,
                      sortPlatformsByPublishOrder(platforms)
                    );
                    navigate("/agents/creative");
                  }}
                >
                  Generate platform drafts
                </button>
              </div>
            </div>
          </div>

          {latestBrief ? (
            <div className="panel" style={{ marginBottom: 16 }}>
              <div className="panel-head">
                <h2>Latest brief · {latestBrief.brand}</h2>
              </div>
              <div className="panel-body">
                <p>
                  <strong>{latestBrief.format}</strong> — {latestBrief.angle}
                </p>
                <p className="muted-sm">{latestBrief.visual_language}</p>
              </div>
            </div>
          ) : null}

          <div className="panel">
            <div className="panel-head">
              <h2>Generated assets</h2>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Platform</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {generated.map((c) => (
                    <tr key={c.content_id}>
                      <td>
                        <span className="badge publish-rank">
                          {publishOrderRank(c.platform)}
                        </span>
                      </td>
                      <td>{c.title}</td>
                      <td>{c.platform}</td>
                      <td>
                        <span className={`badge status-${c.status}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
