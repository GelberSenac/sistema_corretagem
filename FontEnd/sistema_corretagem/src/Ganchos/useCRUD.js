import { useState, useEffect, useCallback } from "react";
import * as api from "../Servicos/Api";

// A assinatura da função aceita um 'parentId' opcional, com 'null' como padrão.
export const useCRUD = (resourceName, parentId = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiFunctions = {
    usuarios: {
      getAll: api.getUsuarios,
      create: api.createUsuario,
      update: api.updateUsuario,
      remove: api.deleteUsuario,
    },
    clientes: {
      getAll: api.getClientes,
      create: api.createCliente,
      update: api.updateCliente,
      remove: api.deleteCliente,
    },
    imoveis: {
      getAll: api.getImoveis,
      create: api.createImovel,
      update: api.updateImovel,
      remove: api.deleteImovel,
    },
    perfisBusca: {
      getAll: api.getPerfisBusca,
      create: api.createPerfilBusca,
      update: api.updatePerfilBusca,
      remove: api.deletePerfilBusca,
    },
  };

  const { getAll, create, update, remove } = apiFunctions[resourceName];

  const fetchData = useCallback(async () => {
    // A função 'getAll' agora pode ou não receber um 'parentId'.
    // Ex: getUsuarios() vs. getPerfisBusca(clienteId)
    const apiCall = () => (parentId ? getAll(parentId) : getAll());

    try {
      setLoading(true);
      const response = await apiCall();
      setData(response.data);
    } catch (e) {
      setError(e);
      console.error(`Erro ao buscar ${resourceName}:`, e);
    } finally {
      setLoading(false);
    }
  }, [resourceName, parentId, getAll]);

  useEffect(() => {
    const isNestedResource = ["perfisBusca"].includes(resourceName);
    // Se for um recurso aninhado, só busca se o parentId existir.
    // Se não for, busca normalmente.
    if (!isNestedResource || (isNestedResource && parentId)) {
      fetchData();
    }
  }, [fetchData, resourceName, parentId]);

  // As funções de manipulação agora passam o parentId se ele existir
  const handleCreate = async (newData) => {
    const response = await create(parentId, newData);
    setData((prev) => [...prev, response.data]);
  };

  const handleUpdate = async (id, updatedData) => {
    const response = await update(parentId, id, updatedData);
    setData(data.map((item) => (item.id === id ? response.data : item)));
  };

  const handleDelete = async (id) => {
    await remove(parentId, id);
    if (["clientes", "imoveis", "perfisBusca"].includes(resourceName)) {
      setData(data.filter((item) => item.id !== id));
    } else {
      // Soft delete para usuários
      setData(
        data.map((item) => (item.id === id ? { ...item, ativo: false } : item)),
      );
    }
  };

  return { data, loading, error, handleCreate, handleUpdate, handleDelete };
};
