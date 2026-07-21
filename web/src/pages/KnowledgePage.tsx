import { useMemo, useState } from "react";
import { useStore } from "../store-context";
import type { EvidenceLevel, KnowledgeType } from "../types";

export function KnowledgePage() {
  const { knowledge, addKnowledge, updateKnowledge, brandFilter } = useStore();
  const [type, setType] = useState<"all" | KnowledgeType>("all");
  const [tag, setTag] = useState("");
  const [selected, setSelected] = useState<string | null>(
    knowledge[0]?.knowledge_id ?? null
  );
  const [showNew, setShowNew] = useState(false);

  const list = useMemo(() => {
    return knowledge.filter((k) => {
      if (brandFilter !== "All" && k.brand !== brandFilter && k.brand !== "universal")
        return false;
      if (type !== "all" && k.type !== type) return false;
      if (
        tag &&
        !k.topic_tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))
      )
        return false;
      return k.status === "active";
    });
  }, [knowledge, brandFilter, type, tag]);

  const item = knowledge.find((k) => k.knowledge_id === selected) ?? list[0];

  return (
    <>
      <header>
        <h1 className="page-title">Knowledge Base</h1>
        <p className="page-desc">
          结构化知识底座，可按品牌 / 类型 / 标签检索调用。Phase 1：research / product /
          brand / founder。
        </p>
      </header>

      <div className="split" style={{ marginTop: 18 }}>
        <div>
          <div className="filters">
            <select value={type} onChange={(e) => setType(e.target.value as typeof type)}>
              <option value="all">All types</option>
              <option value="research">research</option>
              <option value="product">product</option>
              <option value="brand">brand</option>
              <option value="founder">founder</option>
            </select>
            <input
              placeholder="Filter tag…"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              style={{ flex: 1, minWidth: 120 }}
            />
            <button type="button" className="btn" onClick={() => setShowNew(true)}>
              New
            </button>
          </div>

          {list.map((k) => (
            <button
              key={k.knowledge_id}
              type="button"
              className={`list-item ${item?.knowledge_id === k.knowledge_id ? "active" : ""}`}
              onClick={() => setSelected(k.knowledge_id)}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{k.title}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className="badge">{k.type}</span>
                <span className="badge">{k.brand}</span>
                <span className={`badge ${k.evidence_level}`}>{k.evidence_level}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="panel">
          {showNew ? (
            <NewKnowledgeForm
              onCancel={() => setShowNew(false)}
              onSave={(payload) => {
                addKnowledge(payload);
                setShowNew(false);
              }}
            />
          ) : item ? (
            <>
              <div className="panel-head">
                <h2>{item.title}</h2>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() =>
                    updateKnowledge(item.knowledge_id, {
                      last_reviewed_at: new Date().toISOString().slice(0, 10),
                    })
                  }
                >
                  Mark reviewed
                </button>
              </div>
              <div className="panel-body">
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  <span className="badge">{item.type}</span>
                  <span className="badge">{item.brand}</span>
                  <span className={`badge ${item.evidence_level}`}>
                    {item.evidence_level}
                  </span>
                  {item.topic_tags.map((t) => (
                    <span key={t} className="badge">
                      {t}
                    </span>
                  ))}
                </div>
                <p style={{ lineHeight: 1.55 }}>{item.summary}</p>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem" }}>
                  Key claims
                </h3>
                <ul>
                  {item.key_claims.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                {item.safety_notes ? (
                  <div className="callout" style={{ marginTop: 12 }}>
                    Safety: {item.safety_notes}
                  </div>
                ) : null}
                <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 16 }}>
                  Last reviewed: {item.last_reviewed_at ?? "—"} · Formats:{" "}
                  {item.usable_formats.join(", ")}
                </p>
              </div>
            </>
          ) : (
            <div className="empty">No knowledge items</div>
          )}
        </div>
      </div>
    </>
  );
}

function NewKnowledgeForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (payload: {
    title: string;
    type: KnowledgeType;
    brand: "Genpulse" | "Lushair" | "CEO" | "universal";
    topic_tags: string[];
    summary: string;
    key_claims: string[];
    evidence_level: EvidenceLevel;
    usable_formats: ("TikTok" | "Instagram" | "X" | "LinkedIn")[];
    audience_tags: string[];
    safety_notes?: string;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<KnowledgeType>("research");
  const [brand, setBrand] = useState<"Genpulse" | "Lushair" | "CEO" | "universal">(
    "Genpulse"
  );
  const [tags, setTags] = useState("sleep, hormones");
  const [summary, setSummary] = useState("");
  const [claims, setClaims] = useState("");
  const [evidence, setEvidence] = useState<EvidenceLevel>("medium");

  return (
    <>
      <div className="panel-head">
        <h2>New knowledge</h2>
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <div className="panel-body">
        <div className="field">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as KnowledgeType)}>
              <option value="research">research</option>
              <option value="product">product</option>
              <option value="brand">brand</option>
              <option value="founder">founder</option>
            </select>
          </div>
          <div className="field">
            <label>Brand</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value as typeof brand)}
            >
              <option>Genpulse</option>
              <option>Lushair</option>
              <option>CEO</option>
              <option>universal</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Tags (comma)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <div className="field">
          <label>Summary</label>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div className="field">
          <label>Key claims (one per line)</label>
          <textarea value={claims} onChange={(e) => setClaims(e.target.value)} />
        </div>
        <div className="field">
          <label>Evidence</label>
          <select
            value={evidence}
            onChange={(e) => setEvidence(e.target.value as EvidenceLevel)}
          >
            <option>high</option>
            <option>medium</option>
            <option>low</option>
            <option>narrative</option>
          </select>
        </div>
        <button
          type="button"
          className="btn"
          disabled={!title.trim() || !summary.trim()}
          onClick={() =>
            onSave({
              title: title.trim(),
              type,
              brand,
              topic_tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
              summary: summary.trim(),
              key_claims: claims
                .split("\n")
                .map((c) => c.trim())
                .filter(Boolean),
              evidence_level: evidence,
              usable_formats: ["TikTok", "Instagram", "X", "LinkedIn"],
              audience_tags: [],
            })
          }
        >
          Save knowledge
        </button>
      </div>
    </>
  );
}
