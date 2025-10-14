// src/Servicos/Api.js
import axios from "axios";

const apiBaseURL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

const apiClient = axios.create({
  baseURL: apiBaseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // necessário para enviar/receber cookies HttpOnly cross-site
});

// --- Interceptores ---

// Helpers para coleta de logs no console e rede (apenas em DEV)
export const getConsoleLogs = () => window.__APP_CONSOLE_LOGS__ || [];
export const getConsoleErrors = () => window.__APP_CONSOLE_ERRORS__ || [];
export const getNetworkLogs = () => window.__APP_NETWORK_LOGS__ || [];
export const getNetworkErrors = () => window.__APP_NETWORK_ERRORS__ || [];

// Inicializa buffers globais de logs
if (import.meta?.env?.DEV) {
  window.__APP_CONSOLE_LOGS__ = window.__APP_CONSOLE_LOGS__ || [];
  window.__APP_CONSOLE_ERRORS__ = window.__APP_CONSOLE_ERRORS__ || [];
  window.__APP_NETWORK_LOGS__ = window.__APP_NETWORK_LOGS__ || [];
  window.__APP_NETWORK_ERRORS__ = window.__APP_NETWORK_ERRORS__ || [];

  // Wrap simples do console para capturar logs sem bloquear
  const originalLog = console.log;
  const originalError = console.error;
  console.log = function (...args) {
    try {
      window.__APP_CONSOLE_LOGS__.push({ ts: Date.now(), args });
    } catch (e) { /* noop */ }
    originalLog.apply(console, args);
  };
  console.error = function (...args) {
    try {
      window.__APP_CONSOLE_ERRORS__.push({ ts: Date.now(), args });
    } catch (e) { /* noop */ }
    originalError.apply(console, args);
  };
}

// Sinalizador para evitar múltiplos refresh concorrentes
let isRefreshing = false;
let pendingRequests = [];

function subscribeTokenRefresh(cb) {
  pendingRequests.push(cb);
}
function onRefreshed(newToken) {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
}

// 1. Interceptor de REQUISIÇÃO: Adiciona o token de autenticação em cada chamada.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Propagar device_id (se existir) para binding do refresh
  const deviceId = localStorage.getItem("device_id");
  if (deviceId) {
    config.headers["X-Device-Id"] = deviceId;
  }
  // Logs estratégicos no ambiente de desenvolvimento
  if (import.meta?.env?.DEV) {
    try {
      const { method, url, params, data } = config;
      const payload = {
        ts: Date.now(),
        type: "request",
        method: (method || "").toUpperCase(),
        url: `${apiBaseURL}${url}`,
        params,
        data,
      };
      window.__APP_NETWORK_LOGS__?.push(payload);
      console.log("[API] Request", payload);
    } catch (e) { /* noop */ }
  }
  return config;
});

// 2. Interceptor de RESPOSTA: Trata erros globais, como token expirado (erro 401).
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta?.env?.DEV) {
      try {
        const payload = {
          ts: Date.now(),
          type: "response",
          url: response.config?.url,
          status: response.status,
          data: response.data,
        };
        window.__APP_NETWORK_LOGS__?.push(payload);
        console.log("[API] Response", payload);
      } catch (e) { /* noop */ }
    }
    return response;
  },
  async (error) => {
    // Ignorar logs de erro para requisições canceladas (AbortController, StrictMode em dev)
    if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") {
      if (import.meta?.env?.DEV) {
        try {
          const payload = {
            ts: Date.now(),
            type: "cancel",
            url: error.config?.url,
            message: error.message,
            code: error.code,
          };
          window.__APP_NETWORK_LOGS__?.push(payload);
          console.log("[API] Request canceled", payload);
        } catch (e) { /* noop */ }
      }
      return Promise.reject(error);
    }

    if (import.meta?.env?.DEV) {
      try {
        const payload = {
          ts: Date.now(),
          type: "error",
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
          // Complementar logs para erros sem resposta do servidor
          message: error.message,
          code: error.code,
        };
        window.__APP_NETWORK_LOGS__?.push(payload);
        window.__APP_NETWORK_ERRORS__?.push(payload);
        console.error("[API] Error", payload);
      } catch (e) { /* noop */ }
    }
    
    const originalRequest = error.config;
    // Se o erro for 401 (Não Autorizado), tentar refresh silencioso
    if (error.response && error.response.status === 401) {
      const isLoginEndpoint = originalRequest?.url === "/login";
      if (!isLoginEndpoint) {
        // Evitar loops infinitos: não tentar refresh se já é a chamada de refresh
        const isRefreshEndpoint = originalRequest?.url === "/auth/refresh";
        if (isRefreshEndpoint) {
          // Refresh falhou -> logout e redirect
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(error);
        }
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const deviceId = localStorage.getItem("device_id");
            const refreshResponse = await apiClient.post("/auth/refresh", {}, {
              headers: deviceId ? { "X-Device-Id": deviceId } : {},
            });
            const newToken = refreshResponse?.data?.token;
            if (newToken) {
              localStorage.setItem("authToken", newToken);
              apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
              onRefreshed(newToken);
              isRefreshing = false;
              // Reexecuta a requisição original com novo token
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              return apiClient(originalRequest);
            }
            throw new Error("Refresh sem token na resposta");
          } catch (refreshErr) {
            isRefreshing = false;
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return Promise.reject(refreshErr);
          }
        } else {
          // Já está em curso: enfileira requisição e reexecuta após refresh
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh((newToken) => {
              if (!newToken) {
                reject(error);
                return;
              }
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              resolve(apiClient(originalRequest));
            });
          });
        }
      }
    }
    // Para qualquer outro erro, apenas o repassa para ser tratado no componente.
    return Promise.reject(error);
  },
);

