// src/Servicos/Api.js
import axios from "axios";

const apiBaseURL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

const apiClient = axios.create({
  baseURL: apiBaseURL,
  headers: { "Content-Type": "application/json" },
});

// --- Interceptores ---

// 1. Interceptor de REQUISIÇÃO: Adiciona o token de autenticação em cada chamada.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Logs estratégicos no ambiente de desenvolvimento
  if (import.meta?.env?.DEV) {
    try {
      const { method, url, params, data } = config;
      console.log("[API] Request", {
        method: (method || "").toUpperCase(),
        url: `${apiBaseURL}${url}`,
        params,
        data,
      });
    } catch (_) {}
  }
  return config;
});

// 2. Interceptor de RESPOSTA: Trata erros globais, como token expirado (erro 401).
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta?.env?.DEV) {
      try {
        console.log("[API] Response", {
          url: response.config?.url,
          status: response.status,
          data: response.data,
        });
      } catch (_) {}
    }
    return response;
  },
  (error) => {
    if (import.meta?.env?.DEV) {
      try {
        console.error("[API] Error", {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
        });
      } catch (_) {}
    }
    // Se o erro for 401 (Não Autorizado), desloga o usuário automaticamente.
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      // Redireciona para a página de login para uma nova autenticação.
      window.location.href = "/login";
    }
    // Para qualquer outro erro, apenas o repassa para ser tratado no componente.
    return Promise.reject(error);
  },
);

// --- Funções da API ---

// Bloco de Sessões
export const loginUser = (login, password) =>
  apiClient.post("/login", { usuario: { login, senha: password, password } });

// Bloco do Dashboard
export const getDashboardStats = () => apiClient.get("/dashboard_stats");

// Bloco de Usuários
export const getUsuarios = (params = {}) =>
  apiClient.get("/usuarios", { params });
export const getUsuarioById = (id) => apiClient.get(`/usuarios/${id}`);
export const createUsuario = (usuarioData) =>
  apiClient.post("/usuarios", { usuario: usuarioData });
export const updateUsuario = (id, usuarioData) =>
  apiClient.patch(`/usuarios/${id}`, { usuario: usuarioData });
export const deleteUsuario = (id) => apiClient.delete(`/usuarios/${id}`); // Rota para 'deactivate'

// Bloco de Clientes
export const getClientes = (params = {}) =>
  apiClient.get("/clientes", { params });
export const getClienteById = (id) => apiClient.get(`/clientes/${id}`);
export const createCliente = (clienteData) =>
  apiClient.post("/clientes", { cliente: clienteData });
export const updateCliente = (id, clienteData) =>
  apiClient.patch(`/clientes/${id}`, { cliente: clienteData });
export const deleteCliente = (id) => apiClient.delete(`/clientes/${id}`);

// Bloco de Imóveis
export const getImoveis = (params = {}) =>
  apiClient.get("/imoveis", { params });
export const getImovelById = (id) => apiClient.get(`/imoveis/${id}`);
export const createImovel = (formData) => {
  return apiClient.post("/imoveis", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const updateImovel = (id, formData) => {
  return apiClient.patch(`/imoveis/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const deleteImovel = (id) => apiClient.delete(`/imoveis/${id}`);

// Bloco de Perfis de Busca (rotas aninhadas)
export const getPerfisBusca = (clienteId) =>
  apiClient.get(`/clientes/${clienteId}/perfis_busca`);
export const createPerfilBusca = (clienteId, perfilData) =>
  apiClient.post(`/clientes/${clienteId}/perfis_busca`, {
    perfil_busca: perfilData,
  });
export const updatePerfilBusca = (clienteId, perfilId, perfilData) =>
  apiClient.patch(`/clientes/${clienteId}/perfis_busca/${perfilId}`, {
    perfil_busca: perfilData,
  });
export const deletePerfilBusca = (clienteId, perfilId) =>
  apiClient.delete(`/clientes/${clienteId}/perfis_busca/${perfilId}`);

// Bloco de Propostas
export const getPropostas = (params = {}) =>
  apiClient.get("/propostas", { params });
export const createProposta = (propostaData) =>
  apiClient.post("/propostas", { proposta: propostaData });

// Ações customizadas da proposta
export const aceitarProposta = (propostaId) =>
  apiClient.patch(`/propostas/${propostaId}/aceitar`);
export const recusarProposta = (propostaId) =>
  apiClient.patch(`/propostas/${propostaId}/recusar`);
export const cancelarProposta = (propostaId) =>
  apiClient.patch(`/propostas/${propostaId}/cancelar`);

// Bloco de Busca de Imóveis (ação customizada)
export const buscarImoveisCompativeis = (perfilBuscaId) =>
  apiClient.get(`/imoveis/buscar?perfil_busca_id=${perfilBuscaId}`);

// Bloco de Características
export const getCaracteristicas = () => apiClient.get("/caracteristicas");

export default apiClient;
