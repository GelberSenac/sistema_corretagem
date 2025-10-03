import { useState, useEffect, useCallback } from "react";
// Importa todas as funções de 'Api.js' sob o namespace 'api'
import * as api from "../Servicos/Api";

// Função auxiliar para extrair e organizar os dados de paginação dos headers da API
const parsePagyHeaders = (headers) => {
  // Se não houver headers ou o header principal não existir, retorna nulo
  if (!headers || !headers["total-count"]) return null;
  return {
    currentPage: parseInt(headers["current-page"], 10),
    items: parseInt(headers["items"], 10),
    totalPages: parseInt(headers["total-pages"], 10),
    totalCount: parseInt(headers["total-count"], 10),
  };
};

// O Hook Customizado
export const useCRUD = (resourceName, parentId = null) => {
  // --- ESTADOS INTERNOS DO HOOK ---
  const [data, setData] = useState([]); // Armazena os dados da página atual
  const [loading, setLoading] = useState(true); // Controla o estado de carregamento
  const [error, setError] = useState(null); // Armazena qualquer erro da API

  // Novos estados para gerir paginação e filtros
  const [pagyInfo, setPagyInfo] = useState(null); // Armazena os metadados da paginação
  const [queryParams, setQueryParams] = useState({ page: 1 }); // Estado para a página atual e filtros

  // Mapeamento de nomes de recursos para as funções da API
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

  // Seleciona as funções corretas com base no 'resourceName'
  const { getAll, create, update, remove } = apiFunctions[resourceName];
  const isNested = ["perfisBusca"].includes(resourceName);

  // --- FUNÇÃO PRINCIPAL DE BUSCA DE DADOS ---
  const fetchData = useCallback(async () => {
    // A busca só acontece se o recurso não for aninhado, ou se for aninhado e tiver um 'parentId'
    if (!isNested || (isNested && parentId)) {
      try {
        setLoading(true);
        setError(null);

        // A função 'getAll' agora sempre envia os 'queryParams' para a API
        const response = isNested
          ? await getAll(parentId, queryParams)
          : await getAll(queryParams);

        setData(response.data);
        setPagyInfo(parsePagyHeaders(response.headers)); // Salva os dados de paginação dos headers
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    }
  }, [resourceName, parentId, getAll, isNested, queryParams]);

  // Efeito que dispara a busca de dados sempre que 'queryParams' ou 'parentId' mudarem
  useEffect(() => {
    fetchData();
  }, [fetchData]); // A dependência 'fetchData' já inclui 'queryParams' e 'parentId'

  // --- FUNÇÕES DE AÇÃO (CRUD) ---

  const handleCreate = async (newData) => {
    isNested ? await create(parentId, newData) : await create(newData);
    fetchData(); // Re-busca os dados para atualizar a lista e a paginação
  };

  const handleUpdate = async (id, updatedData) => {
    isNested
      ? await update(parentId, id, updatedData)
      : await update(id, updatedData);
    fetchData(); // Re-busca para refletir as alterações
  };

  const handleDelete = async (id) => {
    isNested ? await remove(parentId, id) : await remove(id);
    // Para deleção, podemos otimisticamente filtrar a UI antes do refetch,
    // mas o refetch garante a consistência da paginação.
    fetchData();
  };

  // --- FUNÇÕES DE CONTROLE (Expostas para o componente) ---

  // Função para mudar a página atual
  const setPage = (pageNumber) => {
    setQueryParams((prevParams) => ({ ...prevParams, page: pageNumber }));
  };

  // Função para aplicar filtros
  const setFilters = (filters) => {
    // Ao aplicar novos filtros, sempre voltamos para a página 1 para evitar inconsistências
    setQueryParams((prevParams) => ({ ...filters, page: 1 }));
  };

  // --- VALORES RETORNADOS PELO HOOK ---
  return {
    data,
    loading,
    error,
    pagyInfo,
    queryParams,
    setPage,
    setFilters,
    handleCreate,
    handleUpdate,
    handleDelete,
    refetch: fetchData, // Expõe a função de busca para atualizações manuais se necessário
  };
};
