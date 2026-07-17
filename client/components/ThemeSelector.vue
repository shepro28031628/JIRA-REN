<template>
  <div class="flex items-center gap-2 p-2 bg-white/30 backdrop-blur-md rounded-xl border border-white/50 shadow-inner">
    <button
      v-for="theme in themes"
      :key="theme.name"
      @click="themeStore.setTheme(theme.name)"
      :class="[
        'w-6 h-6 rounded-full cursor-pointer transition-all duration-300 relative',
        theme.gradient,
        themeStore.currentTheme === theme.name ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-70 hover:opacity-100 hover:scale-105'
      ]"
      :title="theme.label"
    >
      <div v-if="themeStore.currentTheme === theme.name" class="absolute inset-0 flex items-center justify-center">
        <div class="w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '../stores/theme.store';
import type { Theme } from '../stores/theme.store';

const themeStore = useThemeStore();

const themes: { name: Theme; label: string; gradient: string }[] = [
  { name: 'lavender', label: 'Violeta Lavanda', gradient: 'bg-gradient-to-br from-purple-400 to-purple-600' },
  { name: 'glacier', label: 'Azul Glaciar', gradient: 'bg-gradient-to-br from-blue-400 to-indigo-500' },
  { name: 'aurora', label: 'Rosa Aurora', gradient: 'bg-gradient-to-br from-rose-400 to-pink-500' }
];
</script>
