import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useCookie, useRouter } from '#app';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null);
  const token = useCookie('auth_token');
  const router = useRouter();

  const setAuth = (userData: any, tokenStr: string) => {
    user.value = userData;
    token.value = tokenStr;
  };

  const login = async (email: string, password_raw: string) => {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password: password_raw }
    });
    
    setAuth(response.user, response.token);
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    router.push('/login');
  };

  const isAuthenticated = computed(() => !!token.value);

  // En producción real, aquí podríamos validar el token contra el servidor (ej: /api/auth/me) al iniciar
  const fetchUser = async () => {
    // Si tenemos token pero no usuario en memoria, podríamos restaurarlo
    if (token.value && !user.value) {
      // Mock: asumimos que el token es válido o hacemos fetch
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    login,
    logout,
    fetchUser
  };
});
