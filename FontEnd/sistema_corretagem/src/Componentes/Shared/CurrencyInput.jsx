import React from 'react';

function truncateToTwoDecimals(num) {
  if (typeof num !== 'number' || isNaN(num)) return '';
  const abs = Math.abs(num);
  return Math.floor(abs * 100) / 100;
}

function parseCurrencyToNumber(text) {
  const s = String(text ?? '').trim();
  if (!s) return '';

  // Caso 1: string numérica "pura" (ex.: "280350.7" ou "-280350.7") => parse direto, bloquear negativos e truncar
  if (/^[+-]?\d+(\.\d+)?$/.test(s)) {
    const n = Math.abs(Number(s));
    const t = truncateToTwoDecimals(n);
    return t === '' ? '' : t;
  }

  // Caso 2: formato pt-BR com separadores e/ou prefixo (ex.: "R$ 280.350,70")
  // Bloqueia negativos removendo o sinal
  if (s.includes(',') || /\D/.test(s)) {
    const normalized = s
      .replace(/[\-]/g, '') // remove sinal negativo
      .replace(/[^\d.,]/g, '') // mantém apenas dígitos, vírgula e ponto
      .replace(/\./g, '') // remove separadores de milhar
      .replace(',', '.'); // converte decimal pt-BR para ponto
    const n = parseFloat(normalized);
    const t = truncateToTwoDecimals(n);
    return t === '' ? '' : t;
  }

  // Caso 3: fallback para somente dígitos => divide por 100 (ex.: "28035070") e truncar
  const digits = s.replace(/[^\d]/g, '');
  if (!digits) return '';
  const num = parseFloat(digits) / 100;
  const t = truncateToTwoDecimals(num);
  return t === '' ? '' : t;
}

function formatCurrencyBR(value) {
  if (value === '' || value === null || value === undefined) return '';
  const num = typeof value === 'number' ? truncateToTwoDecimals(value) : parseCurrencyToNumber(value);
  if (num === '' || isNaN(num)) return '';
  return Number(num).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CurrencyInput({ id, name, value, onChange, readOnly = false, required = false, disabled = false, className }) {
  const handleChange = (e) => {
    const raw = e.target.value;
    const num = parseCurrencyToNumber(raw);
    onChange && onChange(num);
  };

  const displayValue = formatCurrencyBR(value);

  return (
    <input
      id={id}
      name={name}
      type="text"
      className={className ? className + ' input-base' : 'input-base'}
      value={displayValue}
      onChange={handleChange}
      readOnly={readOnly}
      required={required}
      disabled={disabled}
      inputMode="numeric"
    />
  );
}

export { formatCurrencyBR, parseCurrencyToNumber };