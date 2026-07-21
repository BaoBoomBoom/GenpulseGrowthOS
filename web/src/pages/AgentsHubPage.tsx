import { Navigate, Route, Routes } from "react-router-dom";
import { SubNav } from "../components/SubNav";
import { CreativePage } from "./CreativePage";
import { GrowthPage } from "./GrowthPage";
import { ScientistPage } from "./ScientistPage";

export function AgentsHubPage() {
  return (
    <div>
      <SubNav
        items={[
          { to: "/agents/scientist", label: "Scientist" },
          { to: "/agents/creative", label: "Creative" },
          { to: "/agents/growth", label: "Growth" },
        ]}
      />
      <Routes>
        <Route index element={<Navigate to="scientist" replace />} />
        <Route path="scientist" element={<ScientistPage />} />
        <Route path="creative" element={<CreativePage />} />
        <Route path="growth" element={<GrowthPage />} />
        <Route path="*" element={<Navigate to="scientist" replace />} />
      </Routes>
    </div>
  );
}