// --- Funções da API ---

// Bloco de Sessões
export const loginUser = (login, password) =>
  apiClient.post("/login", { usuario: { login, password } });

// Bloco do Dashboard
export const getDashboardStats = () => apiClient.get("/dashboard_stats");

// Bloco de Usuários
export const getUsuarios = (params = {}, config = {}) =>
  apiClient.get("/usuarios", { params, ...config });
export const getUsuarioById = (id, config = {}) => apiClient.get(`/usuarios/${id}`, { ...config });
export const createUsuario = (usuarioData) =>
  apiClient.post("/usuarios", { usuario: usuarioData });
export const updateUsuario = (id, usuarioData) =>
  apiClient.patch(`/usuarios/${id}`, { usuario: usuarioData });
export const deleteUsuario = (id) => apiClient.delete(`/usuarios/${id}`); // Rota para 'deactivate'

// Bloco de Clientes
export const getClientes = (params = {}, config = {}) =>
  apiClient.get("/clientes", { params, ...config });
export const getClienteById = (id, config = {}) => apiClient.get(`/clientes/${id}`, { ...config });
export const createCliente = (clienteData) =>
  apiClient.post("/clientes", { cliente: clienteData });
export const updateCliente = (id, clienteData) =>
  apiClient.patch(`/clientes/${id}`, { cliente: clienteData });
export const deleteCliente = (id) => apiClient.delete(`/clientes/${id}`);

// Bloco de Imóveis
export const getImoveis = (params = {}) =>
  apiClient.get("/imoveis", { params });
export const getImovelById = (id) => apiClient.get(`/imoveis/${id}`);
export const createImovel = (formData, config = {}) => {
  return apiClient.post("/imoveis", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });
};
export const updateImovel = (id, formData, config = {}) => {
  return apiClient.patch(`/imoveis/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });
};
export const deleteImovel = (id) => apiClient.delete(`/imoveis/${id}`);

// Bloco de Perfis de Busca (rotas aninhadas)
export const getPerfisBusca = (clienteId, config = {}) =>
  apiClient.get(`/clientes/${clienteId}/perfis_busca`, { ...config });
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

// CRUD adicional
export const getPropostaById = (id, config = {}) =>
  apiClient.get(`/propostas/${id}`, { ...config });
export const updateProposta = (id, propostaData) =>
  apiClient.patch(`/propostas/${id}`, { proposta: propostaData });
export const deleteProposta = (id) => apiClient.delete(`/propostas/${id}`);

// Ações customizadas da proposta
export const aceitarProposta = (propostaId) =>
  apiClient.patch(`/propostas/${propostaId}/aceitar`);
export const recusarProposta = (propostaId) =>
  apiClient.patch(`/propostas/${propostaId}/recusar`);
export const cancelarProposta = (propostaId) =>
  apiClient.patch(`/propostas/${propostaId}/cancelar`);

// Bloco de Busca de Imóveis (ação customizada)
export const buscarImoveisCompativeis = (perfilBuscaId, params = {}) =>
  apiClient.get("/imoveis/buscar", { params: { perfil_busca_id: perfilBuscaId, ...params } });

// Bloco de Características
export const getCaracteristicas = () => apiClient.get("/caracteristicas");

// Bloco de Agendamentos
export const getAgendamentos = (params = {}) =>
  apiClient.get("/agendamentos", { params });
export const getAgendamentoById = (id) => apiClient.get(`/agendamentos/${id}`);
export const createAgendamento = (agendamentoData) =>
  apiClient.post("/agendamentos", { agendamento: agendamentoData });
export const updateAgendamento = (id, agendamentoData) =>
  apiClient.patch(`/agendamentos/${id}`, { agendamento: agendamentoData });
export const deleteAgendamento = (id) => apiClient.delete(`/agendamentos/${id}`);

// Bloco de Lançamentos Financeiros
export const getLancamentoFinanceiros = (params = {}) =>
  apiClient.get("/lancamento_financeiros", { params });
export const getLancamentoFinanceiroById = (id) =>
  apiClient.get(`/lancamento_financeiros/${id}`);
export const createLancamentoFinanceiro = (lancamentoData) =>
  apiClient.post("/lancamento_financeiros", { lancamento_financeiro: lancamentoData });
export const updateLancamentoFinanceiro = (id, lancamentoData) =>
  apiClient.patch(`/lancamento_financeiros/${id}`, { lancamento_financeiro: lancamentoData });
export const deleteLancamentoFinanceiro = (id) =>
  apiClient.delete(`/lancamento_financeiros/${id}`);

export default apiClient;
