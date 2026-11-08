import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { NO_AUTO_ACTIVE_CLASS } from "@/components/site/link";
import { handleImageError } from "@/components/site/image";
import { SiteLayout } from "@/components/site/SiteLayout";
import { productName, productStockText } from "@/i18n/catalog-text";
import { translateProductText } from "@/i18n/product-content";
import { useLang, useT } from "@/i18n/context";
import { SITE, getProduct } from "@/data/catalog";
import { formatBRL } from "@/data/store";
import { useCatalog } from "@/lib/catalog-db";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => {
    const product = getProduct(Number(params["id"]));
    return {
      meta: [
        {
          title: `${product?.name ?? "Produto nÃ£o encontrado"} - ${SITE.name}`,
        },
        { name: "description", content: product?.name ?? SITE.description },
        { name: "keywords", content: SITE.keywords },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const t = useT();
  const { lang } = useLang();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { products } = useCatalog();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const productId = Number(id);
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return (
      <SiteLayout>
        <div className="row" />
        <div className="well well-small alert alert-warning cntr">
          <h2>{t("product.error")}</h2>
          <p>{t("product.notFound")}</p>
          <Link {...NO_AUTO_ACTIVE_CLASS} className="defaultBtn" to="/">
            {t("product.goHome")}
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const name = productName(product, lang);
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    add(product.id, qty);
    void navigate({ to: "/cart" });
  };

  return (
    <SiteLayout>
      <div className="row" />
      <div className="row">
        <div className="span12">
          <div className="well well-small">
            <div className="row-fluid">
              <div className="span5">
                <div id="myCarousel" className="carousel slide cntr">
                  <div className="carousel-inner">
                    <div className="item active">
                      <img
                        src={product.image}
                        alt={name}
                        style={{ width: "100%" }}
                        onError={handleImageError}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="span7">
                <Link {...NO_AUTO_ACTIVE_CLASS} to="/">
                  {" "}
                  {t("product.allProducts")}
                </Link>{" "}
                <i className="icon-double-angle-right" />{" "}
                <Link
                  {...NO_AUTO_ACTIVE_CLASS}
                  to="/cat/$id"
                  params={{ id: String(product.categories[0] ?? 0) }}
                />
                <h2>{name}</h2>
                <hr className="soft" />
                <form className="form-horizontal qtyFrm" onSubmit={submit}>
                  <input type="hidden" name="addproduct" value={product.id} />
                  <h4>
                    {t("product.price")}: {formatBRL(product.price, lang)}
                  </h4>
                  <h4 className={product.stock ? "text-success" : "text-danger"}>
                    {productStockText(product, lang)}
                  </h4>
                  <h4>
                    {t("product.from")}{" "}
                    <Link
                      {...NO_AUTO_ACTIVE_CLASS}
                      to="/vendor/$id"
                      params={{ id: String(product.vendorId) }}
                    >
                      {product.vendorName}
                    </Link>
                  </h4>
                  <div className="control-group">
                    <label className="control-label" htmlFor="qty">
                      {t("product.quantity")}
                    </label>
                    <div className="controls">
                      <input
                        id="qty"
                        type="number"
                        className="span6"
                        name="qty"
                        placeholder={t("product.qtyPlaceholder")}
                        min={1}
                        max={10000}
                        value={qty}
                        onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
                      />
                    </div>
                  </div>

                  <center>
                    <button type="submit" className="shopBtn">
                      <span className="icon-shopping-cart" /> {t("product.addToCart")}
                    </button>
                    <br />
                    <small>{t("product.finalPrice")}</small>
                  </center>
                </form>
              </div>
            </div>
            <hr className="softn clr" />

            <div className="tab-content tabWrapper">
              <div
                className="tab-pane fade active in"
                id="home"
                dangerouslySetInnerHTML={{ __html: translateProductText(product.info, lang) }}
              />
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
