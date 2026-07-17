import { useAuthStore } from '../stores/auth.store';
import { defineNuxtRouteMiddleware, navigateTo } from '#app';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  
  // Rutas públicas
  if (to.path === '/login' || to.path === '/register') {
    if (authStore.token) {
      return navigateTo('/projects'); // Si ya está logueado, redirigir a inicio
    }
    return;
  }

  // Rutas protegidas
  if (!authStore.token) {
    return navigateTo('/login');
  }
});
