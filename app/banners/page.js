"use client";

import { useState } from "react";
import Link from "next/link";

export default function Banners() {
  const [produto, setProduto] = useState("");
  const [publico, setPublico] = useState("");
  const [objetivo, setObjetivo] = useState("Vender mais");
  const [tom, setTom] = useState("Profissional");
  const [resultado, setResultado] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function gerarBanner(e) {
    e.preventDefault();

    if (!produto) {
      alert("Digite o produto ou serviço");
      return;
    }

    setCarregando(true);
    setResultado("");

    try {
      const resposta = await fetch("/api/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          produto,
          publico,
          objetivo,
          tom,
        }),
      });

      const data = await resposta.json();

      if (!resposta.ok) {
        throw new Error(data.error || "Erro ao gerar banner");
      }

      setResultado(data.resultado);
    } catch (error) {
      setResultado(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="bannerPage">
      <div className="bannerContainer">
        <Link href="/" className="backLink">
          ← Voltar
        </Link>

        <div className="bannerHeader">
          <span>🎨 Criador de Posts</span>
          <h1>Crie textos profissionais para banners com IA</h1>
          <p>
            Gere títulos, chamadas, ofertas e CTAs para divulgar seus produtos.
          </p>
        </div>

        <section className="bannerGrid">
          <form onSubmit={gerarBanner} className="bannerForm">
            <label>Produto ou serviço</label>
            <input
              type="text"
              placeholder="Ex: Creme hidratante, curso online, loja de roupas..."
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
            />

            <label>Público-alvo</label>
            <input
              type="text"
              placeholder="Ex: mulheres, lojistas, jovens, empresas..."
              value={publico}
              onChange={(e) => setPublico(e.target.value)}
            />

            <label>Objetivo do banner</label>
            <select value={objetivo} onChange={(e) => setObjetivo(e.target.value)}>
              <option>Vender mais</option>
              <option>Divulgar promoção</option>
              <option>Lançamento de produto</option>
              <option>Captar clientes</option>
              <option>Divulgar serviço</option>
            </select>

            <label>Tom da comunicação</label>
            <select value={tom} onChange={(e) => setTom(e.target.value)}>
              <option>Profissional</option>
              <option>Premium</option>
              <option>Divertido</option>
              <option>Urgente</option>
              <option>Elegante</option>
              <option>Persuasivo</option>
            </select>

            <button type="submit" disabled={carregando}>
              {carregando ? "Gerando..." : "Gerar Textos"}
            </button>
          </form>

          <div className="bannerResult">
            <h2>Resultado</h2>

            {resultado ? (
              <div className="bannerOutput">
                {resultado.split("\n").map((linha, index) => (
                  <p key={index}>{linha}</p>
                ))}
              </div>
            ) : (
              <div className="emptyResult">
                <strong>Seu banner aparecerá aqui</strong>
                <p>
                  A IA vai criar ideias de título, subtítulo, chamada e botão.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}