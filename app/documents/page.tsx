"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '../lib/utils/supabase/client';
import PdfUploader from "../components/PdfUp";
import { sortDatePeriods } from '../lib/utils/SortDate';

interface Report {
  report_period: string;
}


export default function DocumentsPage() {
  const supabase = createClient();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('reports')
            .select('report_period')
            .eq('user_id', user.id);

          if (error) throw new Error(error.message);

          // Padrão: recente primeiro 'desc', adicionar o parametro 'asc' para mais antigo primeiro
          const sortedReports = sortDatePeriods(data || []); 
          setReports(sortedReports);
        } else {
          throw new Error('Usuário não autenticado');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;
  

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] p-8">
      <h1 className="text-2xl font-bold mb-4">Upload PDF Relatorio</h1>
      <PdfUploader />
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
          <tr className='bg-gray-100'>
            <th className="px-6 py-3">File Name</th>
            <th className="px-6 py-3">Ação</th>
          </tr>
        </thead>
        <tbody>
        {reports.map(report => (
          <tr key={report.report_period} className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200'>
            <td className='px-6 py-4'>{report.report_period}</td>
            <td className='px-6 py-4'>
              <button>teste</button>
            </td>
          </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
