import { Chart } from 'chart.js/auto';

let chartInstance = null;

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4'];

export function renderDoughnutChart(canvas, { labels, data }) {
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: COLORS,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    },
  });

  return chartInstance;
}

export function destroyDoughnutChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}
