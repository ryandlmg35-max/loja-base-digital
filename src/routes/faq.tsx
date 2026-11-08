import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang, useT } from "@/i18n/context";
import { FAQ_EN, FAQ_PT } from "@/i18n/catalog-text";
import { SITE } from "@/data/catalog";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: `Perguntas frequentes - ${SITE.name}` },
      { name: "description", content: SITE.description },
      { name: "keywords", content: SITE.keywords },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const t = useT();
  const { lang } = useLang();

  const sections = lang === "en" ? FAQ_EN : FAQ_PT;

  return (
    <SiteLayout>
      <div className="row" />
      <div className="well well-small">
        <h2>{t("faq.title")}</h2>
        <hr className="soften" />
        <div className="row-fluid">
          <div className="span12">
            {sections.map((section) => (
              <div key={section.title}>
                <ul id="productDetail" className="nav nav-tabs">
                  <li className="active">
                    <a>
                      <span className="icon-chevron-right" /> {section.title}
                    </a>
                  </li>
                </ul>
                <div className="tab-content tabWrapper">
                  <div
                    className="tab-pane fade active in"
                    dangerouslySetInnerHTML={{ __html: section.html }}
                  />
                </div>

                <br />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
