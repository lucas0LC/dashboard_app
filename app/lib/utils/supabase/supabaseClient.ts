import { createClient } from './server';
import { StructuredData } from '../../../dataInterfaces'


// Função para converter data de "DD/MM/YYYY" para "YYYY-MM-DD"
function convertDateFormat(dateStr: string): string {
  const parts = dateStr.split('/');
  if (parts.length !== 3) {
    throw new Error(`Formato de data inválido: ${dateStr}`);
  }
  const [day, month, year] = parts;
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

export async function insertDataToSupabase(dados: StructuredData) {
  const { report_period, value, dynamic_price, promotion, final_earnings, transactions } = dados;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Inserir dados na tabela 'reports'
  const { data: reportData, error: reportError } = await supabase
    .from('reports')
    .insert([{ user_id: user?.id, report_period, value, dynamic_price, promotion, final_earnings }])
    .select(); // retorna os dados inseridos (incluindo o id)

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

  // 2. Preparar os dados das transações, convertendo formatos e dividindo datetime_start
  const transactionsToInsert = transactions.map((tx) => {
    // Converte a data da transação
    const transaction_date = tx.date ? convertDateFormat(tx.date) : null;
    const [dateStartPart, timeStartPart] = tx.datetime_start? tx.datetime_start.split(' '): "";
    const date_start = convertDateFormat(dateStartPart);
    const time_start = formatTime(timeStartPart);
    const time_end = formatTime(tx.time_end);
    
    return {
      report_id: reportId,
      transaction_date,
      date_start,
      time_start,
      time_end,
      type: tx.type,
      amount: tx.amount,
    };
  });

  // 3. Inserir os dados na tabela 'transactions'
  const { data: transactionsData, error: transactionsError } = await supabase
    .from('transactions')
    .insert(transactionsToInsert);

  if (transactionsError) {
    console.error('Erro ao inserir transactions:', transactionsError);
    return { data: null, error: transactionsError };
  }

  return { data: { report: reportData, transactions: transactionsData }, error: null };
}
