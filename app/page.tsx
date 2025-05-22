"use client";
import React, { useState } from 'react';
import ReportsCards from './components/ReportsCards';
import ReportInsights from './components/ReportInsights';
import ReportTable from './components/ReportTable';
import GraphPie from './components/GraphPie';

export default function Home() {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  // carrega e define o primeiro report como padrão
  const handleReportsLoaded = (reports: { id: number }[]) => {
    if (reports.length > 0 && !selectedReportId) {
      setSelectedReportId(reports[0].id);
    }
  };

  return (
    <div className="inline-flex p-4 h-screen">
      <div className='inline-flex flex-col w-full'>
        {selectedReportId && (
          <div className="mt-6">
            <ReportsCards reportId={selectedReportId} />
          </div>
        )}
        <div className="mt-14 flex-1">
          <ReportInsights reportId={selectedReportId} />
        </div>
      </div>
      <div className="ml-6 mt-6">
        <ReportTable onSelectReport={setSelectedReportId} onReportsLoaded={handleReportsLoaded} />
        <GraphPie reportId={selectedReportId} ></GraphPie>
      </div>
    </div>
  );
}
