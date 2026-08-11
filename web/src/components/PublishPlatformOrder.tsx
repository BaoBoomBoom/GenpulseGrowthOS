import { Link } from "react-router-dom";
import {
  PUBLISH_PLATFORM_ORDER,
  PUBLISH_PLATFORM_ROLE,
  sortPlatformsByPublishOrder,
  type Platform,
} from "../types";

export function PublishPlatformOrder({
  platforms,
  compact = false,
  showLink = true,
  title = "发布平台顺序",
}: {
  /** Brand-specific subset; defaults to OS-wide order */
  platforms?: Platform[];
  compact?: boolean;
  showLink?: boolean;
  title?: string;
}) {
  const ordered = sortPlatformsByPublishOrder(
    platforms?.length ? platforms : PUBLISH_PLATFORM_ORDER
  );

  return (
    <div className={`publish-order ${compact ? "compact" : ""}`}>
      <div className="publish-order-head">
        <div>
          <div className="publish-order-title">{title}</div>
          {!compact ? (
            <div className="muted-sm">
              同一主题按序号分发：先验证，再沉淀，再专业/长尾/私域
            </div>
          ) : null}
        </div>
        {showLink ? (
          <Link className="btn ghost" to="/brands">
            Brand Matrix
          </Link>
        ) : null}
      </div>
      <ol className="publish-order-list">
        {ordered.map((p, idx) => (
          <li key={p} className="publish-order-item">
            <span className="publish-order-num">{idx + 1}</span>
            <span className="publish-order-name">{p}</span>
            {!compact ? (
              <span className="publish-order-role">{PUBLISH_PLATFORM_ROLE[p]}</span>
            ) : null}
            {idx < ordered.length - 1 ? (
              <span className="publish-order-arrow" aria-hidden>
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
