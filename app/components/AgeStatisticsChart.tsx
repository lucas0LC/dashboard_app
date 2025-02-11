"use client";

import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const AgeStatisticsChart = () => {
  const data = {
    labels: [19, 20, 21, 22, 23, 24, 25, 26, 27],
    datasets: [
      {
        label: 'Age statistics of borrowers',
        data: [12, 19, 3, 5, 2, 3, 7, 8, 10],
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default AgeStatisticsChart;
