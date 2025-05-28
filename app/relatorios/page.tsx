"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '../lib/utils/supabase/client';
import { adjustTransactionDate } from '../lib/utils/Insights';
import { ReportFilterSidebar } from './components/relatorioFilterSidebar';
import { ReportMonth } from './components/relatorioTable';

export interface TransactionForReport {
  id?: string | number;
  date_start: string;
  time_start: string;
  type: string;
  amount: number;
}

interface ProcessedTransaction extends TransactionForReport {
  adjustedDate: Date;
}

export default function RelatoriosPage() {
  const supabase = createClient();
  const [uniqueYearsFromData, setUniqueYearsFromData] = useState<number[]>([]);
  // Map principal: Ano -> (Mês -> Transações[])
  const [transactionsByYearMonth, setTransactionsByYearMonth] = 
    useState<Map<number, Map<number, ProcessedTransaction[]>>>(new Map());

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndProcessInitialData = async () => {
      setLoadingInitialData(true);
      setFetchError(null);

      const { data, error } = await supabase
        .from('transactions')
        .select('id, type, date_start, time_start, amount')
      if (error) {
        console.error("Erro ao buscar transações:", error);
        setFetchError(`Falha ao carregar dados: ${error.message}`);
        setLoadingInitialData(false);
        return;
      }

      if (data && data.length > 0) {
        const processed: ProcessedTransaction[] = data.map((t: TransactionForReport) => ({
          ...t,
          adjustedDate: adjustTransactionDate(t.date_start, t.time_start),
        }))

        const yearsSet = new Set<number>();
        processed.forEach(t => yearsSet.add(t.adjustedDate.getFullYear()));
        const detectedYears = Array.from(yearsSet).sort((a, b) => b - a);
        setUniqueYearsFromData(detectedYears);

        if (detectedYears.length > 0 && !detectedYears.includes(selectedYear)) {
          setSelectedYear(detectedYears[0]);
        };

        const TransactionsByYearMonth = new Map<number, Map<number, ProcessedTransaction[]>>();
        processed.forEach(transaction => {
          const year = transaction.adjustedDate.getFullYear();
          const month = transaction.adjustedDate.getMonth(); // 0-11

          if (!TransactionsByYearMonth.has(year)) {
            TransactionsByYearMonth.set(year, new Map<number, ProcessedTransaction[]>());
          }
          const monthMap = TransactionsByYearMonth.get(year)!;

          if (!monthMap.has(month)) {
            monthMap.set(month, []);
          }
          monthMap.get(month)!.push(transaction);
        });
        setTransactionsByYearMonth(TransactionsByYearMonth);

      } else {
        setUniqueYearsFromData([]);
        setTransactionsByYearMonth(new Map());
      }
      setLoadingInitialData(false);
    };

    fetchAndProcessInitialData();
  }, [supabase]);


  const transactionsForDetailedView = useMemo(() => {
    return transactionsByYearMonth.get(selectedYear)?.get(selectedMonth) || [];
  }, [selectedYear, selectedMonth, transactionsByYearMonth]);

  // Agrupa todas transações referente ao ano
  const allTransactionsForSelectedYear = useMemo(() => {
    const yearDataMap = transactionsByYearMonth.get(selectedYear);
    const transactions: ProcessedTransaction[] = [];
    if (yearDataMap) {
      yearDataMap.forEach(monthTransactions => {
        transactions.push(...monthTransactions);
      });
    }
    return transactions;
  }, [selectedYear, transactionsByYearMonth]);


  if (loadingInitialData) {
    return <div className="p-8 text-center">Carregando dados iniciais dos relatórios...</div>;
  }

  if (fetchError) {
    return <div className="p-8 text-center text-red-500">Erro: {fetchError}</div>;
  }
  
  if (uniqueYearsFromData.length === 0 && !loadingInitialData) {
      return <div className="p-8 text-center text-gray-500">Nenhuma transação encontrada no banco de dados para gerar relatórios.</div>;
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-900 w-3/4 text-white">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Painel de Relatórios</h1>
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          <ReportFilterSidebar
            selectedMonth={selectedMonth} // 0-11
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            availableYears={uniqueYearsFromData}
            className="lg:sticky lg:top-20 flex-shrink-0" 
          />
          <main className="flex-1">
            <ReportMonth
              displayMonth={selectedMonth} 
              displayYear={selectedYear}
              transactionsForDailySummary={transactionsForDetailedView}
              allTransactionsInSelectedYear={allTransactionsForSelectedYear}
            />
          </main>
        </div>
      </div>
    </div>
  );
}