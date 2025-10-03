// src/componentes/Gerenciamentos/PerfisBusca/PerfilBuscaForm.jsx

import React, { useState, useEffect } from "react";

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

function PerfilBuscaForm({ perfilSendoEditado, onFormSubmit, onCancelEdit }) {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (perfilSendoEditado) {
      // Garante que o estado do formulário seja preenchido corretamente
      setFormData({
        ...initialState,
        ...perfilSendoEditado,
        // Se 'bairros' for uma string, converte para array para o input
        bairros: Array.isArray(perfilSendoEditado.bairros)
          ? perfilSendoEditado.bairros
          : (perfilSendoEditado.bairro_preferencia || "")
              .split(",")
              .map((b) => b.trim()),
      });
    } else {
      setFormData(initialState);
    }
  }, [perfilSendoEditado]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "bairros") {
      // Transforma a string de bairros separados por vírgula em um array
      setFormData((prev) => ({
        ...prev,
        [name]: value.split(",").map((b) => b.trim()),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit(formData, perfilSendoEditado?.id);
  };

  return (
    <div className="formulario-container" style={{ marginBottom: "30px" }}>
      <h2>
        {perfilSendoEditado
          ? "Editar Perfil de Busca"
          : "Adicionar Novo Perfil"}
      </h2>
      <form
        onSubmit={handleSubmit}
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
          <input
            type="number"
            name="valor_maximo_imovel"
            value={formData.valor_maximo_imovel}
            onChange={handleFormChange}
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
      </form>
    </div>
  );
}

export default PerfilBuscaForm;
