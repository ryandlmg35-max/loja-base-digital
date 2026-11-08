import { Link } from "@tanstack/react-router";
import { useT } from "@/i18n/context";
import { PAYMENT_ICONS, SITE } from "@/data/catalog";
import { FOOTER_SEO_HTML } from "@/data/footer-seo";
import { NO_AUTO_ACTIVE_CLASS } from "./link";

export function SiteFooter() {
  const t = useT();

  return (
    <footer className="footer">
      <div className="row-fluid">
        <div className="span8">
          <Link {...NO_AUTO_ACTIVE_CLASS} to="/faq">
            {t("footer.shippingInfo")}
          </Link>
          <br />
          <Link {...NO_AUTO_ACTIVE_CLASS} to="/faq">
            {t("footer.dataPrivacy")}
          </Link>
          <br />
          <br />
          <br />
          {t("site.copyright")}
          <div
            style={{ visibility: "hidden", height: 0, width: 0, position: "fixed" }}
            dangerouslySetInnerHTML={{ __html: FOOTER_SEO_HTML }}
          />
        </div>
        <div className="span4">
          <h5>{t("footer.paymentMethods")}</h5>
          {PAYMENT_ICONS.map(([file, label]) => (
            <img
              key={file}
              src={`/images/icon_${file}.png`}
              alt={label}
              title={label}
              style={{ maxHeight: 50, paddingRight: 7 }}
            />
          ))}
        </div>
      </div>
    </footer>
  );
}
