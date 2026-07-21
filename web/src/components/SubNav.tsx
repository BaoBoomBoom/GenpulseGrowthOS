import { NavLink } from "react-router-dom";

export function SubNav({
  items,
}: {
  items: { to: string; label: string; end?: boolean }[];
}) {
  return (
    <div className="subnav" role="tablist">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          role="tab"
          className={({ isActive }) => `subnav-tab ${isActive ? "active" : ""}`}
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}
