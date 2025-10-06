// src/componentes/Gerenciamentos/Usuarios/Usuarios.jsx

import React, { useState } from "react";
import { useCRUD } from "../../../Ganchos/useCRUD";
import { useAuth } from "../../../Contextos/AuthContexto";
import UsuarioForm from "./UsuarioForm";
import UsuarioList from "./UsuarioList";
import { Toaster, toast } from "react-hot-toast";
import "./Usuarios.css";

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

  const handleFormSubmit = async (formData, id) => {
    try {
      if (id) {
        await handleUpdate(id, formData);
        toast.success("Usuário atualizado com sucesso!");
      } else {
        await handleCreate(formData);
        toast.success("Usuário criado com sucesso!");
      }
      setUsuarioSendoEditado(null);
    } catch (err) {
      // Tratamento detalhado de erros
      const status = err?.response?.status;
      const apiData = err?.response?.data;
      if (status === 422 && apiData) {
        // Exibe mensagens específicas de validação vindas da API
        const detalhes = typeof apiData === "string" ? apiData : JSON.stringify(apiData);
        toast.error(`Erro de validação: ${detalhes}`);
      } else if (err?.response) {
        toast.error(`Erro ${status}: ${err.response?.data?.error || "Falha ao processar requisição"}`);
      } else if (err?.request) {
        toast.error("Falha de conexão com o servidor. Tente novamente.");
      } else {
        toast.error("Erro inesperado ao salvar o usuário.");
      }
      console.error(err);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Tem certeza que deseja inativar este usuário?")) {
      try {
        await handleDelete(id);
        toast.success("Usuário inativado com sucesso!");
      } catch (err) {
        toast.error("Ocorreu um erro ao inativar o usuário.");
        console.error(err);
      }
    }
  };

  if (loading && !usuarios.length) return <h1>Carregando usuários...</h1>;
  if (error)
    return <h1>Ocorreu um erro ao buscar os dados. Verifique o console.</h1>;

  return (
    <div className="page-container">
      <Toaster position="top-right" />
      <h1>Gerenciamento de Usuários</h1>

      {user?.role === "admin" && (
        <UsuarioForm
          usuarioSendoEditado={usuarioSendoEditado}
          onFormSubmit={handleFormSubmit}
          onCancelEdit={() => setUsuarioSendoEditado(null)}
        />
      )}

      <hr className="section-divider" />

      {/* 2. Passamos os novos dados e funções de paginação para o componente da lista */}
      <UsuarioList
        usuarios={usuarios}
        currentUser={user}
        onEdit={(usuario) => setUsuarioSendoEditado(usuario)}
        onDelete={handleDeleteClick}
        pagyInfo={pagyInfo}
        onPageChange={setPage}
        loading={loading}
      />
    </div>
  );
}

export default Usuarios;
