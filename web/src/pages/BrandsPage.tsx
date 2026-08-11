import { WeeklyFrequencyStats } from "../components/WeeklyFrequencyStats";
import { PublishPlatformOrder } from "../components/PublishPlatformOrder";
import { useStore } from "../store-context";
import {
  PUBLISH_PLATFORM_ORDER,
  publishOrderRank,
  sortPlatformsByPublishOrder,
} from "../types";

export function BrandsPage() {
  const { brands, platformPlans, brandFilter } = useStore();
  const list =
    brandFilter === "All" ? brands : brands.filter((b) => b.id === brandFilter);
  const plans =
    brandFilter === "All"
      ? platformPlans
      : platformPlans.filter((p) => p.account === brandFilter);

  const sortedPlans = [...plans].sort((a, b) => {
    const acc = a.account.localeCompare(b.account);
    if (acc !== 0) return acc;
    return publishOrderRank(a.platform) - publishOrderRank(b.platform);
  });

  return (
    <>
      <header>
        <h1 className="page-title">Brand Matrix</h1>
        <p className="page-desc">
          From Genpulse Growth OS v2 — audience, tone, goal, KPI, CTA, and prompt
          beginnings for every account Creative Director must honor. Platforms
          follow the OS publish order.
        </p>
      </header>

      <div style={{ marginTop: 16 }}>
        <PublishPlatformOrder
          platforms={
            brandFilter === "All" ? PUBLISH_PLATFORM_ORDER : list[0]?.platforms
          }
          title={
            brandFilter === "All"
              ? "OS 发布平台顺序"
              : `${brandFilter} 发布平台顺序`
          }
        />
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Publish order</th>
                <th>Audience</th>
                <th>Tone</th>
                <th>Goal</th>
                <th>KPI</th>
                <th>CTA</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => {
                const ordered = sortPlatformsByPublishOrder(b.platforms);
                return (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.id}</strong>
                    </td>
                    <td>
                      <div className="platform-order-inline">
                        {ordered.map((p, i) => (
                          <span key={p} className="platform-order-chip">
                            <span className="n">{i + 1}</span>
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{b.audience}</td>
                    <td style={{ maxWidth: 240 }}>{b.tone}</td>
                    <td>{b.goal}</td>
                    <td>{b.kpi}</td>
                    <td>
                      {b.cta}
                      <div className="muted-sm">{b.secondary_cta}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-head">
          <h2>Platform Strategy</h2>
          <span className="muted-sm">Sorted by account · publish order</span>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Account</th>
                <th>Platform</th>
                <th>Objective</th>
                <th>CTA</th>
                <th>Frequency</th>
                <th>Target / week</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlans.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="badge publish-rank">
                      {publishOrderRank(p.platform)}
                    </span>
                  </td>
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
