// src/componentes/Gerenciamentos/Imoveis/ImovelForm.jsx

import React, { useState, useEffect } from "react";
import { getCaracteristicas } from "../../../Servicos/Api"; // Função que precisa estar no seu Api.js
import { useMask } from "@react-input/mask";

// Estado inicial completo e alinhado com o backend
const initialState = {
  nome_empreendimento: "",
  tipo: "apartamento",
  finalidade: "venda",
  condicao: "usado",
  posicao_solar: "",
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
  status: "disponivel",
  caracteristica_ids: [],
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

const ufs = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

function ImovelForm({ imovelSendoEditado, onFormSubmit, onCancelEdit }) {
  const [formData, setFormData] = useState(initialState);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [allCaracteristicas, setAllCaracteristicas] = useState([]);

  const cepRef = useMask({ mask: "_____-___", replacement: { _: /\d/ } });

  useEffect(() => {
    const fetchCaracteristicas = async () => {
      try {
        const response = await getCaracteristicas();
        setAllCaracteristicas(response.data);
      } catch (error) {
        console.error("Erro ao buscar características:", error);
      }
    };
    fetchCaracteristicas();
  }, []);

  useEffect(() => {
    if (imovelSendoEditado) {
      setFormData({
        ...initialState,
        ...imovelSendoEditado,
        caracteristica_ids:
          imovelSendoEditado.caracteristicas?.map((c) => c.id) || [],
        endereco_attributes: imovelSendoEditado.endereco
          ? { ...imovelSendoEditado.endereco }
          : initialState.endereco_attributes,
      });
      setSelectedFiles(null);
    } else {
      setFormData(initialState);
    }
  }, [imovelSendoEditado]);

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

  const handleCaracteristicaChange = (e) => {
    const { value, checked } = e.target;
    const id = parseInt(value, 10);
    setFormData((prev) => {
      const idsAtuais = prev.caracteristica_ids || [];
      if (checked) {
        return { ...prev, caracteristica_ids: [...idsAtuais, id] };
      } else {
        return {
          ...prev,
          caracteristica_ids: idsAtuais.filter((i) => i !== id),
        };
      }
    });
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (
        ["endereco", "caracteristicas", "photos_urls", "corretor"].includes(key)
      )
        return;
      if (key === "caracteristica_ids") {
        (formData.caracteristica_ids || []).forEach((id) =>
          dataToSend.append("imovel[caracteristica_ids][]", id),
        );
      } else if (key === "endereco_attributes") {
        Object.keys(formData[key]).forEach((subKey) =>
          dataToSend.append(
            `imovel[${key}][${subKey}]`,
            formData[key][subKey] || "",
          ),
        );
      } else {
        dataToSend.append(`imovel[${key}]`, formData[key] || "");
      }
    });
    if (selectedFiles) {
      Array.from(selectedFiles).forEach((file) =>
        dataToSend.append("imovel[photos][]", file),
      );
    }
    onFormSubmit(dataToSend, imovelSendoEditado?.id);
  };

  return (
    <div className="formulario-container">
      <h2>{imovelSendoEditado ? "Editar Imóvel" : "Adicionar Novo Imóvel"}</h2>
      <form onSubmit={handleSubmit}>
        <h3 className="form-section-title">Informações Principais</h3>
        <div className="form-grid">
          <label className="grid-col-span-3">
            Nome do Empreendimento:
            <input
              type="text"
              name="nome_empreendimento"
              value={formData.nome_empreendimento}
              onChange={handleFormChange}
              required
            />
          </label>
          <label>
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
        <label>
          Descrição:
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleFormChange}
            rows="4"
          ></textarea>
        </label>

        <h3 className="form-section-title">Endereço</h3>
        <div className="form-grid">
          <label className="grid-col-span-2">
            Logradouro:
            <input
              type="text"
              name="endereco_attributes.logradouro"
              value={formData.endereco_attributes.logradouro}
              onChange={handleFormChange}
            />
          </label>
          <label>
            Número:
            <input
              type="text"
              name="endereco_attributes.numero"
              value={formData.endereco_attributes.numero}
              onChange={handleFormChange}
            />
          </label>
          <label>
            Complemento:
            <input
              type="text"
              name="endereco_attributes.complemento"
              value={formData.endereco_attributes.complemento}
              onChange={handleFormChange}
            />
          </label>
          <label>
            Bairro:
            <input
              type="text"
              name="endereco_attributes.bairro"
              value={formData.endereco_attributes.bairro}
              onChange={handleFormChange}
            />
          </label>
          <label>
            Cidade:
            <input
              type="text"
              name="endereco_attributes.cidade"
              value={formData.endereco_attributes.cidade}
              onChange={handleFormChange}
            />
          </label>
          <label>
            Estado:
            <select
              name="endereco_attributes.estado"
              value={formData.endereco_attributes.estado}
              onChange={handleFormChange}
            >
              <option value="">UF</option>
              {ufs.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </label>
          <label>
            CEP:
            <input
              ref={cepRef}
              type="text"
              name="endereco_attributes.cep"
              value={formData.endereco_attributes.cep}
              onChange={handleFormChange}
            />
          </label>
        </div>

        <h3 className="form-section-title">Características do Imóvel</h3>
        <div className="form-grid">
          <label>
            Quartos:
            <input
              type="number"
              name="quartos"
              value={formData.quartos}
              onChange={handleFormChange}
              min="0"
            />
          </label>
          <label>
            Suítes:
            <input
              type="number"
              name="suites"
              value={formData.suites}
              onChange={handleFormChange}
              min="0"
            />
          </label>
          <label>
            Banheiros:
            <input
              type="number"
              name="banheiros"
              value={formData.banheiros}
              onChange={handleFormChange}
              min="0"
            />
          </label>
          <label>
            Vagas:
            <input
              type="number"
              name="vagas_garagem"
              value={formData.vagas_garagem}
              onChange={handleFormChange}
              min="0"
            />
          </label>
          <label>
            Metragem (m²):
            <input
              type="number"
              name="metragem"
              value={formData.metragem}
              onChange={handleFormChange}
              min="0"
            />
          </label>
          <label>
            Ano de Construção:
            <input
              type="number"
              name="ano_construcao"
              value={formData.ano_construcao}
              onChange={handleFormChange}
              placeholder="Ex: 2020"
            />
          </label>
          <label>
            {" "}
            Posição Solar:
            <select
              name="posicao_solar"
              value={formData.posicao_solar}
              onChange={handleFormChange}
            >
              <option value="">Selecione...</option>
              <option value="norte">Norte</option>
              <option value="sul">Sul</option>
              <option value="leste">Leste (Nascente)</option>
              <option value="oeste">Oeste (Poente)</option>
            </select>
          </label>
        </div>

        <h3 className="form-section-title">Valores</h3>
        <div className="form-grid">
          <label>
            Valor (R$):
            <input
              type="number"
              name="valor"
              value={formData.valor}
              onChange={handleFormChange}
              required
              step="0.01"
            />
          </label>
          <label>
            Condomínio (R$):
            <input
              type="number"
              name="valor_condominio"
              value={formData.valor_condominio}
              onChange={handleFormChange}
              step="0.01"
            />
          </label>
          <label>
            IPTU (R$):
            <input
              type="number"
              name="valor_iptu"
              value={formData.valor_iptu}
              onChange={handleFormChange}
              step="0.01"
            />
          </label>
        </div>

        <h3 className="form-section-title">Características / Comodidades</h3>
        <div className="comodidades-grid">
          {allCaracteristicas.length > 0 ? (
            allCaracteristicas.map((caracteristica) => (
              <label key={caracteristica.id}>
                <input
                  type="checkbox"
                  value={caracteristica.id}
                  checked={formData.caracteristica_ids.includes(
                    caracteristica.id,
                  )}
                  onChange={handleCaracteristicaChange}
                />{" "}
                {caracteristica.nome}
              </label>
            ))
          ) : (
            <p>Carregando características...</p>
          )}
        </div>

        <label className="input-fotos">
          Fotos do Imóvel:
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept="image/*"
          />
        </label>

        <div className="form-actions">
          <button type="submit">
            {imovelSendoEditado ? "Salvar Alterações" : "Salvar Imóvel"}
          </button>
          {imovelSendoEditado && (
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

export default ImovelForm;
