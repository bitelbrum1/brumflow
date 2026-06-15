"use client";

import { useState } from "react";
import Link from "next/link";

export default function Artes() {
  const [produto, setProduto] = useState("");
  const [texto, setTexto] = useState("");
  const [formato, setFormato] = useState("1024x1024");
  const [estilo, setEstilo] = useState("premium moderno");
  const [imagem, setImagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function gerarArte(e) {
    e.preventDefault();

    if (!produto || !texto) {
      alert("Preencha produto e texto principal");
      return;
    }

    setCarregando(true);
    setImagem("");

    try {
      const resposta = await fetch("/api/artes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          produto,
          texto,
          formato,
          estilo,
        }),
      });

      const textoResposta = await resposta.text();

let data;

try {
  data = JSON.parse(textoResposta);
} catch {
  throw new Error("A rota /api/artes não retornou JSON. Verifique se app/api/artes/route.js existe.");
}

      if (!resposta.ok) {
        throw new Error(data.error || "Erro ao gerar imagem");
      }

      setImagem(data.imagem);
    } catch (error) {
      alert(error.message);
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
          <span>🎨 Criador de Artes IA</span>
          <h1>Gere imagens para posts, stories e banners</h1>
          <p>Crie artes prontas para redes sociais usando inteligência artificial.</p>
        </div>

        <section className="bannerGrid">
          <form onSubmit={gerarArte} className="bannerForm">
            <label>Produto ou serviço</label>
            <input
              placeholder="Ex: Casaco Tactel Feminino"
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
            />

            <label>Texto principal da arte</label>
            <input
              placeholder="Ex: Promoção Especial"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />

            <label>Formato</label>
            <select value={formato} onChange={(e) => setFormato(e.target.value)}>
  <option value="post">Post Instagram 1:1</option>
  <option value="story">Story/Reels 9:16</option>
  <option value="banner">Banner horizontal 16:9</option>
</select>

            <label>Estilo visual</label>
            <select value={estilo} onChange={(e) => setEstilo(e.target.value)}>
              <option>premium moderno</option>
              <option>luxo roxo e rosa</option>
              <option>minimalista elegante</option>
              <option>promoção chamativa</option>
              <option>tecnológico futurista</option>
            </select>

            <button type="submit" disabled={carregando}>
              {carregando ? "Gerando imagem..." : "Gerar arte com IA"}
            </button>
          </form>

          <div className="bannerResult">
            <h2>Prompt Gerado</h2>

            {imagem ? (
  <div className="imagePreview">
    <img
      src={imagem}
      alt="Arte gerada por IA"
      onError={() => {
        alert("A geração gratuita está em fila ou no limite. Aguarde alguns minutos e tente novamente.");
        setImagem("");
      }}
    />

    <a href={imagem} target="_blank" className="primaryBtn">
      Abrir imagem
    </a>
  </div>
) : (
  <div className="emptyResult">
    <strong>Sua arte aparecerá aqui</strong>
    <p>A IA vai gerar uma imagem pronta para divulgação.</p>
  </div>
)}
          </div>
        </section>
      </div>
    </main>
  );
}