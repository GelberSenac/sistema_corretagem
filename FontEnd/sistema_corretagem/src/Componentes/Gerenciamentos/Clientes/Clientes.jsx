// src/componentes/Gerenciamentos/Clientes/Clientes.jsx

import React, { useState } from "react";
import { useCRUD } from "../../../Ganchos/useCRUD"; // Nosso hook poderoso!
import ClienteForm from "./ClienteForm";
import ClienteLista from "./ClienteLista.jsx";
import { Toaster, toast } from "react-hot-toast";
import "./Clientes.css";
import { formatApiErrors } from "../../../Servicos/ErroUtils";
import ConfirmModal from "../../Shared/ConfirmModal";
import { useNavigate } from "react-router-dom";

function Clientes() {
  // 1. O hook agora nos dá tudo o que precisamos para paginação e filtros.
  const {
    data: clientes,
    loading,
    error,
    pagyInfo,
    setPage,
    // setFilters, // Descomente quando for adicionar filtros
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCRUD("clientes");

  const navigate = useNavigate();

  const [clienteSendoEditado, setClienteSendoEditado] = useState(null);
  const [showForm, setShowForm] = useState(false); // controlar visibilidade
  const [searchQuery, setSearchQuery] = useState(""); // filtro local de busca

  // Estados para criação contínua e sinal de reset do filho
  const [continuousCreationActive, setContinuousCreationActive] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  // Estados do modal de exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Derivação: clientes filtrados (local) — busca em nome/email/cpf
  const filteredClientes = React.useMemo(() => {
    if (!Array.isArray(clientes)) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter((c) => {
      const campos = [c?.nome, c?.email, c?.cpf];
      return campos.some((f) => String(f || "").toLowerCase().includes(q));
    });
  }, [clientes, searchQuery]);

  // formatApiErrors padronizado via Servicos/ErroUtils

  const handleFormSubmit = async (formData, id, options = {}) => {
    try {
      console.log("[Clientes] Submissão do formulário", { id, payload: formData, options });
      if (id) {
        await handleUpdate(id, formData);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const created = await handleCreate(formData);
        toast.success("Cliente criado com sucesso!");
        // Se não for criação contínua, redireciona para a página de detalhes
        if (!options.continueCreating && created?.id) {
          navigate(`/clientes/${created.id}`);
          return; // encerra para evitar seguir o fluxo padrão
        }
      }
      if (options.continueCreating) {
        // Mantém formulário aberto e limpa os campos para um novo cadastro
        setClienteSendoEditado(null);
        setContinuousCreationActive(true);
        setResetSignal((prev) => prev + 1);
        // Foco inicial pode ser ajustado no filho se necessário
      } else {
        setClienteSendoEditado(null); // Limpa o formulário após o sucesso
        setShowForm(false); // Volta para listagem
        setContinuousCreationActive(false);
      }
    } catch (err) {
      const mensagem = formatApiErrors(err);
      const status = err?.response?.status;
      toast.error(mensagem);
      console.error("[Clientes] Erro ao salvar cliente", { status, err });
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  // Enquanto os dados iniciais estão a ser carregados
  if (loading && !clientes.length) return <h1>Carregando clientes...</h1>;
  if (error)
    return <h1>Ocorreu um erro ao buscar os dados. Verifique o console.</h1>;

  return (
    <div className="page-container">
      <Toaster position="top-right" />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Excluir cliente?"
        message="Esta ação não pode ser desfeita. Deseja realmente excluir?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={async () => {
          setIsDeleteModalOpen(false);
          if (deleteTargetId) {
            try {
              await handleDelete(deleteTargetId);
              toast.success("Cliente excluído com sucesso!");
            } catch (err) {
              const status = err?.response?.status;
              const mensagem = status === 403
                ? "Você não tem permissão para excluir este cliente."
                : status === 500
                  ? "Erro interno no servidor ao excluir cliente."
                  : "Ocorreu um erro ao excluir o cliente.";
              toast.error(mensagem);
              console.error("[Clientes] Erro ao excluir cliente", { status, err });
            } finally {
              setDeleteTargetId(null);
            }
          }
        }}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
      />
      <h1>Gerenciamento de Clientes</h1>

      {/* Botão de cadastro visível somente quando não estamos exibindo o formulário */}
      {!showForm && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => {
              setClienteSendoEditado(null);
              setShowForm(true);
              setContinuousCreationActive(false);
            }}
          >
            Cadastrar novo cliente
          </button>
        </div>
      )}

      {/* Mostrar formulário apenas quando estivermos criando/alterando */}
      {showForm && (
        <ClienteForm
          key={clienteSendoEditado?.id ?? "novo"}
          clienteSendoEditado={clienteSendoEditado}
          onFormSubmit={handleFormSubmit}
          onCancelEdit={() => {
            setClienteSendoEditado(null);
            setShowForm(false); // Volta para listagem
            setContinuousCreationActive(false);
          }}
          resetSignal={resetSignal}
        />
      )}

      {!showForm && (
        <>
          <hr className="section-divider" />

          {/* Filtros de listagem: busca por nome/email/CPF */}
          <div className="filtros-container" style={{ marginBottom: 12 }}>
            <label>
              Buscar
              <input
                type="text"
                placeholder="Buscar por nome, email ou CPF"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ marginLeft: 8 }}
              />
            </label>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="clear-button"
                style={{ marginLeft: 8 }}
              >
                Limpar
              </button>
            )}
          </div>

          {/* Passamos os novos dados de paginação para o componente da lista */}
          <ClienteLista
            clientes={filteredClientes}
            loading={loading}
            onEdit={(cliente) => {
              console.log("[Clientes] onEdit acionado", cliente);
              setClienteSendoEditado(cliente);
              setShowForm(true); // Abre formulário pré-preenchido
              setContinuousCreationActive(false);
            }}
            onDelete={handleDeleteClick}
            pagyInfo={pagyInfo}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

export default Clientes;
