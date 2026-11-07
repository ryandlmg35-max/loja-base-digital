import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PRODUCTS } from "@/data/catalog";
import { SITE } from "@/data/catalog";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: `Store admin - ${SITE.name}` }],
  }),
  component: AdminPage,
});

type SyncResult = { ok: boolean; message: string; detail?: string | undefined };

function AdminPage() {
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
          message: `Catalog synced: ${payload.inserted ?? 0} inserted, ${payload.updated ?? 0} updated.`,
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
        <h2>Store admin</h2>
        <hr className="soften" />

        <p>
          Logged in as: <b>{user?.email ?? "nobody — login first"}</b>
        </p>

        <h4>Catalog sync</h4>
        <p>
          Writes the {PRODUCTS.length} products of the cloned storefront into the{" "}
          <code>produtos</code> table (prices, stock, description and image path). The checkout
          needs it to store the order lines.
        </p>
        <button type="button" className="shopBtn" onClick={() => void sync()} disabled={busy}>
          <span className="icon-refresh" /> {busy ? "Syncing..." : "Sync catalog to database"}
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

        <h4>Manual fallback</h4>
        <p>
          If the sync button answers <code>admin_key_unavailable</code>, run the SQL in the Lovable
          SQL editor (Database → SQL):
        </p>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {`-- 1) give your account the admin role
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'SEU_EMAIL';

-- 2) load the catalog
\\i seed/catalogo.sql`}
        </pre>
      </div>
    </SiteLayout>
  );
}
