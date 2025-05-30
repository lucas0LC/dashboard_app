"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '../lib/utils/supabase/client';
import PdfUploader from "./components/PdfUp";
import { sortDatePeriods } from '../lib/utils/SortDate';

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

// Atualizando a interface Report para incluir um ID
interface Report {
  id: string | number; // Essencial para a exclusão
  report_period: string;
  // Adicione outros campos se necessário, como created_at, file_name, etc.
}

const ITEMS_PER_PAGE = 5;

export default function DocumentsPage() {
  const supabase = createClient();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error: fetchErr } = await supabase
            .from('reports')
            .select('id, report_period')
            .eq('user_id', user.id);

          if (fetchErr) throw new Error(fetchErr.message);

          const sortedReports = sortDatePeriods(data || [], 'desc');
          setReports(sortedReports);
        } else {
          throw new Error('Usuário não autenticado. Faça login para ver seus documentos.');
        }
      } catch (err: unknown) {
        if(err instanceof Error){
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [supabase]);

  const totalPages = Math.ceil(reports.length / ITEMS_PER_PAGE);
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return reports.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [reports, currentPage]);

  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleDeleteReport = async (reportId: string | number, reportPeriod: string) => {
    setActionError(null);
    if (!window.confirm(`Tem certeza que deseja excluir o relatório "${reportPeriod}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setIsDeleting(reportId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sessão expirada. Faça login novamente para excluir.');
      }

      const { error: deleteError } = await supabase
        .from('reports')
        .delete()
        .match({ id: reportId, user_id: user.id });

      if (deleteError) {
        throw new Error(`Falha ao excluir o relatório: ${deleteError.message}`);
      }

      // Atualiza o local removendo o report excluído
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
      if (paginatedReports.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: unknown) {
      if(err instanceof Error){
        console.error("Erro ao excluir relatório:", err);
        setActionError(err.message);
      }
    } finally {
      setIsDeleting(null);
    }
  };
  
  const handleUploadSuccess = (addNewReport: Report) => {
    setReports(prevReports => {
      const updatedReports = sortDatePeriods([addNewReport, ...prevReports], 'desc');
      return updatedReports;
    });
    setCurrentPage(1); 
    setActionError(null);
  };


  if (loading && reports.length === 0) return <div className="p-8 text-center text-gray-300">Carregando seus documentos...</div>;
  if (error) return <div className="p-8 text-center text-red-400">Erro ao carregar documentos: {error}</div>;
  
  return (
    <div className="flex justify-center p-3 md:p-6 w-full lg:w-2/3 mx-auto">
      <div className='p-4 sm:p-6 w-full rounded-lg bg-gray-800 shadow-2xl'>
        <h1 className="text-2xl sm:text-3xl text-gray-300 font-bold mb-6 text-center sm:text-left">
          Gerenciar Documentos
        </h1>
        
        <PdfUploader onUploadSuccess={handleUploadSuccess} />

        {actionError && (
            <div className="my-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md text-sm text-center">
                {actionError}
            </div>
        )}

        <div className="mt-2">
          <h2 className="text-xl ml-1 text-gray-300 font-semibold mb-4">Relatórios Enviados</h2>
          {reports.length === 0 && !loading ? (
            <p className="text-center text-gray-500 py-8">Nenhum relatório encontrado. Comece fazendo um upload!</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg shadow-md border border-gray-700">
                <table className="w-full text-sm text-left text-gray-400">
                  <thead className='text-xs uppercase bg-gray-700 text-gray-400'>
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Período do Relatório
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReports.map(report => (
                      <tr key={report.id} className='bg-gray-800 border-b border-gray-700 hover:bg-gray-700/70 transition-colors duration-150'>
                        <td className='px-6 py-4 font-medium text-gray-200 whitespace-nowrap'>
                          {report.report_period}
                        </td>
                        <td className='px-6 py-4 text-right'>
                          <button
                            onClick={() => handleDeleteReport(report.id, report.report_period)}
                            disabled={isDeleting === report.id}
                            className="font-medium text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-wait p-1 rounded hover:bg-red-500/10"
                            aria-label={`Excluir relatório ${report.report_period}`}
                          >
                            {isDeleting === report.id ? (
                              <span className="italic text-xs">Excluindo...</span>
                            ) : (
                              <TrashIcon />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between text-sm text-gray-300">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  <span>
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
