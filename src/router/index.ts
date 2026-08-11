import { createRouter, createWebHistory } from 'vue-router';

import LoginView from '@/views/login/page/LoginView.vue';
import RegisterView from '@/views/register/page/RegisterView.vue';
import HomeView from '@/views/home/page/HomeView.vue';

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
  ],
});

export default router;