<template>
  <div class="flex h-screen bg-canvas text-txt-primary font-sans overflow-hidden">
    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col bg-surface-1 border-r border-border-subtle transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      ]"
    >
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between h-14 px-4 border-b border-border-subtle shrink-0">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-6 h-6 rounded-md bg-gradient-to-br from-[#4facfe] to-[#8a2be2] shrink-0"></div>
          <span
            v-show="!isCollapsed"
            class="font-semibold text-sm whitespace-nowrap opacity-100 transition-opacity duration-200"
          >
            Jira Clone
          </span>
        </div>
        <button
          @click="toggleSidebar"
          class="flex items-center justify-center p-1 rounded hover:bg-surface-2 text-txt-secondary hover:text-txt-primary transition-colors shrink-0"
          :title="isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'"
        >
          <svg
            v-if="!isCollapsed"
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <svg
            v-else
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <!-- Sidebar Navigation -->
      <nav class="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
        <!-- Tablero (Board) -->
        <NuxtLink
          :to="`/board/${projectId}`"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-txt-secondary hover:bg-surface-2 hover:text-txt-primary transition-all duration-200 group"
          active-class="bg-surface-2 !text-txt-primary font-medium"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 group-hover:text-txt-primary">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span v-show="!isCollapsed" class="text-[13px] whitespace-nowrap">Tablero</span>
        </NuxtLink>

        <!-- Planificación (Backlog) -->
        <NuxtLink
          :to="`/projects/${projectId}/backlog`"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-txt-secondary hover:bg-surface-2 hover:text-txt-primary transition-all duration-200 group"
          active-class="bg-surface-2 !text-txt-primary font-medium"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 group-hover:text-txt-primary">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <span v-show="!isCollapsed" class="text-[13px] whitespace-nowrap">Planificación</span>
        </NuxtLink>

        <!-- Documentos (Docs) -->
        <NuxtLink
          :to="`/projects/${projectId}/docs`"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-txt-secondary hover:bg-surface-2 hover:text-txt-primary transition-all duration-200 group"
          active-class="bg-surface-2 !text-txt-primary font-medium"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 group-hover:text-txt-primary">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span v-show="!isCollapsed" class="text-[13px] whitespace-nowrap">Documentos</span>
        </NuxtLink>

        <!-- Equipos/Tiempos (Teams) -->
        <NuxtLink
          :to="`/projects/${projectId}/teams`"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-txt-secondary hover:bg-surface-2 hover:text-txt-primary transition-all duration-200 group"
          active-class="bg-surface-2 !text-txt-primary font-medium"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 group-hover:text-txt-primary">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span v-show="!isCollapsed" class="text-[13px] whitespace-nowrap">Equipos</span>
        </NuxtLink>
      </nav>
      
      <!-- Footer / Perfil Sidebar -->
      <div class="p-3 border-t border-border-subtle shrink-0">
        <div class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface-2 cursor-pointer transition-colors">
          <div class="w-6 h-6 rounded-full bg-surface-2 border border-border-strong flex items-center justify-center shrink-0">
            <span class="text-[10px] font-bold text-txt-secondary">U</span>
          </div>
          <span v-show="!isCollapsed" class="text-[13px] text-txt-secondary whitespace-nowrap overflow-hidden text-ellipsis">
            Mi Perfil
          </span>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from '#app';

const route = useRoute();
const projectId = computed(() => route.params.id || 'default');

const isCollapsed = ref(false);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>
