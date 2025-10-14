// src/componentes/Gerenciamentos/PerfisBusca/PerfisBusca.jsx

import React, { useState } from "react";
import { useCRUD } from "../../../Ganchos/useCRUD";
import { Toaster, toast } from "react-hot-toast";
import PerfilBuscaForm from "./PerfilBuscaForm";
import PerfilBuscaList from "./PerfilBuscaList";
import ConfirmModal from "../../Shared/ConfirmModal";

function PerfisBusca({ clienteId }) {
  // 1. Pegamos 'pagyInfo' e 'setPage' do nosso hook
  const {
    data: perfis,
    loading,
    error,
    pagyInfo,
    setPage,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCRUD("perfisBusca", clienteId);

  const [perfilSendoEditado, setPerfilSendoEditado] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const handleFormSubmit = async (formData, id) => {
    try {
      if (id) {
        await handleUpdate(id, formData);
        toast.success("Perfil de busca atualizado!");
      } else {
        await handleCreate(formData);
        toast.success("Perfil de busca criado!");
      }
      setPerfilSendoEditado(null);
    } catch (err) {
      toast.error("Ocorreu um erro ao salvar o perfil.");
      console.error(err);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  if (error) return <p>Erro ao carregar perfis.</p>;

  return (
    <div className="perfis-busca-container" style={{ marginTop: "20px" }}>
      <Toaster position="top-right" />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Excluir perfil de busca?"
        message="Esta ação não pode ser desfeita. Deseja realmente excluir?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={async () => {
          setIsDeleteModalOpen(false);
          if (deleteTargetId) {
            try {
              await handleDelete(deleteTargetId);
              toast.success("Perfil de busca excluído!");
            } catch (err) {
              toast.error("Ocorreu um erro ao excluir o perfil.");
              console.error(err);
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
      <h3>Perfis de Busca do Cliente</h3>
      <PerfilBuscaForm
        perfilSendoEditado={perfilSendoEditado}
        onFormSubmit={handleFormSubmit}
        onCancelEdit={() => setPerfilSendoEditado(null)}
      />
      <hr />
      {/* O feedback de loading agora fica dentro do PerfilBuscaList */}
      <PerfilBuscaList
        perfis={perfis}
        loading={loading}
        onEdit={(perfil) => setPerfilSendoEditado(perfil)}
        onDelete={handleDeleteClick}
        // 2. Passamos os novos dados e funções de paginação
        pagyInfo={pagyInfo}
        onPageChange={setPage}
      />
    </div>
  );
}

export default PerfisBusca;
