import { Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/data/catalog";
import { NO_AUTO_ACTIVE_CLASS } from "./link";

export function CategorySidebar() {
  return (
    <div id="sidebar" className="span3">
      <div className="well well-small">
        <center>
          <h4>Categories</h4>
        </center>
        <ul className="nav nav-list">
          {CATEGORIES.map((category) => (
            <li key={category.id}>
              <Link {...NO_AUTO_ACTIVE_CLASS} to="/cat/$id" params={{ id: String(category.id) }}>
                <span className="icon-chevron-right" /> {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
