import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req) {
  try {
    const { produto, publico, plataforma, tom } = await req.json();

    if (!produto) {
      return NextResponse.json(
        { erro: "Informe o nome do produto." },
        { status: 400 }
      );
    }

    const estruturas = [
      "Faça uma descrição curta, direta e comercial.",
      "Faça uma descrição em formato de anúncio para Instagram.",
      "Faça uma descrição com título, benefícios em tópicos e chamada final.",
      "Faça uma descrição emocional, focada no desejo de compra.",
      "Faça uma descrição profissional para marketplace.",
      "Faça uma descrição premium, sofisticada e elegante.",
    ];

    const estrutura =
      estruturas[Math.floor(Math.random() * estruturas.length)];

    const resposta = await openai.chat.completions.create({
      model: "openrouter/auto",
      temperature: 1.3,
      top_p: 0.95,
      frequency_penalty: 0.9,
      presence_penalty: 0.9,
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em copywriting para vendas online. Gere textos variados, naturais e comerciais.",
        },
        {
          role: "user",
          content: `
Produto: ${produto}
Público-alvo: ${publico || "público geral"}
Plataforma: ${plataforma || "loja online"}
Tom: ${tom || "profissional"}

Estrutura desta geração:
${estrutura}

- Gere uma descrição realmente diferente das anteriores.
- Mude a abertura.
- Mude o tamanho do texto.
- Mude a estrutura da descrição.
- Não invente especificações técnicas.
- Não use sempre as mesmas frases.
- Escreva em português do Brasil.
- Responda somente com a descrição.
- Não use markdown.
- Não use asteriscos.
- Não use símbolos como ** ou ###.
- Não coloque títulos em negrito.
- Não utilize listas em markdown.
- Use texto limpo, elegante e bem organizado.
- Escreva como uma descrição profissional de loja online.

Código aleatório: ${Date.now()}-${Math.random()}
          `,
        },
      ],
    });

    return NextResponse.json({
      descricao: resposta.choices[0].message.content,
    });
  } catch (error) {
    console.error("ERRO OPENROUTER:", error);

    return NextResponse.json(
      {
        erro: "Erro ao gerar descrição com IA",
        detalhe: error.message,
      },
      { status: 500 }
    );
  }
}