// src/componentes/Gerenciamentos/Clientes/Clientes.jsx

import React, { useState } from "react";
import { useCRUD } from "../../../Ganchos/useCRUD"; // Verifique se o caminho está correto
import ClienteForm from "./ClienteForm";
import ClienteList from "./ClienteLista.jsx";
import { Toaster, toast } from "react-hot-toast"; // Para notificações (UX melhorada)
import "./Clientes.css";

function Clientes() {
  // 1. A MÁGICA ACONTECE AQUI: Toda a lógica de dados vem do hook!
  const {
    data: clientes,
    loading,
    error,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCRUD("clientes");

  // 2. O estado para controlar a edição continua aqui
  const [clienteSendoEditado, setClienteSendoEditado] = useState(null);

  // 3. A função de submit agora é mais simples e usa as funções do hook
  const handleFormSubmit = async (formData, id) => {
    try {
      if (id) {
        await handleUpdate(id, formData);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await handleCreate(formData);
        toast.success("Cliente criado com sucesso!");
      }
      setClienteSendoEditado(null); // Limpa o formulário após o sucesso
    } catch (err) {
      toast.error("Ocorreu um erro ao salvar o cliente.");
      console.error(err);
    }
  };

  // 4. A função de delete também usa a função do hook
  const handleDeleteClick = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await handleDelete(id);
        toast.success("Cliente excluído com sucesso!");
      } catch (err) {
        toast.error("Ocorreu um erro ao excluir o cliente.");
        console.error(err);
      }
    }
  };

  // 5. A renderização condicional continua simples
  if (loading) return <h1>Carregando clientes...</h1>;
  if (error)
    return <h1>Ocorreu um erro ao buscar os dados. Verifique o console.</h1>;

  // 6. O JSX renderiza os componentes filhos, passando os dados e funções necessários
  return (
    <>
      <Toaster position="top-right" />
      <h1>Gerenciamento de Clientes</h1>
      <ClienteForm
        clienteSendoEditado={clienteSendoEditado}
        onFormSubmit={handleFormSubmit}
        onCancelEdit={() => setClienteSendoEditado(null)}
      />
      <hr />
      <ClienteList
        clientes={clientes}
        onEdit={(cliente) => setClienteSendoEditado(cliente)}
        onDelete={handleDeleteClick}
      />
    </>
  );
}

export default Clientes;
