import { getState } from '../state/store.js';
import {
  getWeeklyHoursChartData,
  getCategoryDistribution,
  getSkillProgressChartData,
} from '../state/selectors.js';
import { renderLineChart, destroyLineChart } from '../components/charts/line-chart.js';
import { renderDoughnutChart, destroyDoughnutChart } from '../components/charts/doughnut-chart.js';
import { renderProgressBarChart, destroyProgressBarChart } from '../components/charts/progress-bar-chart.js';
import { renderEmptyState } from '../components/ui-states.js';

export function renderAnalytics() {
  const { sessions } = getState();
  const hasData = sessions.length > 0;

  return `
    <section class="view">
      <div class="view-header">
        <h2>Analitika</h2>
        <p class="text-muted">3 pagrindiniai grafikai – duomenys iš tavo sesijų</p>
      </div>

      ${
        !hasData
          ? `<div class="card">${renderEmptyState({
              icon: '📊',
              title: 'Grafikams trūksta duomenų',
              description: 'Užregistruok mokymosi sesijas – tada čia matysi 3 interaktyvius grafikus.',
              ctaLabel: 'Pridėti sesiją',
              ctaHref: '#/sessions',
            })}</div>`
          : ''
      }

      <div class="charts-grid">
        <div class="card chart-card">
          <h3>Mokymosi valandos laike</h3>
          <p class="text-muted">Savaitinės valandos per paskutines 8 savaites</p>
          <div class="chart-container">
            <canvas id="chart-weekly-hours"></canvas>
          </div>
        </div>

        <div class="card chart-card">
          <h3>Laiko pasiskirstymas</h3>
          <p class="text-muted">Proporcijos pagal kategoriją (min)</p>
          <div class="chart-container">
            <canvas id="chart-categories"></canvas>
          </div>
        </div>

        <div class="card chart-card chart-card--wide">
          <h3>Įgūdžių progresas</h3>
          <p class="text-muted">Lygis ir sesijų skaičius per įgūdį – SkillForge progreso grafikas</p>
          <div class="chart-container chart-container--tall">
            <canvas id="chart-skill-progress"></canvas>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function mountAnalyticsCharts(root) {
  const weeklyCanvas = root.querySelector('#chart-weekly-hours');
  const categoryCanvas = root.querySelector('#chart-categories');
  const progressCanvas = root.querySelector('#chart-skill-progress');

  const weeklyData = getWeeklyHoursChartData();
  const categoryData = getCategoryDistribution();
  const progressData = getSkillProgressChartData();

  if (weeklyCanvas) renderLineChart(weeklyCanvas, weeklyData);
  if (categoryCanvas && !categoryData.empty) {
    renderDoughnutChart(categoryCanvas, categoryData);
  }
  if (progressCanvas && progressData.labels.length) {
    renderProgressBarChart(progressCanvas, progressData);
  }
}

export function unmountAnalyticsCharts() {
  destroyLineChart();
  destroyDoughnutChart();
  destroyProgressBarChart();
}
