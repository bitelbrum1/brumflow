import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function dadosDoPlano(externalReference) {
  if (externalReference === "basico_mensal") {
    return {
      plano: "basico",
      tipo_assinatura: "mensal",
      valor: 29.9,
      meses_restantes: 1,
    };
  }

  if (externalReference === "premium_mensal") {
    return {
      plano: "premium",
      tipo_assinatura: "mensal",
      valor: 0.5,
      meses_restantes: 1,
    };
  }

  if (externalReference === "premium_trimestral") {
    return {
      plano: "premium",
      tipo_assinatura: "trimestral",
      valor: 164.7,
      meses_restantes: 3,
    };
  }

  return null;
}

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("Webhook Mercado Pago:", body);

    const paymentId = body.data?.id || body.id;

    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    const pagamentoResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );

    const pagamento = await pagamentoResponse.json();

    console.log("Pagamento Mercado Pago:", pagamento);

    if (pagamento.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    const planoDados = dadosDoPlano(pagamento.external_reference);

    if (!planoDados) {
      return NextResponse.json({ ok: true });
    }

    const email = pagamento.payer?.email;

    if (!email) {
      return NextResponse.json({ ok: true });
    }

    const { data: usersData, error: usersError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error("Erro ao listar usuários:", usersError);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const usuario = usersData.users.find((user) => user.email === email);

    if (!usuario) {
      console.error("Usuário não encontrado:", email);
      return NextResponse.json({ ok: true });
    }

    const proximaCobranca = new Date();
    proximaCobranca.setMonth(proximaCobranca.getMonth() + 1);

    const { error } = await supabaseAdmin
      .from("assinaturas")
      .upsert(
        {
          user_id: usuario.id,
          email,
          nome: usuario.user_metadata?.name || email.split("@")[0],
          plano: planoDados.plano,
          tipo_assinatura: planoDados.tipo_assinatura,
          meses_restantes: planoDados.meses_restantes,
          valor: planoDados.valor,
          status: "ativo",
          mercado_pago_id: String(pagamento.id),
          proxima_cobranca: proximaCobranca.toISOString().slice(0, 10),
        },
        {
          onConflict: "user_id",
        }
      );

    if (error) {
      console.error("Erro ao atualizar Supabase:", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro no webhook:", error);

    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}