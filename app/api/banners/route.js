import OpenAI from "openai";

export async function POST(req) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "OPENROUTER_API_KEY não encontrada na Vercel" },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });

    const { produto, publico, objetivo, tom } = await req.json();

    if (!produto) {
      return Response.json(
        { error: "Produto obrigatório" },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "openrouter/auto",
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
Objetivo: ${objetivo || "venda"}
Tom: ${tom || "profissional"}

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
        error: error?.message || "Erro desconhecido ao gerar banner com IA",
      },
      { status: 500 }
    );
  }
}