"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '../lib/utils/supabase/client';

interface Report {
  value: number;
  dynamic_price: number;
  promotion: number;
  final_earnings: number;
}
interface ReportsCardsProps {
  reportId: number;
}

export default function ReportsCards({ reportId }: ReportsCardsProps) {
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
          .select('value, dynamic_price, promotion, final_earnings')
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

  const ValueAjust = Math.round((report.value - report.dynamic_price) * 100) / 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card title="Valor" value={ValueAjust} />
      <Card title="Dinâmica" value={report.dynamic_price} />
      <Card title="Promoção" value={report.promotion} />
      <Card title="Valor Final" value={report.final_earnings} />
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {title}
      </h5>
      <p className="font-normal text-gray-700 dark:text-gray-400">R$ {value}</p>
    </div>
  );
}