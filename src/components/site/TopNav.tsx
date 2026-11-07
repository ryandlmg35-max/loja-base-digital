import { Link, useRouterState } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { NO_AUTO_ACTIVE_CLASS } from "./link";

const LINKS = [
  { to: "/", label: "Home", icon: "icon-home" },
  { to: "/toplist", label: "Top List", icon: "icon-user" },
  { to: "/faq", label: "F-A-Q", icon: "icon-question-sign" },
  { to: "/login", label: "Login/Register", icon: "icon-user" },
  { to: "/support", label: "Support", icon: "icon-envelope" },
  { to: "/cart", label: "Cart", icon: "icon-shopping-cart" },
] as const;

export function TopNav() {
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
                <span className={link.icon} /> {link.label}
                {link.to === "/cart" && hydrated && count > 0 ? (
                  <span style={{ marginLeft: 4, fontWeight: "bold" }}>({count})</span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
