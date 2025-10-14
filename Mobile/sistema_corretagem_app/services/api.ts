import Constants from "expo-constants";
import { Platform } from "react-native";

// Base URL do backend. Preferencialmente configurada via expo-constants (app.json -> expo.extra.API_BASE_URL)
// Fallback inteligente para dispositivos físicos: se estiver em mobile e API_BASE_URL usar localhost/127.0.0.1,
// tenta descobrir o IP do host de desenvolvimento (Expo) para montar http://<IP>:3001
function resolveBaseUrl(): string {
  const configuredRaw: string = (Constants?.expoConfig as any)?.extra?.API_BASE_URL || "http://localhost:3001";
  const configured = configuredRaw.replace(/\/+$/, "");

  const isWeb = Platform.OS === "web";
  const usesLocalhost = configured.includes("localhost") || configured.includes("127.0.0.1");

  // Em web, força IPv4 para evitar resolução para ::1 quando o servidor não escuta IPv6
  if (isWeb && usesLocalhost) {
    try {
      const u = new URL(configured);
      if (u.hostname === "localhost") {
        u.hostname = "127.0.0.1";
        const forced = u.origin;
        console.debug("[API] Forçando IPv4 em Web para evitar ::1: ", { from: configured, to: forced });
        return forced;
      }
    } catch {
      // Fallback simples se URL parsing falhar
      const forced = configured.replace("localhost", "127.0.0.1");
      console.debug("[API] Forçando IPv4 (fallback) em Web: ", { from: configured, to: forced });
      return forced;
    }
  }

  if (!isWeb && usesLocalhost) {
    const hostCandidate =
      // SDKs mais novos expõem hostUri em expoConfig
      (Constants as any)?.expoConfig?.hostUri ||
      // SDKs antigos expõem debuggerHost em manifest
      (Constants as any)?.manifest?.debuggerHost ||
      // Em algumas versões, o host pode estar em manifest2.extra.expoGo.developer.host
      (Constants as any)?.manifest2?.extra?.expoGo?.developer?.host || "";

    if (typeof hostCandidate === "string" && hostCandidate.length > 0) {
      const ip = hostCandidate.split(":")[0];
      if (ip && ip.trim().length > 0) {
        // Se app.json fornecer porta via expo.extra.API_PORT, usa ela; senão assume 3001
        const portRaw = (Constants?.expoConfig as any)?.extra?.API_PORT;
        const port = typeof portRaw === "string" && portRaw.trim().length > 0 ? portRaw.trim() : "3001";
        return `http://${ip}:${port}`;
      }
    }
  }

  return configured;
}

const API_BASE_URL: string = resolveBaseUrl();
console.debug(`[API] Base URL resolvida: ${API_BASE_URL}`);

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

function buildHeaders(isJson: boolean = true): HeadersInit {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers["Content-Type"] = "application/json";
    headers["Accept"] = "application/json"; // força resposta JSON do Rails
  }
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  return headers;
}

// --- Autenticação ---
export async function loginRequest(login: string, password: string) {
  const url = `${API_BASE_URL}/api/v1/login`;
  console.debug("[API] POST /api/v1/login", { url });

  const resp = await fetch(url, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify({ usuario: { login, password } }),
  });

  const status = resp.status;
  const contentType = resp.headers.get("Content-Type") || "";

  if (!resp.ok) {
    const errorText = await safeReadText(resp);
    console.debug("[API] Login falhou", { status, contentType, errorText });
    throw new Error(errorText || `Falha no login: HTTP ${status}`);
  }

  let data: any;
  try {
    if ((contentType || "").toLowerCase().includes("application/json")) {
      data = await resp.json();
    } else {
      const text = await resp.text();
      console.debug("[API] Login retornou texto não-JSON", { length: text.length });
      data = JSON.parse(text);
    }
  } catch (e: any) {
    console.debug("[API] Erro ao parsear resposta de login", { status, contentType, message: e?.message });
    throw new Error("Resposta inesperada do servidor de login");
  }

  console.debug("[API] Login bem-sucedido", { userId: data?.user?.id, role: data?.user?.role });
  // data: { user: { id, nome, role }, token }
  return data as { user: { id: number; nome: string; role: string }; token: string };
}

// --- Métodos genéricos ---
export async function apiGet<T = any>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const resp = await fetch(url, { method: "GET", headers: buildHeaders(false) });
  if (!resp.ok) {
    const errorText = await safeReadText(resp);
    throw new Error(errorText || `Falha no GET ${path}: HTTP ${resp.status}`);
  }
  return (await resp.json()) as T;
}

