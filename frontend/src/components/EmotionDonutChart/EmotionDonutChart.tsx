import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './EmotionDonutChart.css';

ChartJS.register(ArcElement, Tooltip, ChartDataLabels);

const emotionData = [
  {
    label: 'Sadness',
    value: 10,
    color: '#f77da1',
    emoji: '😭',
    icon: 'https://cdn-icons-png.flaticon.com/128/10393/10393315.png',
  },
  {
    label: 'Anger',
    value: 10,
    color: '#ff6b6b',
    emoji: '😡',
    icon: 'https://cdn-icons-png.flaticon.com/128/3852/3852216.png',
  },
  {
    label: 'Fear',
    value: 15,
    color: '#fceaff',
    emoji: '😨',
    icon: 'https://cdn-icons-png.flaticon.com/128/4160/4160758.png',
  },
  {
    label: 'Happiness',
    value: 20,
    color: '#fff3b0',
    emoji: '😁',
    icon: 'https://cdn-icons-png.flaticon.com/128/10851/10851235.png',
  },
  {
    label: 'Confused',
    value: 10,
    color: '#b0d9ff',
    emoji: '😕',
    icon: 'https://cdn-icons-png.flaticon.com/128/742/742774.png',
  },
  {
    label: 'Love',
    value: 15,
    color: '#ffb6c1',
    emoji: '🥰',
    icon: 'https://cdn-icons-png.flaticon.com/128/1933/1933691.png',
  },
  {
    label: 'Disgust',
    value: 10,
    color: '#9be39b',
    emoji: '😖',
    icon: 'https://cdn-icons-png.flaticon.com/128/6637/6637180.png',
  },
  {
    label: 'Others',
    value: 10,
    color: '#c392e5',
    emoji: '❓',
    icon: 'https://cdn-icons-png.flaticon.com/128/722/722353.png',
  },
];

const total = emotionData.reduce((sum, e) => sum + e.value, 0);

const data = {
  labels: emotionData.map((e) => e.label),
  datasets: [
    {
      data: emotionData.map((e) => e.value),
      backgroundColor: emotionData.map((e) => e.color),
      borderWidth: 0,
      cutout: '60%',
    },
  ],
};

const options: ChartOptions<'doughnut'> = {
  plugins: {
    legend: {
      display: false,
    },
    datalabels: {
      color: '#333',
      font: {
        size: 14,
        weight: 'bold' as const,
      },
      formatter: function (value: number, context: any) {
        const percentage = ((value / total) * 100).toFixed(1);
        const emoji = emotionData[context.dataIndex].emoji;
        return `${emoji} ${percentage}%`;
      },
      anchor: 'center',
      align: 'center',
      offset: 4,
      clip: false,
    },
  },
};


const EmotionDonutChart = () => {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>🧠 Emotion Summary</h2>
      <div style={{ maxWidth: '280px', margin: '0 auto' }}>
  <Doughnut data={data} options={{ ...options, responsive: true, maintainAspectRatio: true }} />
</div>
      <div className="custom-legend">
        {emotionData.map((e, idx) => (
          <div key={idx} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: e.color }}
            ></span>
            <img
              src={e.icon}
              alt={e.label}
              width="20"
              height="20"
              style={{ marginRight: 6 }}
            />
            <span>{e.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmotionDonutChart;
