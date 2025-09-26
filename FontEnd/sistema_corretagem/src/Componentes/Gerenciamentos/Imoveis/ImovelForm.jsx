import React, { useState, useEffect } from "react";

const initialState = {
  nome_empreendimento: "",
  tipo: "apartamento",
  finalidade: "venda",
  condicao: "usado",
  descricao: "",
  quartos: 0,
  suites: 0,
  banheiros: 0,
  vagas_garagem: 0,
  metragem: 0,
  ano_construcao: "",
  valor: "",
  valor_condominio: "",
  valor_iptu: "",
  comodidades: [],
  status: "disponivel",
  endereco_attributes: {
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  },
};

function ImovelForm({ imovelSendoEditado, onFormSubmit, onCancelEdit }) {
  const [formData, setFormData] = useState(initialState);
  const [selectedFiles, setSelectedFiles] = useState(null);

  useEffect(() => {
    if (imovelSendoEditado) {
      // Garante que todos os campos, especialmente os aninhados, sejam preenchidos
      const initialData = {
        ...initialState,
        ...imovelSendoEditado,
        comodidades: imovelSendoEditado.comodidades || [],
        endereco_attributes: imovelSendoEditado.endereco
          ? { ...imovelSendoEditado.endereco }
          : initialState.endereco_attributes,
      };
      setFormData(initialData);
      setSelectedFiles(null);
    } else {
      setFormData(initialState);
    }
  }, [imovelSendoEditado]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => {
        const comodidadesAtuais = prev.comodidades || [];
        if (checked) {
          return { ...prev, comodidades: [...comodidadesAtuais, name] };
        } else {
          return {
            ...prev,
            comodidades: comodidadesAtuais.filter((c) => c !== name),
          };
        }
      });
      return;
    }
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

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    // Lógica para construir o FormData (já estava correta)
    Object.keys(formData).forEach((key) => {
      if (["endereco", "photos_urls", "corretor", "comodidades"].includes(key))
        return;
      if (typeof formData[key] === "object" && formData[key] !== null) {
        Object.keys(formData[key]).forEach((subKey) => {
          dataToSend.append(
            `imovel[${key}][${subKey}]`,
            formData[key][subKey] || "",
          );
        });
      } else {
        dataToSend.append(`imovel[${key}]`, formData[key] || "");
      }
    });
    (formData.comodidades || []).forEach((comodidade) => {
      dataToSend.append("imovel[comodidades][]", comodidade);
    });
    if (selectedFiles) {
      Array.from(selectedFiles).forEach((file) => {
        dataToSend.append("imovel[photos][]", file);
      });
    }
    onFormSubmit(dataToSend, imovelSendoEditado?.id);
  };

  return (
    <div className="formulario-container">
      <h2>{imovelSendoEditado ? "Editar Imóvel" : "Adicionar Novo Imóvel"}</h2>
      <form onSubmit={handleSubmit}>
        <h3 className="form-section-title">Informações Principais</h3>
        <div className="form-grid">
          <label className="grid-col-span-4">
            Nome do Empreendimento:
            <input
              type="text"
              name="nome_empreendimento"
              value={formData.nome_empreendimento}
              onChange={handleFormChange}
              required
            />
          </label>
          <label className="grid-col-span-2">
            Tipo:
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleFormChange}
            >
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="terreno">Terreno</option>
              <option value="flat">Flat</option>
              <option value="cobertura">Cobertura</option>
              <option value="kitnet">Kitnet</option>
            </select>
          </label>
          <label className="grid-col-span-1">
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
          <label className="grid-col-span-1">
            Condição:
            <select
              name="condicao"
              value={formData.condicao}
              onChange={handleFormChange}
            >
              <option value="usado">Usado</option>
              <option value="lancamento">Lançamento</option>
              <option value="em_obras">Em Obras</option>
            </select>
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

        <h3 className="form-section-title">Características</h3>
        <div className="form-grid">
          <label className="grid-col-span-1">
            Quartos:{" "}
            <input
              type="number"
              name="quartos"
              value={formData.quartos}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-1">
            Suítes:{" "}
            <input
              type="number"
              name="suites"
              value={formData.suites}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-1">
            Banheiros:{" "}
            <input
              type="number"
              name="banheiros"
              value={formData.banheiros}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-1">
            Vagas:{" "}
            <input
              type="number"
              name="vagas_garagem"
              value={formData.vagas_garagem}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-2">
            Metragem (m²):{" "}
            <input
              type="number"
              name="metragem"
              value={formData.metragem}
              onChange={handleFormChange}
            />
          </label>
          <label className="grid-col-span-2">
            Ano de Construção:{" "}
            <input
              type="number"
              name="ano_construcao"
              value={formData.ano_construcao}
              onChange={handleFormChange}
            />
          </label>
        </div>

        <h3 className="form-section-title">Valores</h3>
        <div className="form-grid">
          <label className="grid-col-span-1">
            Valor (R$):{" "}
            <input
              type="number"
              name="valor"
              value={formData.valor}
              onChange={handleFormChange}
              required
              step="0.01"
            />
          </label>
          <label className="grid-col-span-1">
            Condomínio (R$):{" "}
            <input
              type="number"
              name="valor_condominio"
              value={formData.valor_condominio}
              onChange={handleFormChange}
              step="0.01"
            />
          </label>
          <label className="grid-col-span-2">
            IPTU (R$):{" "}
            <input
              type="number"
              name="valor_iptu"
              value={formData.valor_iptu}
              onChange={handleFormChange}
              step="0.01"
            />
          </label>
        </div>

        <h3 className="form-section-title">Comodidades</h3>
        <div className="comodidades-grid">
          <label>
            <input
              type="checkbox"
              name="Piscina"
              checked={formData.comodidades.includes("Piscina")}
              onChange={handleFormChange}
            />{" "}
            Piscina
          </label>
          <label>
            <input
              type="checkbox"
              name="Churrasqueira"
              checked={formData.comodidades.includes("Churrasqueira")}
              onChange={handleFormChange}
            />{" "}
            Churrasqueira
          </label>
          <label>
            <input
              type="checkbox"
              name="Academia"
              checked={formData.comodidades.includes("Academia")}
              onChange={handleFormChange}
            />{" "}
            Academia
          </label>
          <label>
            <input
              type="checkbox"
              name="Playground"
              checked={formData.comodidades.includes("Playground")}
              onChange={handleFormChange}
            />{" "}
            Playground
          </label>
          <label>
            <input
              type="checkbox"
              name="Portaria 24h"
              checked={formData.comodidades.includes("Portaria 24h")}
              onChange={handleFormChange}
            />{" "}
            Portaria 24h
          </label>
          <label>
            <input
              type="checkbox"
              name="Salão de Festas"
              checked={formData.comodidades.includes("Salão de Festas")}
              onChange={handleFormChange}
            />{" "}
            Salão de Festas
          </label>
        </div>

        <label style={{ marginTop: "20px" }}>
          Fotos do Imóvel:{" "}
          <input type="file" multiple onChange={handleFileChange} />
        </label>
        <button type="submit">Salvar Imóvel</button>
        {imovelSendoEditado && (
          <button type="button" onClick={onCancelEdit}>
            Cancelar
          </button>
        )}
      </form>
    </div>
  );
}

export default ImovelForm;
