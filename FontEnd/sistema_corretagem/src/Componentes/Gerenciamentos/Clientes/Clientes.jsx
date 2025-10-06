// src/componentes/Gerenciamentos/Clientes/Clientes.jsx

import React, { useState } from "react";
import { useCRUD } from "../../../Ganchos/useCRUD"; // Nosso hook poderoso!
import ClienteForm from "./ClienteForm";
import ClienteLista from "./ClienteLista.jsx";
import { Toaster, toast } from "react-hot-toast";
import "./Clientes.css";

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

  const [clienteSendoEditado, setClienteSendoEditado] = useState(null);

  // Formata erros vindos do Rails (ActiveModel) para um texto amigável, distinguindo códigos HTTP
  const formatApiErrors = (err) => {
    try {
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 403) return "Você não tem permissão para realizar esta ação.";
      if (status === 500) return "Erro interno no servidor ao salvar o cliente. Tente novamente mais tarde.";

      if (!data) return "Ocorreu um erro ao salvar o cliente.";
      if (typeof data === "string") return data;
      if (typeof data === "object") {
        const mensagens = Object.entries(data).map(([campo, msgs]) => {
          const textoMsgs = Array.isArray(msgs) ? msgs.join(", ") : String(msgs);
          const campoLabel = campo
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          return `${campoLabel}: ${textoMsgs}`;
        });
        return `Verifique os dados: ${mensagens.join("; ")}`;
      }
      return "Erro inesperado ao salvar o cliente.";
    } catch (_) {
      return "Ocorreu um erro ao salvar o cliente.";
    }
  };

  const handleFormSubmit = async (formData, id) => {
    try {
      console.log("[Clientes] Submissão do formulário", { id, payload: formData });
      if (id) {
        await handleUpdate(id, formData);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await handleCreate(formData);
        toast.success("Cliente criado com sucesso!");
      }
      setClienteSendoEditado(null); // Limpa o formulário após o sucesso
    } catch (err) {
      const mensagem = formatApiErrors(err);
      const status = err?.response?.status;
      toast.error(mensagem);
      console.error("[Clientes] Erro ao salvar cliente", { status, err });
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await handleDelete(id);
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
      }
    }
  };

  // Enquanto os dados iniciais estão a ser carregados
  if (loading && !clientes.length) return <h1>Carregando clientes...</h1>;
  if (error)
    return <h1>Ocorreu um erro ao buscar os dados. Verifique o console.</h1>;

  return (
    <div className="page-container">
      <Toaster position="top-right" />
      <h1>Gerenciamento de Clientes</h1>

      <ClienteForm
        clienteSendoEditado={clienteSendoEditado}
        onFormSubmit={handleFormSubmit}
        onCancelEdit={() => setClienteSendoEditado(null)}
      />

      <hr className="section-divider" />

      {/* Passamos os novos dados de paginação para o componente da lista */}
      <ClienteLista
        clientes={clientes}
        loading={loading} // Passa o estado de loading para a lista poder mostrar um feedback
        onEdit={(cliente) => setClienteSendoEditado(cliente)}
        onDelete={handleDeleteClick}
        pagyInfo={pagyInfo}
        onPageChange={setPage} // Passa a função 'setPage' do hook
      />
    </div>
  );
}

export default Clientes;
