import MetricsCard from './components/MetricsCard';
import ReportCard from './components/ReportCard';
import AgeStatisticsChart from './components/AgeStatisticsChart';
import PricingTable from './components/PricingTable';

export default function Home() {
  const reportMetrics = [
    { label: "Refund amount", value: "50%", percent: "+20%" },
    { label: "Refund of interest", value: "25%", percent: "+20%" },
    { label: "Main debt", value: "85%", percent: "+10%" },
    { label: "Return of fines", value: "60%", percent: "+70%" },
  ];

  return (
    <div className="flex-1 min-h-screen p-8">
      <main className="flex-1 grid grid-cols-4 gap-4">
        <MetricsCard title="Revenue" value="$405,091.00" percentage="+4.75%" />
        <MetricsCard title="Overdue invoices" value="$12,787.00" percentage="+54.02%" />
        <MetricsCard title="Outstanding invoices" value="$245,988.00" percentage="-1.39%" />
        <MetricsCard title="Expenses" value="$30,156.00" percentage="+10.18%" />
      </main>
      <div className="mt-8 flex-1 grid grid-cols-2 gap-10 h-56">
        <ReportCard title="Final report" metrics={reportMetrics} />
        <AgeStatisticsChart />
      </div>
      <div className="mt-8">
        <PricingTable />
      </div>
    </div>
  );
}
