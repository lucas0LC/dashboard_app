import { RawTransaction, RawHeader, RawData, ReportData, TransactionData, StructuredData } from '../../dataInterfaces'

interface DateComponents {
  day: string;
  month: string;
  year: string | null;
}

// Função para converter valores monetários para numéricos
function parseCurrency(currencyStr: string): number {
  const regex = /R\$\s*([\d.]+),(\d{2})/;
  const match = currencyStr.match(regex);
  if (match) {
    const integerPart = match[1].replace(/\./g, "");
    const decimalPart = match[2];
    return parseFloat(integerPart + "." + decimalPart);
  }
  return 0;
}

// Função para formatar strings de hora que vêm sem separador, ex.: "0111" => "01:11"
function formatTimeString(timeStr: string): string {
  if (timeStr.length === 4) {
    return timeStr.slice(0, 2) + ":" + timeStr.slice(2);
  }
  return timeStr;
}

/**
 * Extrai os componentes da data (dia, mês, ano) a partir de uma string.
 * Se o ano não for informado e um ano base for fornecido,
 * utiliza a lógica: se o mês extraído for menor que o mês base, o ano é baseYear+1; caso contrário, é baseYear.
 */
function extractDateComponents(
  dateStr: string,
  baseYear: string | null = null,
  baseMonth: string | null = null
): DateComponents | null {
  const cleanedDateStr = dateStr.replace(/^[^0-9]*/, "").trim();
  const regex = /(\d{1,2})\s+de\s+(\w+)\.?(?:\s+de\s+(\d{4}))?/i;
  const match = cleanedDateStr.match(regex);
  if (match) {
    const day = match[1].padStart(2, "0");
    const monthAbbrev = match[2].toLowerCase();
    const monthMap: { [key: string]: string } = {
      jan: "01",
      fev: "02",
      mar: "03",
      abr: "04",
      mai: "05",
      jun: "06",
      jul: "07",
      ago: "08",
      set: "09",
      out: "10",
      nov: "11",
      dez: "12",
    };
    const month = monthMap[monthAbbrev] || "01";
    let year: string | null = match[3] || null; // Se não vier, será null.
    if (!year && baseYear && baseMonth) {
      // Se o mês extraído for menor que o mês base, consideramos virada de ano.
      if (parseInt(month, 10) < parseInt(baseMonth, 10)) {
        year = String(parseInt(baseYear, 10) + 1);
      } else {
        year = baseYear;
      }
    }
    return { day, month, year };
  }
  return null;
}

/**
 * Processa o campo "datetime_start" no formato "17 de fev 0046".
 * Se o ano não estiver presente, utiliza baseYear e baseMonth para inferir.
 * Retorna uma string no formato "DD/MM/YYYY HH:MM".
 */
function parseDatetimeStart(
  datetimeStartStr: string,
  baseYear: string | null = null,
  baseMonth: string | null = null
): string | null {
  const regex = /(\d{1,2}\s+de\s+\w+)\s+(\d{4})/i;
  const match = datetimeStartStr.match(regex);
  if (match) {
    const datePartComponents = extractDateComponents(match[1], baseYear, baseMonth);
    const timePart = formatTimeString(match[2]);
    if (datePartComponents && datePartComponents.year) {
      return `${datePartComponents.day}/${datePartComponents.month}/${datePartComponents.year} ${timePart}`;
    }
  }
  return null;
}

/**
 * Processa o cabeçalho do relatório.
 * Além de montar o report, extrai um "ano base" e "mês base" a partir da data de início do período.
 */
function processHeader(rawHeader: RawHeader[]): ReportData {
  const header = rawHeader[0];
  const periodo = header.periodo;
  const parts = periodo.split("-");
  if (parts.length < 2) {
    throw new Error("Formato do período inválido.");
  }
  const startPart = parts[0].trim().replace(/\s+\d+h/, "");
  const endPart = parts[1].trim().replace(/\s+\d+h/, "");

  const startComponents = extractDateComponents(startPart);
  const endComponents = extractDateComponents(endPart);

  if (!startComponents || !endComponents || !startComponents.year) {
    throw new Error("Não foi possível extrair o ano do cabeçalho.");
  }

  // Se a data final não tiver ano, aplica a lógica de virada de ano
  let startYear = startComponents.year;
  let endYear = endComponents.year;
  if (!endYear) {
    if (parseInt(endComponents.month, 10) < parseInt(startComponents.month, 10)) {
      endYear = String(parseInt(startYear, 10) + 1);
    } else {
      endYear = startYear;
    }
  }
  const startDate = `${startComponents.day}/${startComponents.month}/${startYear}`;
  const endDate = `${endComponents.day}/${endComponents.month}/${endYear}`;
  const reportPeriod = `${startDate} - ${endDate}`;

  let value = 0, dynamic_price = 0, promotion = 0;
  header.detalhes.forEach((item) => {
    const descricao = item.descricao.toLowerCase();
    if (descricao === "valor") {
      value = parseCurrency(item.valor);
    } else if (descricao === "preço dinâmico") {
      dynamic_price = parseCurrency(item.valor);
    } else if (descricao === "promoção") {
      promotion = parseCurrency(item.valor);
    }
  });
  const final_earnings = parseCurrency(header.total);

  return {
    report_period: reportPeriod,
    value,
    dynamic_price,
    promotion,
    final_earnings,
    baseYear: startComponents.year,
    baseMonth: startComponents.month,
  };
}

/**
 * Processa as transações utilizando os valores base extraídos do cabeçalho.
 */
function processTransactions(rawTransactions: RawTransaction[], baseYear: string, baseMonth: string): TransactionData[] {
  return rawTransactions.map((tx) => {
    const dateComp = extractDateComponents(tx.date_end, baseYear, baseMonth);
    const dateFormatted =
      dateComp && dateComp.year
        ? `${dateComp.day}/${dateComp.month}/${dateComp.year}`
        : null;
    return {
      date: dateFormatted,
      time_end: formatTimeString(tx.time_end),
      datetime_start: parseDatetimeStart(tx.datetime_start, baseYear, baseMonth),
      type: tx.type,
      amount: parseCurrency(tx.ganho),
    };
  });
}

/**
 * Função que recebe uma string contendo o JSON com os dados do cabeçalho e transações,
 * processa-os e retorna os dados estruturados.
 */
export const processData = async (jsonStr: string): Promise<StructuredData> => {
  try {
    const rawData = JSON.parse(jsonStr) as RawData;
    const headerData: ReportData = processHeader(rawData.header);
    
    if (!headerData.baseYear || !headerData.baseMonth) {
      throw new Error("Ano ou mês base não definidos no cabeçalho.");
    }

    const transactionsData: TransactionData[] = processTransactions(
      rawData.transacoes,
      headerData.baseYear,
      headerData.baseMonth
    );

    const structuredData: StructuredData = {
      ...headerData,
      transactions: transactionsData,
    };

    return structuredData;
  } catch (error: any) {
    console.error("Erro no processamento:", error.message);
    throw error;
  }
};
