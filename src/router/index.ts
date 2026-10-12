import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

import LoginView from '@/views/login/pages/LoginView.vue';
import RegisterView from '@/views/register/pages/RegisterView.vue';
import ForgotPasswordView from '@/views/forgot-password/pages/ForgotPasswordView.vue';
import ResetPasswordView from '@/views/reset-password/pages/ResetPasswordView.vue';
import HomeView from '@/views/home/pages/HomeView.vue';
import PreferencesView from '@/views/preferences/pages/PreferencesView.vue';
import RecommendationsView from '@/views/recommendations/pages/RecommendationsView.vue';
import DestinationView from '@/views/destinations/pages/DestinationsView.vue';
import DestinationDetailView from '@/views/destination-detail/pages/DestinationDetailView.vue';
import TripDetailView from '@/views/trip-detail/pages/TripDetailView.vue';
import TripsView from '@/views/trips/pages/TripsView.vue';
import DashboardView from '@/views/dashboard/pages/DashboardView.vue';
import SearchResultsView from '@/views/search/pages/SearchResultsView.vue';
import AdminUsersView from '@/views/admin/pages/AdminUsersView.vue';
import { getCurrentUser } from '@/api/auth.api';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresRole?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    layout?: 'auth';
  }
}

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
      meta: { layout: 'auth' },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { layout: 'auth' },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      meta: { layout: 'auth' },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
      meta: { layout: 'auth' },
    },
    {
      path: '/search',
      name: 'search',
      component: SearchResultsView,
    },
    {
      path: '/preferences',
      name: 'preferences',
      component: PreferencesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/recommendations',
      name: 'recommendations',
      component: RecommendationsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/destinations',
      name: 'destinations',
      component: DestinationView,
      meta: { requiresAuth: true },
    },
    {
      path: '/destinations/:id',
      name: 'destination-detail',
      component: DestinationDetailView,
      meta: { requiresAuth: true },
    },
    {
      path: '/trips',
      name: 'trips',
      component: TripsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/trips/:id',
      name: 'trip-detail',
      component: TripDetailView,
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/manage-admins',
      name: 'manage-admins',
      component: AdminUsersView,
      meta: { requiresAuth: true, requiresRole: 'SUPER_ADMIN' },
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (authStore.isAuthenticated && !authStore.user) {
    try {
      const response = await getCurrentUser();
      authStore.setUser(response.data);
    } catch {
      if (!authStore.isAuthenticated) {
        return { name: 'login', query: { redirect: to.fullPath } };
      }
      return false;
    }
  }

  const requiredRole = to.meta.requiresRole;
  if (requiredRole === 'SUPER_ADMIN' && authStore.user?.role !== 'SUPER_ADMIN') {
    return { name: 'home' };
  }
  if (requiredRole === 'ADMIN' && authStore.user?.role !== 'ADMIN' && authStore.user?.role !== 'SUPER_ADMIN') {
    return { name: 'home' };
  }
});

export default router;