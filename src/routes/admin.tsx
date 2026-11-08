import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useT } from "@/i18n/context";
import { PRODUCTS } from "@/data/catalog";
import { SITE } from "@/data/catalog";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: `Painel da loja - ${SITE.name}` }],
  }),
  component: AdminPage,
});

type SyncResult = { ok: boolean; message: string; detail?: string | undefined };

function AdminPage() {
  const t = useT();
  const [user, setUser] = useState<User | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const sync = async () => {
    setBusy(true);
    setResult(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const response = await fetch("/api/sync-catalog", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        inserted?: number;
        updated?: number;
        error?: string;
        hint?: string;
      } | null;

      if (response.ok && payload?.ok) {
        setResult({
          ok: true,
          message: t("admin.syncOk", {
            inserted: payload.inserted ?? 0,
            updated: payload.updated ?? 0,
          }),
        });
      } else {
        setResult({
          ok: false,
          message: payload?.error ?? `Sync failed (HTTP ${response.status}).`,
          detail: payload?.hint,
        });
      }
    } catch (error) {
      setResult({ ok: false, message: error instanceof Error ? error.message : "Sync failed." });
    }
    setBusy(false);
  };

  return (
    <SiteLayout>
      <div className="row" />
      <div className="well well-small">
        <h2>{t("admin.title")}</h2>
        <hr className="soften" />

        <p>
          {t("admin.loggedInAs")} <b>{user?.email ?? t("admin.nobody")}</b>
        </p>

        <h4>{t("admin.syncTitle")}</h4>
        <p>{t("admin.syncIntro", { count: PRODUCTS.length })}</p>
        <button type="button" className="shopBtn" onClick={() => void sync()} disabled={busy}>
          <span className="icon-refresh" /> {busy ? t("admin.syncing") : t("admin.syncButton")}
        </button>
        {result ? (
          <div className={result.ok ? "alert alert-success" : "alert alert-error"}>
            {result.message}
            {result.detail ? (
              <div>
                <small>{result.detail}</small>
              </div>
            ) : null}
          </div>
        ) : null}

        <h4>{t("admin.manualFallback")}</h4>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {`${t("admin.sqlAdmin")}
${t("admin.sqlInsert")}

${t("admin.sqlCatalog")}
${t("admin.sqlFile")}`}
        </pre>
      </div>
    </SiteLayout>
  );
}
