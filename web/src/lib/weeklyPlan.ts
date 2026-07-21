import type { BrandId, CalendarSlot, Platform, PlatformPlan } from "../types";

export interface WeeklyPlanRow {
  planId: string;
  account: BrandId;
  platform: Platform;
  frequency: string;
  weekly_target: number;
  scheduled: number;
  gap: number;
  fill: number; // 0-1
  status: "ok" | "low" | "over";
}

export function buildWeeklyPlanStats(
  plans: PlatformPlan[],
  slots: CalendarSlot[],
  brandFilter: "All" | BrandId
): { rows: WeeklyPlanRow[]; targetTotal: number; scheduledTotal: number } {
  const filtered =
    brandFilter === "All"
      ? plans
      : plans.filter((p) => p.account === brandFilter);

  const rows: WeeklyPlanRow[] = filtered.map((p) => {
    const scheduled = slots.filter(
      (s) => s.brand === p.account && s.platform === p.platform
    ).length;
    const gap = p.weekly_target - scheduled;
    const fill =
      p.weekly_target <= 0 ? 1 : Math.min(1, scheduled / p.weekly_target);
    const status: WeeklyPlanRow["status"] =
      scheduled > p.weekly_target
        ? "over"
        : scheduled >= p.weekly_target
          ? "ok"
          : "low";
    return {
      planId: p.id,
      account: p.account,
      platform: p.platform,
      frequency: p.frequency,
      weekly_target: p.weekly_target,
      scheduled,
      gap,
      fill,
      status,
    };
  });

  return {
    rows,
    targetTotal: rows.reduce((s, r) => s + r.weekly_target, 0),
    scheduledTotal: rows.reduce((s, r) => s + r.scheduled, 0),
  };
}
