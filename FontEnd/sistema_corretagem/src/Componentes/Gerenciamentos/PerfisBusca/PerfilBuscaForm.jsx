import React, { useState, useEffect } from "react";

const initialState = {
  titulo_busca: "",
  tipo_negocio: "venda",
  condicao_imovel: "",
  bairro_preferencia: "",
  valor_maximo_imovel: "",
  valor_entrada_disponivel: "",
  renda_minima_exigida: "",
  quartos_minimo: 0,
  suites_minimo: 0,
  banheiros_minimo: 0,
  vagas_minimo: 0,
  metragem_minima: 0,
  exige_varanda: false,
};

function PerfilBuscaForm({ perfilSendoEditado, onFormSubmit, onCancelEdit }) {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (perfilSendoEditado) {
      setFormData({ ...initialState, ...perfilSendoEditado });
    } else {
      setFormData(initialState);
    }
  }, [perfilSendoEditado]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit(formData, perfilSendoEditado?.id);
    setFormData(initialState); // Limpa o formulário
  };

  return (
    <div className="formulario-container">
      <h2>
        {perfilSendoEditado
          ? "Editar Perfil de Busca"
          : "Adicionar Novo Perfil de Busca"}
      </h2>
      <form onSubmit={handleSubmit}>
        <label>
          Título da Busca (Ex: "Apartamento para alugar perto do centro"):
          <input
            type="text"
            name="titulo_busca"
            value={formData.titulo_busca}
            onChange={handleFormChange}
            required
          />
        </label>
        <div className="form-group-row">
          <label>
            Tipo de Negócio:
            <select
              name="tipo_negocio"
              value={formData.tipo_negocio}
              onChange={handleFormChange}
            >
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </select>
          </label>
          <label>
            Bairro de Preferência:
            <input
              type="text"
              name="bairro_preferencia"
              value={formData.bairro_preferencia}
              onChange={handleFormChange}
            />
          </label>
        </div>
        <div className="form-group-row">
          <label>
            Valor Máximo do Imóvel:{" "}
            <input
              type="number"
              name="valor_maximo_imovel"
              value={formData.valor_maximo_imovel}
              onChange={handleFormChange}
            />
          </label>
          <label>
            Nº de Quartos (mínimo):{" "}
            <input
              type="number"
              name="quartos_minimo"
              value={formData.quartos_minimo}
              onChange={handleFormChange}
            />
          </label>
        </div>
        {/* Adicione aqui outros inputs para os campos restantes: metragem, vagas, etc. */}
        <label>
          Exige Varanda?
          <input
            type="checkbox"
            name="exige_varanda"
            checked={formData.exige_varanda}
            onChange={handleFormChange}
          />
        </label>

        <button type="submit">
          {perfilSendoEditado ? "Salvar Alterações" : "Salvar Perfil"}
        </button>
        {perfilSendoEditado && (
          <button type="button" onClick={onCancelEdit}>
            Cancelar
          </button>
        )}
      </form>
    </div>
  );
}

export default PerfilBuscaForm;
