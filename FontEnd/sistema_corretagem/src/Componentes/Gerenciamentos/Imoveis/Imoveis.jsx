import React, { useState } from "react";
import { useCRUD } from "../../../Ganchos/useCRUD";
import ImovelForm from "./ImovelForm";
import ImovelList from "./ImovelList";
import { Toaster, toast } from "react-hot-toast";
import "./Imoveis.css"; // Crie um arquivo CSS básico

function Imoveis() {
  const {
    data: imoveis,
    loading,
    error,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCRUD("imoveis");

  const [imovelSendoEditado, setImovelSendoEditado] = useState(null);

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

  if (loading) return <h1>Carregando imóveis...</h1>;
  if (error) return <h1>Ocorreu um erro ao buscar os dados.</h1>;

  return (
    <>
      <Toaster position="top-right" />
      <h1>Gerenciamento de Imóveis</h1>
      <ImovelForm
        imovelSendoEditado={imovelSendoEditado}
        onFormSubmit={handleFormSubmit}
        onCancelEdit={() => setImovelSendoEditado(null)}
      />
      <hr />
      <ImovelList
        imoveis={imoveis}
        onEdit={(imovel) => setImovelSendoEditado(imovel)}
        onDelete={handleDeleteClick}
      />
    </>
  );
}

export default Imoveis;
