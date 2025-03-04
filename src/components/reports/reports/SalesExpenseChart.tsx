// components/SalesExpenseChart.tsx
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ChartDataPoint {
  date: string;
  sales: number;
  expenses: number;
}

interface SalesExpenseChartProps {
  period: 'weekly' | 'monthly' | 'yearly';
  clubId?: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SalesExpenseChart({ period, clubId }: SalesExpenseChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let url = `${API_BASE_URL}/api/reports/sales-expenses?period=${period}`;
    if (clubId) {
      url += `&club=${clubId}`;
    }
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setChartData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching chart data:', err);
        setLoading(false);
      });
  }, [period, clubId]);

  if (loading) {
    return <p>Cargando gráfico...</p>;
  }

  // Preparar datos para la gráfica
  const labels = chartData.map(d => d.date);
  const salesValues = chartData.map(d => d.sales);
  const expensesValues = chartData.map(d => d.expenses);

  const dataConfig = {
    labels,
    datasets: [
      {
        label: 'Ventas',
        data: salesValues,
        borderColor: 'green',
        backgroundColor: 'rgba(0, 128, 0, 0.1)',
        fill: true,
      },
      {
        label: 'Gastos',
        data: expensesValues,
        borderColor: 'red',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      <Line data={dataConfig} options={chartOptions} />
    </div>
  );
}



