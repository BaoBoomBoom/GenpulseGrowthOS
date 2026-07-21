import { Navigate, Route, Routes } from "react-router-dom";
import { SubNav } from "../components/SubNav";
import { CalendarPage } from "./CalendarPage";
import { DatabasePage } from "./DatabasePage";

export function ContentHubPage() {
  return (
    <div>
      <SubNav
        items={[
          { to: "/content/database", label: "Database" },
          { to: "/content/calendar", label: "Calendar" },
        ]}
      />
      <Routes>
        <Route index element={<Navigate to="database" replace />} />
        <Route path="database" element={<DatabasePage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="*" element={<Navigate to="database" replace />} />
      </Routes>
    </div>
  );
}
