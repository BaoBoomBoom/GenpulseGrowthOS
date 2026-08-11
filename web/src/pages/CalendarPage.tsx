import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { WeeklyFrequencyStats } from "../components/WeeklyFrequencyStats";
import { PublishPlatformOrder } from "../components/PublishPlatformOrder";
import { useStore } from "../store-context";
import type { Weekday } from "../types";
import { publishOrderRank } from "../types";

const DAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = ["09:00", "11:00", "12:00", "15:00", "18:00", "20:00"];

export function CalendarPage() {
  const {
    calendarSlots,
    databaseEntries,
    brandFilter,
    weekKey,
    scheduleEntry,
    unscheduleEntry,
    moveCalendarSlot,
  } = useStore();
  const [pickEntry, setPickEntry] = useState("");
  const [pickDay, setPickDay] = useState<Weekday>("Mon");
  const [pickTime, setPickTime] = useState("11:00");

  const slots = useMemo(
    () =>
      calendarSlots.filter(
        (s) => brandFilter === "All" || s.brand === brandFilter
      ),
    [calendarSlots, brandFilter]
  );

  const unscheduled = useMemo(
    () =>
      databaseEntries.filter((e) => {
        if (brandFilter !== "All" && e.brand !== brandFilter) return false;
        return !e.scheduled_day && e.status !== "archived";
      }),
    [databaseEntries, brandFilter]
  );

  const byDay = useMemo(() => {
    const map: Record<Weekday, typeof slots> = {
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
      Sat: [],
      Sun: [],
    };
    for (const s of slots) map[s.day].push(s);
    for (const d of DAYS) {
      map[d].sort(
        (a, b) =>
          publishOrderRank(a.platform) - publishOrderRank(b.platform) ||
          a.time.localeCompare(b.time)
      );
    }
    return map;
  }, [slots]);

  const counts = {
    scheduled: slots.length,
    ready: databaseEntries.filter((e) => e.status === "ready").length,
    published: databaseEntries.filter((e) => e.status === "published").length,
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Work · Master Content Calendar</p>
          <h1 className="page-title">Content Calendar</h1>
          <p className="page-desc">
            Week {weekKey} — who posts what, on which platform, and when. Prefer
            scheduling earlier platforms first (TikTok → Instagram → …).
          </p>
        </div>
        <div className="header-actions">
          <Link className="btn secondary" to="/content/database">
            Content Database
          </Link>
        </div>
      </header>

      <div style={{ marginBottom: 14 }}>
        <PublishPlatformOrder compact />
      </div>

      <WeeklyFrequencyStats />

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="stat accent">
          <div className="label">Ready (unscheduled in database)</div>
          <div className="value">{unscheduled.length}</div>
        </div>
        <div className="stat signal">
          <div className="label">Published rows</div>
          <div className="value">{counts.published}</div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head">
          <h2>Schedule from database</h2>
        </div>
        <div className="panel-body schedule-bar">
          <select
            value={pickEntry}
            onChange={(e) => setPickEntry(e.target.value)}
          >
            <option value="">Select unscheduled entry…</option>
            {unscheduled.map((e) => (
              <option key={e.id} value={e.id}>
                {e.id} · {e.brand} · {e.platform} · {e.topic}
              </option>
            ))}
          </select>
          <select
            value={pickDay}
            onChange={(e) => setPickDay(e.target.value as Weekday)}
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select value={pickTime} onChange={(e) => setPickTime(e.target.value)}>
            {TIMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn"
            disabled={!pickEntry}
            onClick={() => {
              scheduleEntry(pickEntry, pickDay, pickTime);
              setPickEntry("");
            }}
          >
            Add to calendar
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {DAYS.map((day) => (
          <div key={day} className="calendar-day">
            <div className="calendar-day-head">
              <span>{day}</span>
              <span className="count-pill">{byDay[day].length}</span>
            </div>
            <div className="calendar-day-body">
              {byDay[day].length === 0 ? (
                <div className="calendar-empty">Open</div>
              ) : (
                byDay[day].map((s) => (
                  <div
                    key={s.slot_id}
                    className={`cal-card brand-${s.brand.toLowerCase()}`}
                  >
                    <div className="cal-time">{s.time}</div>
                    <div className="cal-title">{s.title}</div>
                    <div className="cal-meta">
                      <span className="badge publish-rank">
                        #{publishOrderRank(s.platform)}
                      </span>
                      <span className="badge">{s.brand}</span>
                      <span className="badge">{s.platform}</span>
                    </div>
                    <div className="muted-sm">CTA: {s.cta}</div>
                    <div className="cal-actions">
                      <select
                        aria-label="Move day"
                        value={s.day}
                        onChange={(e) =>
                          moveCalendarSlot(
                            s.slot_id,
                            e.target.value as Weekday,
                            s.time
                          )
                        }
                      >
                        {DAYS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <select
                        aria-label="Move time"
                        value={s.time}
                        onChange={(e) =>
                          moveCalendarSlot(s.slot_id, s.day, e.target.value)
                        }
                      >
                        {[s.time, ...TIMES.filter((t) => t !== s.time)].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => unscheduleEntry(s.entry_id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="callout" style={{ marginTop: 16 }}>
        Tip: keep CEO TikTok and Genpulse upload-CTA slots early in the week; use Growth
        Manager allocation to decide density by brand.
      </div>
    </>
  );
}
