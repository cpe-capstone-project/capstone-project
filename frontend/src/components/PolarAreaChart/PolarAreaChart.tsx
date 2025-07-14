
import { PolarArea, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from 'chart.js';

// ✅ ลงทะเบียน chart types
ChartJS.register(
  RadialLinearScale,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// 🎨 สีพาสเทล
const pastelBlue = '#A5D8FF';
const pastelPink = '#FFB5E8';
const pastelPurple = '#D5AAFF';

// ✅ ข้อมูล PolarArea
const polarData: ChartData<'polarArea'> = {
  labels: ['ดีขึ้น', 'แย่ลง', 'คงที่'],
  datasets: [
    {
      label: 'สรุปผู้ป่วย',
      data: [60, 10, 30],
      backgroundColor: [pastelBlue, pastelPink, pastelPurple],
      borderColor: '#fff',
      borderWidth: 1,
    },
  ],
};

// ✅ ข้อมูล Line chart
const lineData: ChartData<'line'> = {
  labels: ['สัปดาห์ที่ 1', 'สัปดาห์ที่ 2', 'สัปดาห์ที่ 3', 'สัปดาห์ที่ 4'],
  datasets: [
    {
      label: 'นภัสวรรณ',
      data: [2, 3, 4, 5],
      borderColor: pastelBlue,
      backgroundColor: 'rgba(165, 216, 255, 0.3)',
      tension: 0.4,
      pointBackgroundColor: pastelBlue,
    },
    {
      label: 'กิตติภพ',
      data: [3, 2, 2, 1],
      borderColor: pastelPink,
      backgroundColor: 'rgba(255, 181, 232, 0.3)',
      tension: 0.4,
      pointBackgroundColor: pastelPink,
    },
    {
      label: 'สมศรี',
      data: [3, 3, 3, 3],
      borderColor: pastelPurple,
      backgroundColor: 'rgba(213, 170, 255, 0.3)',
      tension: 0.4,
      pointBackgroundColor: pastelPurple,
    },
  ],
};

// ✅ Options สำหรับ Line chart
const lineOptions: ChartOptions<'line'> = {
  plugins: {
    legend: {
      labels: {
        color: '#555',
        font: { size: 14 },
      },
    },
  },
  scales: {
    x: {
      ticks: { color: '#777' },
      grid: { color: '#eee' },
    },
    y: {
      ticks: { color: '#777' },
      grid: { color: '#eee' },
    },
  },
};

// ✅ Options สำหรับ PolarArea chart
const polarOptions: ChartOptions<'polarArea'> = {
  plugins: {
    legend: {
      labels: {
        color: '#555',
        font: { size: 14 },
      },
    },
  },
  scales: {
    r: {
      angleLines: { color: '#eee' },
      grid: { color: '#eee' },
      pointLabels: { color: '#666' },
      ticks: { color: '#888', backdropColor: 'transparent' },
    },
  },
};

export default function SummaryCharts() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '24px',
        color: '#333',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      <div>
        <h4 style={{ marginBottom: '12px', color: '#444' }}>แนวโน้มอารมณ์ผู้ป่วยแต่ละคน</h4>
        <Line data={lineData} options={lineOptions} />
      </div>
      <div>
        <h4 style={{ marginBottom: '12px', color: '#444' }}>สรุปผลรวมผู้ป่วย</h4>
        <PolarArea data={polarData} options={polarOptions} />
      </div>
    </div>
  );
}
