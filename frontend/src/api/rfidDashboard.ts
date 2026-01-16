// /frontend/src/api/rfidDashboard.ts
import axios from "axios";

// Detecta se está rodando em produção
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

// Normaliza a URL da API
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
    console.log("🔗 Usando URL padrão do Railway (produção)");
    return "https://automacao-relatorio-production.up.railway.app";
  }

  return "http://127.0.0.1:8000";
};

const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_BASE_URL);

console.log("🔗 RFID API Base URL:", API_BASE_URL);

// =============================================================================
// TIPOS - Conferência RFID (MICROVIX vs RFID)
// =============================================================================

/**
 * Status possíveis da conferência RFID
 */
export type RfidStatus = 
  | "OK"           // Quantidades conferem
  | "FALTANDO"     // Faltam itens no RFID
  | "SOBRANDO"     // Itens extras no RFID
  | "SO_MICROVIX"  // Apenas no MICROVIX
  | "SO_RFID";     // Apenas no RFID

/**
 * Cards de resumo do dashboard RFID
 */
export interface RfidDashboardCards {
  total_itens_microvix: number;  // Soma das quantidades do MICROVIX
  total_itens_rfid: number;      // Soma das quantidades do RFID
  total_divergencias: number;    // Quantidade de EANs com status != OK
  itens_ok: number;              // Quantidade de EANs com status OK
  itens_faltando: number;        // Quantidade de EANs com status FALTANDO
  itens_sobrando: number;        // Quantidade de EANs com status SOBRANDO
  itens_so_microvix: number;     // Quantidade de EANs apenas no MICROVIX
  itens_so_rfid: number;         // Quantidade de EANs apenas no RFID
}

/**
 * Linha individual do relatório RFID
 */
export interface RfidDashboardRow {
  codigo_barras: string;
  descricao?: string | null;
  qtd_microvix: number;
  qtd_rfid: number;
  diferenca: number;  // qtd_rfid - qtd_microvix (positivo = sobrando, negativo = faltando)
  status: RfidStatus;
}

/**
 * Resposta completa do endpoint RFID
 */
export interface RfidDashboardResponse {
  cards: RfidDashboardCards;
  divergencias: RfidDashboardRow[];  // Itens com status != OK
  ok: RfidDashboardRow[];            // Itens com status OK
  all?: RfidDashboardRow[];          // Lista completa (opcional)
}

// =============================================================================
// FUNÇÃO PRINCIPAL DE FETCH
// =============================================================================

/**
 * Busca o dashboard de conferência RFID vs MICROVIX
 * 
 * @param microvixFile - Arquivo MICROVIX.xlsx
 * @param rfidFile - Arquivo RFID.csv
 * @returns Dashboard com cards, divergências e lista completa
 */
export const getRfidDashboardPreview = async (
  microvixFile: File,
  rfidFile: File
): Promise<RfidDashboardResponse> => {
  const formData = new FormData();

  // IMPORTANTE: Nomes devem bater com o backend (FastAPI UploadFile params)
  formData.append("microvix_file", microvixFile);
  formData.append("rfid_file", rfidFile);

  try {
    const response = await axios.post<RfidDashboardResponse>(
      `${API_BASE_URL}/api/rfid-dashboard/preview`,
      formData,
      {
        timeout: 120000, // 2 minutos (planilhas podem ser grandes)
      }
    );

    // Se "all" não vier no response, monta a partir de divergencias + ok
    if (!response.data.all) {
      response.data.all = [...response.data.divergencias, ...response.data.ok];
    }

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
