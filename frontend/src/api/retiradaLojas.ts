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

export interface RetiradaResponse {
  id: number;
  loja: string;
  responsavel: string;
  observacao: string | null;
  created_at: string;
  items: RetiradaItemResponse[];
}

export const lookupProductByBarcode = async (
  barcode: string
): Promise<ProductLookupResult> => {
  const response = await axios.get<ProductLookupResult>(
    `${API_BASE_URL}/api/retirada-lojas/lookup/barcode/${encodeURIComponent(barcode)}`
  );
  return response.data;
};

export const createRetirada = async (
  payload: RetiradaCreate
): Promise<RetiradaResponse> => {
  const response = await axios.post<RetiradaResponse>(
    `${API_BASE_URL}/api/retirada-lojas/`,
    payload
  );
  return response.data;
};
