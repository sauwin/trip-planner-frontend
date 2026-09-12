<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useI18n } from 'vue-i18n';
import type { Interaction } from '@/types/interaction.types';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const props = defineProps<{
  interactions: Interaction[];
}>();

const { t, locale } = useI18n();

const activityOverTimeData = computed(() => {
  const days: string[] = [];
  const counts: Record<string, number> = {};
  const today = new Date();
  for (let offset = 13; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(day.getDate() - offset);
    const key = day.toISOString().slice(0, 10);
    days.push(key);
    counts[key] = 0;
  }
  for (const i of props.interactions) {
    const key = i.createdAt.slice(0, 10);
    if (key in counts) counts[key] = (counts[key] ?? 0) + 1;
  }
  return {
    labels: days.map((d) => new Date(d).toLocaleDateString(locale.value, { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: t('dashboard.interactions'),
        borderColor: '#0F52BA',
        backgroundColor: 'rgba(15, 82, 186, 0.12)',
        pointBackgroundColor: '#0F52BA',
        pointRadius: 3,
        tension: 0.35,
        fill: true,
        data: days.map((d) => counts[d] ?? 0),
      },
    ],
  };
});

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1, color: '#64748B', font: { size: 11 } }, grid: { color: '#E2E8F0', drawBorder: false } },
    x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 7 } },
  },
};
</script>

<template>
  <div>
    <h2 class="font-display text-2xl font-bold mb-6" style="color: var(--color-ink)">{{ t('dashboard.activityOverTime') }}</h2>
    <div class="card-surface rounded-lg p-8">
      <h3 class="tag-mono text-xs font-bold mb-6" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.last14Days') }}</h3>
      <div style="height: 260px">
        <Line :data="activityOverTimeData" :options="lineChartOptions" />
      </div>
    </div>
  </div>
</template>