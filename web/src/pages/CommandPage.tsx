import { Link } from "react-router-dom";
import { WeeklyFrequencyStats } from "../components/WeeklyFrequencyStats";
import { PublishPlatformOrder } from "../components/PublishPlatformOrder";
import { useStore } from "../store-context";

export function CommandPage() {
  const {
    knowledge,
    databaseEntries,
    calendarSlots,
    growthMetrics,
    growthInsights,
    events,
  } = useStore();
  const installs = events
    .filter((e) => e.event_type === "install")
    .reduce((s, e) => s + e.value, 0);
  const uploads = events
    .filter((e) => e.event_type === "upload")
    .reduce((s, e) => s + e.value, 0);

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Genpulse Marketing OS</p>
          <h1 className="page-title">What should we ship this week?</h1>
          <p className="page-desc">
            Start in Content Database, let agents sharpen science / creative / growth,
            then lock posts on the Calendar — publish in platform order.
          </p>
        </div>
        <div className="header-actions">
          <Link className="btn" to="/review">
            Review queue
          </Link>
          <Link className="btn secondary" to="/sales">
            Sales OS
          </Link>
        </div>
      </header>

      <div className="howto-strip">
        <Link to="/content/database"><strong>1 Content</strong> enter &amp; schedule</Link>
        <Link to="/agents"><strong>2 Agents</strong> science / creative / growth</Link>
        <Link to="/review"><strong>3 Review</strong> hard publish gate</Link>
        <Link to="/sales"><strong>4 Sales</strong> pipeline &amp; deal table</Link>
      </div>

      <div style={{ marginBottom: 16 }}>
        <PublishPlatformOrder compact />
      </div>

      <div className="grid-4" style={{ marginBottom: 18 }}>
        <div className="stat">
          <div className="label">Database rows</div>
          <div className="value">{databaseEntries.length}</div>
        </div>
        <div className="stat">
          <div className="label">On calendar</div>
          <div className="value">{calendarSlots.length}</div>
        </div>
        <div className="stat signal">
          <div className="label">Downloads</div>
          <div className="value">{installs}</div>
        </div>
        <div className="stat accent">
          <div className="label">Uploads</div>
          <div className="value">{uploads}</div>
        </div>
      </div>

      <WeeklyFrequencyStats compact />

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <Link to="/content/database" className="panel jump-card" style={{ textDecoration: "none" }}>
          <div className="panel-body">
            <div className="n">Input</div>
            <h3>Content Database</h3>
            <p>
              Spreadsheet-grade fields: topic, hook, script, brand, platform, CTA,
              funnel, repurpose matrix. This is the source of truth for what exists.
            </p>
          </div>
        </Link>
        <Link to="/content/calendar" className="panel jump-card" style={{ textDecoration: "none" }}>
          <div className="panel-body">
            <div className="n">Schedule</div>
            <h3>Content Calendar</h3>
            <p>
              Week board by day. Move posts, pull from unscheduled library, see brand +
              platform at a glance.
            </p>
          </div>
        </Link>
      </div>

      <section className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head">
          <h2>Three agents (when you need help)</h2>
        </div>
        <div className="panel-body">
          <div className="loop agents-loop">
            <Link to="/agents/scientist" className="loop-card kb agent-card" style={{ textDecoration: "none" }}>
              <div className="n">Truth</div>
              <h3>Scientist</h3>
              <p>Evidence score, controversy, risk — before you publish science claims.</p>
            </Link>
            <Link to="/agents/creative" className="loop-card content agent-card" style={{ textDecoration: "none" }}>
              <div className="n">Style</div>
              <h3>Creative</h3>
              <p>Brand voice + format + how one topic plays on each platform.</p>
            </Link>
            <Link to="/agents/growth" className="loop-card dash agent-card" style={{ textDecoration: "none" }}>
              <div className="n">Resources</div>
              <h3>Growth</h3>
              <p>What drove downloads/uploads — allocate next week accordingly.</p>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <h2>North-star metrics</h2>
          </div>
          <div className="panel-body">
            <div className="grid-2">
              {growthMetrics.slice(0, 4).map((m) => (
                <div key={m.metric + String(m.brand)} className="stat">
                  <div className="label">
                    {m.brand} · {m.metric}
                  </div>
                  <div className="value" style={{ fontSize: "1.25rem" }}>
                    {m.value.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <p className="muted-sm" style={{ marginTop: 10 }}>
              Knowledge items on file: {knowledge.length}
            </p>
          </div>
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2>Briefing</h2>
            <Link className="btn ghost" to="/agents/growth">
              Open Growth
            </Link>
          </div>
          <div className="panel-body">
            <ul className="brief-list">
              {growthInsights.slice(0, 3).map((g) => (
                <li key={g.id}>
                  <strong>{g.type}</strong> — {g.title}
                  <div className="muted-sm">{g.detail}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
