import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store-context";
import { buildWeeklyPlanStats } from "../lib/weeklyPlan";

export function WeeklyFrequencyStats({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { platformPlans, calendarSlots, brandFilter, weekKey } = useStore();

  const { rows, targetTotal, scheduledTotal } = useMemo(
    () => buildWeeklyPlanStats(platformPlans, calendarSlots, brandFilter),
    [platformPlans, calendarSlots, brandFilter]
  );

  const low = rows.filter((r) => r.status === "low").length;
  const fillPct =
    targetTotal <= 0 ? 0 : Math.round((scheduledTotal / targetTotal) * 100);

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="panel-head">
        <div>
          <h2>Weekly plan vs calendar</h2>
          <div className="muted-sm">
            Week {weekKey} · from Brand Matrix Platform Strategy frequency
          </div>
        </div>
        {!compact ? (
          <Link className="btn ghost" to="/brands">
            Brand Matrix
          </Link>
        ) : null}
      </div>
      <div className="panel-body">
        <div className="grid-3" style={{ marginBottom: 14 }}>
          <div className="stat">
            <div className="label">Plan target / week</div>
            <div className="value">{targetTotal}</div>
          </div>
          <div className="stat accent">
            <div className="label">Scheduled on calendar</div>
            <div className="value">{scheduledTotal}</div>
          </div>
          <div className={`stat ${fillPct >= 100 ? "accent" : "signal"}`}>
            <div className="label">Fill rate</div>
            <div className="value">{fillPct}%</div>
          </div>
        </div>

        {low > 0 ? (
          <div className="callout warn" style={{ marginBottom: 12 }}>
            {low} channel{low > 1 ? "s" : ""} below planned frequency — add posts from
            Content Database to close the gap.
          </div>
        ) : (
          <div className="callout" style={{ marginBottom: 12 }}>
            All visible channels meet or exceed this week&apos;s planned frequency.
          </div>
        )}

        <div className="freq-table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Platform</th>
                <th>Strategy frequency</th>
                <th>Target</th>
                <th>Scheduled</th>
                <th>Gap</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.planId} className={`freq-row-${r.status}`}>
                  <td>{r.account}</td>
                  <td>{r.platform}</td>
                  <td className="muted-sm" style={{ maxWidth: 220 }}>
                    {r.frequency}
                  </td>
                  <td>
                    <strong>{r.weekly_target}</strong>
                    <span className="muted-sm"> /wk</span>
                  </td>
                  <td>{r.scheduled}</td>
                  <td>
                    <span
                      className={`badge ${
                        r.gap > 0 ? "status-ready" : r.gap < 0 ? "status-published" : "status-scheduled"
                      }`}
                    >
                      {r.gap > 0 ? `−${r.gap}` : r.gap < 0 ? `+${-r.gap}` : "0"}
                    </span>
                  </td>
                  <td style={{ minWidth: 120 }}>
                    <div className="bar-row" style={{ marginBottom: 0 }}>
                      <div className="bar" style={{ gridColumn: "1 / -1" }}>
                        <span
                          className={`bar-fill-${r.status}`}
                          style={{ width: `${Math.min(100, r.fill * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
