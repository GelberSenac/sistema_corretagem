// src/componentes/Gerenciamentos/Usuarios/Usuarios.jsx

import React, { useState } from "react";
import { useCRUD } from "../../../Ganchos/useCRUD";
import { useAuth } from "../../../Contextos/AuthContexto";
import UsuarioForm from "./UsuarioForm";
import UsuarioList from "./UsuarioList";
import { Toaster, toast } from "react-hot-toast";
import "./Usuarios.css";
import ConfirmModal from "../../Shared/ConfirmModal";

function Usuarios() {
  // 1. Pegamos 'pagyInfo' e 'setPage' do nosso hook para a paginação
  const {
    data: usuarios,
    loading,
    error,
    pagyInfo,
    setPage,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCRUD("usuarios");

  const { user } = useAuth();
  const [usuarioSendoEditado, setUsuarioSendoEditado] = useState(null);
  const [showForm, setShowForm] = useState(false); // controlar visibilidade
  // Controle do fluxo de criação contínua e reset do formulário
  const [continuousCreationActive, setContinuousCreationActive] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  // Filtros locais
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [ativoFilter, setAtivoFilter] = useState(""); // "", "ativo", "inativo"

  // Estado para confirmação de inativação/remoção
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Perfis com privilégios elevados (admin_like): admin e gerente
  const isAdminLike = user?.role === "admin" || user?.role === "gerente";

  const filteredUsuarios = React.useMemo(() => {
    if (!Array.isArray(usuarios)) return [];
    let arr = usuarios;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      arr = arr.filter((u) => {
        const campos = [u?.nome, u?.email, u?.login];
        return campos.some((f) => String(f || "").toLowerCase().includes(q));
      });
    }
    if (roleFilter) {
      arr = arr.filter((u) => String(u?.role) === roleFilter);
    }
    if (ativoFilter) {
      const flag = ativoFilter === "ativo";
      arr = arr.filter((u) => Boolean(u?.ativo) === flag);
    }
    return arr;
  }, [usuarios, searchQuery, roleFilter, ativoFilter]);

  const handleFormSubmit = async (formData, id, options = {}) => {
    try {
      if (id) {
        await handleUpdate(id, formData);
        toast.success("Usuário atualizado com sucesso!");
        // Ao editar, encerramos o formulário e mantemos página/filtros atuais
        setUsuarioSendoEditado(null);
        setShowForm(false);
        setContinuousCreationActive(false);
      } else {
        await handleCreate(formData);
        toast.success("Usuário criado com sucesso!");
        // Se o fluxo contínuo estiver ativo, mantemos o formulário aberto e resetamos os campos
        if (options?.continueCreating) {
          setUsuarioSendoEditado(null);
          setShowForm(true);
          setContinuousCreationActive(true);
          setResetSignal((prev) => prev + 1); // sinaliza reset para o formulário
        } else {
          // Fluxo normal: fechar e voltar para lista
          setUsuarioSendoEditado(null);
          setShowForm(false);
          setContinuousCreationActive(false);
        }
      }
    } catch (err) {
      toast.error("Ocorreu um erro ao salvar o usuário.");
      console.error(err);
    }
  };

  const handleDeleteClick = async (id) => {
    setDeleteTargetId(id);
    setIsConfirmOpen(true);
  };

  if (loading && !usuarios.length) return <h1>Carregando usuários...</h1>;
  if (error)
    return <h1>Ocorreu um erro ao buscar os dados. Verifique o console.</h1>;

  return (
    <div className="page-container">
      <Toaster position="top-right" />
      <h1>Gerenciamento de Usuários</h1>

      {/* Botão de cadastro visível somente para perfis admin_like quando não estamos exibindo o formulário */}
      {isAdminLike && !showForm && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => {
              setUsuarioSendoEditado(null);
              setContinuousCreationActive(true); // inicia fluxo contínuo
              setShowForm(true);
            }}
          >
            Cadastrar novo usuário
          </button>
        </div>
      )}

      {/* Mostrar formulário apenas quando estivermos criando/alterando */}
      {isAdminLike && showForm && (
        <UsuarioForm
          usuarioSendoEditado={usuarioSendoEditado}
          onFormSubmit={handleFormSubmit}
          onCancelEdit={() => {
            setUsuarioSendoEditado(null);
            setShowForm(false); // Volta para listagem
            if (continuousCreationActive) {
              // Se estávamos no fluxo de criação contínua, ao fechar voltamos para a página 1
              setPage(1);
              setContinuousCreationActive(false);
            }
          }}
          resetSignal={resetSignal}
        />
      )}

      {!showForm && (
        <>
          <hr className="section-divider" />

          {/* Filtros de listagem: busca, role e status */}
          <div className="filtros-container" style={{ marginBottom: 12, display: "flex", gap: 12, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Buscar por nome, email ou login"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">Todos os papéis</option>
              <option value="admin">Admin</option>
              <option value="gerente">Gerente</option>
              <option value="corretor">Corretor</option>
            </select>
            <select value={ativoFilter} onChange={(e) => setAtivoFilter(e.target.value)}>
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
            {(searchQuery || roleFilter || ativoFilter) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("");
                  setAtivoFilter("");
                }}
              >
                Limpar filtros
              </button>
            )}
          </div>

          <UsuarioList
            usuarios={filteredUsuarios}
            loading={loading}
            onEdit={(usuario) => {
              setUsuarioSendoEditado(usuario);
              setShowForm(true);
            }}
            onDelete={handleDeleteClick}
            pagyInfo={pagyInfo}
            onPageChange={setPage}
            currentUser={user}
          />
        </>
      )}

      {/* Modal de confirmação de inativação/remoção */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Inativar usuário?"
        message="Tem certeza que deseja inativar este usuário?"
        confirmLabel="Inativar"
        cancelLabel="Cancelar"
        onConfirm={async () => {
          if (!deleteTargetId) return;
          try {
            await handleDelete(deleteTargetId);
            toast.success("Usuário inativado com sucesso!");
          } catch (err) {
            toast.error("Ocorreu um erro ao inativar o usuário.");
            console.error(err);
          } finally {
            setIsConfirmOpen(false);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => {
          setIsConfirmOpen(false);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
}

export default Usuarios;
