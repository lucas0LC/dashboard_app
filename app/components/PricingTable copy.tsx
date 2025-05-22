"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '../lib/utils/supabase/client';

interface transaction {
  transaction_date: string,
  transaction_time: string,
  type: string,
  amount: number,
}


export default function PricingTable() {
    const supabase = createClient();
    const [transactions, setTransactions] = useState<transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);

        useEffect(() => {
          const fetchTransactions = async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              
              if (user) {
                const { data, error } = await supabase
                .from('transactions')
                .select(`
                  transaction_date,
                  transaction_time,
                  type,
                  amount,
                  reports!inner (user_id)
                `)
                .eq('reports.user_id', user.id);
      
                if (error) throw new Error(error.message);
                setTransactions(data || []);
              } else {
                throw new Error('Usuário não autenticado');
              }
            } catch (err: any) {
              setError(err.message);
            } finally {
              setLoading(false);
            }
          };
      
          fetchTransactions();
        }, []);

        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
        const totalPages = Math.ceil(transactions.length / itemsPerPage);

        const pagination = (pageNumber: number) => setCurrentPage(pageNumber);
      
        if (loading) return <p>Carregando...</p>;
        if (error) return <p>Erro: {error}</p>;

  return (
    <div className="h-screen relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
          <tr className="bg-gray-100">
            <th className="px-6 py-3">Data</th>
            <th className="px-6 py-3">Hora</th>
            <th className="px-6 py-3">Categoria</th>
            <th className="px-6 py-3">Valor</th>
          </tr>
        </thead>
        <tbody>
        {currentTransactions.map((transaction, index) => (
          <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
            <td className="px-6 py-4">{transaction.transaction_date}</td>
            <td className="px-6 py-4">{transaction.transaction_time}</td>
            <td className="px-6 py-4">{transaction.type}</td>
            <td className="px-6 py-4">{transaction.amount}</td>
          </tr>
          ))}
        </tbody>
      </table>
      {/* Paginação */}
      <div className="flex justify-between items-center mt-4 p-4 bg-gray-50 dark:bg-gray-800">
        <button 
          onClick={() => pagination(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition-colors"
        >
          Anterior
        </button>
                
        <span className="text-gray-700 dark:text-gray-300">
          Página {currentPage} de {totalPages}
        </span>
                
        <button 
          onClick={() => pagination(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition-colors"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
