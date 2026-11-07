import { createFileRoute } from "@tanstack/react-router";
import { getAdminClient, isSameOrigin, json } from "@/lib/server/admin-client";

type RegisterBody = {
  email?: string;
  password?: string;
  nome?: string;
};

export const Route = createFileRoute("/api/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOrigin(request)) return json({ ok: false, error: "forbidden_origin" }, 403);

        let body: RegisterBody;
        try {
          body = (await request.json()) as RegisterBody;
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        const email = body.email?.trim().toLowerCase();
        const password = body.password ?? "";
        const nome = body.nome?.trim() ?? "";

        if (!email || !password) return json({ ok: false, error: "missing_fields" }, 400);
        if (password.length < 6) return json({ ok: false, error: "weak_password" }, 400);

        const admin = await getAdminClient();
        if (!admin) {
          // No service-role key in this runtime: the client falls back to the regular
          // sign-up flow (which asks the shopper to confirm the email).
          return json({ ok: false, error: "admin_key_unavailable" }, 503);
        }

        // AUTO_CONFIRM_EMAIL=false turns the instant sign-in off and restores the
        // standard "confirm your email" flow of the Supabase project.
        if (process.env["AUTO_CONFIRM_EMAIL"] === "false") {
          return json({ ok: false, error: "auto_confirm_disabled" }, 503);
        }

        const { data, error } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { nome },
        });

        if (error) {
          const alreadyExists = /already|registered|exists/i.test(error.message);
          return json({ ok: false, error: alreadyExists ? "email_taken" : error.message }, 400);
        }

        return json({ ok: true, userId: data.user?.id ?? null, confirmed: true });
      },
    },
  },
});
