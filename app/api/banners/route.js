import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return Response.json(
        { error: "OPENROUTER_API_KEY não encontrada no .env.local" },
        { status: 500 }
      );
    }

    const { produto, publico, objetivo, tom } = await req.json();

    if (!produto) {
      return Response.json(
        { error: "Produto obrigatório" },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "openrouter/free",
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em copywriting para banners, anúncios e vendas online.",
        },
        {
          role: "user",
         content: `
Crie textos profissionais para um banner comercial.

Produto ou serviço: ${produto}
Público-alvo: ${publico || "público geral"}
Objetivo: ${objetivo}
Tom: ${tom}

Regras importantes:
- Não invente características técnicas.
- Não diga motor, turbo, ano, potência, versão, garantia, preço ou condição se o usuário não informou.
- Se for veículo, não afirme detalhes mecânicos sem confirmação.
- Foque em desejo, oportunidade, aparência, conforto, praticidade e chamada comercial.
- Gere também hashtags coerentes com o produto.
- Responda em português do Brasil.
- Não use markdown.
- Não use asteriscos.

Formato obrigatório:

Título principal:
Subtítulo:
Chamada curta:
Texto de apoio:
Botão CTA:
Legenda para post:
Hashtags:
3 variações extras de chamada:

Formato:
Título principal:
Subtítulo:
Chamada curta:
Texto de apoio:
Botão CTA:
3 variações extras:
          `,
        },
      ],
    });

    const resultado =
      completion.choices?.[0]?.message?.content ||
      "Não foi possível gerar o conteúdo.";

    return Response.json({ resultado });
  } catch (error) {
    console.error("ERRO API BANNERS:", error);

    return Response.json(
      {
        error:
          error?.message || "Erro desconhecido ao gerar banner com IA",
      },
      { status: 500 }
    );
  }
}