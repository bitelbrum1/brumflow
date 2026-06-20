import { NextResponse } from "next/server";

const PLANOS = {
  basico_mensal: {
    nome: "BrumFlow Básico",
    valor: 29.9,
  },
  premium_mensal: {
    nome: "BrumFlow Premium Mensal",
    valor: 0.5,
  },
  premium_trimestral: {
    nome: "BrumFlow Premium Trimestral",
    valor: 164.7,
  },
};

export async function POST(req) {
  try {
    const { plano, email, userId } = await req.json();

    const planoSelecionado = PLANOS[plano];

    if (!planoSelecionado) {
      return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
    }

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: planoSelecionado.nome,
            quantity: 1,
            currency_id: "BRL",
            unit_price: planoSelecionado.valor,
          },
        ],
        payer: {
          email: email?.trim().toLowerCase(),
        },
        external_reference: `${plano}|${userId}`,
        back_urls: {
          success: "https://brumflow.vercel.app/planos",
          failure: "https://brumflow.vercel.app/planos",
          pending: "https://brumflow.vercel.app/planos",
        },
        auto_return: "approved",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Mercado Pago:", data);
      return NextResponse.json(
        { error: data.message || JSON.stringify(data) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      init_point: data.init_point,
      id: data.id,
    });
  } catch (error) {
    console.error("Erro interno:", error);

    return NextResponse.json(
      { error: error.message || "Erro interno ao criar pagamento." },
      { status: 500 }
    );
  }
}