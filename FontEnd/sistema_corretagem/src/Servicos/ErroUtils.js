// Utilitários genéricos de erro e normalização de texto

// Formata erros vindos do backend (Rails/ActiveModel) para texto amigável
export function formatApiErrors(err) {
  try {
    const status = err?.response?.status;
    const data = err?.response?.data;

    if (status === 403) return "Você não tem permissão para realizar esta ação.";
    if (status === 500) return "Erro interno no servidor. Tente novamente mais tarde.";

    if (!data) return "Ocorreu um erro ao processar a solicitação.";
    if (typeof data === "string") return data;
    if (typeof data === "object") {
      const mensagens = Object.entries(data).map(([campo, msgs]) => {
        const textoMsgs = Array.isArray(msgs) ? msgs.join(", ") : String(msgs);
        const campoLabel = campo
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return `${campoLabel}: ${textoMsgs}`;
      });
      return `Verifique os dados: ${mensagens.join("; ")}`;
    }
    return "Erro inesperado ao processar a solicitação.";
  } catch (_) {
    return "Ocorreu um erro ao processar a solicitação.";
  }
}

// Normaliza texto: trim + colapso de múltiplos espaços
export function normalizeText(value) {
  if (typeof value !== "string") return value;
  return value.trim().replace(/\s+/g, " ");
}