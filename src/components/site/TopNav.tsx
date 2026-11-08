import { Link, useRouterState } from "@tanstack/react-router";
import { LanguagePicker } from "./LanguagePicker";
import { useT } from "@/i18n/context";
import { useCart } from "@/lib/cart";
import { NO_AUTO_ACTIVE_CLASS } from "./link";

const LINKS = [
  { to: "/", key: "nav.home", icon: "icon-home" },
  { to: "/toplist", key: "nav.toplist", icon: "icon-user" },
  { to: "/faq", key: "nav.faq", icon: "icon-question-sign" },
  { to: "/login", key: "nav.login", icon: "icon-user" },
  { to: "/support", key: "nav.support", icon: "icon-envelope" },
  { to: "/cart", key: "nav.cart", icon: "icon-shopping-cart" },
] as const;

export function TopNav() {
  const t = useT();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { count, hydrated } = useCart();

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="navbar navbar-inverse navbar-fixed-top">
      <div className="topNav">
        <div className="container">
          <div className="alignR">
            <div className="pull-left">
              <Link {...NO_AUTO_ACTIVE_CLASS} to="/" style={{ padding: 0 }}>
                <img src="/images/logo_1.png" alt="Simply Steroids" style={{ height: 60 }} />
              </Link>
            </div>
            {LINKS.map((link) => (
              <Link
                {...NO_AUTO_ACTIVE_CLASS}
                key={link.to}
                to={link.to}
                className={isActive(link.to) ? "active" : ""}
              >
                <span className={link.icon} /> {t(link.key)}
                {link.to === "/cart" && hydrated && count > 0 ? (
                  <span style={{ marginLeft: 4, fontWeight: "bold" }}>({count})</span>
                ) : null}
              </Link>
            ))}
            <LanguagePicker />
          </div>
        </div>
      </div>
    </div>
  );
}
