// src/componentes/Gerenciamentos/Imoveis/Imoveis.jsx

import React, { useState } from "react";
import { useCRUD } from "../../../Ganchos/useCRUD";
import ImovelForm from "./ImovelForm";
import ImovelList from "./ImovelList";
import { Toaster, toast } from "react-hot-toast";
import "./Imoveis.css";

const initialFilters = {
  bairro: "",
  valor_minimo: "",
  valor_maximo: "",
  quartos_minimo: "",
  tipo: "",
};

function Imoveis() {
  // 1. Pegamos 'pagyInfo', 'setPage' e 'setFilters' do nosso hook
  const {
    data: imoveis,
    loading,
    error,
    pagyInfo,
    setPage,
    setFilters,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCRUD("imoveis");

  const [imovelSendoEditado, setImovelSendoEditado] = useState(null);
  // 2. Criamos um estado para controlar os inputs de filtro
  const [activeFilters, setActiveFilters] = useState(initialFilters);

  const handleFormSubmit = async (formData, id) => {
    try {
      if (id) {
        await handleUpdate(id, formData);
        toast.success("Imóvel atualizado com sucesso!");
      } else {
        await handleCreate(formData);
        toast.success("Imóvel criado com sucesso!");
      }
      setImovelSendoEditado(null);
    } catch (err) {
      toast.error("Ocorreu um erro ao salvar o imóvel.");
      console.error(err);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este imóvel?")) {
      try {
        await handleDelete(id);
        toast.success("Imóvel excluído com sucesso!");
      } catch (err) {
        toast.error("Ocorreu um erro ao excluir o imóvel.");
      }
    }
  };

  // 3. Funções para controlar o formulário de filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setActiveFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setFilters(activeFilters); // Envia os filtros para o hook useCRUD, que dispara a busca
  };

  const clearFilters = () => {
    setActiveFilters(initialFilters);
    setFilters(initialFilters); // Envia os filtros limpos para o hook
  };

  if (loading && !imoveis.length) return <h1>Carregando imóveis...</h1>;
  if (error) return <h1>Ocorreu um erro ao buscar os dados.</h1>;

  return (
    <div className="page-container">
      <Toaster position="top-right" />
      <h1>Gerenciamento de Imóveis</h1>

      <ImovelForm
        imovelSendoEditado={imovelSendoEditado}
        onFormSubmit={handleFormSubmit}
        onCancelEdit={() => setImovelSendoEditado(null)}
      />

      <hr className="section-divider" />

      {/* 4. Formulário de Filtros */}
      <div className="filtros-container">
        <h2>Buscar Imóveis</h2>
        <div className="filtros-grid">
          <input
            name="bairro"
            value={activeFilters.bairro}
            onChange={handleFilterChange}
            placeholder="Bairro"
          />
          <input
            name="valor_minimo"
            type="number"
            value={activeFilters.valor_minimo}
            onChange={handleFilterChange}
            placeholder="Valor Mínimo"
          />
          <input
            name="valor_maximo"
            type="number"
            value={activeFilters.valor_maximo}
            onChange={handleFilterChange}
            placeholder="Valor Máximo"
          />
          <input
            name="quartos_minimo"
            type="number"
            value={activeFilters.quartos_minimo}
            onChange={handleFilterChange}
            placeholder="Quartos (mín)"
          />
          <select
            name="tipo"
            value={activeFilters.tipo}
            onChange={handleFilterChange}
          >
            <option value="">Tipo de Imóvel</option>
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
            {/* Adicione outros tipos */}
          </select>
          <button onClick={handleSearch}>Filtrar</button>
          <button onClick={clearFilters} className="clear-button">
            Limpar
          </button>
        </div>
      </div>

      {/* 5. Passamos os dados de paginação para a lista */}
      <ImovelList
        imoveis={imoveis}
        loading={loading}
        onEdit={(imovel) => setImovelSendoEditado(imovel)}
        onDelete={handleDeleteClick}
        pagyInfo={pagyInfo}
        onPageChange={setPage}
      />
    </div>
  );
}

export default Imoveis;
