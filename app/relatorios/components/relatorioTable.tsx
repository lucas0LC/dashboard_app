import React, { useEffect, useState, useMemo  } from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);

interface Transaction {
    id?: string | number;
    date_start: string;
    time_start: string;
    type: string;
    amount: number;
}

interface dataTable {
    day: number;
    fullDate: Date;
    count: number; // Quantidade de transações neste dia
    types: string[];
    totalValue: number;
}

interface ProcessedTransaction extends Transaction {
    adjustedDate: Date;
}

interface ReportMonthProps {
  displayMonth: number; // 0-11
  displayYear: number;
  transactionsForDailySummary: ProcessedTransaction[];
  allTransactionsInSelectedYear: ProcessedTransaction[];
}

const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
 ];

const ReportMonth: React.FC<ReportMonthProps> = ({
  displayMonth,
  displayYear,
  transactionsForDailySummary,
  allTransactionsInSelectedYear,
}) => {
  const [dailySummaries, setDailySummaries] = useState<dataTable[]>([]);
  const [totalSelectedPeriodValue, setTotalSelectedPeriodValue] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;


  useEffect(() => {
    if (transactionsForDailySummary.length > 0) {
      const summariesMap = new Map<number, { dateObject: Date; count: number; types: Set<string>; totalValue: number }>();
      transactionsForDailySummary.forEach(transaction => {
        const dayOfMonth = transaction.adjustedDate.getDate();
        let dayData = summariesMap.get(dayOfMonth);
        if (!dayData) {
          dayData = {
            dateObject: new Date(transaction.adjustedDate.getFullYear(), transaction.adjustedDate.getMonth(), dayOfMonth),
            count: 0,
            types: new Set<string>(),
            totalValue: 0,
          };
        }
        dayData.count++;
        dayData.types.add(transaction.type);
        dayData.totalValue += transaction.amount;
        summariesMap.set(dayOfMonth, dayData);
      });

      const summariesArray: dataTable[] = Array.from(summariesMap.entries())
        .map(([day, data]) => ({
          day: day,
          fullDate: data.dateObject,
          count: data.count,
          types: Array.from(data.types).sort(),
          totalValue: data.totalValue,
        })).sort((a, b) => a.day - b.day);
      setDailySummaries(summariesArray);

      const totalValue = transactionsForDailySummary.reduce((sum, t) => sum + t.amount, 0);
      setTotalSelectedPeriodValue(totalValue);
    } else {
      setDailySummaries([]);
      setTotalSelectedPeriodValue(0);
    }
  }, [transactionsForDailySummary]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentdailySummaries = dailySummaries.slice(startIndex, endIndex);
  const totalPages = Math.ceil(dailySummaries.length / itemsPerPage);
  console.log(dailySummaries);
  

  // Prepara dados para o Plotly
  const { plotlyXLabels, plotlyYValues } = useMemo(() => {
    const monthlyTotalsForYear = new Map<number, number>();
    for (let i = 0; i < 12; i++) {
      monthlyTotalsForYear.set(i, 0);
    }

    allTransactionsInSelectedYear.forEach(transaction => {
      if (transaction.adjustedDate.getFullYear() === displayYear) {
        const monthIndex = transaction.adjustedDate.getMonth(); // 0-11
        monthlyTotalsForYear.set(monthIndex, (monthlyTotalsForYear.get(monthIndex) || 0) + transaction.amount);
      }
    });
    
    const xLabels: string[] = monthNames;
    const yValues: number[] = Array.from({ length: 12 }, (_, i) => monthlyTotalsForYear.get(i) || 0);
    
    return { plotlyXLabels: xLabels, plotlyYValues: yValues };
  }, [allTransactionsInSelectedYear, displayYear]);


  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('pt-BR', options || defaultOptions);
  };

  const currentMonthName = monthNames[displayMonth] || `Mês ${displayMonth + 1}`;

  if (transactionsForDailySummary.length === 0 && allTransactionsInSelectedYear.length === 0) {
      return (
        <div className="p-6 rounded-lg bg-gray-800 shadow-xl">
            <h2 className="text-2xl font-semibold mb-2 text-gray-300">Relatório de {currentMonthName} / {displayYear}</h2>
            <p className="text-gray-400">Nenhuma transação encontrada para {currentMonthName} de {displayYear}.</p>
        </div>
      );
  }


  return (
    <div className="space-y-8 p-1">
      <div className="p-6 rounded-lg bg-gray-800 shadow-xl">
        <h2 className="text-2xl font-semibold mb-2 text-gray-300">Detalhes de {currentMonthName} / {displayYear}</h2>
        <p className="text-lg mb-2 text-gray-400">
          Valor Total Movimentado em {currentMonthName}: 
          <span className="font-bold ml-2 text-white">
            R$ {totalSelectedPeriodValue.toFixed(2)}
          </span>
        </p>

        <h3 className="text-xl font-semibold mb-3 mt-4 text-gray-300">Resumo Diário de Transações</h3>
        {dailySummaries.length > 0 ? (
          <div className="overflow-auto max-h-[60vh] shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tipos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Valor Dia</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nº Transação.</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {currentdailySummaries.map(summary => (
                  <tr key={summary.day} className="hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{formatDate(summary.fullDate, { day: '2-digit', month: '2-digit' })}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{summary.types.join(', ')}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">R$ {summary.totalValue.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{summary.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-4 px-4 py-2">
                <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Anterior
                </button>
                <span className="text-gray-400 dark:text-gray-300">
                Página {currentPage} de {totalPages || 1}
                </span>
                <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Próximo
                </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Nenhuma transação encontrada para detalhamento diário em {currentMonthName} de {displayYear}.</p>
        )}
      </div>
      
      <div className="p-6 rounded-lg bg-gray-800 shadow-xl mt-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-300">Visão Geral Mensal do Ano: {displayYear}</h3>
        {allTransactionsInSelectedYear.length > 0 ? (
            <div className="w-full h-[400px] sm:h-[450px] md:h-[500px]"> 
                <Plot
                    data={[ { 
                        x: plotlyXLabels, 
                        y: plotlyYValues, 
                        type: 'bar', 
                        marker: { color: 'rgb(79, 70, 229)' },
                        hovertemplate: "%{x}<br>Total: R$ %{y:,.2f}<extra></extra>"
                    },]}
                    layout={{
                        xaxis: { 
                            title: 'Mês', 
                            tickfont: { color: '#9ca3af' }, 
                            gridcolor: 'rgba(55, 65, 81, 0.5)',
                            automargin: true,
                            fixedrange: true
                        },
                        yaxis: { 
                            title: 'Valor Total (R$)',
                            tickfont: { color: '#9ca3af' },
                            gridcolor: 'rgba(55, 65, 81, 0.5)',
                            fixedrange: true,
                            automargin: true,
                        },
                        dragmode: false,
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        font: { color: '#d1d5db' },
                        autosize: true,
                        margin: { l: 70, r: 30, b: 60, t: 30, pad: 4 }
                    }}
                    config={{ 
                        responsive: true,
                        displaylogo: false,
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    className="w-full h-full"
                />
            </div>
        ) : (
             <p className="text-gray-500">Nenhuma transação encontrada para o ano de {displayYear} para exibir o gráfico.</p>
        )}
      </div>
    </div>
  );
};
export default ReportMonth;