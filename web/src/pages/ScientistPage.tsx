import { useMemo, useState } from "react";
import { AgentChat } from "../components/AgentChat";
import { useStore } from "../store-context";

export function ScientistPage() {
  const {
    knowledge,
    allTopics,
    scientistIngest,
    scientistScoreTopic,
    brandFilter,
  } = useStore();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("hormones, sleep");
  const [claims, setClaims] = useState("");
  const [selected, setSelected] = useState(knowledge[0]?.knowledge_id ?? null);

  const list = useMemo(
    () =>
      knowledge.filter((k) => {
        if (brandFilter === "All") return true;
        return k.brand === brandFilter || k.brand === "universal";
      }),
    [knowledge, brandFilter]
  );
  const item = knowledge.find((k) => k.knowledge_id === selected) ?? list[0];

  return (
    <>
      <header>
        <h1 className="page-title">AI Scientist</h1>
        <p className="page-desc">
          Not a copywriter. Tracks scientific updates, extracts usable evidence, flags
          controversy and risk, translates paper language into content language, and
          assigns evidence scores — the credibility gatekeeper.
        </p>
      </header>

      <div className="agent-layout" style={{ marginTop: 18 }}>
        <AgentChat
          agent="scientist"
          placeholders={[
            "Score evidence on sleep topics",
            "What controversies should we flag?",
            "Translate melatonin paper into content language",
          ]}
        />

        <div className="agent-main">
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-head">
              <h2>Ingest scientific update</h2>
            </div>
            <div className="panel-body">
              <div className="field">
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="field">
                <label>Summary / abstract</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Tags</label>
                  <input value={tags} onChange={(e) => setTags(e.target.value)} />
                </div>
                <div className="field">
                  <label>Key claims (one per line)</label>
                  <textarea
                    value={claims}
                    onChange={(e) => setClaims(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn"
                disabled={!title.trim() || !summary.trim()}
                onClick={() => {
                  const item = scientistIngest({ title, summary, tags, claims });
                  setSelected(item.knowledge_id);
                  setTitle("");
                  setSummary("");
                  setClaims("");
                }}
              >
                Extract evidence + score
              </button>
            </div>
          </div>

          <div className="grid-2">
            <div className="panel">
              <div className="panel-head">
                <h2>Evidence library</h2>
              </div>
              <div className="panel-body" style={{ paddingTop: 8 }}>
                {list.map((k) => (
                  <button
                    key={k.knowledge_id}
                    type="button"
                    className={`list-item ${
                      item?.knowledge_id === k.knowledge_id ? "active" : ""
                    }`}
                    onClick={() => setSelected(k.knowledge_id)}
                  >
                    <div style={{ fontWeight: 600 }}>{k.title}</div>
                    <div className="chip-row" style={{ marginTop: 6 }}>
                      <span className={`badge ${k.evidence_level}`}>
                        score {k.evidence_score}
                      </span>
                      <span className="badge">{k.type}</span>
                      {k.risk_flags.length ? (
                        <span className="badge signal-badge">risk</span>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel">
              {item ? (
                <>
                  <div className="panel-head">
                    <h2>{item.title}</h2>
                    <span className={`badge ${item.evidence_level}`}>
                      {item.evidence_score}
                    </span>
                  </div>
                  <div className="panel-body">
                    <p>{item.summary}</p>
                    <h3 className="h3-tight">Key claims</h3>
                    <ul>
                      {item.key_claims.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                    {item.content_language ? (
                      <div className="callout" style={{ marginTop: 10 }}>
                        Content language: {item.content_language}
                      </div>
                    ) : null}
                    {item.controversy ? (
                      <div className="callout warn" style={{ marginTop: 10 }}>
                        Controversy: {item.controversy}
                      </div>
                    ) : null}
                    {item.risk_flags.length ? (
                      <ul style={{ marginTop: 10 }}>
                        {item.risk_flags.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="empty">No evidence item</div>
              )}
            </div>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-head">
              <h2>Score topics before Creative</h2>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Brand</th>
                    <th>Evidence</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {allTopics.slice(0, 8).map((t) => (
                    <tr key={t.topic_id}>
                      <td>{t.title}</td>
                      <td>{t.brand}</td>
                      <td>
                        <span className={`badge ${t.evidence_level}`}>
                          {t.evidence_score}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => scientistScoreTopic(t.topic_id)}
                        >
                          Re-score
                        </button>
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
