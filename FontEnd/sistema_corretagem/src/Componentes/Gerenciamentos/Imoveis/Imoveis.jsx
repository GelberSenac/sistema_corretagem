// src/componentes/Gerenciamentos/Imoveis/Imoveis.jsx

import React, { useState } from "react";
import { useCRUD } from "../../../Ganchos/useCRUD";
import ImovelForm from "./ImovelForm";
import ImovelList from "./ImovelList";
import { Toaster, toast } from "react-hot-toast";
import "./Imoveis.css";
import ConfirmModal from "../../Shared/ConfirmModal";
import { getImovelById } from "../../../Servicos/Api";

const initialFilters = {
  bairro: "",
  valor_minimo: "",
  valor_maximo: "",
  quartos_minimo: "",
  quartos_maximo: "", // novo campo
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
  // Novo: controlar visibilidade do formulário de criação/edição
  const [showForm, setShowForm] = useState(false);
  const [continuousCreationActive, setContinuousCreationActive] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  // Estado para confirmação de exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const handleFormSubmit = async (formData, id, options = {}) => {
    try {
      // Se o envio já ocorreu via XHR, apenas aplicar pós-sucesso (toast/fechamento) e forçar refetch pela página atual
      if (options.skipNetwork) {
        toast.success(id ? "Imóvel atualizado com sucesso!" : "Imóvel criado com sucesso!");
        setShowForm(false);
        setImovelSendoEditado(null);
        // força atualização mantendo paginação atual (refetch)
        setPage(pagyInfo?.currentPage || 1);
        return;
      }

      if (id) {
        await handleUpdate(id, formData);
        toast.success("Imóvel atualizado com sucesso!");
        setShowForm(false);
        setImovelSendoEditado(null);
      } else {
        await handleCreate(formData);
        toast.success("Imóvel criado com sucesso!");
        if (options.continueCreating) {
          setContinuousCreationActive(true);
          setResetSignal((s) => s + 1);
        } else {
          setShowForm(false);
        }
      }
    } catch (err) {
      toast.error("Ocorreu um erro ao salvar o imóvel.");
      console.error(err);
    }
  };

  const handleDeleteClick = async (id) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
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

      {/* Ações principais: cadastro novo e controle de formulário */}
      {!showForm && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => {
              setImovelSendoEditado(null);
              setShowForm(true);
            }}
          >
            Cadastrar novo imóvel
          </button>
        </div>
      )}

      {/* Formulário de criação/edição — visível apenas quando necessário */}
      {showForm && (
        <ImovelForm
          imovelSendoEditado={imovelSendoEditado}
          onFormSubmit={handleFormSubmit}
          onCancelEdit={() => {
            setImovelSendoEditado(null);
            setShowForm(false);
          }}
          resetSignal={resetSignal}
        />
      )}

      {!showForm && (
        <>
          <hr className="section-divider" />

          {/* 4. Formulário de Filtros */}
          <div className="filtros-container">
            <h2>Buscar Imóveis</h2>
            <div className="filtros-grid">
              {/* Linha 1: Tipo de imóvel (1 coluna) + Bairro (3 colunas) */}
              <select
                name="tipo"
                value={activeFilters.tipo}
                onChange={handleFilterChange}
                className="grid-col-span-1"
              >
                <option value="">Tipo de Imóvel</option>
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                {/* Adicione outros tipos */}
              </select>
              <input
                name="bairro"
                value={activeFilters.bairro}
                onChange={handleFilterChange}
                placeholder="Bairro"
                className="grid-col-span-3"
              />

              {/* Linha 2: Quartos(min), Quartos(max), Valor Mínimo, Valor Máximo */}
              <input
                name="quartos_minimo"
                type="number"
                value={activeFilters.quartos_minimo}
                onChange={handleFilterChange}
                placeholder="Quartos (mín)"
                className="grid-col-span-1"
              />
              <input
                name="quartos_maximo"
                type="number"
                value={activeFilters.quartos_maximo}
                onChange={handleFilterChange}
                placeholder="Quartos (máx)"
                className="grid-col-span-1"
              />
              <input
                name="valor_minimo"
                type="number"
                value={activeFilters.valor_minimo}
                onChange={handleFilterChange}
                placeholder="Valor Mínimo"
                className="grid-col-span-1"
              />
              <input
                name="valor_maximo"
                type="number"
                value={activeFilters.valor_maximo}
                onChange={handleFilterChange}
                placeholder="Valor Máximo"
                className="grid-col-span-1"
              />

              {/* Linha 3: Botões Filtrar e Limpar */}
              <button onClick={handleSearch} className="grid-col-span-1">Filtrar</button>
              <button onClick={clearFilters} className="clear-button grid-col-span-1">Limpar</button>
            </div>
          </div>

          {/* 5. Passamos os dados de paginação para a lista */}
          <ImovelList
            imoveis={imoveis}
            loading={loading}
            onEdit={(imovel) => {
              // Abre formulário imediatamente com dados atuais
              setImovelSendoEditado(imovel);
              setShowForm(true); // Abre formulário com dados pré-preenchidos
              // Em seguida busca dados atualizados do imóvel para evitar fotos antigas em cache
              getImovelById(imovel.id)
                .then((resp) => {
                  if (resp?.data) setImovelSendoEditado(resp.data);
                })
                .catch((err) => {
                  console.error("Falha ao buscar imóvel atualizado", err);
                });
            }}
            onDelete={handleDeleteClick}
            pagyInfo={pagyInfo}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Excluir imóvel?"
        message="Tem certeza que deseja excluir este imóvel?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={async () => {
          if (!deleteTargetId) return;
          try {
            await handleDelete(deleteTargetId);
            toast.success("Imóvel excluído com sucesso!");
          } catch (err) {
            toast.error("Ocorreu um erro ao excluir o imóvel.");
            console.error(err);
          } finally {
            setIsDeleteModalOpen(false);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
}

export default Imoveis;
