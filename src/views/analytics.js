import {
  weeklyHoursByWeek,
  categoryDistribution,
  skillProgress,
} from '../data/mock-data.js';
import { renderLineChart, destroyLineChart } from '../components/charts/line-chart.js';
import { renderDoughnutChart, destroyDoughnutChart } from '../components/charts/doughnut-chart.js';
import { renderProgressBarChart, destroyProgressBarChart } from '../components/charts/progress-bar-chart.js';

export function renderAnalytics() {
  return `
    <section class="view">
      <div class="view-header">
        <h2>Analitika</h2>
        <p class="text-muted">3 pagrindiniai grafikai – mokymosi progreso vizualizacija</p>
      </div>

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
          <p class="text-muted">Proporcijos pagal kategoriją (%)</p>
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

  if (weeklyCanvas) renderLineChart(weeklyCanvas, weeklyHoursByWeek);
  if (categoryCanvas) renderDoughnutChart(categoryCanvas, categoryDistribution);
  if (progressCanvas) renderProgressBarChart(progressCanvas, skillProgress);
}

export function unmountAnalyticsCharts() {
  destroyLineChart();
  destroyDoughnutChart();
  destroyProgressBarChart();
}
