import { WeeklyFrequencyStats } from "../components/WeeklyFrequencyStats";
import { useStore } from "../store-context";

export function BrandsPage() {
  const { brands, platformPlans, brandFilter } = useStore();
  const list =
    brandFilter === "All" ? brands : brands.filter((b) => b.id === brandFilter);
  const plans =
    brandFilter === "All"
      ? platformPlans
      : platformPlans.filter((p) => p.account === brandFilter);

  return (
    <>
      <header>
        <h1 className="page-title">Brand Matrix</h1>
        <p className="page-desc">
          From Genpulse Growth OS v2 — audience, tone, goal, KPI, CTA, and prompt
          beginnings for every account Creative Director must honor.
        </p>
      </header>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Audience</th>
                <th>Tone</th>
                <th>Goal</th>
                <th>KPI</th>
                <th>CTA</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.id}</strong>
                    <div className="muted-sm">{b.platforms.join(", ")}</div>
                  </td>
                  <td>{b.audience}</td>
                  <td style={{ maxWidth: 260 }}>{b.tone}</td>
                  <td>{b.goal}</td>
                  <td>{b.kpi}</td>
                  <td>
                    {b.cta}
                    <div className="muted-sm">{b.secondary_cta}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-head">
          <h2>Platform Strategy</h2>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Platform</th>
                <th>Objective</th>
                <th>CTA</th>
                <th>Frequency</th>
                <th>Target / week</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td>{p.account}</td>
                  <td>{p.platform}</td>
                  <td style={{ maxWidth: 320 }}>{p.objective}</td>
                  <td>{p.cta}</td>
                  <td>{p.frequency}</td>
                  <td>
                    <strong>{p.weekly_target}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <WeeklyFrequencyStats />
      </div>
    </>
  );
}
