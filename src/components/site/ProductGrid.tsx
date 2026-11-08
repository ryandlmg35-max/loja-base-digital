import { Link } from "@tanstack/react-router";
import { productName } from "@/i18n/catalog-text";
import { useLang, useT } from "@/i18n/context";
import type { Product } from "@/data/catalog";
import { NO_AUTO_ACTIVE_CLASS } from "./link";
import { handleImageError } from "./image";

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

export function ProductGrid({ products }: { products: Product[] }) {
  const t = useT();
  const { lang } = useLang();

  if (products.length === 0) {
    return <div className="row-fluid">{t("grid.noProducts")}</div>;
  }

  return (
    <div className="row-fluid">
      {chunk(products, 3).map((row, rowIndex) => (
        <ul className="thumbnails" key={rowIndex}>
          {row.map((product) => (
            <li className="span4" key={product.id}>
              <div className="thumbnail">
                <Link
                  {...NO_AUTO_ACTIVE_CLASS}
                  to="/product/$id"
                  params={{ id: String(product.id) }}
                >
                  <img
                    src={product.image}
                    alt={productName(product, lang)}
                    onError={handleImageError}
                  />
                </Link>
                <div className="caption cntr">
                  <Link
                    {...NO_AUTO_ACTIVE_CLASS}
                    to="/product/$id"
                    params={{ id: String(product.id) }}
                  >
                    <h5>{productName(product, lang)}</h5>
                  </Link>
                  <p>
                    <strong>${product.price.toFixed(2)}</strong>
                  </p>
                  <h4>
                    <Link
                      {...NO_AUTO_ACTIVE_CLASS}
                      className="shopBtn"
                      to="/product/$id"
                      params={{ id: String(product.id) }}
                      title={t("home.addToCart")}
                    >
                      <span className="icon-zoom-in" /> {t("home.view")}
                    </Link>
                  </h4>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
