import { useMemo, useState } from "react";
import { useStore } from "../store-context";

export function ReviewPage() {
  const {
    contentTasks,
    submitTaskForReview,
    approveTask,
    rejectTask,
    publishApprovedTask,
    brandFilter,
  } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [publishUrl, setPublishUrl] = useState("");
  const [queue, setQueue] = useState<"in_review" | "approved" | "all">("in_review");

  const list = useMemo(() => {
    return contentTasks.filter((t) => {
      if (brandFilter !== "All" && t.brand_id !== brandFilter) return false;
      if (queue === "all") return true;
      return t.status === queue;
    });
  }, [contentTasks, brandFilter, queue]);

  const task = contentTasks.find((t) => t.task_id === (selected || list[0]?.task_id));

  const pending = contentTasks.filter((t) => t.status === "in_review").length;
  const healthPending = contentTasks.filter(
    (t) => t.status === "in_review" && t.health_claim_flag
  ).length;

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Hard gate · AMOS Phase 0</p>
          <h1 className="page-title">Human Review Gate</h1>
          <p className="page-desc">
            Nothing publishes without Approve. Health claims need extra scrutiny —
            Agent cannot bypass this state machine.
          </p>
        </div>
      </header>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div className="stat signal">
          <div className="label">In review</div>
          <div className="value">{pending}</div>
        </div>
        <div className="stat">
          <div className="label">Health-claim flagged</div>
          <div className="value">{healthPending}</div>
        </div>
        <div className="stat accent">
          <div className="label">Approved awaiting publish</div>
          <div className="value">
            {contentTasks.filter((t) => t.status === "approved").length}
          </div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 12 }}>
        {(
          [
            ["in_review", "Queue"],
            ["approved", "Approved"],
            ["all", "All"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab ${queue === id ? "active" : ""}`}
            onClick={() => setQueue(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="split">
        <div>
          {list.map((t) => (
            <button
              key={t.task_id}
              type="button"
              className={`list-item ${task?.task_id === t.task_id ? "active" : ""}`}
              onClick={() => setSelected(t.task_id)}
            >
              <div style={{ fontWeight: 600 }}>{t.topic}</div>
              <div className="chip-row" style={{ marginTop: 6 }}>
                <span className="badge">{t.brand_id}</span>
                <span className="badge">{t.channel}</span>
                <span className={`badge status-${t.status}`}>{t.status}</span>
                {t.health_claim_flag ? (
                  <span className="badge signal-badge">health claim</span>
                ) : null}
              </div>
            </button>
          ))}
          {!list.length ? <div className="empty">Queue clear</div> : null}
        </div>

        <div className="panel">
          {task ? (
            <>
              <div className="panel-head">
                <h2>{task.topic}</h2>
                <span className={`badge status-${task.status}`}>{task.status}</span>
              </div>
              <div className="panel-body">
                <div className="chip-row" style={{ marginBottom: 12 }}>
                  <span className="badge">{task.brand_id}</span>
                  <span className="badge">{task.channel}</span>
                  {typeof task.brand_tone_score === "number" ? (
                    <span className="badge">tone {task.brand_tone_score}</span>
                  ) : null}
                </div>

                {task.health_claim_flag ? (
                  <div className="callout warn" style={{ marginBottom: 12 }}>
                    <strong>Health claim flag</strong>
                    <div style={{ marginTop: 6 }}>
                      {task.health_claim_detail || "Flagged for compliance review."}
                    </div>
                  </div>
                ) : (
                  <div className="callout" style={{ marginBottom: 12 }}>
                    No health_claim_flag on this draft.
                  </div>
                )}

                <h3 className="h3-tight">Draft</h3>
                <pre className="draft-box">
                  {JSON.stringify(task.draft_content, null, 2)}
                </pre>

                <div className="field" style={{ marginTop: 12 }}>
                  <label>Review notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Compliance / tone notes…"
                  />
                </div>

                <div className="row-actions">
                  {task.status === "draft" ? (
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => submitTaskForReview(task.task_id)}
                    >
                      Submit to review
                    </button>
                  ) : null}
                  {task.status === "in_review" ? (
                    <>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          approveTask(task.task_id, notes);
                          setNotes("");
                        }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => {
                          if (!notes.trim()) {
                            alert("Rejection requires notes");
                            return;
                          }
                          rejectTask(task.task_id, notes.trim());
                          setNotes("");
                        }}
                      >
                        Reject
                      </button>
                    </>
                  ) : null}
                </div>

                {task.status === "approved" ? (
                  <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                    <div className="field">
                      <label>Publish URL (only after approve)</label>
                      <input
                        value={publishUrl}
                        onChange={(e) => setPublishUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <button
                      type="button"
                      className="btn"
                      disabled={!publishUrl.trim()}
                      onClick={() => {
                        publishApprovedTask(task.task_id, publishUrl.trim());
                        setPublishUrl("");
                      }}
                    >
                      Mark published
                    </button>
                    <p className="muted-sm" style={{ marginTop: 8 }}>
                      Publish is blocked in store logic unless status is approved/scheduled
                      and reviewed_at is set.
                    </p>
                  </div>
                ) : null}

                {task.status === "published" ? (
                  <p style={{ marginTop: 12, color: "var(--accent-deep)" }}>
                    Published · {task.publish_url}
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <div className="empty">Select a task</div>
          )}
        </div>
      </div>
    </>
  );
}
