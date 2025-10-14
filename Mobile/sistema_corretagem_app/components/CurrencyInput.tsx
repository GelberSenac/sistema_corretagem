import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { TextInput, TextInputProps } from "react-native";
import { formatFromDigits, sanitizeCurrencyInput } from "../constants/currency";

export type CurrencyInputRef = TextInput;

export type CurrencyInputProps = Omit<TextInputProps, "value" | "onChangeText"> & {
  value?: number | string;
  onValueChange?: (value: number) => void;
  onChangeText?: (masked: string) => void;
};

function toDigitsFromValue(value?: number | string): string {
  if (value === undefined || value === null) return "";
  const num = typeof value === "number" ? value : Number(String(value).replace(/[^0-9,.-]/g, "").replace(/-/g, "").replace(/\./g, "").replace(/,/g, "."));
  const safe = isNaN(num) ? 0 : Math.max(0, num);
  return Math.round(safe * 100).toString();
}

export const CurrencyInput = forwardRef<CurrencyInputRef, CurrencyInputProps>(
  ({ value, onValueChange, onChangeText, keyboardType = "numeric", ...props }, ref) => {
    const [digits, setDigits] = useState<string>(() => toDigitsFromValue(value));

    useImperativeHandle(ref, () => inputRef.current as TextInput);

    const inputRef = React.useRef<TextInput>(null);

    useEffect(() => {
      // Atualiza estado interno quando value externo muda
      const next = toDigitsFromValue(value);
      if (next !== digits) setDigits(next);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const masked = useMemo(() => formatFromDigits(digits), [digits]);

    function handleChangeText(raw: string) {
      const sanitized = sanitizeCurrencyInput(raw);
      const onlyDigits = sanitized.replace(/\D/g, "");
      setDigits(onlyDigits);
      const numericValue = (parseInt(onlyDigits || "0", 10) || 0) / 100;
      onValueChange?.(numericValue);
      onChangeText?.(formatFromDigits(onlyDigits));
    }

    return (
      <TextInput
        ref={inputRef}
        value={masked}
        onChangeText={handleChangeText}
        keyboardType={keyboardType}
        inputMode={keyboardType === "numeric" ? "numeric" : undefined}
        {...props}
      />
    );
  }
);

export default CurrencyInput;