export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const resp = await fetch(url, { method: "POST", headers: buildHeaders(true), body: JSON.stringify(body) });
  if (!resp.ok) {
    const errorText = await safeReadText(resp);
    throw new Error(errorText || `Falha no POST ${path}: HTTP ${resp.status}`);
  }
  return (await resp.json()) as T;
}

async function safeReadText(resp: Response) {
  try {
    return await resp.text();
  } catch (e) {
    return "";
  }
}

export async function apiPatch<T = any>(path: string, body: any): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const resp = await fetch(url, { method: "PATCH", headers: buildHeaders(true), body: JSON.stringify(body) });
  if (!resp.ok) {
    const errorText = await safeReadText(resp);
    throw new Error(errorText || `Falha no PATCH ${path}: HTTP ${resp.status}`);
  }
  return (await resp.json()) as T;
}

export async function apiDelete<T = { ok: true }>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const resp = await fetch(url, { method: "DELETE", headers: buildHeaders(false) });
  if (!resp.ok) {
    const errorText = await safeReadText(resp);
    throw new Error(errorText || `Falha no DELETE ${path}: HTTP ${resp.status}`);
  }
  // DELETE normalmente retorna 204 sem conteúdo
  return ({ ok: true } as unknown) as T;
}

// ---- Clientes ----
export type Cliente = {
  id: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  // Campos adicionais existem no backend, mas vamos começar com o mínimo necessário para o CRUD inicial
};

export type ClientePayload = {
  nome?: string;
  email?: string | null;
  telefone?: string | null;
  // Suporta expansões futuras: endereco_attributes, conjuge_attributes, etc.
};

export async function getClientes(): Promise<Cliente[]> {
  return apiGet("/api/v1/clientes");
}

export async function createCliente(payload: ClientePayload): Promise<Cliente> {
  return apiPost("/api/v1/clientes", { cliente: payload });
}

export async function updateCliente(id: number, payload: ClientePayload): Promise<Cliente> {
  return apiPatch(`/api/v1/clientes/${id}`, { cliente: payload });
}

export async function deleteCliente(id: number): Promise<{ ok: true }> {
  return apiDelete(`/api/v1/clientes/${id}`);
}

// ---- Imóveis ----
export type Imovel = {
  id: number;
  nome_empreendimento: string;
  tipo?: string | null;
  finalidade?: string | null;
  valor?: number | null;
  status?: string | null;
  endereco?: {
    id?: number;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
};

export type ImovelPayload = {
  nome_empreendimento?: string;
  tipo?: string | null;
  finalidade?: string | null;
  valor?: number | null;
  status?: string | null;
  endereco_attributes?: {
    id?: number;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  // Campos aninhados adicionais suportados pelo backend (comodo_attributes, infraestrutura_attributes, piso_attributes, posicao_attributes, proximidade_attributes, caracteristica_ids, photos) podem ser adicionados conforme necessidade
};

export async function getImoveis(): Promise<Imovel[]> {
  return apiGet("/api/v1/imoveis");
}

export async function createImovel(payload: ImovelPayload): Promise<Imovel> {
  return apiPost("/api/v1/imoveis", { imovel: payload });
}

export async function updateImovel(id: number, payload: ImovelPayload): Promise<Imovel> {
  return apiPatch(`/api/v1/imoveis/${id}`, { imovel: payload });
}

export async function deleteImovel(id: number): Promise<{ ok: true }> {
  return apiDelete(`/api/v1/imoveis/${id}`);
}

// ---- Usuários ----
export type Usuario = {
  id: number;
  nome: string;
  login: string;
  role: "admin" | "gerente" | "corretor";
  ativo: boolean;
};

export type UsuarioCreatePayload = {
  nome: string;
  login: string;
  password: string;
  role?: "admin" | "gerente" | "corretor";
};

export type UsuarioUpdatePayload = {
  nome?: string;
  login?: string;
  password?: string;
  role?: "admin" | "gerente" | "corretor";
  ativo?: boolean;
};

export async function getUsuarios(): Promise<Usuario[]> {
  return apiGet("/api/v1/usuarios");
}

export async function createUsuario(payload: UsuarioCreatePayload): Promise<Usuario> {
  return apiPost("/api/v1/usuarios", { usuario: payload });
}

export async function updateUsuario(id: number, payload: UsuarioUpdatePayload): Promise<Usuario> {
  return apiPatch(`/api/v1/usuarios/${id}`, { usuario: payload });
}

export async function deactivateUsuario(id: number): Promise<{ ok: true }> {
  return apiDelete(`/api/v1/usuarios/${id}`);
}