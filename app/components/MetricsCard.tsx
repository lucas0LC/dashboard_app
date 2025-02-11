interface MetricsCardProps {
  title: string;
  value: string;
  percentage: string;
}

export default function MetricsCard({ title, value, percentage }: MetricsCardProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-48col justify-between h-32">
      <h3 className="text-gray-600">{title}</h3>
      <div className="text-xl font-bold text-black">{value}</div>
      <div className={`text-sm ${percentage.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
        {percentage}
      </div>
    </div>
  );
}
