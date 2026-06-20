import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function liberarPlano(paymentId) {
  const resposta = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
    }
  );

  const pagamento = await resposta.json();

  console.log("PAGAMENTO MP:", pagamento);

  if (pagamento.status !== "approved") {
    return { ok: true, status: pagamento.status };
  }

  const externalReference = pagamento.external_reference;

  if (!externalReference || !externalReference.includes("|")) {
    return {
      ok: false,
      erro: "external_reference inválido",
      externalReference,
    };
  }

const [planoRecebido, userId] = externalReference.split("|");

let plano = "premium";

if (planoRecebido === "basico_mensal") {
  plano = "basico";
}

if (planoRecebido === "premium_trimestral") {
  plano = "premium_trimestral";
}

const plano =
  planoRecebido === "basico_mensal" ? "premium_mensal" : "premium_trimestral";

  const agora = new Date();
  const expiraEm = new Date();
  expiraEm.setMonth(expiraEm.getMonth() + 1);

  const { error } = await supabaseAdmin
  .from("assinaturas")
  .upsert(
    {
      user_id: userId,
      plano,
      status: "ativo",
      mercado_pago_id: String(pagamento.id),
      email: pagamento.payer?.email || null,
      valor: pagamento.transaction_amount || 0
    },
    {
      onConflict: "user_id",
    }
  );

  if (error) {
    console.error("ERRO SUPABASE:", error);
    return { ok: false, erro: error.message };
  }

  return { ok: true, plano, userId };
}

export async function POST(req) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    console.log("WEBHOOK POST BODY:", body);
    console.log("WEBHOOK POST URL:", req.url);

    const paymentId =
      body?.data?.id ||
      body?.id ||
      url.searchParams.get("data.id") ||
      url.searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json({ ok: true, aviso: "sem paymentId" });
    }

    const resultado = await liberarPlano(paymentId);

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("ERRO WEBHOOK POST:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);

    console.log("WEBHOOK GET URL:", req.url);

    const paymentId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json({ ok: true, aviso: "sem paymentId GET" });
    }

    const resultado = await liberarPlano(paymentId);

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("ERRO WEBHOOK GET:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}