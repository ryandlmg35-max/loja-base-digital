import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { CategorySidebar } from "@/components/site/CategorySidebar";
import { HomeBanner } from "@/components/site/HomeBanner";
import { ProductGrid } from "@/components/site/ProductGrid";
import { ShippingButtons } from "@/components/site/ShippingButtons";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SitePagination } from "@/components/site/SitePagination";
import { categoryName } from "@/i18n/catalog-text";
import { useLang, useT } from "@/i18n/context";
import { SITE, getCategory } from "@/data/catalog";
import { useCatalog } from "@/lib/catalog-db";

export const Route = createFileRoute("/cat/$id")({
  validateSearch: (search: Record<string, unknown>): { page?: number } => {
    const page = Number(search["page"]);
    return Number.isFinite(page) && page > 0 ? { page: Math.floor(page) } : {};
  },
  head: ({ params }) => {
    const category = getCategory(Number(params["id"]));
    return {
      meta: [
        { title: `${category?.name ?? "Todas as categorias"} - ${SITE.name}` },
        { name: "description", content: SITE.description },
        { name: "keywords", content: SITE.keywords },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const t = useT();
  const { lang } = useLang();
  const { id } = Route.useParams();
  const { page = 1 } = Route.useSearch();
  const navigate = useNavigate();
  const { products } = useCatalog();

  const categoryId = Number(id);
  const category = getCategory(categoryId);

  // /cat/15 does not exist on the original store and redirects to the home listing.
  useEffect(() => {
    if (!category) void navigate({ to: "/", replace: true });
  }, [category, navigate]);

  const members = category
    ? products.filter((product) => category.productIds.includes(product.id))
    : [];
  const pageSize = SITE.pageSize;
  const totalPages = Math.max(1, Math.ceil(members.length / pageSize));
  const current = Math.min(page, totalPages);
  const visible = members.slice((current - 1) * pageSize, current * pageSize);

  return (
    <SiteLayout>
      <HomeBanner />
      <div className="row">
        <CategorySidebar />
        <div className="span9">
          <ShippingButtons />
          <div className="well well-small">
            <center>
              <h3>{category ? categoryName(category, lang) : t("cat.allCategories")}</h3>
            </center>
            <ProductGrid products={visible} />
            {members.length > pageSize ? (
              <SitePagination page={current} totalPages={totalPages} />
            ) : null}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
