import { useMemo } from "react";
import { useStore } from "../store-context";
import type { BrandIp, Platform } from "../types";

export function DashboardPage() {
  const { events, content, allTopics, brandFilter } = useStore();

  const scopedEvents = useMemo(
    () =>
      events.filter(
        (e) => brandFilter === "All" || e.brand === brandFilter
      ),
    [events, brandFilter]
  );

  const published = content.filter(
    (c) =>
      c.status === "published" &&
      (brandFilter === "All" || c.brand === brandFilter)
  ).length;

  const sum = (type: string) =>
    scopedEvents
      .filter((e) => e.event_type === type)
      .reduce((s, e) => s + e.value, 0);

  const byTopic = useMemo(() => {
    const map = new Map<
      string,
      { title: string; clicks: number; installs: number; activations: number; uploads: number }
    >();
    for (const e of scopedEvents) {
      const topic = allTopics.find((t) => t.topic_id === e.topic_id);
      const row = map.get(e.topic_id) ?? {
        title: topic?.title ?? e.topic_id,
        clicks: 0,
        installs: 0,
        activations: 0,
        uploads: 0,
      };
      if (e.event_type === "click") row.clicks += e.value;
      if (e.event_type === "install") row.installs += e.value;
      if (e.event_type === "activation") row.activations += e.value;
      if (e.event_type === "upload") row.uploads += e.value;
      map.set(e.topic_id, row);
    }
    return [...map.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.installs - a.installs);
  }, [scopedEvents, allTopics]);

  const byPlatform = useMemo(() => {
    const platforms: Platform[] = ["TikTok", "Instagram", "X", "LinkedIn"];
    return platforms.map((p) => {
      const pe = scopedEvents.filter((e) => e.platform === p);
      return {
        platform: p,
        clicks: pe.filter((e) => e.event_type === "click").reduce((s, e) => s + e.value, 0),
        installs: pe.filter((e) => e.event_type === "install").reduce((s, e) => s + e.value, 0),
        activations: pe
          .filter((e) => e.event_type === "activation")
          .reduce((s, e) => s + e.value, 0),
      };
    });
  }, [scopedEvents]);

  const byBrand = useMemo(() => {
    const brands: BrandIp[] = ["Genpulse", "Lushair", "CEO"];
    return brands.map((b) => {
      const be = events.filter((e) => e.brand === b);
      return {
        brand: b,
        installs: be.filter((e) => e.event_type === "install").reduce((s, e) => s + e.value, 0),
        activations: be
          .filter((e) => e.event_type === "activation")
          .reduce((s, e) => s + e.value, 0),
        uploads: be.filter((e) => e.event_type === "upload").reduce((s, e) => s + e.value, 0),
      };
    });
  }, [events]);

  const maxInstalls = Math.max(1, ...byPlatform.map((p) => p.installs));

  return (
    <>
      <header>
        <h1 className="page-title">Attribution Dashboard</h1>
        <p className="page-desc">
          用 6 类基础事件把 topic 与增长结果关联：click / download /
          activation / upload——回流下周选题。
        </p>
      </header>

      <div className="grid-4" style={{ marginTop: 18, marginBottom: 16 }}>
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
          <div className="label">Activations / Uploads</div>
          <div className="value">
            {sum("activation")}/{sum("upload")}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <h2>By Topic</h2>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Clicks</th>
                  <th>Downloads</th>
                  <th>Act.</th>
                  <th>Uploads</th>
                </tr>
              </thead>
              <tbody>
                {byTopic.map((row) => (
                  <tr key={row.id}>
                    <td style={{ maxWidth: 280 }}>{row.title}</td>
                    <td>{row.clicks}</td>
                    <td>
                      <strong>{row.installs}</strong>
                    </td>
                    <td>{row.activations}</td>
                    <td>{row.uploads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!byTopic.length ? <div className="empty">No events yet</div> : null}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>By Platform</h2>
          </div>
          <div className="panel-body">
            {byPlatform.map((p) => (
              <div key={p.platform} className="bar-row">
                <div>{p.platform}</div>
                <div className="bar">
                  <span style={{ width: `${(p.installs / maxInstalls) * 100}%` }} />
                </div>
                <div>{p.installs}</div>
              </div>
            ))}
            <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 12 }}>
              Bar = downloads (installs). Clicks shown in topic table.
            </p>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-head">
          <h2>By Brand</h2>
        </div>
        <div className="panel-body">
          <div className="grid-3">
            {byBrand.map((b) => (
              <div key={b.brand} className="stat">
                <div className="label">{b.brand}</div>
                <div className="value" style={{ fontSize: "1.35rem" }}>
                  {b.installs} dl
                </div>
                <div style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 6 }}>
                  {b.activations} activated · {b.uploads} uploads
                </div>
              </div>
            ))}
          </div>
          <div className="callout" style={{ marginTop: 14 }}>
            下周选题可将 topic 表现回灌 priority_score（hist_similarity
            × 20%）。种子示例：TikTok sleep 主题 46 downloads / 12 activations / 4
            uploads。
          </div>
        </div>
      </div>
    </>
  );
}
