// /frontend/src/api/rfidDashboard.ts
import axios from "axios";

// Reutiliza a mesma lógica de detecção de URL do dashboard.ts
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

// TODO: Definir os tipos conforme o schema do backend
export interface RfidDashboardRow {
  id?: string | null;
  campo1?: string | null;
  campo2?: number | null;
  // Adicionar mais campos conforme necessário
}

export interface RfidDashboardSummary {
  total_itens: number;
  // Adicionar mais campos conforme necessário
}

export interface RfidDashboardResponse {
  rows: RfidDashboardRow[];
  summary: RfidDashboardSummary;
}

export const getRfidDashboardPreview = async (
  file1: File,
  file2: File
): Promise<RfidDashboardResponse> => {
  const formData = new FormData();
  formData.append("file1", file1);
  formData.append("file2", file2);

  try {
    const response = await axios.post<RfidDashboardResponse>(
      `${API_BASE_URL}/api/rfid-dashboard/preview`,
      formData,
      {
        timeout: 120000,
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
