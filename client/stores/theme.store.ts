import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type Theme = 'lavender' | 'glacier' | 'aurora';

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>('lavender');

  // Si estamos en el cliente, intentamos recuperar del localStorage
  if (process.client) {
    const savedTheme = localStorage.getItem('jira-ren-theme') as Theme;
    if (savedTheme && ['lavender', 'glacier', 'aurora'].includes(savedTheme)) {
      currentTheme.value = savedTheme;
    }
    
    // Al cambiar el tema, guardamos y modificamos las variables CSS en :root
    watch(currentTheme, (newTheme) => {
      localStorage.setItem('jira-ren-theme', newTheme);
      updateRootTheme(newTheme);
    }, { immediate: true });
  }

  function updateRootTheme(theme: Theme) {
    if (!process.client) return;
    const root = document.documentElement;
    root.classList.remove('theme-lavender', 'theme-glacier', 'theme-aurora');
    root.classList.add(`theme-${theme}`);
  }

  function setTheme(theme: Theme) {
    currentTheme.value = theme;
  }

  return {
    currentTheme,
    setTheme
  };
});
