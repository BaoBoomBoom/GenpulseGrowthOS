import { useMemo, useState } from "react";
import { useStore } from "../store-context";
import type { Deal, DealStage, DealStatus, IcpType } from "../types";

const ICP_LABEL: Record<IcpType, string> = {
  pharma_rd: "Pharma R&D",
  cosmetics_brand: "Cosmetics brand",
  indie_brand: "Indie brand",
  salon_clinic: "Salon / clinic",
};

const STAGES: DealStage[] = [
  "Lead",
  "Qualified",
  "Demo",
  "Discovery",
  "Proposal",
  "Negotiations",
];

const STATUSES: DealStatus[] = ["Open", "Lost", "Won"];

const CONTACT_ONS = ["", "Wechat", "Email", "Whatsapp", "LinkedIn", "Phone"];

const CHANNELS = [
  "",
  "Website",
  "Referral",
  "Ins",
  "Amazon",
  "Whatsapp",
  "Offline Campaign",
  "API Usage",
];

const LOST_REASONS = [
  "",
  "unkown - to be reviewed",
  "business model doesnt align",
  "product not meeting requirements",
  "iteration speed slow",
  "Goal not aligned",
];

function formatMoney(amount: number, currency = "USD") {
  if (!amount) return `0 ${currency}`;
  return `${amount.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })} ${currency}`;
}

function statusClass(status: DealStatus) {
  if (status === "Won") return "deal-won";
  if (status === "Lost") return "deal-lost";
  return "deal-open";
}

