import { Chart } from 'chart.js/auto';

let chartInstance = null;

export function renderProgressBarChart(canvas, { labels, levels, sessionCounts }) {
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Lygis (1–5)',
          data: levels,
          backgroundColor: '#6366f1',
          borderRadius: 4,
        },
        {
          label: 'Sesijų sk.',
          data: sessionCounts,
          backgroundColor: '#a5b4fc',
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  return chartInstance;
}

export function destroyProgressBarChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}
