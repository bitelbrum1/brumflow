import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();

    const paymentId =
      body?.data?.id ||
      body?.id;

    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    const resposta = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );

    const pagamento = await resposta.json();

    if (pagamento.status !== "approved") {
      return NextResponse.json({ ok: true, status: pagamento.status });
    }

    const externalReference = pagamento.external_reference;

    if (!externalReference || !externalReference.includes("|")) {
      console.error("external_reference inválido:", externalReference);
      return NextResponse.json({ ok: false });
    }

    const [plano, userId] = externalReference.split("|");

    const valor = pagamento.transaction_amount || 0;
    const email = pagamento.payer?.email || null;
    const mercadoPagoId = String(pagamento.id);

    const agora = new Date();
    const expiraEm = new Date();
    expiraEm.setMonth(expiraEm.getMonth() + 1);

    const { error } = await supabaseAdmin
      .from("assinaturas")
      .upsert(
        {
          user_id: userId,
          plano: plano,
          status: "ativo",
          mercado_pago_id: mercadoPagoId,
          inicio_em: agora.toISOString(),
          expira_em: expiraEm.toISOString(),
          email: email,
          tipo_assinatura: "mensal",
          meses_restantes: 1,
          valor: valor,
          proxima_cobranca: expiraEm.toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (error) {
      console.error("Erro ao atualizar assinatura:", error);
      return NextResponse.json({ ok: false, error: error.message });
    }

    return NextResponse.json({
      ok: true,
      message: "Assinatura liberada com sucesso",
      userId,
      plano,
    });
  } catch (error) {
    console.error("Erro no webhook Mercado Pago:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}