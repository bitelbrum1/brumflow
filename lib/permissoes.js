export const permissoesPorPlano = {
  sem_plano: [],

  basico: [
    "ia-produtos",
    "criador-titulos",
    
  ],

  premium: [
    "ia-produtos",
    "criador-titulos",
    "financeiro",
    "estoque",
    "agendamento",
    "clientes",
    "dashboard",
    "whatsapp-ia",
    "nota-fiscal",
  ],
};

export function temPermissao(plano, recurso) {
  if (!plano) return false;

  return (
    permissoesPorPlano[plano] &&
    permissoesPorPlano[plano].includes(recurso)
  );
}