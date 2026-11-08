import { Link } from "@tanstack/react-router";
import { categoryName } from "@/i18n/catalog-text";
import { useLang, useT } from "@/i18n/context";
import { CATEGORIES } from "@/data/catalog";
import { BRAZIL_CATEGORY_IDS } from "@/data/store";
import { NO_AUTO_ACTIVE_CLASS } from "./link";

export function CategorySidebar() {
  const t = useT();
  const { lang } = useLang();
  const visible = CATEGORIES.filter((category) =>
    (BRAZIL_CATEGORY_IDS as readonly number[]).includes(category.id),
  );

  return (
    <div id="sidebar" className="span3">
      <div className="well well-small">
        <center>
          <h4>{t("sidebar.categories")}</h4>
        </center>
        <ul className="nav nav-list">
          {visible.map((category) => (
            <li key={category.id}>
              <Link {...NO_AUTO_ACTIVE_CLASS} to="/cat/$id" params={{ id: String(category.id) }}>
                <span className="icon-chevron-right" /> {categoryName(category, lang)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
