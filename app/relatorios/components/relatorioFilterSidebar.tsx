import React from 'react';

interface ReportFilterSidebarProps {
  selectedMonth: number; // 0-11
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  availableYears: number[];
  className?: string;
}

export  const ReportFilterSidebar: React.FC<ReportFilterSidebarProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  availableYears,
  className = '',
}) => {
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const yearsToDisplay = React.useMemo(() => {
    return [...availableYears].sort((a, b) => b - a);
  }, [availableYears]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onYearChange(parseInt(event.target.value, 10));
  };

  return (
    <aside 
      className={`w-full lg:w-60 xl:w-72 bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg flex-shrink-0 ${className}`}
      aria-label="Filtros do Relatório"
    >
      <div className="mb-6">
        <label htmlFor="year-select" className="block text-sm font-medium text-gray-300 mb-1">
          Ano:
        </label>
        <select
          id="year-select"
          name="year"
          value={selectedYear}
          onChange={handleYearChange}
          disabled={yearsToDisplay.length === 0}
          className="block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 disabled:opacity-50"
        >
          {yearsToDisplay.length === 0 ? (
            <option>Nenhum ano disponível</option>
          ) : (
            yearsToDisplay.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))
          )}
        </select>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-300">
          Mês:
        </h3>
        <ul className="space-y-2">
          {monthNames.map((name, index) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => onMonthChange(index)} // Envia o index 0~11
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-150
                  ${selectedMonth === index 
                    ? 'bg-indigo-600 text-white font-semibold shadow-md' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                aria-current={index === selectedMonth ? "true" : undefined}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};