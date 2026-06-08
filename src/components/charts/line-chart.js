import { Chart } from 'chart.js/auto';

let chartInstance = null;

export function renderLineChart(canvas, { labels, data }) {
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Valandos',
          data,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Val.' },
        },
      },
    },
  });

  return chartInstance;
}

export function destroyLineChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}
