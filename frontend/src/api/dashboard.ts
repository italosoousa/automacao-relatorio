// /frontend/src/api/dashboard.ts
import axios from "axios";

// Usa variável de ambiente ou fallback para desenvolvimento local
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export interface DashboardRow {
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

export interface DashboardSummary {
  total_lucro: number;
  total_itens: number;
  skus_sem_cadastro: number;
}

export interface FilterOptions {
  states: string[];
  status_group: string[];
}

export interface DashboardResponse {
  rows: DashboardRow[];
  summary: DashboardSummary;
  filter_options: FilterOptions;
  missing_skus: MissingSkuItem[];
}

export const getDashboardPreview = async (
  mlFile: File,
  baseFile: File
): Promise<DashboardResponse> => {
  const formData = new FormData();

  // IMPORTANTE: estes nomes precisam bater com o backend (FastAPI UploadFile params)
  formData.append("ml_file", mlFile);
  formData.append("base_file", baseFile);

  try {
    const response = await axios.post<DashboardResponse>(
      `${API_BASE_URL}/api/dashboard/preview`,
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
