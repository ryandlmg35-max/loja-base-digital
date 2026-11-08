import { createFileRoute, Link } from "@tanstack/react-router";
import { NO_AUTO_ACTIVE_CLASS } from "@/components/site/link";
import { handleImageError } from "@/components/site/image";
import { SiteLayout } from "@/components/site/SiteLayout";
import { vendorRank, vendorSelling } from "@/i18n/catalog-text";
import { useLang, useT } from "@/i18n/context";
import { SITE, getVendor } from "@/data/catalog";

export const Route = createFileRoute("/vendor/$id")({
  head: ({ params }) => {
    const vendor = getVendor(Number(params["id"]));
    return {
      meta: [
        { title: `Vendedor ${vendor?.name ?? ""} - ${SITE.name}` },
        { name: "description", content: SITE.description },
      ],
    };
  },
  component: VendorPage,
});

function VendorPage() {
  const t = useT();
  const { lang } = useLang();
  const { id } = Route.useParams();
  const vendor = getVendor(Number(id));

  if (!vendor) {
    return (
      <SiteLayout>
        <div className="row" />
        <div className="well well-small alert alert-warning cntr">
          <h2>{t("vendor.error")}</h2>
          <p>{t("vendor.notFound")}</p>
          <Link {...NO_AUTO_ACTIVE_CLASS} className="defaultBtn" to="/">
            {t("vendor.goHome")}
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="row" />
      <div className="well well-small">
        <h3>{t("vendor.details")}</h3>
        <hr className="soften" />
        <div className="row-fluid">
          <div className="span12">
            <h2>{vendor.name}</h2>
            <img src={vendor.image} alt={vendor.name} onError={handleImageError} />
          </div>
          <table>
            <tbody>
              <tr>
                <td style={{ paddingRight: 20 }}>
                  <b>{t("vendor.rank")}</b>
                </td>
                <td>{vendorRank(vendor, lang)}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: 20 }}>
                  <b>{t("vendor.activeSince")}</b>
                </td>
                <td>{vendor.activeSince}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: 20 }}>
                  <b>{t("vendor.selling")}</b>
                </td>
                <td>{vendorSelling(vendor, lang)}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: 20 }}>
                  <b>{t("vendor.feedbacks")}</b>
                </td>
                <td>
                  {vendor.totalFeedbacks} -{" "}
                  <span className="text-success">
                    {vendor.positive} {t("vendor.positive")}
                  </span>{" "}
                  ({vendor.feedback})
                </td>
              </tr>
              <tr>
                <td style={{ paddingRight: 20 }}>
                  <b>{t("vendor.lastSale")}</b>
                </td>
                <td>{vendor.lastSale}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </SiteLayout>
  );
}
