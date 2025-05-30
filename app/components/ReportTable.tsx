"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '../lib/utils/supabase/client';
import { sortDatePeriods } from '../lib/utils/SortDate';

interface Report {
  id: number;
  report_period: string;
}
interface ReportTableProps {
  onSelectReport: (id: number) => void;
  onReportsLoaded: (reports: Report[]) => void;
}

export default function ReportTable({ onSelectReport, onReportsLoaded }: ReportTableProps) {
  const supabase = createClient();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('reports')
            .select('id, report_period')
            .eq('user_id', user.id);

          if (error) throw new Error(error.message);

          const sortedReports = sortDatePeriods(data || []); 
          setReports(sortedReports);
          onReportsLoaded(sortedReports || []);
        } else {
          throw new Error('Usuário não autenticado');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          console.error("Erro desconhecido ao buscar os dados:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [onReportsLoaded ,supabase, error]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = reports.slice(startIndex, endIndex);
  const totalPages = Math.ceil(reports.length / itemsPerPage);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="h-auto bg-gray-800 relative overflow-x-auto shadow-md sm:rounded-lg w-auto">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-300">
        <thead className='text-xs text-gray-100 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300'>
          <tr className='bg-gray-700'>
            <th className="px-6 py-3">Relatórios Semanais</th>
          </tr>
        </thead>
        <tbody>
          {currentReports.map(report => (
            <tr key={report.id} className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200'>
              <td className='px-6 py-4 hover:bg-gray-700 rounded'>
                <button onClick={() => onSelectReport(report.id)} className="text-gray-300 hover:bg-gray-600 hover:text-white">
                  {report.report_period}
                </button>
              </td>
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
  );
}