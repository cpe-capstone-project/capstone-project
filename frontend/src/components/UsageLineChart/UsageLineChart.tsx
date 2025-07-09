// components/UsageLineChart.tsx
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Props = {
  data: { date: string; count: number }[];
};

const UsageLineChart: React.FC<Props> = ({ data }) => {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "จำนวนการเข้าใช้งาน",
        data: data.map((d) => d.count),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return <Line data={chartData} />;
};

export default UsageLineChart;
