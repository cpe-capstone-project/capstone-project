// DiarySummaryChart.tsx
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Props = {
  summaryData: { month: string; count: number }[];
};

const DiarySummaryChart: React.FC<Props> = ({ summaryData }) => {
  const data = {
    labels: summaryData.map((item) => item.month),
    datasets: [
      {
        label: "จำนวนไดอารี่",
        data: summaryData.map((item) => item.count),
        backgroundColor: "rgba(75, 192, 192, 0.4)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "สรุปจำนวนไดอารี่รายเดือน",
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default DiarySummaryChart;
