import { createFileRoute, Link } from "@tanstack/react-router";
import { NO_AUTO_ACTIVE_CLASS } from "@/components/site/link";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useT } from "@/i18n/context";
import { SITE, VENDORS } from "@/data/catalog";

export const Route = createFileRoute("/toplist")({
  head: () => ({
    meta: [
      { title: `Toplista de vendedores - ${SITE.name}` },
      { name: "description", content: SITE.description },
      { name: "keywords", content: SITE.keywords },
    ],
  }),
  component: ToplistPage,
});

function ToplistPage() {
  const t = useT();

  return (
    <SiteLayout>
      <div className="row" />
      <div className="well well-small">
        <h2>{t("toplist.title")}</h2>
        <hr className="soften" />
        {VENDORS.map((vendor) => (
          <div className="row-fluid" key={vendor.id}>
            <div className="span12">
              <Link {...NO_AUTO_ACTIVE_CLASS} to="/vendor/$id" params={{ id: String(vendor.id) }}>
                {vendor.name}
              </Link>{" "}
              - {vendor.sales} {t("toplist.sales")} -{" "}
              <span className="text-success">
                ({vendor.feedback} {t("toplist.feedback")})
              </span>
            </div>
          </div>
        ))}
      </div>
    </SiteLayout>
  );
}
