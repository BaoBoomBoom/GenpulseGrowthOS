import { useMemo, useState } from "react";
import { trackingLink } from "../store";
import { useStore } from "../store-context";
import type { Platform } from "../types";

export function ContentPage() {
  const {
    content,
    topics,
    allTopics,
    activeContentId,
    setActiveContentId,
    updateContent,
    publishContent,
    generateContent,
    brandFilter,
  } = useStore();

  const list = useMemo(
    () =>
      content.filter(
        (c) => brandFilter === "All" || c.brand === brandFilter
      ),
    [content, brandFilter]
  );

  const active = list.find((c) => c.content_id === activeContentId) ?? list[0];
  const topic = allTopics.find((t) => t.topic_id === active?.topic_id);
  const [platformTab, setPlatformTab] = useState<Platform | null>(null);
  const [publishUrl, setPublishUrl] = useState("");
  const [campaign, setCampaign] = useState("2026W30");
  const [copied, setCopied] = useState(false);

  const siblings = active
    ? content.filter((c) => c.topic_id === active.topic_id)
    : [];
  const currentPlatform = platformTab ?? active?.platform ?? "TikTok";
  const viewing =
    siblings.find((c) => c.platform === currentPlatform) ?? active;

  if (!viewing) {
    return (
      <>
        <header>
          <h1 className="page-title">Content Generator</h1>
          <p className="page-desc">从 Topic 生成多平台内容草稿</p>
        </header>
        <div className="empty panel" style={{ marginTop: 18 }}>
          暂无 content。去 Topics 页 Generate。
        </div>
      </>
    );
  }

  const link = trackingLink(viewing.tracking_params);

  return (
    <>
      <header>
        <h1 className="page-title">Multi-platform Content</h1>
        <p className="page-desc">
          同一主题改写为 TikTok / IG / X / LinkedIn；引用 knowledge；发布时写入追踪参数。
        </p>
      </header>

      <div className="grid-2" style={{ marginTop: 18 }}>
        <div className="panel">
          <div className="panel-head">
            <h2>Assets</h2>
            {topic ? (
              <button
                type="button"
                className="btn secondary"
                onClick={() => generateContent(topic.topic_id, topic.platform)}
              >
                Regenerate platforms
              </button>
            ) : null}
          </div>
          <div className="panel-body" style={{ paddingTop: 8 }}>
            {list.map((c) => {
              const t = topics.find((x) => x.topic_id === c.topic_id) ??
                allTopics.find((x) => x.topic_id === c.topic_id);
              return (
                <button
                  key={c.content_id}
                  type="button"
                  className={`list-item ${
                    viewing.content_id === c.content_id ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveContentId(c.content_id);
                    setPlatformTab(c.platform);
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{c.title}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    <span className="badge">{c.platform}</span>
                    <span className={`badge ${c.status}`}>{c.status}</span>
                    <span className="badge">{c.brand}</span>
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: 6 }}>
                    {t?.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>{topic?.title ?? viewing.title}</h2>
              <div style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 4 }}>
                {topic?.core_angle} · CTA: {topic?.cta_type}
              </div>
            </div>
          </div>
          <div className="panel-body">
            <div className="tabs">
              {(["TikTok", "Instagram", "X", "LinkedIn"] as Platform[]).map((p) => {
                const exists = siblings.some((s) => s.platform === p);
                return (
                  <button
                    key={p}
                    type="button"
                    className={`tab ${currentPlatform === p ? "active" : ""}`}
                    disabled={!exists}
                    onClick={() => {
                      const hit = siblings.find((s) => s.platform === p);
                      if (hit) {
                        setActiveContentId(hit.content_id);
                        setPlatformTab(p);
                      }
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {(viewing.source_knowledge_ids || []).map((id) => (
                <span key={id} className="badge">
                  {id}
                </span>
              ))}
            </div>

            <ScriptView copy={viewing.script_or_copy} />

            <div className="field" style={{ marginTop: 14 }}>
              <label>Hook</label>
              <input
                value={viewing.hook}
                onChange={(e) =>
                  updateContent(viewing.content_id, { hook: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label>CTA</label>
              <input
                value={viewing.cta}
                onChange={(e) =>
                  updateContent(viewing.content_id, { cta: e.target.value })
                }
              />
            </div>

            <div className="callout" style={{ marginBottom: 12 }}>
              Tracking link
              <div className="mono" style={{ marginTop: 6 }}>
                {link}
              </div>
            </div>

            <div className="row-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={() =>
                  updateContent(viewing.content_id, { status: "approved" })
                }
              >
                Approve
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(link);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? "Copied" : "Copy tracking link"}
              </button>
            </div>

            {viewing.status !== "published" ? (
              <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                <div className="field">
                  <label>Publish URL</label>
                  <input
                    placeholder="https://..."
                    value={publishUrl}
                    onChange={(e) => setPublishUrl(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Campaign tag</label>
                  <input
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn"
                  disabled={!publishUrl.trim()}
                  onClick={() => {
                    publishContent(viewing.content_id, publishUrl.trim(), campaign);
                    setPublishUrl("");
                  }}
                >
                  Mark published
                </button>
              </div>
            ) : (
              <p style={{ marginTop: 14, color: "var(--accent-deep)" }}>
                Published · {viewing.publish_url}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ScriptView({ copy }: { copy: Record<string, unknown> }) {
  return (
    <div
      style={{
        background: "var(--surface-2)",
        borderRadius: 10,
        padding: 14,
        fontSize: "0.9rem",
        lineHeight: 1.5,
      }}
    >
      {Object.entries(copy).map(([key, value]) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <div
            style={{
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--muted)",
              marginBottom: 4,
            }}
          >
            {key}
          </div>
          {Array.isArray(value) ? (
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {value.map((v) => (
                <li key={String(v)}>{String(v)}</li>
              ))}
            </ol>
          ) : (
            <div>{String(value)}</div>
          )}
        </div>
      ))}
    </div>
  );
}
