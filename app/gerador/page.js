"use client";

import { useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Gerador() {
  const [produto, setProduto] = useState("");
  const [publico, setPublico] = useState("");
  const [plataforma, setPlataforma] = useState("Loja online");
  const [tom, setTom] = useState("Profissional");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  function limparTexto(texto) {
    return texto
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/###/g, "")
      .trim();
  }

  async function gerarDescricao() {
    try {
      setLoading(true);
      setDescricao("");

      const resposta = await fetch("/api/gerar-descricao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          produto,
          publico,
          plataforma,
          tom,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.detalhe || dados.erro || "Erro desconhecido");
      }

      setDescricao(limparTexto(dados.descricao));
    } catch (error) {
      alert("Erro ao gerar descrição: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function copiarTexto() {
    await navigator.clipboard.writeText(descricao);
    alert("Descrição copiada!");
  }

  return (
     <ProtectedRoute recurso="ia-produtos">
    <main className="page">
      <section className="hero">
        <span className="badge">BrumFlow</span>
        <h1>Gerador de Descrição</h1>
        <p>
          Crie descrições únicas, persuasivas e profissionais para vender mais.
        </p>
      </section>

      <section className="card">
        <label>Nome do produto</label>
        <input
          type="text"
          placeholder="Ex: ventilador, celular, perfume..."
          value={produto}
          onChange={(e) => setProduto(e.target.value)}
        />

        <label>Público-alvo</label>
        <input
          type="text"
          placeholder="Ex: mulheres, jovens, lojistas..."
          value={publico}
          onChange={(e) => setPublico(e.target.value)}
        />

        <div className="grid">
          <div>
            <label>Plataforma / Canal</label>
            <select
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value)}
            >
              <option>Loja online</option>
              <option>Instagram</option>
              <option>WhatsApp</option>
              <option>Mercado Livre</option>
              <option>Shopee</option>
              <option>Amazon</option>
            </select>
          </div>

          <div>
            <label>Tom da descrição</label>
            <select value={tom} onChange={(e) => setTom(e.target.value)}>
              <option>Profissional</option>
              <option>Premium</option>
              <option>Persuasivo</option>
              <option>Emocional</option>
              <option>Moderno</option>
              <option>Descontraído</option>
              <option>Direto</option>
            </select>
          </div>
        </div>

        <button onClick={gerarDescricao} disabled={loading}>
          {loading ? "Gerando descrição..." : "Gerar descrição"}
        </button>
      </section>

      {descricao && (
        <section className="resultado">
          <div className="resultadoHeader">
            <h2>Descrição gerada</h2>
            <button className="copyBtn" onClick={copiarTexto}>
              Copiar texto
            </button>
          </div>

          <div className="textoGerado">
            {descricao.split("\n").map((linha, index) => {
              if (!linha.trim()) return <br key={index} />;

              return <p key={index}>{linha}</p>;
            })}
          </div>
        </section>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 50px 20px;
          background:
            radial-gradient(circle at top left, rgba(124, 58, 237, 0.25), transparent 35%),
            radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.18), transparent 30%),
            #070713;
          color: #fff;
          font-family: Arial, Helvetica, sans-serif;
        }

        .hero {
          text-align: center;
          margin-bottom: 35px;
        }

        .badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 999px;
          background: rgba(168, 85, 247, 0.18);
          color: #c084fc;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.8px;
          margin-bottom: 18px;
        }

        h1 {
          font-size: clamp(36px, 6vw, 64px);
          margin: 0;
          font-weight: 900;
          line-height: 1.05;
          background: linear-gradient(90deg, #fff, #c084fc, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero p {
          margin-top: 16px;
          color: #cbd5e1;
          font-size: 20px;
        }

        .card,
        .resultado {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto 28px;
          padding: 30px;
          border-radius: 24px;
          background: rgba(15, 23, 42, 0.78);
          border: 1px solid rgba(168, 85, 247, 0.35);
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(16px);
        }

        label {
          display: block;
          margin-bottom: 8px;
          color: #e2e8f0;
          font-weight: 700;
        }

        input,
        select {
          width: 100%;
          padding: 17px 18px;
          margin-bottom: 22px;
          border-radius: 14px;
          border: 1px solid rgba(148, 163, 184, 0.35);
          background: rgba(15, 23, 42, 0.9);
          color: #fff;
          font-size: 16px;
          outline: none;
        }

        input:focus,
        select:focus {
          border-color: #a855f7;
          box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.15);
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        button {
          padding: 16px 28px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #7c3aed, #c026d3);
          color: #fff;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s;
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(168, 85, 247, 0.35);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .resultadoHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .resultado h2 {
          margin: 0;
          font-size: 30px;
        }

        .copyBtn {
          background: transparent;
          border: 1px solid #a855f7;
          padding: 12px 18px;
        }

        .textoGerado {
          padding: 26px;
          border-radius: 18px;
          background: rgba(2, 6, 23, 0.65);
          border: 1px solid rgba(148, 163, 184, 0.18);
          color: #f8fafc;
          font-size: 18px;
          line-height: 1.7;
          white-space: pre-line;
        }

        .textoGerado p {
          margin: 0 0 14px;
        }

        @media (max-width: 700px) {
          .page {
            padding: 30px 14px;
          }

          .card,
          .resultado {
            padding: 22px;
            border-radius: 20px;
          }

          .grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .resultadoHeader {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero p {
            font-size: 17px;
          }
        }
      `}</style>
    </main>
   </ProtectedRoute>
  );
}