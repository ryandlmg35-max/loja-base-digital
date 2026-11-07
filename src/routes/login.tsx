import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SITE } from "@/data/catalog";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: `Register/Login - ${SITE.name}: 🧪 ⚗️ 💊 American Pharma` },
      { name: "description", content: SITE.description },
      { name: "keywords", content: SITE.keywords },
    ],
  }),
  component: LoginPage,
});

type Notice = { kind: "ok" | "error"; text: string } | null;

function LoginPage() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
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
    setNotice(null);

    if (password !== password2) {
      setNotice({ kind: "error", text: "Passwords do not match." });
      return;
    }
    if (password.length < 6) {
      setNotice({ kind: "error", text: "Password must have at least 6 characters." });
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { nome: username } },
    });
    setBusy(false);

    if (error) {
      setNotice({ kind: "error", text: error.message });
      return;
    }
    setNotice(
      data.session
        ? { kind: "ok", text: "Account created. You are logged in." }
        : { kind: "ok", text: "Account created. Confirm your email to log in." },
    );
  };

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setNotice({ kind: "error", text: error.message });
  };

  const logout = async () => {
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
    setNotice({ kind: "ok", text: "You are logged out." });
  };

  return (
    <SiteLayout>
      <div className="row" />
      <div className="well well-small">
        <hr className="soften" />
        <div className="row-fluid">
          <div className="span6">
            <div className="well">
              <h3>Create Account</h3>
              {user ? (
                <div>
                  <p>
                    You are logged in as <b>{user.email}</b>
                  </p>
                  <button
                    type="button"
                    className="shopBtn"
                    onClick={() => void logout()}
                    disabled={busy}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <form className="form-horizontal" onSubmit={register}>
                  <div className="control-group">
                    <label className="control-label" htmlFor="username">
                      Username <sup>*</sup>
                    </label>
                    <div className="controls">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="control-group">
                    <label className="control-label" htmlFor="register-email">
                      Email <sup>*</sup>
                    </label>
                    <div className="controls">
                      <input
                        type="email"
                        id="register-email"
                        name="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="control-group">
                    <label className="control-label" htmlFor="pass1">
                      Password <sup>*</sup>
                    </label>
                    <div className="controls">
                      <input
                        type="password"
                        placeholder="Password"
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
                      Password (repeat)
                      <sup>*</sup>
                    </label>
                    <div className="controls">
                      <input
                        type="password"
                        placeholder="Password"
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
                        Register
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
          <div className="span6">
            <div className="well">
              <h3>Login</h3>
              <form className="form-horizontal" onSubmit={login}>
                <div className="control-group">
                  <label className="control-label" htmlFor="login-email">
                    Email <sup>*</sup>
                  </label>
                  <div className="controls">
                    <input
                      type="email"
                      id="login-email"
                      name="username"
                      placeholder="Email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="control-group">
                  <label className="control-label" htmlFor="login-pass">
                    Password <sup>*</sup>
                  </label>
                  <div className="controls">
                    <input
                      type="password"
                      placeholder="Password"
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
                      Login
                    </button>
                  </div>
                </div>
              </form>
              {notice ? (
                <div className={notice.kind === "ok" ? "alert alert-success" : "alert alert-error"}>
                  {notice.text}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
