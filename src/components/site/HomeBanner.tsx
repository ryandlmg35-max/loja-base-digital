import { useT } from "@/i18n/context";
import { SITE } from "@/data/catalog";

export function HomeBanner() {
  const t = useT();

  return (
    <div className="row">
      <div className="span12">
        <div className="well np">
          <div id="myCarousel" className="carousel slide homCar">
            <div className="carousel-inner">
              <div className="item active">
                <img style={{ width: "100%" }} src="/images/header_bg_1.gif" alt={SITE.name} />
                <div className="carousel-caption">
                  <h4>{SITE.name}</h4>
                  <p>
                    <span>{t("site.tagline")}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
