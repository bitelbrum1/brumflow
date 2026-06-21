"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

const ADMIN_EMAIL = "gbitelbrum@gmail.com";

export default function AdminPage() {
  const [adminEmail, setAdminEmail] = useState("");
  const [email, setEmail] = useState("");
  const [dados, setDados] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificarAdmin() {
      const { data } = await supabase.auth.getSession();
      const usuarioEmail = data.session?.user?.email || "";

      if (usuarioEmail !== ADMIN_EMAIL) {
        window.location.href = "/sistema";
        return;
      }

      setAdminEmail(usuarioEmail);
      setCarregando(false);
    }

    verificarAdmin();
  }, []);

  function diasRestantes(expiraEm) {
    if (!expiraEm) return "Sem data";
    const diff = new Date(expiraEm) - new Date();
    if (diff <= 0) return "Expirado";
    return `${Math.ceil(diff / (1000 * 60 * 60 * 24))} dias`;
  }

  async function enviar(acao) {
    setMensagem("Processando...");

    const response = await fetch("/api/admin/assinaturas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ adminEmail, email, acao }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMensagem(data.error || "Erro.");
      return;
    }

    setDados(data);
    setMensagem(acao === "buscar" ? "Usuário encontrado." : "Plano atualizado.");
  }

  if (carregando) {
    return <main className="adminPage"><h1>Carregando...</h1></main>;
  }

  return (
    <main className="adminPage">
      <section className="adminCard">
        <h1>Painel Admin</h1>
        <p>Busque usuários, veja assinatura e altere planos.</p>

        <input
          className="adminInput"
          placeholder="Email do cliente"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="adminButtons">
          <button onClick={() => enviar("buscar")}>Buscar Usuário</button>
          <button onClick={() => enviar("basico")}>Ativar Básico</button>
          <button onClick={() => enviar("premium")}>Ativar Premium</button>
          <button onClick={() => enviar("premium_trimestral")}>
            Ativar Trimestral
          </button>
          <button className="danger" onClick={() => enviar("suspender")}>
            Suspender
          </button>
        </div>

        {mensagem && <div className="adminMsg">{mensagem}</div>}

        {dados?.assinatura && (
          <div className="adminDados">
            <h2>Dados da assinatura</h2>
            <p><b>Email:</b> {dados.assinatura.email}</p>
            <p><b>Plano:</b> {dados.assinatura.plano}</p>
            <p><b>Status:</b> {dados.assinatura.status}</p>
            <p><b>Tipo:</b> {dados.assinatura.tipo_assinatura || "Não definido"}</p>
            <p><b>Valor:</b> R$ {dados.assinatura.valor || 0}</p>
            <p><b>Expira em:</b> {dados.assinatura.expira_em ? new Date(dados.assinatura.expira_em).toLocaleDateString("pt-BR") : "Sem data"}</p>
            <p><b>Tempo restante:</b> {diasRestantes(dados.assinatura.expira_em)}</p>
            <p><b>ID Mercado Pago:</b> {dados.assinatura.mercado_pago_id || "Não informado"}</p>
          </div>
        )}

        <Link href="/sistema" className="adminVoltar">
          ← Voltar
        </Link>
      </section>
    </main>
  );
}