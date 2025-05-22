function parseDateTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}`);
}

/**
 * Calcula a diferença em minutos entre duas datas.
 */
export function differenceInMinutes(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Ajusta a data da transação considerando que o dia de trabalho termina às 4h da manhã.
 * Se o horário for menor que 4h, a transação é considerada do dia anterior.
 */
export function adjustTransactionDate(dateStr: string, timeStr: string): Date {
  const dt = parseDateTime(dateStr, timeStr);
  if (dt.getHours() < 4) {
    // Subtrai um dia para considerar que a transação ainda pertence ao dia anterior
    dt.setDate(dt.getDate() - 1);
  }
  return dt;
}

/**
 * Retorna o dia da semana ajustado.
 */
export function getAdjustedDay(dateStr: string, timeStr: string): number {
  return adjustTransactionDate(dateStr, timeStr).getDay();
}

/**
 * Retorna o nome do dia da semana.
 */
export function getDayName(day: number): string {
  const dayNames = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];
  return dayNames[day] || '';
}

/**
 * Calcula a duração (em minutos) entre o início e o fim de uma janela de trabalho,
 * considerando que o dia de trabalho é definido de 4h a 4h.
 * Se a data/hora final for "menor" que a inicial, assume que a jornada passou da meia-noite e adiciona 24h.
 */
export function computeDuration(startDate: string, startTime: string, endDate: string, endTime: string): number {
    let startDT = adjustTransactionDate(startDate, startTime);
    let endDT = adjustTransactionDate(endDate, endTime);
    // Se a data final ajustada for menor que a inicial, significa que o fim ocorreu após a meia-noite (dentro do mesmo dia de trabalho)
    if (endDT < startDT) {
      endDT = new Date(endDT.getTime() + 24 * 60 * 60 * 1000);
    }
    return differenceInMinutes(startDT, endDT);
}
