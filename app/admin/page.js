"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

const ADMIN_EMAIL = "gbitelbrum@gmail.com";

export default function AdminPage() {
  const [carregando, setCarregando] = useState(true);
  const [assinaturas, setAssinaturas] = useState([]);

  useEffect(() => {
    async function iniciar() {
      const { data } = await supabase.auth.getSession();

      if (!data.session?.user) {
        window.location.href = "/login";
        return;
      }

      if (data.session.user.email !== ADMIN_EMAIL) {
        window.location.href = "/";
        return;
      }

      await carregarAssinaturas();
      setCarregando(false);
    }

    iniciar();
  }, []);

  async function carregarAssinaturas() {
    const { data, error } = await supabase
      .from("assinaturas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
  console.error("Erro completo ao carregar assinaturas:", error);
  alert(error.message);
  return;
}

    setAssinaturas(data || []);
  }

  const resumo = useMemo(() => {
    const total = assinaturas.length;
    const semPlano = assinaturas.filter((a) => !a.plano || a.plano === "sem_plano").length;
    const basico = assinaturas.filter((a) => a.plano === "basico" && a.status === "ativo").length;
    const premiumMensal = assinaturas.filter(
      (a) => a.plano === "premium" && a.tipo_assinatura === "mensal" && a.status === "ativo"
    ).length;
    const premiumTrimestral = assinaturas.filter(
      (a) => a.plano === "premium" && a.tipo_assinatura === "trimestral" && a.status === "ativo"
    ).length;

    const mrr = assinaturas
      .filter((a) => a.status === "ativo")
      .reduce((total, a) => total + Number(a.valor || 0), 0);

    return { total, semPlano, basico, premiumMensal, premiumTrimestral, mrr };
  }, [assinaturas]);

  async function atualizarPlano(id, plano, tipo, valor) {
    const { error } = await supabase
      .from("assinaturas")
      .update({
        plano,
        tipo_assinatura: tipo,
        valor,
        status: "ativo",
      })
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("Erro ao atualizar plano");
      return;
    }

    await carregarAssinaturas();
  }

  async function cancelarAssinatura(id) {
    const confirmar = confirm("Deseja cancelar essa assinatura?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("assinaturas")
      .update({
        plano: "sem_plano",
        status: "cancelado",
        valor: 0,
      })
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("Erro ao cancelar assinatura");
      return;
    }

    await carregarAssinaturas();
  }

  if (carregando) {
    return (
      <main className="adminPage">
        <h1>Carregando painel admin...</h1>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <span>BrumFlow Admin</span>
          <h1>Painel Administrativo</h1>
          <p>Gerencie clientes, planos, status e receita recorrente.</p>
        </div>

        <Link href="/" className="adminBack">
          Voltar
        </Link>
      </header>

      <section className="adminCards">
        <div className="adminCard">
          <span>Usuários totais</span>
          <strong>{resumo.total}</strong>
        </div>

        <div className="adminCard">
          <span>Sem plano</span>
          <strong>{resumo.semPlano}</strong>
        </div>

        <div className="adminCard">
          <span>Básico</span>
          <strong>{resumo.basico}</strong>
        </div>

        <div className="adminCard">
          <span>Premium mensal</span>
          <strong>{resumo.premiumMensal}</strong>
        </div>

        <div className="adminCard">
          <span>Premium trimestral</span>
          <strong>{resumo.premiumTrimestral}</strong>
        </div>

        <div className="adminCard destaque">
          <span>Receita mensal</span>
          <strong>
            {resumo.mrr.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </strong>
        </div>
      </section>

      <section className="adminTableBox">
        <h2>Clientes e assinaturas</h2>

        <div className="adminTableWrapper">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Plano</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {assinaturas.map((item) => (
                <tr key={item.id}>
                  <td>{item.nome || "Sem nome"}</td>
                  <td>{item.email || item.user_id}</td>
                  <td>{item.plano || "sem_plano"}</td>
                  <td>{item.tipo_assinatura || "mensal"}</td>
                  <td>{item.status}</td>
                  <td>
                    {Number(item.valor || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td>
                    <div className="adminActions">
                      <button
                        onClick={() =>
                          atualizarPlano(item.id, "basico", "mensal", 29.9)
                        }
                      >
                        Básico
                      </button>

                      <button
                        onClick={() =>
                          atualizarPlano(item.id, "premium", "mensal", 69.9)
                        }
                      >
                        Premium mensal
                      </button>

                      <button
                        onClick={() =>
                          atualizarPlano(item.id, "premium", "trimestral", 54.9)
                        }
                      >
                        Premium trimestral
                      </button>

                      <button
                        className="danger"
                        onClick={() => cancelarAssinatura(item.id)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {assinaturas.length === 0 && (
                <tr>
                  <td colSpan="7">Nenhuma assinatura encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
