export interface RawHeader {
  periodo: string;
  detalhes: { descricao: string; valor: string }[];
  total: string;
}

export interface RawTransaction {
  date_end: string;
  time_end: string;
  datetime_start: string;
  type: string;
  ganho: string;
  saldo_atual: string;
}

export interface RawData {
  header: RawHeader[];
  transacoes: RawTransaction[];
}

export interface ReportData {
  report_period: string;
  value: number;
  dynamic_price: number;
  promotion: number;
  final_earnings: number;
  baseYear: string;
  baseMonth: string;
}

export interface TransactionData {
  date: string | null;
  time_end: string;
  datetime_start: string | null;
  type: string;
  amount: number;
}

export interface StructuredData {
  report_period: string;
  value: number;
  dynamic_price: number;
  promotion: number;
  final_earnings: number;
  transactions: TransactionData[];
}

export interface ApiKeyResponseData {
  apiKey?: string;
  keyName?: string;
  keyHint?: string;
  message?: string;
  error?: string;
}

export interface ExistingApiKeyInfo {
  keyName: string | null;
  keyHint: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}