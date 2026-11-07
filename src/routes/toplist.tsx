import { createFileRoute, Link } from "@tanstack/react-router";
import { NO_AUTO_ACTIVE_CLASS } from "@/components/site/link";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SITE, VENDORS } from "@/data/catalog";

export const Route = createFileRoute("/toplist")({
  head: () => ({
    meta: [
      { title: `TOP Vendor list - ${SITE.name}: 🧪 ⚗️ 💊 American Pharma` },
      { name: "description", content: SITE.description },
      { name: "keywords", content: SITE.keywords },
    ],
  }),
  component: ToplistPage,
});

function ToplistPage() {
  return (
    <SiteLayout>
      <div className="row" />
      <div className="well well-small">
        <h2>Toplist</h2>
        <hr className="soften" />
        {VENDORS.map((vendor) => (
          <div className="row-fluid" key={vendor.id}>
            <div className="span12">
              <Link {...NO_AUTO_ACTIVE_CLASS} to="/vendor/$id" params={{ id: String(vendor.id) }}>
                {vendor.name}
              </Link>{" "}
              - {vendor.sales} sales -{" "}
              <span className="text-success">({vendor.feedback} feedback)</span>
            </div>
          </div>
        ))}
      </div>
    </SiteLayout>
  );
}