export function SalesPage() {
  const {
    companies,
    leads,
    deals,
    activities,
    createOutreachDraft,
    updateDeal,
    createDeal,
    deleteDeal,
    saveNow,
  } = useStore();
  const [tab, setTab] = useState<"pipeline" | "table" | "leads" | "outreach">(
    "pipeline"
  );
  const [editEnabled, setEditEnabled] = useState(true);
  const [statusFilter, setStatusFilter] = useState<DealStatus | "All">("Open");
  const [stageFilter, setStageFilter] = useState<DealStage | "All">("All");
  const [channelFilter, setChannelFilter] = useState<string>("All");
  const [ownerFilter, setOwnerFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState(leads[0]?.lead_id ?? "");

  const channels = useMemo(() => {
    const set = new Set<string>();
    deals.forEach((d) => {
      if (d.channel) set.add(d.channel);
    });
    return ["All", ...Array.from(set).sort()];
  }, [deals]);

  const owners = useMemo(() => {
    const set = new Set(deals.map((d) => d.owner).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [deals]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deals.filter((d) => {
      if (statusFilter !== "All" && d.status !== statusFilter) return false;
      if (stageFilter !== "All" && d.stage !== stageFilter) return false;
      if (channelFilter !== "All" && d.channel !== channelFilter) return false;
      if (ownerFilter !== "All" && d.owner !== ownerFilter) return false;
      if (!q) return true;
      const hay = [
        d.title,
        d.organization,
        d.contact_person,
        d.channel,
        d.lost_reason,
        d.product_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [deals, statusFilter, stageFilter, channelFilter, ownerFilter, query]);

  const selected =
    deals.find((d) => d.deal_id === selectedId) ??
    filtered[0] ??
    deals[0] ??
    null;

  const stats = useMemo(() => {
    const open = deals.filter((d) => d.status === "Open");
    const won = deals.filter((d) => d.status === "Won");
    const lost = deals.filter((d) => d.status === "Lost");
    const openValue = open.reduce((s, d) => s + (d.amount || 0), 0);
    const wonValue = won.reduce((s, d) => s + (d.amount || 0), 0);
    return {
      open: open.length,
      won: won.length,
      lost: lost.length,
      openValue,
      wonValue,
      stuck: deals.filter((d) => d.label === "Stuck" && d.status === "Open")
        .length,
    };
  }, [deals]);

  const byStage = useMemo(() => {
    const map: Record<DealStage, Deal[]> = {
      Lead: [],
      Qualified: [],
      Demo: [],
      Discovery: [],
      Proposal: [],
      Negotiations: [],
    };
    filtered.forEach((d) => {
      map[d.stage].push(d);
    });
    return map;
  }, [filtered]);

  const lead = leads.find((l) => l.lead_id === selectedLead) ?? leads[0];
  const company = companies.find((c) => c.company_id === lead?.company_id);
  const leadActivities = useMemo(
    () => activities.filter((a) => a.lead_id === lead?.lead_id),
    [activities, lead]
  );

  function handleCreateDeal() {
    if (!editEnabled) return;
    const deal = createDeal({
      title: "New deal",
      organization: "New organization",
      owner: "Celi",
      status: "Open",
      stage: "Lead",
    });
    setSelectedId(deal.deal_id);
    setStatusFilter("All");
    setTab("pipeline");
  }

  function handleDeleteDeal(dealId: string) {
    if (!editEnabled) return;
    const target = deals.find((d) => d.deal_id === dealId);
    if (!target) return;
    if (!window.confirm(`Delete deal “${target.title}”? This cannot be undone.`)) {
      return;
    }
    deleteDeal(dealId);
    setSelectedId(null);
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">SAOS · Sales Tracking</p>
          <h1 className="page-title">Sales Management</h1>
          <p className="page-desc">
            Deal-centric CRM with full edit access — Status × Stage, contacts,
            channel, product, and lost reasons. Toggle edit mode to lock the
            board when reviewing.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className={`btn secondary ${editEnabled ? "edit-on" : ""}`}
            onClick={() => setEditEnabled((v) => !v)}
            aria-pressed={editEnabled}
          >
            {editEnabled ? "Editing on" : "View only"}
          </button>
          <button
            type="button"
            className="btn"
            disabled={!editEnabled}
            onClick={handleCreateDeal}
          >
            New deal
          </button>
        </div>
      </header>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="stat">
          <div className="label">Open pipeline</div>
          <div className="value">{stats.open}</div>
        </div>
        <div className="stat accent">
          <div className="label">Won / value</div>
          <div className="value" style={{ fontSize: "1.25rem" }}>
            {stats.won} · {formatMoney(stats.wonValue)}
          </div>
        </div>
        <div className="stat signal">
          <div className="label">Open $ (named)</div>
          <div className="value" style={{ fontSize: "1.25rem" }}>
            {formatMoney(stats.openValue)}
          </div>
        </div>
        <div className="stat">
          <div className="label">Lost · Stuck</div>
          <div className="value" style={{ fontSize: "1.25rem" }}>
            {stats.lost} · {stats.stuck}
          </div>
        </div>
      </div>

      {!editEnabled ? (
        <div className="callout warn" style={{ marginBottom: 14 }}>
          View-only mode — fields are locked. Turn on <strong>Editing on</strong>{" "}
          to create, update, or delete deals.
        </div>
      ) : null}

      <div className="tabs" style={{ marginBottom: 14 }}>
        {(
          [
            ["pipeline", "Pipeline"],
            ["table", "Deal table"],
            ["leads", "Leads (ICP)"],
            ["outreach", "Outreach drafts"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {(tab === "pipeline" || tab === "table") && (
        <div className="filters sales-filters">
          <label>
            Status
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as DealStatus | "All")
              }
            >
              <option value="All">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Stage
            <select
              value={stageFilter}
              onChange={(e) =>
                setStageFilter(e.target.value as DealStage | "All")
              }
            >
              <option value="All">All</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Channel
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
            >
              {channels.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            Owner
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
            >
              {owners.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="sales-search">
            Search
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, org, contact…"
            />
          </label>
          <div className="muted-sm" style={{ alignSelf: "end", paddingBottom: 8 }}>
            {filtered.length} deals
          </div>
        </div>
      )}

      {tab === "pipeline" ? (
        <div className="split sales-split">
          <div className="pipeline-board">
            {STAGES.map((stage) => (
              <div key={stage} className="pipeline-col">
                <div className="pipeline-col-head">
                  <span>{stage}</span>
                  <span className="badge">{byStage[stage].length}</span>
                </div>
                <div className="pipeline-col-body">
                  {byStage[stage].map((d) => (
                    <button
                      key={d.deal_id}
                      type="button"
                      className={`deal-card ${
                        selected?.deal_id === d.deal_id ? "active" : ""
                      }`}
                      onClick={() => setSelectedId(d.deal_id)}
                    >
                      <div className="deal-card-title">{d.title}</div>
                      <div className="muted-sm">{d.organization}</div>
                      <div className="chip-row" style={{ marginTop: 6 }}>
                        <span className={`badge ${statusClass(d.status)}`}>
                          {d.status}
                        </span>
                        {d.channel ? (
                          <span className="badge">{d.channel}</span>
                        ) : null}
                        {d.label ? (
                          <span className="badge deal-stuck">{d.label}</span>
                        ) : null}
                      </div>
                      {d.amount > 0 ? (
                        <div className="deal-card-value">
                          {formatMoney(d.amount, d.currency)}
                        </div>
                      ) : null}
                    </button>
                  ))}
                  {!byStage[stage].length ? (
                    <div className="empty muted-sm">No deals</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <DealDetail
            deal={selected}
            editEnabled={editEnabled}
            onUpdate={updateDeal}
            onDelete={handleDeleteDeal}
            onSave={() => void saveNow()}
          />
        </div>
      ) : null}

      {tab === "table" ? (
        <div className="split sales-split">
          <div className="panel" style={{ overflow: "auto" }}>
            <div className="panel-body" style={{ padding: 0 }}>
              <table className="table sales-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Value</th>
                    <th>Organization</th>
                    <th>Contact</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Stage</th>
                    <th>Channel</th>
                    <th>Lost reason</th>
                    <th>Closed</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr
                      key={d.deal_id}
                      className={
                        selected?.deal_id === d.deal_id ? "row-active" : ""
                      }
                      onClick={() => setSelectedId(d.deal_id)}
                    >
                      <td>
                        {d.title}
                        {d.label ? (
                          <span
                            className="badge deal-stuck"
                            style={{ marginLeft: 6 }}
                          >
                            {d.label}
                          </span>
                        ) : null}
                      </td>
                      <td className="mono">
                        {formatMoney(d.amount, d.currency)}
                      </td>
                      <td>{d.organization}</td>
                      <td>
                        {d.contact_person || "—"}
                        {d.contact_on ? (
                          <span className="muted-sm"> · {d.contact_on}</span>
                        ) : null}
                      </td>
                      <td>{d.owner}</td>
                      <td>
                        <span className={`badge ${statusClass(d.status)}`}>
                          {d.status}
                        </span>
                      </td>
                      <td>
                        <span className="badge">{d.stage}</span>
                      </td>
                      <td>{d.channel || "—"}</td>
                      <td className="muted-sm">{d.lost_reason || "—"}</td>
                      <td className="mono">{d.closed_on || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <DealDetail
            deal={selected}
            editEnabled={editEnabled}
            onUpdate={updateDeal}
            onDelete={handleDeleteDeal}
            onSave={() => void saveNow()}
          />
        </div>
      ) : null}

      {tab === "leads" ? (
        <div className="split">
          <div>
            {leads.map((l) => {
              const co = companies.find((c) => c.company_id === l.company_id);
              return (
                <button
                  key={l.lead_id}
                  type="button"
                  className={`list-item ${
                    lead?.lead_id === l.lead_id ? "active" : ""
                  }`}
                  onClick={() => setSelectedLead(l.lead_id)}
                >
                  <div style={{ fontWeight: 600 }}>{l.full_name}</div>
                  <div className="muted-sm">
                    {l.title} · {co?.name}
                  </div>
                  <div className="chip-row" style={{ marginTop: 6 }}>
                    <span className="badge">{ICP_LABEL[l.icp_type]}</span>
                    <span className="badge">score {l.score}</span>
                    <span className="badge">{l.status}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="panel">
            {lead && company ? (
              <>
                <div className="panel-head">
                  <h2>{lead.full_name}</h2>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => createOutreachDraft(lead.lead_id)}
                  >
                    Draft outreach
                  </button>
                </div>
                <div className="panel-body">
                  <p>
                    <strong>{company.name}</strong> · {ICP_LABEL[lead.icp_type]}{" "}
                    · {company.size_band}
                  </p>
                  <p className="muted-sm">Source: {lead.source_channel}</p>
                  <div className="callout" style={{ marginTop: 12 }}>
                    {lead.research_summary}
                  </div>
                  <h3 className="h3-tight">Activity</h3>
                  {leadActivities.map((a) => (
                    <div key={a.activity_id} className="insight-card">
                      <div className="chip-row">
                        <span className="badge">{a.type}</span>
                        <span className="badge">{a.created_by}</span>
                      </div>
                      <pre className="draft-box" style={{ marginTop: 8 }}>
                        {a.content}
                      </pre>
                    </div>
                  ))}
                  {!leadActivities.length ? (
                    <div className="empty">No activity yet</div>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "outreach" ? (
        <div className="panel">
          <div className="panel-body">
            <div className="callout warn" style={{ marginBottom: 12 }}>
              Outreach drafts are agent-generated. Sending externally is blocked
              until a human approves (Phase 1: HubSpot/Klaviyo send path).
            </div>
            {activities
              .filter((a) => a.type === "outreach_draft")
              .map((a) => (
                <div key={a.activity_id} className="insight-card">
                  <div className="chip-row">
                    <span className="badge">draft</span>
                    <span className="badge">{a.created_by}</span>
                    <span className="muted-sm">{a.created_at}</span>
                  </div>
                  <pre className="draft-box" style={{ marginTop: 8 }}>
                    {a.content}
                  </pre>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

function DealDetail({
  deal,
  editEnabled,
  onUpdate,
  onDelete,
  onSave,
}: {
  deal: Deal | null;
  editEnabled: boolean;
  onUpdate: (id: string, patch: Partial<Deal>) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
}) {
  if (!deal) {
    return (
      <div className="panel">
        <div className="panel-body empty">Select a deal</div>
      </div>
    );
  }

  const locked = !editEnabled;

  function patch(p: Partial<Deal>) {
    if (locked) return;
    onUpdate(deal!.deal_id, p);
  }

  return (
    <div className={`panel deal-detail ${locked ? "deal-locked" : ""}`}>
      <div className="panel-head">
        <div>
          <h2>{deal.title || "Untitled"}</h2>
          <div className="chip-row" style={{ marginTop: 6 }}>
            <span className={`badge ${statusClass(deal.status)}`}>
              {deal.status}
            </span>
            <span className="badge">{deal.stage}</span>
            {locked ? <span className="badge">Locked</span> : null}
          </div>
        </div>
        <div className="chip-row">
          <button
            type="button"
            className="btn"
            disabled={locked}
            onClick={onSave}
          >
            Save
          </button>
          <button
            type="button"
            className="btn secondary danger"
            disabled={locked}
            onClick={() => onDelete(deal.deal_id)}
          >
            Delete
          </button>
        </div>
      </div>
      <div className="panel-body">
        <div className="deal-detail-grid">
          <label className="span-2">
            Title
            <input
              disabled={locked}
              value={deal.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </label>
          <label className="span-2">
            Organization
            <input
              disabled={locked}
              value={deal.organization}
              onChange={(e) => patch({ organization: e.target.value })}
            />
          </label>
          <label>
            Contact person
            <input
              disabled={locked}
              value={deal.contact_person || ""}
              onChange={(e) =>
                patch({ contact_person: e.target.value || null })
              }
            />
          </label>
          <label>
            Contact on
            <select
              disabled={locked}
              value={deal.contact_on || ""}
              onChange={(e) => patch({ contact_on: e.target.value || null })}
            >
              {CONTACT_ONS.map((c) => (
                <option key={c || "none"} value={c}>
                  {c || "—"}
                </option>
              ))}
            </select>
          </label>
          <label>
            Owner
            <input
              disabled={locked}
              value={deal.owner}
              onChange={(e) => patch({ owner: e.target.value })}
            />
          </label>
          <label>
            Label
            <select
              disabled={locked}
              value={deal.label || ""}
              onChange={(e) => patch({ label: e.target.value || null })}
            >
              <option value="">—</option>
              <option value="Stuck">Stuck</option>
            </select>
          </label>
          <label>
            Status
            <select
              disabled={locked}
              value={deal.status}
              onChange={(e) => {
                const status = e.target.value as DealStatus;
                patch({
                  status,
                  closed_on:
                    status === "Open"
                      ? null
                      : deal.closed_on ||
                        new Date().toISOString().slice(0, 10),
                });
              }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Stage
            <select
              disabled={locked}
              value={deal.stage}
              onChange={(e) =>
                patch({ stage: e.target.value as DealStage })
              }
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Channel
            <select
              disabled={locked}
              value={deal.channel || ""}
              onChange={(e) => patch({ channel: e.target.value || null })}
            >
              {CHANNELS.map((c) => (
                <option key={c || "none"} value={c}>
                  {c || "—"}
                </option>
              ))}
              {deal.channel && !CHANNELS.includes(deal.channel) ? (
                <option value={deal.channel}>{deal.channel}</option>
              ) : null}
            </select>
          </label>
          <label>
            Value
            <input
              disabled={locked}
              type="number"
              value={deal.amount || ""}
              onChange={(e) =>
                patch({ amount: Number(e.target.value) || 0 })
              }
            />
          </label>
          <label>
            Currency
            <select
              disabled={locked}
              value={deal.currency || "USD"}
              onChange={(e) => patch({ currency: e.target.value })}
            >
              <option value="USD">USD</option>
              <option value="CNY">CNY</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
          <label>
            Closed on
            <input
              disabled={locked}
              type="date"
              value={deal.closed_on || ""}
              onChange={(e) => patch({ closed_on: e.target.value || null })}
            />
          </label>
          <label>
            Product name
            <input
              disabled={locked}
              value={deal.product_name || ""}
              onChange={(e) =>
                patch({ product_name: e.target.value || null })
              }
            />
          </label>
          <label>
            Product qty
            <input
              disabled={locked}
              type="number"
              value={deal.product_quantity ?? ""}
              onChange={(e) =>
                patch({
                  product_quantity: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
            />
          </label>
          <label>
            Product amount
            <input
              disabled={locked}
              type="number"
              value={deal.product_amount ?? ""}
              onChange={(e) =>
                patch({
                  product_amount: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
            />
          </label>
          <label className="span-2">
            Lost reason
            <select
              disabled={locked || deal.status !== "Lost"}
              value={deal.lost_reason || ""}
              onChange={(e) =>
                patch({ lost_reason: e.target.value || null })
              }
            >
              {LOST_REASONS.map((r) => (
                <option key={r || "none"} value={r}>
                  {r || "—"}
                </option>
              ))}
              {deal.lost_reason && !LOST_REASONS.includes(deal.lost_reason) ? (
                <option value={deal.lost_reason}>{deal.lost_reason}</option>
              ) : null}
            </select>
          </label>
          {deal.status === "Lost" ? (
            <label className="span-2">
              Lost reason (custom)
              <input
                disabled={locked}
                value={deal.lost_reason || ""}
                onChange={(e) =>
                  patch({ lost_reason: e.target.value || null })
                }
                placeholder="Free-text lost reason"
              />
            </label>
          ) : null}
        </div>
      </div>
    </div>
  );
}
