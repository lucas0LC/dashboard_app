import { createClient } from './server';

// Defina os tipos para os dados que você espera inserir
interface Transaction {
  date: string; // formato "dd/mm/yyyy"
  time: string; // formato "HH:MM" ou "HH:MM:SS"
  type: string;
  amount: number;
}

interface Dados {
  report_period: string;
  value: number;
  dynamic_price: number;
  promotion: number;
  final_earnings: number;
  transactions: Transaction[];
}


// Função para converter data de "dd/mm/yyyy" para "yyyy-mm-dd"
function convertDateFormat(dateStr: string): string {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Função para garantir que o horário esteja no formato "HH:MM:SS"
function formatTime(timeStr: string): string {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    return `${timeStr}:00`;
  }
  return timeStr;
}

export async function insertDataToSupabase(dados: Dados) {
  const { report_period, value, dynamic_price, promotion, final_earnings, transactions } = dados;

  const supabase = await createClient();
  const { data: { user }} = await supabase.auth.getUser();

  // 1. Inserir dados na tabela 'reports'
  const { data: reportData, error: reportError } = await supabase
    .from('reports')
    .insert([{ user_id: user?.id, report_period, value, dynamic_price, promotion, final_earnings }])
    .select(); // .select() para retornar os dados inseridos (incluindo o id)

  if (reportError) {
    console.error('Erro ao inserir report:', reportError);
    return { data: null, error: reportError };
  }

  if (!reportData || reportData.length === 0) {
    const error = new Error('Nenhum report foi inserido.');
    console.error(error);
    return { data: null, error };
  }

  // Recupera o id do report inserido
  const reportId = reportData[0].id;

  // 2. Preparar os dados das transações, associando o report_id e convertendo os formatos de data e hora
  const transactionsToInsert = transactions.map((tx) => ({
    report_id: reportId,
    transaction_date: convertDateFormat(tx.date), // "yyyy-mm-dd"
    transaction_time: formatTime(tx.time),          // "HH:MM:SS"
    type: tx.type,
    amount: tx.amount,
  }));

  // Inserir os dados na tabela 'transactions'
  const { data: transactionsData, error: transactionsError } = await supabase
    .from('transactions')
    .insert(transactionsToInsert);

  if (transactionsError) {
    console.error('Erro ao inserir transactions:', transactionsError);
    return { data: null, error: transactionsError };
  }

  return { data: { report: reportData, transactions: transactionsData }, error: null };
}