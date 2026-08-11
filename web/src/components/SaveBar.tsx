import { useStore } from "../store-context";

export function SaveBar() {
  const { saveStatus, lastSavedAt, backendOnline, storageBackend, saveNow } =
    useStore();

  const label =
    saveStatus === "loading"
      ? "Loading…"
      : saveStatus === "saving"
        ? "Saving…"
        : saveStatus === "dirty"
          ? "Unsaved"
          : saveStatus === "error"
            ? "Save failed"
            : saveStatus === "offline"
              ? "Offline · local only"
              : lastSavedAt
                ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}`
                : "Saved";

  const tone =
    saveStatus === "error"
      ? "save-error"
      : saveStatus === "dirty" || saveStatus === "saving"
        ? "save-busy"
        : saveStatus === "offline"
          ? "save-offline"
          : "save-ok";

  const backendLabel = !backendOnline
    ? "Local cache"
    : storageBackend === "supabase"
      ? "Supabase"
      : storageBackend || "Backend";

  return (
    <div className={`save-bar ${tone}`}>
      <span className="save-dot" aria-hidden />
      <span className="save-label">{label}</span>
      <span className="save-backend">{backendLabel}</span>
      <button
        type="button"
        className="btn"
        disabled={saveStatus === "saving" || saveStatus === "loading"}
        onClick={() => void saveNow()}
      >
        Save
      </button>
    </div>
  );
}
