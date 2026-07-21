import { useMemo } from "react";
import { AgentChat } from "../components/AgentChat";
import { useStore } from "../store-context";

export function GrowthPage() {
  const {
    events,
    allTopics,
    growthMetrics,
    growthInsights,
    growthRefreshInsights,
    growthAllocateWeek,
    content,
    brandFilter,
  } = useStore();

  const scoped = useMemo(
    () =>
      events.filter((e) => brandFilter === "All" || e.brand === brandFilter),
    [events, brandFilter]
  );

  const sum = (type: string) =>
    scoped.filter((e) => e.event_type === type).reduce((s, e) => s + e.value, 0);

  const byTopic = useMemo(() => {
    const map = new Map<
      string,
      { title: string; clicks: number; installs: number; uploads: number }
    >();
    for (const e of scoped) {
      const topic = allTopics.find((t) => t.topic_id === e.topic_id);
      const row = map.get(e.topic_id) ?? {
        title: topic?.title ?? e.topic_id,
        clicks: 0,
        installs: 0,
        uploads: 0,
      };
      if (e.event_type === "click") row.clicks += e.value;
      if (e.event_type === "install") row.installs += e.value;
      if (e.event_type === "upload") row.uploads += e.value;
      map.set(e.topic_id, row);
    }
    return [...map.values()].sort((a, b) => b.installs - a.installs);
  }, [scoped, allTopics]);

  const published = content.filter(
    (c) =>
      c.status === "published" &&
      (brandFilter === "All" || c.brand === brandFilter)
  ).length;

  return (
    <>
      <header>
        <h1 className="page-title">AI Growth Manager</h1>
        <p className="page-desc">
          Not a reporting tool. Attributes outcomes, reads trends, finds anomalies,
          recommends, and allocates next-week content capacity toward downloads,
          uploads, scans, and retention — the growth resource allocator.
        </p>
      </header>

      <div className="agent-layout" style={{ marginTop: 18 }}>
        <AgentChat
          agent="growth"
          placeholders={[
            "Allocate next week capacity",
            "Any anomalies this week?",
            "Which content drove uploads?",
          ]}
        />

        <div className="agent-main">
          <div className="grid-4" style={{ marginBottom: 16 }}>
            <div className="stat">
              <div className="label">Published</div>
              <div className="value">{published}</div>
            </div>
            <div className="stat">
              <div className="label">Clicks</div>
              <div className="value">{sum("click")}</div>
            </div>
            <div className="stat signal">
              <div className="label">Downloads</div>
              <div className="value">{sum("install")}</div>
            </div>
            <div className="stat accent">
              <div className="label">Uploads</div>
              <div className="value">{sum("upload")}</div>
            </div>
          </div>

          <div className="row-actions" style={{ marginBottom: 16 }}>
            <button type="button" className="btn secondary" onClick={() => growthRefreshInsights()}>
              Refresh insights
            </button>
            <button type="button" className="btn" onClick={() => growthAllocateWeek()}>
              Allocate next week
            </button>
          </div>

          <div className="grid-2">
            <div className="panel">
              <div className="panel-head">
                <h2>Business attribution by topic</h2>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Topic</th>
                      <th>Clicks</th>
                      <th>Downloads</th>
                      <th>Uploads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byTopic.map((r) => (
                      <tr key={r.title}>
                        <td>{r.title}</td>
                        <td>{r.clicks}</td>
                        <td>
                          <strong>{r.installs}</strong>
                        </td>
                        <td>{r.uploads}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h2>Insights & allocations</h2>
              </div>
              <div className="panel-body">
                {growthInsights.map((g) => (
                  <div key={g.id} className="insight-card">
                    <div className="chip-row">
                      <span className="badge">{g.type}</span>
                      <span className={`badge ${g.impact}`}>{g.impact}</span>
                      {g.brand ? <span className="badge">{g.brand}</span> : null}
                    </div>
                    <div style={{ fontWeight: 600, marginTop: 6 }}>{g.title}</div>
                    <div className="muted-sm">{g.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-head">
              <h2>North-star metrics (from Growth OS sheet)</h2>
            </div>
            <div className="panel-body">
              <div className="grid-4">
                {growthMetrics.map((m) => (
                  <div key={`${m.brand}-${m.metric}`} className="stat">
                    <div className="label">
                      {m.brand} · {m.metric}
                    </div>
                    <div className="value" style={{ fontSize: "1.25rem" }}>
                      {m.value.toLocaleString()}
                    </div>
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
