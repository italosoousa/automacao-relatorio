// /frontend/src/api/mercadoLivreDashboard.ts
import axios from "axios";

// Detecta se está rodando em produção (Vercel)
const isProduction = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  // Detecta se está no Vercel ou em produção
  return hostname.includes('vercel.app') || 
         hostname.includes('netlify.app') || 
         import.meta.env.PROD ||
         (hostname !== 'localhost' && hostname !== '127.0.0.1');
};

// Normaliza a URL da API para garantir que sempre tenha protocolo
const normalizeApiUrl = (url: string | undefined): string => {
  const envUrl = url || import.meta.env.VITE_API_BASE_URL;
  
  if (envUrl) {
    // Remove espaços e barras no final
    let normalizedUrl = envUrl.trim().replace(/\/+$/, "");
    
    // Se não começar com http:// ou https://, adiciona https://
    if (!normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    
    return normalizedUrl;
  }
  
  // Se não houver variável de ambiente configurada
  if (isProduction()) {
    // Em produção, sempre usa a URL do Railway
    console.log("🔗 Usando URL padrão do Railway (produção)");
    return "https://automacao-relatorio-production.up.railway.app";
  }
  
  // Em desenvolvimento, usa localhost
  return "http://127.0.0.1:8000";
};

// Usa variável de ambiente ou fallback
const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_BASE_URL);

// Log da URL sendo usada
console.log("🔗 API Base URL:", API_BASE_URL);
console.log("🌍 Ambiente:", isProduction() ? "Produção" : "Desenvolvimento");

export interface MercadoLivreDashboardRow {
  // Campos existentes
  sku: string | null;
  descricao: string;
  estado: string | null;
  lucro_bruto: number | null;
  status_group: string;

  // Campos do modal
  sale_number?: string | null;
  sale_date?: string | null;
  status_description?: string | null;
  revenue_product?: number | null;
  fee_taxes?: number | null;
  shipping_fees?: number | null;
  total?: number | null;
  cost?: number | null;
  ml_listing_id?: string | null;
}

export interface MissingSkuItem {
  sku: string | null;
  descricao: string;
  estado: string | null;
}

export interface MercadoLivreDashboardSummary {
  total_lucro: number;
  total_itens: number;
  skus_sem_cadastro: number;
}

export interface FilterOptions {
  states: string[];
  status_group: string[];
}

export interface MercadoLivreDashboardResponse {
  rows: MercadoLivreDashboardRow[];
  summary: MercadoLivreDashboardSummary;
  filter_options: FilterOptions;
  missing_skus: MissingSkuItem[];
}

export const getMercadoLivreDashboardPreview = async (
  mlFile: File
): Promise<MercadoLivreDashboardResponse> => {
  const formData = new FormData();

  // IMPORTANTE: nome precisa bater com o backend (FastAPI UploadFile params)
  // Agora só envia a planilha do ML - produtos são buscados do banco de dados
  formData.append("ml_file", mlFile);

  try {
    const response = await axios.post<MercadoLivreDashboardResponse>(
      `${API_BASE_URL}/api/mercado-livre-dashboard/preview`,
      formData,
      {
        // não é necessário setar Content-Type manualmente; o browser adiciona o boundary corretamente
        // headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000, // 2 min (planilhas podem ser pesadas)
      }
    );

    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const detail =
        (err.response?.data as any)?.detail ||
        err.response?.statusText ||
        err.message;

      throw new Error(detail || "Ocorreu um erro desconhecido na API.");
    }

    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
    );
  }
};
