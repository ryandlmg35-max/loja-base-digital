import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { NO_AUTO_ACTIVE_CLASS } from "@/components/site/link";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SITE } from "@/data/catalog";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: `Support - ${SITE.name}: 🧪 ⚗️ 💊 American Pharma` },
      { name: "description", content: SITE.description },
      { name: "keywords", content: SITE.keywords },
    ],
  }),
  component: SupportPage,
});

type SupportMessage = {
  name: string;
  email: string;
  subject: string;
  body: string;
  createdAt: string;
};

const STORAGE_KEY = "steroid-store.support.v1";

function SupportPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "" });
  const [sent, setSent] = useState(false);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message: SupportMessage = { ...form, createdAt: new Date().toISOString() };
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const stored: SupportMessage[] = raw ? (JSON.parse(raw) as SupportMessage[]) : [];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...stored, message]));
    } catch {
      // Storage unavailable: the message is still shown to the user.
    }
    setSent(true);
    setForm({ name: "", email: "", subject: "", body: "" });
  };

  return (
    <SiteLayout>
      <div className="row" />
      <div className="well well-small">
        <h2>Support</h2>
        <hr className="soften" />
        <div className="row-fluid">
          <div className="span12">
            <p>
              Need help with an order, a product or the shipping? Send us a message and the team
              replies through the contact details you provide. Common answers live in the{" "}
              <Link {...NO_AUTO_ACTIVE_CLASS} to="/faq">
                F-A-Q
              </Link>
              .
            </p>
            {sent ? (
              <div className="alert alert-success">
                Your message has been sent. We reply within 24 hours.
              </div>
            ) : null}
            <form className="form-horizontal" onSubmit={submit}>
              <div className="control-group">
                <label className="control-label" htmlFor="support-name">
                  Name <sup>*</sup>
                </label>
                <div className="controls">
                  <input
                    id="support-name"
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="control-group">
                <label className="control-label" htmlFor="support-email">
                  E-mail <sup>*</sup>
                </label>
                <div className="controls">
                  <input
                    id="support-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="control-group">
                <label className="control-label" htmlFor="support-subject">
                  Subject <sup>*</sup>
                </label>
                <div className="controls">
                  <input
                    id="support-subject"
                    type="text"
                    value={form.subject}
                    onChange={(event) => setForm({ ...form, subject: event.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="control-group">
                <label className="control-label" htmlFor="support-body">
                  Message <sup>*</sup>
                </label>
                <div className="controls">
                  <textarea
                    id="support-body"
                    rows={6}
                    value={form.body}
                    onChange={(event) => setForm({ ...form, body: event.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="control-group">
                <div className="controls">
                  <button type="submit" className="shopBtn">
                    <span className="icon-envelope" /> Send message
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
