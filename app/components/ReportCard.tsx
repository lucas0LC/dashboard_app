interface Metric {
  label: string;
  value: string;
  percent: string;
}

interface ReportCardProps {
  title: string;
  metrics: Metric[];
}

export default function ReportCard({ title, metrics }: ReportCardProps) {
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg">
      <h3 className="text-lg font-bold">{title}</h3>
      <div className="flex justify-between mt-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex flex-col items-center">
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="text-sm">{metric.label}</div>
            <div className={`text-sm ${metric.percent.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              {metric.percent}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
