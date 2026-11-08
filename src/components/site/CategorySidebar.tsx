import { Link } from "@tanstack/react-router";
import { categoryName } from "@/i18n/catalog-text";
import { useLang, useT } from "@/i18n/context";
import { CATEGORIES } from "@/data/catalog";
import { NO_AUTO_ACTIVE_CLASS } from "./link";

export function CategorySidebar() {
  const t = useT();
  const { lang } = useLang();

  return (
    <div id="sidebar" className="span3">
      <div className="well well-small">
        <center>
          <h4>{t("sidebar.categories")}</h4>
        </center>
        <ul className="nav nav-list">
          {CATEGORIES.map((category) => (
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
