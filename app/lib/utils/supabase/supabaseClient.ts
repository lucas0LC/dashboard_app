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
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Erro de autenticação ou usuário não encontrado:', authError);
    return { data: null, error: authError || { message: 'Usuário não autenticado.', code: 'AUTH_ERROR' } };
  }

  try {
    const { data: existingReport, error: checkError } = await supabase
      .from('reports')
      .select('id')
      .eq('user_id', user.id)
      .eq('report_period', report_period)
      .maybeSingle();

    if (checkError) {
      console.error('Erro ao verificar relatório existente:', checkError);
      return { data: null, error: checkError };
    }

    if (existingReport) {
      console.warn(`Tentativa de inserir relatório duplicado para o período: ${report_period} e usuário: ${user.id}`);
      return { 
        data: null, 
        error: { 
          message: `Já existe um relatório para o período "${report_period}".`, 
          code: 'DUPLICATE_REPORT_PERIOD'
        } 
      };
    }
  } catch (e: unknown) {
    if(e instanceof Error){
      console.error('Exceção durante a verificação de duplicidade:', e);
      return { data: null, error: { message: e.message || 'Erro inesperado ao verificar duplicidade.'} };
    }
  };

  const { data: reportData, error: reportError } = await supabase
    .from('reports')
    .insert([{ user_id: user?.id, report_period, value, dynamic_price, promotion, final_earnings }])
    .select('id, report_period');

  if (reportError) {
    console.error('Erro ao inserir report:', reportError);
    return { data: null, error: reportError };
  }

  if (!reportData || reportData.length === 0) {
    const error = new Error('Nenhum report foi inserido.');
    console.error(error);
    return { data: null, error: { message: error.message, code: 'INSERT_FAILED'} };
  }

  const reportId = reportData[0].id;

  const transactionsToInsert = transactions.map((tx) => {
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

  const { error: transactionsError } = await supabase
    .from('transactions')
    .insert(transactionsToInsert);

  if (transactionsError) {
    console.error('Erro ao inserir transactions:', transactionsError);
    return { data: null, error: transactionsError };
  }

  return { data: { id: reportId, report_period: reportData[0].report_period }, error: null };
}
