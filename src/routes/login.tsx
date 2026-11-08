import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useT } from "@/i18n/context";
import { SITE } from "@/data/catalog";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: `Cadastro/Login - ${SITE.name}` },
      { name: "description", content: SITE.description },
      { name: "keywords", content: SITE.keywords },
    ],
  }),
  component: LoginPage,
});

type Notice = { kind: "ok" | "error"; text: string } | null;

function LoginPage() {
  const t = useT();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [registerNotice, setRegisterNotice] = useState<Notice>(null);
  const [loginNotice, setLoginNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const register = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegisterNotice(null);

    if (password !== password2) {
      setRegisterNotice({ kind: "error", text: t("login.passwordsDontMatch") });
      return;
    }
    if (password.length < 6) {
      setRegisterNotice({ kind: "error", text: t("login.weakPassword") });
      return;
    }

    setBusy(true);

    // The server route creates the account with the email already confirmed when the
    // runtime has the service-role key (Lovable Cloud). Locally it answers 503 and the
    // regular sign-up flow below takes over.
    let accountReady = false;
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, nome: username }),
      });
      if (response.ok) {
        const payload = (await response.json()) as { ok?: boolean };
        accountReady = Boolean(payload.ok);
      } else {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        if (payload?.error === "email_taken") {
          setBusy(false);
          setRegisterNotice({ kind: "error", text: t("login.emailTaken") });
          return;
        }
      }
    } catch {
      accountReady = false;
    }

    if (accountReady) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        setRegisterNotice({ kind: "error", text: error.message });
        return;
      }
      setRegisterNotice({ kind: "ok", text: t("login.accountCreated") });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { nome: username } },
    });
    setBusy(false);

    if (error) {
      setRegisterNotice({ kind: "error", text: error.message });
      return;
    }
    setRegisterNotice(
      data.session
        ? { kind: "ok", text: t("login.accountCreated") }
        : { kind: "ok", text: t("login.confirmEmail") },
    );
  };

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginNotice(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setLoginNotice({ kind: "error", text: error.message });
  };

  const resendConfirmation = async () => {
    setLoginNotice(null);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      setLoginNotice({ kind: "error", text: error.message });
      return;
    }
    setLoginNotice({ kind: "ok", text: t("login.confirmationSent") });
  };

  const logout = async () => {
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
    setRegisterNotice({ kind: "ok", text: t("login.loggedOut") });
  };

  const needsConfirmation =
    loginNotice?.kind === "error" && /not confirmed/i.test(loginNotice.text);

  return (
    <SiteLayout>
      <div className="row" />
      <div className="well well-small">
        <hr className="soften" />
        <div className="row-fluid">
          <div className="span6">
            <div className="well">
              <h3>{t("login.createAccount")}</h3>
              {user ? (
                <div>
                  <p>
                    {t("login.loggedInAs")} <b>{user.email}</b>
                  </p>
                  <button
                    type="button"
                    className="shopBtn"
                    onClick={() => void logout()}
                    disabled={busy}
                  >
                    {t("login.logout")}
                  </button>
                </div>
              ) : (
                <form className="form-horizontal" onSubmit={register}>
                  <div className="control-group">
                    <label className="control-label" htmlFor="username">
                      {t("login.username")} <sup>*</sup>
                    </label>
                    <div className="controls">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder={t("login.username")}
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="control-group">
                    <label className="control-label" htmlFor="register-email">
                      {t("login.email")} <sup>*</sup>
                    </label>
                    <div className="controls">
                      <input
                        type="email"
                        id="register-email"
                        name="email"
                        placeholder={t("login.email")}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="control-group">
                    <label className="control-label" htmlFor="pass1">
                      {t("login.password")} <sup>*</sup>
                    </label>
                    <div className="controls">
                      <input
                        type="password"
                        placeholder={t("login.password")}
                        id="pass1"
                        name="pass1"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        minLength={6}
                        required
                      />
                    </div>
                  </div>
                  <div className="control-group">
                    <label className="control-label" htmlFor="pass2">
                      {t("login.passwordRepeat")}
                      <sup>*</sup>
                    </label>
                    <div className="controls">
                      <input
                        type="password"
                        placeholder={t("login.passwordRepeat")}
                        id="pass2"
                        name="pass2"
                        value={password2}
                        onChange={(event) => setPassword2(event.target.value)}
                        minLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div className="control-group">
                    <div className="controls">
                      <button type="submit" className="exclusive shopBtn" disabled={busy}>
                        {t("login.register")}
                      </button>
                    </div>
                  </div>
                  {registerNotice ? (
                    <div
                      className={
                        registerNotice.kind === "ok" ? "alert alert-success" : "alert alert-error"
                      }
                    >
                      {registerNotice.text}
                    </div>
                  ) : null}
                </form>
              )}
            </div>
          </div>
          <div className="span6">
            <div className="well">
              <h3>{t("login.login")}</h3>
              <form className="form-horizontal" onSubmit={login}>
                <div className="control-group">
                  <label className="control-label" htmlFor="login-email">
                    {t("login.email")} <sup>*</sup>
                  </label>
                  <div className="controls">
                    <input
                      type="email"
                      id="login-email"
                      name="username"
                      placeholder={t("login.email")}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="control-group">
                  <label className="control-label" htmlFor="login-pass">
                    {t("login.password")} <sup>*</sup>
                  </label>
                  <div className="controls">
                    <input
                      type="password"
                      placeholder={t("login.password")}
                      id="login-pass"
                      name="pass1"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="control-group">
                  <div className="controls">
                    <button type="submit" className="exclusive shopBtn" disabled={busy}>
                      {t("login.login")}
                    </button>
                    {needsConfirmation ? (
                      <button
                        type="button"
                        className="defaultBtn"
                        style={{ marginLeft: 8 }}
                        onClick={() => void resendConfirmation()}
                        disabled={busy}
                      >
                        {t("login.resendConfirmation")}
                      </button>
                    ) : null}
                  </div>
                </div>
                {loginNotice ? (
                  <div
                    className={
                      loginNotice.kind === "ok" ? "alert alert-success" : "alert alert-error"
                    }
                  >
                    {loginNotice.text}
                  </div>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
