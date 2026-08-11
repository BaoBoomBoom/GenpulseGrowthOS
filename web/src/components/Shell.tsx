import { NavLink, useLocation } from "react-router-dom";
import { useStore } from "../store-context";
import type { BrandId } from "../types";
import { SaveBar } from "./SaveBar";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/content", label: "Content", match: "/content" },
  { to: "/agents", label: "Agents", match: "/agents" },
  { to: "/review", label: "Review" },
  { to: "/sales", label: "Sales" },
  { to: "/brands", label: "Brands" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const {
    brandFilter,
    setBrandFilter,
    weekKey,
    brands,
    databaseEntries,
    calendarSlots,
    contentTasks,
    leads,
  } = useStore();
  const location = useLocation();
  const brandOptions: Array<"All" | BrandId> = ["All", ...brands.map((b) => b.id)];
  const reviewCount = contentTasks.filter((t) => t.status === "in_review").length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">Genpulse</div>
          <div className="brand-sub">AMOS + SAOS</div>
        </div>

        <nav className="nav">
          {links.map((l) => {
            const active = l.end
              ? location.pathname === "/"
              : location.pathname === l.to ||
                (l.match ? location.pathname.startsWith(l.match) : false);
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={active ? "active" : undefined}
              >
                <span>{l.label}</span>
                {l.to === "/content" ? (
                  <span className="phase-tag">
                    {databaseEntries.length}/{calendarSlots.length}
                  </span>
                ) : null}
                {l.to === "/review" && reviewCount > 0 ? (
                  <span className="phase-tag">{reviewCount}</span>
                ) : null}
                {l.to === "/sales" ? (
                  <span className="phase-tag">{leads.length}</span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <strong>Phase 0</strong>
          <div style={{ marginTop: 6 }}>
            Review gate is mandatory. Sales outreach drafts never auto-send.
          </div>
          <div style={{ marginTop: 8 }}>Week {weekKey}</div>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div>
            <div className="topbar-hint">Brand filter</div>
            <div className="brand-filter" aria-label="Brand filter">
              {brandOptions.map((b) => (
                <button
                  key={b}
                  type="button"
                  className={`chip ${brandFilter === b ? "active" : ""}`}
                  onClick={() => setBrandFilter(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <SaveBar />
        </div>
        {children}
      </div>
    </div>
  );
}
