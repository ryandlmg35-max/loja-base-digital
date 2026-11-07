import { Link } from "@tanstack/react-router";
import { NO_AUTO_ACTIVE_CLASS } from "./link";

export function SitePagination({ page, totalPages }: { page: number; totalPages: number }) {
  const previous = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <div className="actions" style={{ textAlign: "center" }}>
      <Link {...NO_AUTO_ACTIVE_CLASS} to="/" search={{ page: previous }}>
        <span className="icon icon-arrow-left" />
      </Link>
      {page} / {totalPages}
      <Link {...NO_AUTO_ACTIVE_CLASS} to="/" search={{ page: next }}>
        <span className="icon icon-arrow-right" />
      </Link>
    </div>
  );
}
