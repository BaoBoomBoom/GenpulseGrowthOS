import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { AgentsHubPage } from "./pages/AgentsHubPage";
import { BrandsPage } from "./pages/BrandsPage";
import { CommandPage } from "./pages/CommandPage";
import { ContentHubPage } from "./pages/ContentHubPage";
import { ReviewPage } from "./pages/ReviewPage";
import { SalesPage } from "./pages/SalesPage";
import { StoreProvider } from "./store";
import "./styles/app.css";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<CommandPage />} />
            <Route path="/content/*" element={<ContentHubPage />} />
            <Route path="/agents/*" element={<AgentsHubPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/brands" element={<BrandsPage />} />

            <Route path="/database" element={<Navigate to="/content/database" replace />} />
            <Route path="/calendar" element={<Navigate to="/content/calendar" replace />} />
            <Route path="/scientist" element={<Navigate to="/agents/scientist" replace />} />
            <Route path="/creative" element={<Navigate to="/agents/creative" replace />} />
            <Route path="/growth" element={<Navigate to="/agents/growth" replace />} />
            <Route path="/dashboard" element={<Navigate to="/agents/growth" replace />} />
            <Route path="/knowledge" element={<Navigate to="/agents/scientist" replace />} />
            <Route path="/topics" element={<Navigate to="/agents/creative" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      </BrowserRouter>
    </StoreProvider>
  );
}
