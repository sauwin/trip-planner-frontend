import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
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
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 };
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/pages/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/pages/LoginView.vue'),
      meta: { layout: 'auth' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/register/pages/RegisterView.vue'),
      meta: { layout: 'auth' },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/forgot-password/pages/ForgotPasswordView.vue'),
      meta: { layout: 'auth' },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/reset-password/pages/ResetPasswordView.vue'),
      meta: { layout: 'auth' },
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/search/pages/SearchResultsView.vue'),
    },
    {
      path: '/preferences',
      name: 'preferences',
      component: () => import('@/views/preferences/pages/PreferencesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/recommendations',
      name: 'recommendations',
      component: () => import('@/views/recommendations/pages/RecommendationsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/destinations',
      name: 'destinations',
      component: () => import('@/views/destinations/pages/DestinationsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/destinations/:id',
      name: 'destination-detail',
      component: () => import('@/views/destination-detail/pages/DestinationDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/trips',
      name: 'trips',
      component: () => import('@/views/trips/pages/TripsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/trips/:id',
      name: 'trip-detail',
      component: () => import('@/views/trip-detail/pages/TripDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/pages/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/about/pages/AboutView.vue'),
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/privacy/pages/PrivacyView.vue'),
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/terms/pages/TermsView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/views/contact/pages/ContactView.vue'),
    },
    {
      path: '/manage-admins',
      name: 'manage-admins',
      component: () => import('@/views/admin/pages/AdminUsersView.vue'),
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