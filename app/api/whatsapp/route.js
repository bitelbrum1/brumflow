import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req) {
  try {
    const { mensagem, tom, negocio } = await req.json();

    if (!mensagem) {
      return Response.json(
        { erro: "Mensagem do cliente é obrigatória." },
        { status: 400 }
      );
    }

    const resposta = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Você é um atendente profissional de WhatsApp para um negócio chamado ${negocio || "BrumFlow"}.

Responda sempre em português do Brasil.
Seja direto, educado, vendedor e humano.
Não use markdown.
Não use asteriscos.
Não invente informações específicas como preço, prazo ou estoque se o usuário não informou.
Quando fizer sentido, finalize incentivando o cliente a continuar a conversa.
Tom da resposta: ${tom || "profissional"}.
          `,
        },
        {
          role: "user",
          content: mensagem,
        },
      ],
      temperature: 0.8,
      max_tokens: 350,
    });

    return Response.json({
      resposta: resposta.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { erro: "Erro ao gerar resposta inteligente." },
      { status: 500 }
    );
  }
}