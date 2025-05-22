interface DatePeriod {
  [key: string]: any; // objeto genérico, para diferentes estruturas de dados
  report_period: string;
}

/**
 * utilitário para ordena datas, funciona com qualquer objeto que tenha a propriedade report_period
 */
export const sortDatePeriods = <T extends DatePeriod>(periods: T[], order: 'asc' | 'desc' = 'desc'): T[] => {
  const parseDate = (period: string) => {
    const [start] = period.split(' - ');
    const [day, month, year] = start.split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  return [...periods].sort((a, b) => {
    const dateA = parseDate(a.report_period);
    const dateB = parseDate(b.report_period);
    return order === 'desc' 
      ? dateB.getTime() - dateA.getTime() 
      : dateA.getTime() - dateB.getTime();
  });
};