import { createFileRoute } from "@tanstack/react-router";
import { CategorySidebar } from "@/components/site/CategorySidebar";
import { HomeBanner } from "@/components/site/HomeBanner";
import { ProductGrid } from "@/components/site/ProductGrid";
import { ShippingButtons } from "@/components/site/ShippingButtons";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SitePagination } from "@/components/site/SitePagination";
import { SITE } from "@/data/catalog";
import { useCatalog } from "@/lib/catalog-db";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { page?: number } => {
    const page = Number(search["page"]);
    return Number.isFinite(page) && page > 0 ? { page: Math.floor(page) } : {};
  },
  head: () => ({
    meta: [
      { title: `Home - All Categories - ${SITE.name}: 🧪 ⚗️ 💊 American Pharma` },
      { name: "description", content: SITE.description },
      { name: "keywords", content: SITE.keywords },
      { property: "og:title", content: `${SITE.name} — American Pharma` },
      { property: "og:description", content: SITE.tagline },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { page = 1 } = Route.useSearch();
  const { products } = useCatalog();

  const pageSize = SITE.pageSize;
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const current = Math.min(page, totalPages);
  const visible = products.slice((current - 1) * pageSize, current * pageSize);

  return (
    <SiteLayout>
      <HomeBanner />
      <div className="row">
        <CategorySidebar />
        <div className="span9">
          <ShippingButtons />
          <div className="well well-small">
            <center>
              <h3>All categories</h3>
            </center>
            <ProductGrid products={visible} />
            <SitePagination page={current} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
