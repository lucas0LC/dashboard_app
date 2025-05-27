import { createClient } from '../../lib/utils/supabase/client';
import { adjustTransactionDate } from '../../lib/utils/Insights'
import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);

interface Transaction {
    date_start: string;
    time_start: string;
    type: string;
    amount: number;
}

interface typeReportMonth {
    Month: number;
}

export default function ReportMonth({ Month }: typeReportMonth) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchTransactions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('transactions')
            .select('type, date_start, time_start, amount')
            .order('date_start', { ascending: true })
            .order('time_start', { ascending: true });
        
        if (!error && data) {
            setTransactions(data);
        }
        setLoading(false);
        };
        if (Month) fetchTransactions();

    }, [Month]);

    if (loading) return <p>Carregando dados...</p>;
    if (transactions.length === 0) return <p>Nenhuma transação encontrada.</p>;

    return (
        <div>teste</div>
    );
};