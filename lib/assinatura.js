import { supabase } from "./supabaseClient";

export async function buscarOuCriarAssinatura(userId) {
  if (!userId) return null;

  const { data: assinaturaExistente, error } = await supabase
    .from("assinaturas")
    .select("*")
    .eq("user_id", userId)
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