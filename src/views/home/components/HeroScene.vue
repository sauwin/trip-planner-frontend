<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

defineProps<{
  /** Name and coordinates of the three destinations shown on the route (optional). */
  labels?: { name: string; coords: string }[];
}>();

/* ---------- Static artwork ---------- */

// The route is split in two paths: A -> B and B -> C.
// Each one starts and ends horizontally, so the plane glides smoothly through the middle stop.
const ROUTE_AB = 'M130 300 C210 300 270 150 350 150';
const ROUTE_BC = 'M350 150 C430 150 520 250 600 250';

// Every stop has a thin vertical line that goes down to the baseline, where its coordinates are written.
const AXIS_Y = 392;
const marks = [
  { x: 130, y: 300, color: 'var(--color-accent)' },
  { x: 350, y: 150, color: 'var(--color-accent)' },
  { x: 600, y: 250, color: 'var(--color-secondary-dark)' }, // the destination
].map((mark) => ({ ...mark, drop: AXIS_Y - mark.y }));

// Top view of an airplane, nose pointing to +x (that is the direction the path tangent is applied to).
const PLANE_SHAPE =
  'M18 0 C18 -3 14 -4 9 -4 L-12 -4 C-16 -4 -18 -2 -18 0 C-18 2 -16 4 -12 4 L9 4 C14 4 18 3 18 0 Z ' +
  'M3 -4 L-8 -26 L-13 -26 L-9 -4 Z M3 4 L-8 26 L-13 26 L-9 4 Z ' +
  'M-11 -4 L-17 -12 L-20 -12 L-17 -4 Z M-11 4 L-17 12 L-20 12 L-17 4 Z';

/* ---------- Animation ---------- */

// One loop = the plane flies A -> B -> C, rests there for a while, everything fades out, repeat.
const CYCLE_MS = 13000;
const START_DELAY_MS = 500;
const FLIGHT_MS = 7000;
const RESET_FADE_MS = 700;

const routeAB = ref<SVGPathElement | null>(null);
const routeBC = ref<SVGPathElement | null>(null);
const plane = ref<SVGGElement | null>(null);

// Which stops are already "reached". Only these flags are reactive, the plane itself is moved directly via the DOM (60 fps).
const pinOn = ref([false, false, false]);
const isResetting = ref(false);
// The plane "lands" (fades out) when it reaches the last stop, so the finished route stays clean.
const isLanded = ref(false);

let lenAB = 0;
let lenBC = 0;
let rafId = 0;
let startTime = 0;

function pointAt(distance: number) {
  if (distance <= lenAB) return routeAB.value!.getPointAtLength(distance);
  return routeBC.value!.getPointAtLength(distance - lenAB);
}

// Moves the plane to `distance` (in px along the whole route) and draws the trail behind it.
function renderAt(distance: number) {
  const total = lenAB + lenBC;
  const d = Math.min(Math.max(distance, 0), total);
  const here = pointAt(d);
  const behind = pointAt(Math.max(0, d - 2));
  const ahead = pointAt(Math.min(total, d + 2));
  const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;

  plane.value?.setAttribute('transform', `translate(${here.x} ${here.y}) rotate(${angle})`);
  routeAB.value!.style.strokeDashoffset = String(lenAB - Math.min(d, lenAB));
  routeBC.value!.style.strokeDashoffset = String(lenBC - Math.min(Math.max(d - lenAB, 0), lenBC));
}

function setPin(index: number, value: boolean) {
  if (pinOn.value[index] !== value) pinOn.value[index] = value;
}

function tick(now: number) {
  const total = lenAB + lenBC;
  const t = (now - startTime) % CYCLE_MS;
  const progress = Math.min(Math.max((t - START_DELAY_MS) / FLIGHT_MS, 0), 1);
  const eased = 0.5 - 0.5 * Math.cos(Math.PI * progress); // ease-in-out
  const distance = eased * total;

  renderAt(distance);

  // In the last moments of the loop everything fades out, so the stops are switched off together with it.
  const resetting = t > CYCLE_MS - RESET_FADE_MS;
  setPin(0, t > 150 && !resetting);
  setPin(1, distance >= lenAB - 2 && !resetting);
  setPin(2, distance >= total - 2 && !resetting);
  isResetting.value = resetting;
  isLanded.value = progress >= 1;

  rafId = requestAnimationFrame(tick);
}

onMounted(() => {
  if (!routeAB.value || !routeBC.value) return;

  lenAB = routeAB.value.getTotalLength();
  lenBC = routeBC.value.getTotalLength();

  // The "trail" is a solid line that is hidden with dasharray/dashoffset and revealed as the plane moves.
  routeAB.value.style.strokeDasharray = String(lenAB);
  routeBC.value.style.strokeDasharray = String(lenBC);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Static final frame: full route, all stops visible, no loop.
    renderAt(lenAB + lenBC);
    pinOn.value = [true, true, true];
    isLanded.value = true;
    return;
  }

  renderAt(0);
  startTime = performance.now();
  rafId = requestAnimationFrame(tick);
});

onBeforeUnmount(() => cancelAnimationFrame(rafId));
</script>

<template>
  <svg
    class="hero-scene"
    :class="{ 'is-resetting': isResetting }"
    viewBox="0 0 720 450"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
    focusable="false"
  >
    <line class="hs-axis" x1="40" x2="680" :y1="AXIS_Y" :y2="AXIS_Y" />

    <!-- Everything in this group fades out before the loop restarts. -->
    <g class="hs-fadable">
      <!-- dotted guide (always visible) -->
      <path :d="ROUTE_AB" class="hs-guide" />
      <path :d="ROUTE_BC" class="hs-guide" />

      <!-- solid trail (revealed by the plane) -->
      <path ref="routeAB" :d="ROUTE_AB" class="hs-trail" />
      <path ref="routeBC" :d="ROUTE_BC" class="hs-trail" />

      <g
        v-for="(mark, i) in marks"
        :key="i"
        class="hs-mark"
        :class="{ 'is-on': pinOn[i] }"
        :transform="`translate(${mark.x} ${mark.y})`"
        :style="{ color: mark.color }"
      >
        <path class="hs-drop" :d="`M0 12 V${mark.drop}`" pathLength="1" />
        <circle class="hs-ring" r="11" />
        <circle class="hs-dot" r="4.5" />
        <text v-if="labels?.[i]" class="hs-name" x="0" y="-28" text-anchor="middle">{{ labels?.[i]?.name }}</text>
        <text v-if="labels?.[i]" class="hs-coords" x="0" :y="mark.drop + 26" text-anchor="middle">{{ labels?.[i]?.coords }}</text>
      </g>

      <!-- The transform of this group is set from JS on every frame -->
      <g ref="plane" class="hs-plane" :class="{ 'is-landed': isLanded }">
        <g transform="scale(0.85)">
          <path :d="PLANE_SHAPE" style="fill: var(--color-ink)" />
        </g>
      </g>
    </g>
  </svg>
</template>