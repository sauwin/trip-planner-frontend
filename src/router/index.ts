import { createRouter, createWebHistory } from 'vue-router';

import LoginView from '@/views/login/pages/LoginView.vue';
import RegisterView from '@/views/register/pages/RegisterView.vue';
import HomeView from '@/views/home/pages/HomeView.vue';
import PreferencesView from '@/views/preferences/pages/PreferencesView.vue';
import RecommendationsView from '@/views/recommendations/pages/RecommendationsView.vue';
import DestinationView from '@/views/destinations/pages/DestinationsView.vue';
import DestinationDetailView from '@/views/destinationDetail/pages/DestinationDetailView.vue';

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
    }
  ],
});

export default router;