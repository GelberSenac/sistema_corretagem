// src/componentes/Gerenciamentos/PerfisBusca/PerfilBuscaForm.jsx

import React, { useState, useEffect } from "react";
import CurrencyInput from "../../Shared/CurrencyInput";

// Estado inicial espelhando a estrutura completa da sua tabela
const initialState = {
  titulo_busca: "",
  finalidade: "venda", // Corresponde ao enum 'finalidade' no Rails
  condicao: "", // Corresponde ao enum 'condicao' no Rails
  bairros: [], // Usaremos um array para múltiplos bairros
  valor_maximo_imovel: "",
  quartos_minimo: 0,
  suites_minimo: 0,
  vagas_minimo: 0,
  metragem_minima: 0,
  exige_varanda: false,
};

function PerfilBuscaForm({ perfilSendoEditado, onFormSubmit, onCancelEdit, embedded = false, onFormDataChange }) {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (perfilSendoEditado) {
      // Garante que o estado do formulário seja preenchido corretamente
      const nextState = {
        ...initialState,
        ...perfilSendoEditado,
        // Se 'bairros' for uma string, converte para array para o input
        bairros: Array.isArray(perfilSendoEditado.bairros)
          ? perfilSendoEditado.bairros
          : Array.isArray(perfilSendoEditado.bairro_preferencia)
          ? perfilSendoEditado.bairro_preferencia
          : typeof perfilSendoEditado.bairro_preferencia === "string"
          ? perfilSendoEditado.bairro_preferencia
              .split(",")
              .map((b) => b.trim())
              .filter(Boolean)
          : [],
      };
      const normalizedNextState = {
        ...nextState,
        finalidade:
          typeof nextState.finalidade === "string" && nextState.finalidade
            ? nextState.finalidade
            : initialState.finalidade,
        condicao:
          typeof nextState.condicao === "string"
            ? nextState.condicao
            : "",
      };
      setFormData(normalizedNextState);
      if (embedded && typeof onFormDataChange === "function") {
        onFormDataChange(normalizedNextState);
      }
    } else {
      setFormData(initialState);
      if (embedded && typeof onFormDataChange === "function") {
        onFormDataChange(initialState);
      }
    }
  }, [perfilSendoEditado, embedded]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    let nextState;
    if (name === "bairros") {
      // Transforma a string de bairros separados por vírgula em um array
      nextState = {
        ...formData,
        [name]: value.split(",").map((b) => b.trim()),
      };
    } else {
      nextState = {
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      };
    }
    setFormData(nextState);
    if (embedded && typeof onFormDataChange === "function") {
      onFormDataChange(nextState);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (embedded) return; // No modo embutido, não submitamos aqui
    onFormSubmit(formData, perfilSendoEditado?.id);
  };

  // Usa uma tag dinâmica para evitar <form> dentro de <form> em modo embutido
  const FormTag = embedded ? "div" : "form";

  return (
    <div className="formulario-container" style={{ marginBottom: "30px" }}>
      <h2>
        {perfilSendoEditado
          ? "Editar Perfil de Busca"
          : "Adicionar Novo Perfil"}
      </h2>
      <FormTag
        onSubmit={!embedded ? handleSubmit : undefined}
        className="form-grid"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        <label className="grid-col-span-3">
          Título da Busca (Ex: "Apê perto do trabalho"):
          <input
            type="text"
            name="titulo_busca"
            value={formData.titulo_busca}
            onChange={handleFormChange}
            required
          />
        </label>

        {/* --- MELHORIA: Campos de ENUM agora são <select> --- */}
        <label>
          Finalidade:
          <select
            name="finalidade"
            value={formData.finalidade}
            onChange={handleFormChange}
          >
            <option value="venda">Venda</option>
            <option value="aluguel">Aluguel</option>
          </select>
        </label>

        <label>
          Condição do Imóvel:
          <select
            name="condicao"
            value={formData.condicao}
            onChange={handleFormChange}
          >
            <option value="">Qualquer</option>
            <option value="usado">Usado</option>
            <option value="lancamento">Lançamento</option>
            <option value="em_obras">Em Obras</option>
          </select>
        </label>

        <label>
          Valor Máximo (R$):
          <CurrencyInput
            id="valor_maximo_imovel"
            name="valor_maximo_imovel"
            value={formData.valor_maximo_imovel}
            onChange={(num) => {
              const nextState = { ...formData, valor_maximo_imovel: num };
              setFormData(nextState);
              if (embedded && typeof onFormDataChange === "function") {
                onFormDataChange(nextState);
              }
            }}
          />
        </label>

        <label>
          Bairros (separados por vírgula):
          <input
            type="text"
            name="bairros"
            // Converte o array de volta para uma string para exibição no input
            value={
              Array.isArray(formData.bairros) ? formData.bairros.join(", ") : ""
            }
            onChange={handleFormChange}
            placeholder="Ex: Boa Viagem, Parnamirim"
          />
        </label>

        <label>
          Quartos (mín):
          <input
            type="number"
            name="quartos_minimo"
            value={formData.quartos_minimo}
            onChange={handleFormChange}
            min="0"
          />
        </label>

        <label>
          Vagas (mín):
          <input
            type="number"
            name="vagas_minimo"
            value={formData.vagas_minimo}
            onChange={handleFormChange}
            min="0"
          />
        </label>

        <div
          className="grid-col-span-3"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <input
            type="checkbox"
            name="exige_varanda"
            id="exige_varanda_checkbox"
            checked={formData.exige_varanda}
            onChange={handleFormChange}
          />
          <label htmlFor="exige_varanda_checkbox"> Exige Varanda?</label>
        </div>

        {/* Botões próprios só aparecem quando não está embutido */}
        {!embedded && (
          <div className="form-actions grid-col-span-3">
            <button type="submit">
              {perfilSendoEditado ? "Salvar Alterações" : "Salvar Perfil"}
            </button>
            {perfilSendoEditado && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="cancel-button"
              >
                Cancelar
              </button>
            )}
          </div>
        )}
      </FormTag>
    </div>
  );
}

export default PerfilBuscaForm;
