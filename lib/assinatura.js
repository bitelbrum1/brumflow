import { supabase } from "./supabase";

export async function buscarOuCriarAssinatura(user) {
  if (!user) return null;

  const { data: assinaturaExistente, error } = await supabase
    .from("assinaturas")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar assinatura:", error);
    return null;
  }

  if (assinaturaExistente) {
    return assinaturaExistente;
  }

  return null;
}