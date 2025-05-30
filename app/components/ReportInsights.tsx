'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '../lib/utils/supabase/client';
import { getAdjustedDay, getDayName, computeDuration } from '../lib/utils/Insights';
import Plotly, { type Data } from 'plotly.js-basic-dist-min';
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);

interface Transaction {
  transaction_date: string;
  date_start: string;
  time_start: string;
  time_end: string;
  amount: number;
}

interface ReportInsightsProps {
  reportId: number | null;
}

export default function ReportInsights({ reportId }: ReportInsightsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('transaction_date, date_start, time_start, time_end, amount')
        .eq('report_id', reportId)
        .order('date_start', { ascending: true })
        .order('time_start', { ascending: true });
      
      if (!error && data) {
        setTransactions(data);
      }
      setLoading(false);
    };

    if (reportId) fetchTransactions();
  }, [reportId, supabase]);

  if (loading) return <p>Carregando insights...</p>;
  if (transactions.length === 0) return <p>Nenhuma transação encontrada.</p>;

  // Uber termina seu dia de trabalho todos os dias às 4h ¯\_(ツ)_/¯
  // Agrupa as transações por dia da semana ajustado (considerando que o dia termina às 4h)
  const weekMap = new Map<number, Transaction[]>();
  transactions.forEach(t => {
    const day = getAdjustedDay(t.date_start, t.time_start);
    if (!weekMap.has(day)) {
      weekMap.set(day, [t]);
    } else {
      weekMap.get(day)!.push(t);
    }
  });
  
  // Para cada grupo (dia), calcula a "janela de trabalho", os intervalos entre transações e o tempo ocioso total.
  const workTimes = Array.from(weekMap.entries()).map(([day, trans]) => {
    // Horas de trabalho: entre a primeira e a última transação do grupo.
    const first = trans[0];
    const last = trans[trans.length - 1];
    const duration = computeDuration(first.date_start, first.time_start, last.transaction_date, last.time_end);

    return {
      day,
      dayName: getDayName(day),
      duration,  // Tempo total de trabalho (em minutos)
      count: trans.length,
    };
  });
  
  const week = Array.from({ length: 7}, (_, i) => i);
  const weekDataForGraph = week.map(day => {
    if (weekMap.has(day)) {
      const trans = weekMap.get(day);
      if(trans){
        const totalTrans = trans.reduce((total, valor) => total + valor.amount, 0);
        return { x: getDayName(day), y: totalTrans };
      } else{ return { x: getDayName(day), y: null }; };
    } else {
      return { x: getDayName(day), y: null };
    }
  });
  const data: Data[] = [{
    x: weekDataForGraph.map(grap => grap.x),
    y: weekDataForGraph.map(grap => grap.y),
    type: 'bar',
    marker: { color: 'rgb(79, 70, 229)' },
    hovertemplate: "%{x}<br>Total: R$ %{y:,.2f}<extra></extra>"
  }];

  const layout = {
    title: "Semana",
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: 'white' },
    xaxis: {
      type: 'category' as const,
      fixedrange: true,
      tickfont: { color: '#9ca3af' }, 
      gridcolor: 'rgba(55, 65, 81, 0.5)',
      automargin: true
    },
    yaxis: {
      fixedrange: true,
      tickfont: { color: '#9ca3af' }, 
      gridcolor: 'rgba(55, 65, 81, 0.5)',
      automargin: true,
      tickprefix: 'R$',
      tickformat: ",.2f"
    }
  };

  const config ={
    displayModeBar: false,
    scrollZoom: false,
    responsive: true
  }


  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Análise Semanal</h2>
      <ul className="space-y-2">
        {workTimes.map(({ day, dayName, duration, count }) => (
          <li key={day}>
            <strong>{dayName}:</strong> {count} Corridas – Horas aproximada de trabalho: {Math.floor(duration / 60)}h {duration % 60}min
          </li>
        ))}
      </ul>
      <Plot data={data} layout={layout} config={config}></Plot>
    </div>
  );
}
