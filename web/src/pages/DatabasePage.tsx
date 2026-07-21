import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store-context";
import type {
  BrandId,
  ContentDatabaseEntry,
  DatabaseStatus,
  Funnel,
  Platform,
  Weekday,
} from "../types";

const emptyForm = {
  id: "",
  topic: "",
  ai_prompt: "",
  hook: "",
  script: "",
  caption: "",
  thumbnail_copy: "",
  hashtags: "",
  brand: "CEO" as BrandId,
  platform: "TikTok" as Platform,
  objective: "Download App",
  funnel: "TOFU" as Funnel,
  target_audience: "",
  cta: "Download App",
  broll: "",
  pillar: "Hormones",
  repurpose_matrix: "",
  status: "idea" as DatabaseStatus,
  kpi: "",
  example: "",
  scheduled_day: "" as Weekday | "",
  scheduled_slot: "",
};

export function DatabasePage() {
  const {
    databaseEntries,
    brands,
    brandFilter,
    addDatabaseEntry,
    updateDatabaseEntry,
    deleteDatabaseEntry,
    scheduleEntry,
  } = useStore();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DatabaseStatus>("all");
  const [showForm, setShowForm] = useState(true);

  const list = useMemo(() => {
    return databaseEntries.filter((e) => {
      if (brandFilter !== "All" && e.brand !== brandFilter) return false;
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        const blob = `${e.id} ${e.topic} ${e.hook} ${e.pillar} ${e.platform}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [databaseEntries, brandFilter, statusFilter, query]);

  function setField<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function loadEntry(e: ContentDatabaseEntry) {
    setEditingId(e.id);
    setShowForm(true);
    setForm({
      id: e.id,
      topic: e.topic,
      ai_prompt: e.ai_prompt,
      hook: e.hook,
      script: e.script,
      caption: e.caption,
      thumbnail_copy: e.thumbnail_copy,
      hashtags: e.hashtags,
      brand: e.brand,
      platform: e.platform,
      objective: e.objective,
      funnel: e.funnel,
      target_audience: e.target_audience,
      cta: e.cta,
      broll: e.broll,
      pillar: e.pillar,
      repurpose_matrix: e.repurpose_matrix,
      status: e.status,
      kpi: e.kpi,
      example: e.example,
      scheduled_day: e.scheduled_day || "",
      scheduled_slot: e.scheduled_slot || "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function save() {
    if (!form.topic.trim() || !form.hook.trim()) return;
    const payload = {
      ...form,
      id: form.id.trim() || undefined,
      scheduled_day: form.scheduled_day || undefined,
      scheduled_slot: form.scheduled_slot || undefined,
    };
    if (editingId) {
      updateDatabaseEntry(editingId, payload);
    } else {
      addDatabaseEntry(payload);
    }
    resetForm();
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Work · Content Database</p>
          <h1 className="page-title">Content Database</h1>
          <p className="page-desc">
            One row = one piece of content. Fill topic, hook, brand, platform, then schedule
            it onto the calendar. Matches your Growth OS v2 sheet.
          </p>
        </div>
        <div className="header-actions">
          <Link className="btn secondary" to="/content/calendar">
            Open Calendar
          </Link>
          <button
            type="button"
            className="btn"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            New entry
          </button>
        </div>
      </header>

      <div className="howto-strip">
        <div><strong>1</strong> Enter topic + hook</div>
        <div><strong>2</strong> Pick brand / platform / CTA</div>
        <div><strong>3</strong> Add script &amp; prompt</div>
        <div><strong>4</strong> Schedule → Calendar</div>
      </div>

      <div className="work-layout">
        {showForm ? (
          <div className="panel sticky-form">
            <div className="panel-head">
              <h2>{editingId ? `Edit ${editingId}` : "New content row"}</h2>
              <button type="button" className="btn ghost" onClick={() => setShowForm(false)}>
                Hide
              </button>
            </div>
            <div className="panel-body form-compact">
              <div className="grid-2">
                <div className="field">
                  <label>ID</label>
                  <input
                    placeholder="FIO001"
                    value={form.id}
                    onChange={(e) => setField("id", e.target.value)}
                    disabled={!!editingId}
                  />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value as DatabaseStatus)}
                  >
                    {["idea", "briefed", "scripted", "ready", "scheduled", "published", "archived"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Topic *</label>
                <input
                  value={form.topic}
                  onChange={(e) => setField("topic", e.target.value)}
                  placeholder="Losing 5 hairs during lunch"
                />
              </div>
              <div className="field">
                <label>Hook *</label>
                <input
                  value={form.hook}
                  onChange={(e) => setField("hook", e.target.value)}
                  placeholder="I lost 5 hairs walking to lunch."
                />
              </div>

              <div className="grid-3">
                <div className="field">
                  <label>Brand</label>
                  <select
                    value={form.brand}
                    onChange={(e) => setField("brand", e.target.value as BrandId)}
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Platform</label>
                  <select
                    value={form.platform}
                    onChange={(e) => setField("platform", e.target.value as Platform)}
                  >
                    {["TikTok", "Instagram", "X", "LinkedIn", "Pinterest", "Newsletter"].map(
                      (p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="field">
                  <label>Funnel</label>
                  <select
                    value={form.funnel}
                    onChange={(e) => setField("funnel", e.target.value as Funnel)}
                  >
                    <option>TOFU</option>
                    <option>MOFU</option>
                    <option>BOFU</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="field">
                  <label>Objective</label>
                  <input
                    value={form.objective}
                    onChange={(e) => setField("objective", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>CTA</label>
                  <input value={form.cta} onChange={(e) => setField("cta", e.target.value)} />
                </div>
              </div>

              <div className="grid-2">
                <div className="field">
                  <label>Audience</label>
                  <input
                    value={form.target_audience}
                    onChange={(e) => setField("target_audience", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Pillar</label>
                  <input
                    value={form.pillar}
                    onChange={(e) => setField("pillar", e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label>AI Prompt</label>
                <textarea
                  value={form.ai_prompt}
                  onChange={(e) => setField("ai_prompt", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="field">
                <label>Script</label>
                <textarea
                  value={form.script}
                  onChange={(e) => setField("script", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Caption</label>
                  <textarea
                    value={form.caption}
                    onChange={(e) => setField("caption", e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="field">
                  <label>Thumbnail copy</label>
                  <input
                    value={form.thumbnail_copy}
                    onChange={(e) => setField("thumbnail_copy", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Hashtags</label>
                  <input
                    value={form.hashtags}
                    onChange={(e) => setField("hashtags", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>KPI</label>
                  <input value={form.kpi} onChange={(e) => setField("kpi", e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>B-roll</label>
                <input value={form.broll} onChange={(e) => setField("broll", e.target.value)} />
              </div>
              <div className="field">
                <label>Repurpose matrix</label>
                <input
                  value={form.repurpose_matrix}
                  onChange={(e) => setField("repurpose_matrix", e.target.value)}
                  placeholder="TT master → IG → X → LI → Pin"
                />
              </div>
              <div className="field">
                <label>Example / note</label>
                <input
                  value={form.example}
                  onChange={(e) => setField("example", e.target.value)}
                />
              </div>

              <div className="grid-2">
                <div className="field">
                  <label>Schedule day</label>
                  <select
                    value={form.scheduled_day}
                    onChange={(e) =>
                      setField("scheduled_day", e.target.value as Weekday | "")
                    }
                  >
                    <option value="">Not scheduled</option>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Time</label>
                  <input
                    type="time"
                    value={form.scheduled_slot}
                    onChange={(e) => setField("scheduled_slot", e.target.value)}
                  />
                </div>
              </div>

              <div className="row-actions">
                <button
                  type="button"
                  className="btn"
                  disabled={!form.topic.trim() || !form.hook.trim()}
                  onClick={save}
                >
                  {editingId ? "Save changes" : "Add to database"}
                </button>
                {editingId ? (
                  <button type="button" className="btn secondary" onClick={resetForm}>
                    Cancel edit
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <button type="button" className="btn" onClick={() => setShowForm(true)}>
            Show input form
          </button>
        )}

        <div className="panel">
          <div className="panel-head">
            <h2>
              Library <span className="count-pill">{list.length}</span>
            </h2>
            <div className="filters">
              <input
                placeholder="Search id / topic / hook…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | DatabaseStatus)
                }
              >
                <option value="all">All status</option>
                {["idea", "briefed", "scripted", "ready", "scheduled", "published"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Topic / Hook</th>
                  <th>Brand</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th>Schedule</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <code className="mono">{e.id}</code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{e.topic}</div>
                      <div className="muted-sm">{e.hook}</div>
                    </td>
                    <td>{e.brand}</td>
                    <td>{e.platform}</td>
                    <td>
                      <span className={`badge status-${e.status}`}>{e.status}</span>
                    </td>
                    <td className="muted-sm">
                      {e.scheduled_day
                        ? `${e.scheduled_day} ${e.scheduled_slot || ""}`
                        : "—"}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => loadEntry(e)}
                        >
                          Edit
                        </button>
                        {!e.scheduled_day ? (
                          <button
                            type="button"
                            className="btn ghost"
                            onClick={() => scheduleEntry(e.id, "Wed", "12:00")}
                          >
                            + Wed
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="btn ghost"
                          onClick={() => {
                            if (confirm(`Delete ${e.id}?`)) deleteDatabaseEntry(e.id);
                          }}
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!list.length ? (
              <div className="empty">No rows yet — add your first content entry.</div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
