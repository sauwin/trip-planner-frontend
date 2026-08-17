import { createRouter, createWebHistory } from 'vue-router';

import LoginView from '@/views/login/pages/LoginView.vue';
import RegisterView from '@/views/register/pages/RegisterView.vue';
import HomeView from '@/views/home/pages/HomeView.vue';
import PreferencesView from '@/views/preferences/pages/PreferencesView.vue';
import RecommendationsView from '@/views/recommendations/pages/RecommendationsView.vue';
import DestinationView from '@/views/destinations/pages/DestinationsView.vue';
import DestinationDetailView from '@/views/destination-detail/pages/DestinationDetailView.vue';
import TripDetailView from '@/views/trip-detail/pages/TripDetailView.vue';
import TripsView from '@/views/trips/pages/TripsView.vue';
import DashboardView from '@/views/dashboard/pages/DashboardView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/preferences',
      name: 'preferences',
      component: PreferencesView,
    },
    {
      path: '/recommendations',
      name: 'recommendations',
      component: RecommendationsView,
    },
    {
      path: '/destinations',
      name: 'destinations',
      component: DestinationView,
    },
    {
      path: '/destinations/:id',
      name: 'destination-detail',
      component: DestinationDetailView,
    },
    {
      path: '/trips',
      name: 'trips',
      component: TripsView,
    },
    {
      path: '/trips/:id',
      name: 'trip-detail',
      component: TripDetailView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    }
  ],
});

export default router;