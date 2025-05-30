"use client";
import React, { useState } from 'react';
import ReportsCards from './components/ReportsCards';
import ReportTable from './components/ReportTable';

import dynamic from 'next/dynamic';
const DynamicGraphPie = dynamic(
  () => import('./components/GraphPie'),
  {
    ssr: false,
    loading: () => <p>Carregando gráfico Pie...</p>
  }
);

const DynamicInsights = dynamic(
  () => import('./components/ReportInsights'),
  {
    ssr: false,
    loading: () => <p>Carregando estatisticas...</p>
  }
);

export default function Home() {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  // carrega e define o primeiro report como padrão
  const handleReportsLoaded = (reports: { id: number }[]) => {
    if (reports.length > 0 && !selectedReportId) {
      setSelectedReportId(reports[0].id);
    }
  };

  return (
    <div className="inline-flex p-4 h-[calc(100vh-4rem)]">
      <div className='inline-flex flex-col w-full'>
        {selectedReportId && (
          <div className="mt-6">
            <ReportsCards reportId={selectedReportId} />
          </div>
        )}
        <div className="mt-14 flex-1">
          <DynamicInsights reportId={selectedReportId} />
        </div>
      </div>
      <div className="ml-6 mt-6">
        <ReportTable onSelectReport={setSelectedReportId} onReportsLoaded={handleReportsLoaded} />
        <DynamicGraphPie reportId={selectedReportId} ></DynamicGraphPie>
      </div>
    </div>
  );
}
