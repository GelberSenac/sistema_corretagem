import React, { useEffect } from "react";
import { useMask } from "@react-input/mask";
import { toast } from "react-hot-toast";

/**
 * AddressForm
 * Componente compartilhado para blocos de endereço.
 *
 * Props:
 * - address: objeto com {logradouro, numero, complemento, bairro, cidade, estado, cep}
 * - onFieldChange: função para atualizar o estado do formulário do pai.
 *   Espera um objeto semelhante a evento: { target: { name, value } }
 * - gridClass: classe do wrapper de grid (ex.: "form-grid")
 */
export default function AddressForm({
  address = {},
  onFieldChange,
  gridClass = "form-grid",
}) {
  const cepRef = useMask({ mask: "_____-___", replacement: { _: /\d/ } });

  const formatCepDisplay = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  };

  const emitChange = (name, value) => {
    let finalValue = value;
    if (name.endsWith(".estado")) {
      finalValue = (finalValue || "").toUpperCase().slice(0, 2);
    }
    onFieldChange?.({ target: { name, value: finalValue } });
  };

  // ViaCEP: auto-preenchimento quando o CEP tiver 8 dígitos
  useEffect(() => {
    const cepDigits = (address?.cep || "").replace(/\D/g, "");
    if (cepDigits.length === 8) {
      const controller = new AbortController();
      const fetchCep = async () => {
        try {
          const resp = await fetch(
            `https://viacep.com.br/ws/${cepDigits}/json/`,
            { signal: controller.signal },
          );
          const data = await resp.json();
          if (data?.erro) {
            toast.error("CEP não encontrado.");
            return;
          }
          emitChange(
            "endereco_attributes.logradouro",
            data.logradouro || address.logradouro || "",
          );
          emitChange(
            "endereco_attributes.bairro",
            data.bairro || address.bairro || "",
          );
          emitChange(
            "endereco_attributes.cidade",
            data.localidade || address.cidade || "",
          );
          emitChange(
            "endereco_attributes.estado",
            data.uf || address.estado || "",
          );
        } catch (err) {
          if (err.name !== "AbortError") {
            toast.error("Erro ao buscar CEP.");
          }
        }
      };
      fetchCep();
      return () => controller.abort();
    }
  }, [address?.cep]);

  return (
    <div className={gridClass}>
      <label className="grid-col-span-1" htmlFor="endereco_cep">
        CEP:
        <input
          id="endereco_cep"
          type="text"
          name="endereco_attributes.cep"
          ref={cepRef}
          value={formatCepDisplay(address?.cep || "")}
          onChange={(e) => emitChange(e.target.name, e.target.value)}
        />
      </label>
      <label className="grid-col-span-3"></label>

      <label className="grid-col-span-3" htmlFor="endereco_logradouro">
        Logradouro:
        <input
          id="endereco_logradouro"
          type="text"
          name="endereco_attributes.logradouro"
          value={address?.logradouro || ""}
          onChange={(e) => emitChange(e.target.name, e.target.value)}
        />
      </label>
      <label className="grid-col-span-1" htmlFor="endereco_numero">
        Número:
        <input
          id="endereco_numero"
          type="text"
          name="endereco_attributes.numero"
          value={address?.numero || ""}
          onChange={(e) => emitChange(e.target.name, e.target.value)}
        />
      </label>

      <label className="grid-col-span-2" htmlFor="endereco_complemento">
        Complemento:
        <input
          id="endereco_complemento"
          type="text"
          name="endereco_attributes.complemento"
          value={address?.complemento || ""}
          onChange={(e) => emitChange(e.target.name, e.target.value)}
        />
      </label>
      <label className="grid-col-span-2" htmlFor="endereco_bairro">
        Bairro:
        <input
          id="endereco_bairro"
          type="text"
          name="endereco_attributes.bairro"
          value={address?.bairro || ""}
          onChange={(e) => emitChange(e.target.name, e.target.value)}
        />
      </label>

      <label className="grid-col-span-3" htmlFor="endereco_cidade">
        Cidade:
        <input
          id="endereco_cidade"
          type="text"
          name="endereco_attributes.cidade"
          value={address?.cidade || ""}
          onChange={(e) => emitChange(e.target.name, e.target.value)}
        />
      </label>
      <label className="grid-col-span-1" htmlFor="endereco_estado">
        Estado:
        <input
          id="endereco_estado"
          type="text"
          name="endereco_attributes.estado"
          value={address?.estado || ""}
          maxLength={2}
          onChange={(e) => emitChange(e.target.name, e.target.value)}
        />
      </label>
    </div>
  );
}
