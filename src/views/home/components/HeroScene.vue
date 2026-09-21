<script setup lang="ts">
import { project, WORLD_DOTS } from './heroMap';

defineProps<{
  labels?: string[];
}>();

const VIEWBOX = '0 0 775 600';

const stops = [
  { ...project(-43.17, -22.91), color: 'var(--color-accent)', label: { dx: 16, dy: 6, anchor: 'start' } }, // Rio de Janeiro
  { ...project(12.5, 41.9), color: 'var(--color-sage)', label: { dx: 14, dy: 26, anchor: 'start' } }, // Rome
  { ...project(19.94, 50.06), color: 'var(--color-secondary-dark)', label: { dx: 14, dy: -12, anchor: 'start' } }, // Krakow
];

// Flight arc between two points: a quadratic curve that bulges upwards.
function arc(from: { x: number; y: number }, to: { x: number; y: number }, bend: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  let nx = dy / length;
  let ny = -dx / length;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const cx = (from.x + to.x) / 2 + nx * length * bend;
  const cy = (from.y + to.y) / 2 + ny * length * bend;
  return `M${from.x} ${from.y} Q${cx} ${cy} ${to.x} ${to.y}`;
}

const [rio, rome, krakow] = stops;
const arcs = [
  { d: arc(rio!, rome!, 0.28), color: rio!.color },
  { d: arc(rome!, krakow!, 0.35), color: rome!.color },
];
</script>

<template>
  <svg class="hero-map" :viewBox="VIEWBOX" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" focusable="false">
    <path class="hs-dots" :d="WORLD_DOTS" />

    <g v-for="(route, i) in arcs" :key="i">
      <path class="hs-arc-gap" :d="route.d" />
      <path class="hs-arc" :d="route.d" :style="{ stroke: route.color }" />
    </g>

    <g v-for="(stop, i) in stops" :key="i">
      <circle class="hs-stop" :cx="stop.x" :cy="stop.y" r="9" :style="{ fill: stop.color }" />
      <text
        v-if="labels?.[i]"
        class="hs-name"
        :x="stop.x + stop.label.dx"
        :y="stop.y + stop.label.dy"
        :text-anchor="stop.label.anchor"
      >
        {{ labels[i] }}
      </text>
    </g>
  </svg>
</template>