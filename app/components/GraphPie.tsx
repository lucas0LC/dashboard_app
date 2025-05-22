"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../lib/utils/supabase/client';
import Plotly from 'plotly.js-basic-dist-min';
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);

interface Report {
    value: number;
    dynamic_price: number;
    promotion: number;
}

interface GraphPieIdReport {
    reportId: number;
}

export default function GraphPie({ reportId }: GraphPieIdReport) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchReport() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if(user){
          const { data, error } = await supabase
          .from('reports')
          .select('id, value, dynamic_price, promotion')
          .eq('id', reportId)
          .eq('user_id', user.id)
          .single();

          if (error) throw new Error(error.message);
          setReport( data )
        }

      } catch (error: any) {
        console.error("Erro ao buscar os dados:", error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [reportId]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!report) {
    return <div>Nenhum dado encontrado.</div>;
  }

  const ValueAjust = report.value - report.dynamic_price

  const data = [{
    values: [ValueAjust, report.dynamic_price, report.promotion],
    labels: ['Valor', 'Dinâmica', 'Promoção'],
    type: 'pie',
    textinfo: "label+percent",
    textposition: "outside"
  }];

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)', 
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: 'white' },
    height: 400,
    width: 400,
  };

  const config = {
    displayModeBar: false,
    responsive: true
  }

  return (
    <Plot data={data} layout={layout} config={config}></Plot>
  )
}