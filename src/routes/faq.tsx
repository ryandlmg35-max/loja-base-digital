import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FAQ_SECTIONS, SITE } from "@/data/catalog";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: `FAQ - ${SITE.name}: ðŸ§ª âš—ï¸ ðŸ’Š American Pharma` },
      { name: "description", content: SITE.description },
      { name: "keywords", content: SITE.keywords },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <SiteLayout>
      <div className="row" />
      <div className="well well-small">
        <h2>Frequently-Asked-Questions</h2>
        <hr className="soften" />
        <div className="row-fluid">
          <div className="span12">
            {FAQ_SECTIONS.map((section) => (
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
