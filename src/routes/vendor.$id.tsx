import { createFileRoute, Link } from "@tanstack/react-router";
import { NO_AUTO_ACTIVE_CLASS } from "@/components/site/link";
import { handleImageError } from "@/components/site/image";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SITE, getVendor } from "@/data/catalog";

export const Route = createFileRoute("/vendor/$id")({
  head: ({ params }) => {
    const vendor = getVendor(Number(params["id"]));
    return {
      meta: [
        { title: `Vendor ${vendor?.name ?? "details"} - ${SITE.name}: 🧪 ⚗️ 💊 American Pharma` },
        { name: "description", content: SITE.description },
      ],
    };
  },
  component: VendorPage,
});

function VendorPage() {
  const { id } = Route.useParams();
  const vendor = getVendor(Number(id));

  if (!vendor) {
    return (
      <SiteLayout>
        <div className="row" />
        <div className="well well-small alert alert-warning cntr">
          <h2>Error</h2>
          <p>Vendor not found</p>
          <Link {...NO_AUTO_ACTIVE_CLASS} className="defaultBtn" to="/">
            Go back home
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="row" />
      <div className="well well-small">
        <h3>Vendor details</h3>
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
                  <b>Rank:</b>
                </td>
                <td>{vendor.rank}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: 20 }}>
                  <b>Active since:</b>
                </td>
                <td>{vendor.activeSince}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: 20 }}>
                  <b>Selling :</b>
                </td>
                <td>{vendor.selling}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: 20 }}>
                  <b>Feedbacks:</b>
                </td>
                <td>
                  {vendor.totalFeedbacks} -{" "}
                  <span className="text-success">{vendor.positive} positive</span> (
                  {vendor.feedback})
                </td>
              </tr>
              <tr>
                <td style={{ paddingRight: 20 }}>
                  <b>Last sale:</b>
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
