// src/Servicos/Api.js
import axios from "axios";

// ATENÇÃO: Lembre-se que para React Native, você precisará trocar 'localhost' pelo IP da sua máquina.
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api/v1", // Usando o namespace da API
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor que adiciona o token JWT a todas as requisições autenticadas
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Funções da API ---

// Sessões
export const loginUser = (login, password) =>
  apiClient.post("/login", { usuario: { login, senha: password } });
//------- fim do bloco SESSÕES -------

// Dashboard
export const getDashboardStats = () => apiClient.get("/dashboard_stats");
//------- fim do bloco DASHBOARD -------

// Usuários
export const getUsuarios = () => apiClient.get("/usuarios");
export const getUsuarioById = (id) => apiClient.get(`/usuarios/${id}`);
export const createUsuario = (usuarioData) =>
  apiClient.post("/usuarios", { usuario: usuarioData });
export const updateUsuario = (id, usuarioData) =>
  apiClient.patch(`/usuarios/${id}`, { usuario: usuarioData });
export const deleteUsuario = (id) => apiClient.delete(`/usuarios/${id}`); // Inativação
//------- fim do bloco USUÁRIOS -------

// Clientes
export const getClientes = () => apiClient.get("/clientes");
export const createCliente = (clienteData) =>
  apiClient.post("/clientes", { cliente: clienteData });
export const updateCliente = (id, clienteData) =>
  apiClient.patch(`/clientes/${id}`, { cliente: clienteData });
export const deleteCliente = (id) => apiClient.delete(`/clientes/${id}`); // Exclusão
export const getClienteById = (id) => apiClient.get(`/clientes/${id}`);
//------- fim do bloco CLIENTES -------

// IMÓVEIS - ADICIONE ESTE BLOCO
export const getImoveis = () => apiClient.get("/imoveis");
export const createImovel = (formData) => {
  // Para upload de fotos, precisamos enviar como FormData
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

export const getImovelById = (id) => apiClient.get(`/imoveis/${id}`); // <-- ADICIONE ESTA
//------- fim do bloco IMÓVEIS -------

// PERFIS DE BUSCA - ADICIONE ESTE BLOCO
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
//------- fim do bloco PERFIS DE BUSCA -------

// PROPOSTAS - ADICIONE ESTE BLOCO
// A busca "match" que recebe o ID de um perfil
export const buscarImoveisCompativeis = (perfilBuscaId) =>
  apiClient.get(`/imoveis/buscar?perfil_busca_id=${perfilBuscaId}`);

export const createProposta = (propostaData) =>
  apiClient.post("/propostas", { proposta: propostaData });
//------- fim do bloco PROPOSTAS -------

export default apiClient;
