import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Loja — Base do e-commerce" },
      { name: "description", content: "Página de teste da conexão: login, cadastro e lista de produtos." },
      { property: "og:title", content: "Loja — Base do e-commerce" },
      { property: "og:description", content: "Página de teste da conexão: login, cadastro e lista de produtos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Produto = { id: string; nome: string; preco: number; estoque: number };

function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [erroProdutos, setErroProdutos] = useState<string | null>(null);
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    supabase
      .from("produtos")
      .select("id, nome, preco, estoque")
      .order("criado_em")
      .then(({ data, error }) => {
        if (error) setErroProdutos(error.message);
        else setProdutos(data ?? []);
      });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (modo === "cadastro") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { emailRedirectTo: window.location.origin, data: { nome } },
      });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Cadastro feito! Confirme seu email para entrar.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) setMsg(error.message);
    }
  }

  return (
    <main className="mx-auto max-w-xl space-y-8 p-6 font-sans">
      <h1 className="text-2xl font-bold">Loja (teste de conexão)</h1>

      <section className="space-y-2">
        {user ? (
          <div className="space-y-2">
            <p>Logado como {user.email}</p>
            <button className="rounded border px-3 py-1" onClick={() => supabase.auth.signOut()}>
              Sair
            </button>
          </div>
        ) : (
          <form onSubmit={enviar} className="space-y-2">
            <h2 className="text-lg font-semibold">{modo === "login" ? "Entrar" : "Criar conta"}</h2>
            {modo === "cadastro" && (
              <input className="block w-full rounded border p-2" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            )}
            <input className="block w-full rounded border p-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="block w-full rounded border p-2" type="password" placeholder="Senha" minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} required />
            <button className="rounded border px-3 py-1" type="submit">
              {modo === "login" ? "Entrar" : "Cadastrar"}
            </button>
            <button type="button" className="ml-3 text-sm underline" onClick={() => setModo(modo === "login" ? "cadastro" : "login")}>
              {modo === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
            </button>
            {msg && <p className="text-sm">{msg}</p>}
          </form>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Produtos</h2>
        {erroProdutos && <p>Erro: {erroProdutos}</p>}
        <ul className="list-disc pl-5">
          {produtos.map((p) => (
            <li key={p.id}>
              {p.nome} — R$ {Number(p.preco).toFixed(2)} (estoque: {p.estoque})
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
