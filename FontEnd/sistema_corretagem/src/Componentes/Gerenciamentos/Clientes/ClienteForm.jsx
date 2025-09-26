import React, { useState, useEffect } from "react";

const initialState = {
  nome: "",
  rg: "",
  cpf: "",
  sexo: "M",
  email: "",
  telefone: "",
  data_nascimento: "",
  estado_civil: "",
  profissao: "",
  renda: "",
  nacionalidade: "",
  data_casamento: "",
  regime_bens: "",
  endereco_attributes: {
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  },
  conjuge_attributes: {
    nome: "",
    data_nascimento: "",
    cpf: "",
    rg: "",
    profissao: "",
    renda: "",
  },
};

function ClienteForm({ clienteSendoEditado, onFormSubmit, onCancelEdit }) {
  const [formData, setFormData] = useState(initialState);
  const [mostrarConjuge, setMostrarConjuge] = useState(false);

  useEffect(() => {
    if (clienteSendoEditado) {
      const temConjuge = !!clienteSendoEditado.conjuge;
      setMostrarConjuge(temConjuge);
      setFormData({
        ...initialState,
        ...clienteSendoEditado,
        data_nascimento:
          clienteSendoEditado.data_nascimento?.split("T")[0] || "",
        data_casamento: clienteSendoEditado.data_casamento?.split("T")[0] || "",
        endereco_attributes: clienteSendoEditado.endereco
          ? { ...clienteSendoEditado.endereco }
          : initialState.endereco_attributes,
        conjuge_attributes: clienteSendoEditado.conjuge
          ? {
              ...clienteSendoEditado.conjuge,
              data_nascimento:
                clienteSendoEditado.conjuge.data_nascimento?.split("T")[0] ||
                "",
            }
          : initialState.conjuge_attributes,
      });
    } else {
      setFormData(initialState);
      setMostrarConjuge(false);
    }
  }, [clienteSendoEditado]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");

    if (keys.length > 1) {
      setFormData((prev) => ({
        ...prev,
        [keys[0]]: { ...prev[keys[0]], [keys[1]]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalFormData = { ...formData };
    if (!mostrarConjuge) {
      delete finalFormData.conjuge_attributes;
    }
    onFormSubmit(finalFormData, clienteSendoEditado?.id);
  };

  return (
    <div className="formulario-container">
      <h2>
        {clienteSendoEditado ? "Editar Cliente" : "Adicionar Novo Cliente"}
      </h2>
      <form onSubmit={handleSubmit}>
        <h3 className="form-section-title">Dados Pessoais</h3>
        <div className="form-grid">
          <label className="grid-col-span-2">
            Nome:{" "}
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleFormChange}
              required
            />
          </label>
          <label className="grid-col-span-1">
            Data de Nascimento:{" "}
            <input
              type="date"
              name="data_nascimento"
              value={formData.data_nascimento}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-2">
            Email:{" "}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
          </label>
          <label className="grid-col-span-1">
            Telefone:{" "}
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-1">
            CPF:{" "}
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleFormChange}
              required
            />
          </label>
          <label className="grid-col-span-1">
            RG:{" "}
            <input
              type="text"
              name="rg"
              value={formData.rg}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-1">
            Sexo:
            <select
              name="sexo"
              value={formData.sexo}
              onChange={handleFormChange}
            >
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </label>
          <label className="grid-col-span-1">
            Nacionalidade:{" "}
            <input
              type="text"
              name="nacionalidade"
              value={formData.nacionalidade}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-1">
            Estado Civil:{" "}
            <input
              type="text"
              name="estado_civil"
              value={formData.estado_civil}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-1">
            Data de Casamento:{" "}
            <input
              type="date"
              name="data_casamento"
              value={formData.data_casamento}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-1">
            Regime de Bens:{" "}
            <input
              type="text"
              name="regime_bens"
              value={formData.regime_bens}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-1">
            Profissão:{" "}
            <input
              type="text"
              name="profissao"
              value={formData.profissao}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-1">
            Renda (R$):{" "}
            <input
              type="number"
              name="renda"
              value={formData.renda}
              onChange={handleFormChange}
            />
          </label>
        </div>

        <h3 className="form-section-title">Endereço</h3>
        <div className="form-grid">
          <label className="grid-col-span-3">
            Logradouro:{" "}
            <input
              type="text"
              name="endereco_attributes.logradouro"
              value={formData.endereco_attributes.logradouro}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-1">
            Número:{" "}
            <input
              type="text"
              name="endereco_attributes.numero"
              value={formData.endereco_attributes.numero}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-2">
            Bairro:{" "}
            <input
              type="text"
              name="endereco_attributes.bairro"
              value={formData.endereco_attributes.bairro}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-2">
            Cidade:{" "}
            <input
              type="text"
              name="endereco_attributes.cidade"
              value={formData.endereco_attributes.cidade}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-2">
            Complemento:{" "}
            <input
              type="text"
              name="endereco_attributes.complemento"
              value={formData.endereco_attributes.complemento}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-1">
            Estado:{" "}
            <input
              type="text"
              name="endereco_attributes.estado"
              value={formData.endereco_attributes.estado}
              onChange={handleFormChange}
              maxLength="2"
            />
          </label>
          <label className="grid-col-span-1">
            CEP:{" "}
            <input
              type="text"
              name="endereco_attributes.cep"
              value={formData.endereco_attributes.cep}
              onChange={handleFormChange}
            />
          </label>
        </div>

        <hr />
        <label>
          <input
            type="checkbox"
            checked={mostrarConjuge}
            onChange={(e) => setMostrarConjuge(e.target.checked)}
          />{" "}
          Adicionar Cônjuge?
        </label>

        {mostrarConjuge && (
          <>
            <h3 className="form-section-title">Dados do Cônjuge</h3>
            <div className="form-grid">
              <label className="grid-col-span-2">
                Nome do Cônjuge:{" "}
                <input
                  type="text"
                  name="conjuge_attributes.nome"
                  value={formData.conjuge_attributes.nome}
                  onChange={handleFormChange}
                />
              </label>
              <label className="grid-col-span-1">
                CPF do Cônjuge:{" "}
                <input
                  type="text"
                  name="conjuge_attributes.cpf"
                  value={formData.conjuge_attributes.cpf}
                  onChange={handleFormChange}
                />
              </label>
              <label className="grid-col-span-2">
                Profissão do Cônjuge:{" "}
                <input
                  type="text"
                  name="conjuge_attributes.profissao"
                  value={formData.conjuge_attributes.profissao}
                  onChange={handleFormChange}
                />
              </label>
              <label className="grid-col-span-1">
                Renda do Cônjuge (R$):{" "}
                <input
                  type="number"
                  name="conjuge_attributes.renda"
                  value={formData.conjuge_attributes.renda}
                  onChange={handleFormChange}
                />
              </label>
            </div>
          </>
        )}

        <button type="submit">
          {clienteSendoEditado ? "Salvar Alterações" : "Salvar Cliente"}
        </button>
        {clienteSendoEditado && (
          <button type="button" onClick={onCancelEdit}>
            Cancelar
          </button>
        )}
      </form>
    </div>
  );
}

export default ClienteForm;
