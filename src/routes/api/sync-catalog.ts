import { createFileRoute } from "@tanstack/react-router";
import { PRODUCTS } from "@/data/catalog";
import { getAdminClient, isSameOrigin, json } from "@/lib/server/admin-client";

export const Route = createFileRoute("/api/sync-catalog")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOrigin(request)) return json({ ok: false, error: "forbidden_origin" }, 403);

        const admin = await getAdminClient();
        if (!admin) {
          return json(
            {
              ok: false,
              error: "admin_key_unavailable",
              hint: "SUPABASE_SERVICE_ROLE_KEY is only available in the Lovable Cloud runtime. Locally, paste seed/catalogo.sql in the SQL editor.",
            },
            503,
          );
        }

        const authorization = request.headers.get("authorization") ?? "";
        const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
        if (!token) return json({ ok: false, error: "unauthorized" }, 401);

        const { data: userData, error: userError } = await admin.auth.getUser(token);
        if (userError || !userData.user) return json({ ok: false, error: "unauthorized" }, 401);

        const { data: roles } = await admin
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.user.id);
        const isAdmin = (roles ?? []).some((row) => row.role === "admin");
        if (!isAdmin) return json({ ok: false, error: "forbidden" }, 403);

        const names = PRODUCTS.map((product) => product.name);
        const { data: existing, error: existingError } = await admin
          .from("produtos")
          .select("id, nome")
          .in("nome", names);

        if (existingError) return json({ ok: false, error: existingError.message }, 500);

        const idByName = new Map<string, string>();
        for (const row of existing ?? []) {
          idByName.set(row.nome.trim().toLowerCase(), row.id);
        }

        const toInsert: Array<{
          nome: string;
          descricao: string;
          preco: number;
          imagem_url: string;
          estoque: number;
        }> = [];
        let updated = 0;

        for (const product of PRODUCTS) {
          const row = {
            nome: product.name,
            descricao: product.info,
            preco: product.price,
            imagem_url: product.image,
            estoque: product.stock ? 100 : 0,
          };
          const id = idByName.get(product.name.trim().toLowerCase());
          if (!id) {
            toInsert.push(row);
            continue;
          }
          const { error } = await admin.from("produtos").update(row).eq("id", id);
          if (error) return json({ ok: false, error: error.message }, 500);
          updated++;
        }

        if (toInsert.length > 0) {
          const { error } = await admin.from("produtos").insert(toInsert);
          if (error) return json({ ok: false, error: error.message }, 500);
        }

        return json({
          ok: true,
          inserted: toInsert.length,
          updated,
          total: PRODUCTS.length,
        });
      },
    },
  },
});
