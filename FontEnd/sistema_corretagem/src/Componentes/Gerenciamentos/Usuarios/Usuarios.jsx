// src/componentes/Gerenciamentos/Usuarios/Usuarios.jsx

import React, { useState } from "react";
import { useCRUD } from "../../../Ganchos/useCRUD";
import { useAuth } from "../../../Contextos/AuthContexto"; // Precisamos saber o papel do usuário logado
import UsuarioForm from "./UsuarioForm";
import UsuarioList from "./UsuarioList";
import { Toaster, toast } from "react-hot-toast";
import "./Usuarios.css";

function Usuarios() {
  const {
    data: usuarios,
    loading,
    error,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCRUD("usuarios");

  const { user } = useAuth(); // Pega o usuário logado do nosso contexto
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
      toast.error("Ocorreu um erro ao salvar o usuário.");
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

  if (loading) return <h1>Carregando usuários...</h1>;
  if (error)
    return <h1>Ocorreu um erro ao buscar os dados. Verifique o console.</h1>;

  return (
    <>
      <Toaster position="top-right" />
      <h1>Gerenciamento de Usuários</h1>

      {/* Apenas um admin pode criar/editar usuários */}
      {user?.role === "admin" && (
        <UsuarioForm
          usuarioSendoEditado={usuarioSendoEditado}
          onFormSubmit={handleFormSubmit}
          onCancelEdit={() => setUsuarioSendoEditado(null)}
        />
      )}

      <hr />

      <UsuarioList
        usuarios={usuarios}
        currentUser={user} // Passa o usuário atual para a lista
        onEdit={(usuario) => setUsuarioSendoEditado(usuario)}
        onDelete={handleDeleteClick}
      />
    </>
  );
}

export default Usuarios;
