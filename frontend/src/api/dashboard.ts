// /frontend/src/api/dashboard.ts
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000'; // URL do seu backend FastAPI

export interface DashboardRow {
  sku: string | null;
  descricao: string;
  estado: string | null;
  lucro_bruto: number | null;
  status_group: string; // NOVO CAMPO
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

// NOVO TIPO PARA OPÇÕES DE FILTRO
export interface FilterOptions {
  states: string[];
  status_group: string[];
}

export interface DashboardResponse {
  rows: DashboardRow[];
  summary: DashboardSummary;
  filter_options: FilterOptions; // ALTERADO
  missing_skus: MissingSkuItem[];
}

export const getDashboardPreview = async (
  mlFile: File,
  baseFile: File
): Promise<DashboardResponse> => {
  const formData = new FormData();
  formData.append('ml_file', mlFile);
  formData.append('base_file', baseFile);

  try {
    const response = await axios.post<DashboardResponse>(
      `${API_BASE_URL}/api/dashboard/preview`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'Ocorreu um erro desconhecido na API.');
    }
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
  }
};