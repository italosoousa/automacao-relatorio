import axios from "axios";

const isProduction = (): boolean => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return (
    hostname.includes("vercel.app") ||
    hostname.includes("netlify.app") ||
    import.meta.env.PROD ||
    (hostname !== "localhost" && hostname !== "127.0.0.1")
  );
};

const normalizeApiUrl = (url: string | undefined): string => {
  const envUrl = url || import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    let normalizedUrl = envUrl.trim().replace(/\/+$/, "");
    if (!normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    return normalizedUrl;
  }
  if (isProduction()) {
    return "https://automacao-relatorio-production.up.railway.app";
  }
  return "http://127.0.0.1:8000";
};

const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_BASE_URL);

// ── Tipos base ────────────────────────────────────────────────────────────────

export interface ProductLookupResult {
  codigo_linx: string;
  descricao: string | null;
  preco_custo: number | null;
  codigo_barras: string | null;
  sku: string | null;
}

export interface RetiradaItemCreate {
  codigo_linx: string | null;
  codigo_barras: string | null;
  descricao: string | null;
  preco_custo: number | null;
}

export interface RetiradaCreate {
  loja: string;
  responsavel: string;
  observacao?: string;
  items: RetiradaItemCreate[];
}

export interface RetiradaItemResponse {
  id: number;
  retirada_id: number;
  codigo_linx: string | null;
  codigo_barras: string | null;
  descricao: string | null;
  preco_custo: number | null;
}

// ── Status ────────────────────────────────────────────────────────────────────

export type RetiradaStatus = "pendente" | "aprovado" | "rejeitado";

// ── Resposta completa (com itens) ─────────────────────────────────────────────

export interface RetiradaResponse {
  id: number;
  loja: string;
  responsavel: string;
  observacao: string | null;
  created_at: string;
  items: RetiradaItemResponse[];
  // Aprovação
  status: RetiradaStatus;
  aprovado_por: string | null;
  aprovado_em: string | null;
  motivo_rejeicao: string | null;
  // Robô Playwright (integração futura)
  robo_executado: boolean;
  robo_executado_em: string | null;
  robo_resultado: string | null;
}

// ── Item de listagem (sem itens detalhados) ───────────────────────────────────

export interface RetiradaListItem {
  id: number;
  loja: string;
  responsavel: string;
  created_at: string;
  total_items: number;
  // Aprovação
  status: RetiradaStatus;
  aprovado_por: string | null;
  aprovado_em: string | null;
  motivo_rejeicao: string | null;
  // Robô Playwright (integração futura)
  robo_executado: boolean;
  robo_executado_em: string | null;
  robo_resultado: string | null;
}

// ── Funções de API ────────────────────────────────────────────────────────────

/** Busca produto pelo código de barras (bipagem) */
export const lookupProductByBarcode = async (
  barcode: string
): Promise<ProductLookupResult> => {
  const response = await axios.get<ProductLookupResult>(
    `${API_BASE_URL}/api/retirada-lojas/lookup/barcode/${encodeURIComponent(barcode)}`
  );
  return response.data;
};

/** Cria uma nova retirada com os itens bipados */
export const createRetirada = async (
  payload: RetiradaCreate
): Promise<RetiradaResponse> => {
  const response = await axios.post<RetiradaResponse>(
    `${API_BASE_URL}/api/retirada-lojas/`,
    payload
  );
  return response.data;
};

/** Lista todas as retiradas (com filtros opcionais) */
export const listRetiradas = async (params?: {
  loja?: string;
  status_filter?: RetiradaStatus;
}): Promise<RetiradaListItem[]> => {
  const response = await axios.get<RetiradaListItem[]>(
    `${API_BASE_URL}/api/retirada-lojas/`,
    { params }
  );
  return response.data;
};

/** Busca uma retirada completa por ID (inclui todos os itens) */
export const getRetirada = async (id: number): Promise<RetiradaResponse> => {
  const response = await axios.get<RetiradaResponse>(
    `${API_BASE_URL}/api/retirada-lojas/${id}`
  );
  return response.data;
};

/** Aprova uma retirada pendente */
export const aprovarRetirada = async (
  id: number,
  aprovadoPor: string
): Promise<RetiradaResponse> => {
  const response = await axios.patch<RetiradaResponse>(
    `${API_BASE_URL}/api/retirada-lojas/${id}/aprovar`,
    { aprovado_por: aprovadoPor }
  );
  return response.data;
};

/** Rejeita uma retirada pendente com motivo */
export const rejeitarRetirada = async (
  id: number,
  motivo: string
): Promise<RetiradaResponse> => {
  const response = await axios.patch<RetiradaResponse>(
    `${API_BASE_URL}/api/retirada-lojas/${id}/rejeitar`,
    { motivo_rejeicao: motivo }
  );
  return response.data;
};
