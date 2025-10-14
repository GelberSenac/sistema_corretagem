// Helpers de moeda para pt-BR
// - formatCurrencyBR: formata números em BRL (R$ 1.234,56)
// - parseCurrencyBR: parseia string com máscara pt-BR para número decimal
// - sanitizeCurrencyInput: remove caracteres inválidos mantendo dígitos e separadores

function toNumber(value: number | string): number {
  if (typeof value === "number") return value;
  const cleaned = String(value)
    .replace(/[^0-9,.-]/g, "") // mantém dígitos e separadores
    .replace(/-/g, ""); // não aceita negativos
  // Troca vírgula por ponto para parseFloat
  const normalized = cleaned.replace(/\./g, "").replace(/,/g, ".");
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}

export function formatCurrencyBR(value: number | string): string {
  const num = toNumber(value);
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
  } catch {
    // Fallback simples se Intl não estiver disponível
    const parts = num.toFixed(2).split(".");
    const inteiro = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `R$ ${inteiro},${parts[1]}`;
  }
}

export function parseCurrencyBR(masked: string): number {
  return toNumber(masked);
}

export function sanitizeCurrencyInput(raw: string): string {
  // Remove tudo que não seja dígito, ponto, vírgula
  return raw.replace(/[^0-9.,]/g, "").replace(/-/g, "");
}

export function formatFromDigits(digits: string): string {
  // Constrói número a partir de dígitos (centavos implícitos) e formata
  const onlyDigits = digits.replace(/\D/g, "");
  const num = parseInt(onlyDigits || "0", 10) / 100; // dois decimais
  return formatCurrencyBR(num);
}