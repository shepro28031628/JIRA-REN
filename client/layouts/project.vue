<template>
  <div :class="[
    'flex h-screen text-slate-800 font-sans overflow-hidden transition-colors duration-500',
    themeStore.currentTheme === 'glacier' ? 'bg-gradient-to-br from-blue-50 to-indigo-100/50' :
    themeStore.currentTheme === 'aurora' ? 'bg-gradient-to-br from-rose-50 to-purple-100/50' :
    'bg-gradient-to-br from-purple-50 via-white to-purple-100/50'
  ]">
    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col bg-white/40 backdrop-blur-xl border-r border-white/40 shadow-lg rounded-r-3xl transition-all duration-500 ease-in-out relative z-50 transform-gpu overflow-hidden',
        isCollapsed && !zenMode ? 'w-20' : !zenMode ? 'w-64' : 'w-0 opacity-0 pointer-events-none'
      ]"
    >
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between h-14 px-4 border-b border-white/50 shrink-0">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-6 h-6 rounded-md bg-gradient-to-br from-[#4facfe] to-[#8a2be2] shrink-0"></div>
          <span
            v-show="!isCollapsed"
            class="font-semibold text-sm whitespace-nowrap opacity-100 transition-opacity duration-200 text-slate-800"
          >
            Jira Clone
          </span>
        </div>
        <button
          @click="toggleSidebar"
          class="flex items-center justify-center p-1 rounded hover:bg-white/50 text-slate-500 hover:text-purple-700 transition-colors shrink-0"
          :title="isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'"
        >
          <PanelLeftClose
            v-if="!isCollapsed"
            class="w-[18px] h-[18px]" stroke-width="1.5"
          />
          <PanelLeft
            v-else
            class="w-[18px] h-[18px]" stroke-width="1.5"
          />
        </button>
      </div>

      <!-- Sidebar Navigation -->
      <nav class="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
        <!-- Tablero (Board) -->
        <NuxtLink
          v-if="projectFeatures.kanban"
          :to="`/board/${projectId}`"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-white/60 hover:text-purple-600 transition-all duration-300 group relative overflow-hidden"
          active-class="bg-white/80 !text-purple-700 shadow-sm border border-white/60 font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-gradient-to-b before:from-purple-400 before:to-purple-600 before:rounded-r-md"
        >
          <LayoutDashboard class="shrink-0 group-hover:text-purple-600 w-5 h-5 transition-colors" stroke-width="2" />
          <span v-show="!isCollapsed" class="text-sm whitespace-nowrap">Tablero</span>
        </NuxtLink>

        <!-- Planificación (Backlog) -->
        <NuxtLink
          v-if="projectFeatures.backlog"
          :to="`/projects/${projectId}/backlog`"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-white/60 hover:text-purple-600 transition-all duration-300 group relative overflow-hidden"
          active-class="bg-white/80 !text-purple-700 shadow-sm border border-white/60 font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-gradient-to-b before:from-purple-400 before:to-purple-600 before:rounded-r-md"
        >
          <CalendarRange class="shrink-0 group-hover:text-purple-600 w-5 h-5 transition-colors" stroke-width="2" />
          <span v-show="!isCollapsed" class="text-sm whitespace-nowrap">Planificación</span>
        </NuxtLink>

        <!-- Documentos (Docs) -->
        <NuxtLink
          v-if="projectFeatures.docs"
          :to="`/projects/${projectId}/docs`"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-white/60 hover:text-purple-600 transition-all duration-300 group relative overflow-hidden"
          active-class="bg-white/80 !text-purple-700 shadow-sm border border-white/60 font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-gradient-to-b before:from-purple-400 before:to-purple-600 before:rounded-r-md"
        >
          <FileText class="shrink-0 group-hover:text-purple-600 w-5 h-5 transition-colors" stroke-width="2" />
          <span v-show="!isCollapsed" class="text-sm whitespace-nowrap">Documentos</span>
        </NuxtLink>

        <!-- Equipos/Tiempos (Teams) -->
        <NuxtLink
          v-if="projectFeatures.teams"
          :to="`/projects/${projectId}/teams`"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-white/60 hover:text-purple-600 transition-all duration-300 group relative overflow-hidden"
          active-class="bg-white/80 !text-purple-700 shadow-sm border border-white/60 font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-gradient-to-b before:from-purple-400 before:to-purple-600 before:rounded-r-md"
        >
          <Users class="shrink-0 group-hover:text-purple-600 w-5 h-5 transition-colors" stroke-width="2" />
          <span v-show="!isCollapsed" class="text-sm whitespace-nowrap">Equipos</span>
        </NuxtLink>

        <!-- Soporte (Service Management) -->
        <NuxtLink
          v-if="projectFeatures.support"
          :to="`/projects/${projectId}/support`"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-white/60 hover:text-purple-600 transition-all duration-300 group relative overflow-hidden"
          active-class="bg-white/80 !text-purple-700 shadow-sm border border-white/60 font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-gradient-to-b before:from-purple-400 before:to-purple-600 before:rounded-r-md"
        >
          <LifeBuoy class="shrink-0 group-hover:text-purple-600 w-5 h-5 transition-colors" stroke-width="2" />
          <span v-show="!isCollapsed" class="text-sm whitespace-nowrap">Soporte</span>
        </NuxtLink>

        <!-- Inbox / Notificaciones -->
        <NuxtLink
          :to="`/inbox`"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-white/60 hover:text-purple-600 transition-all duration-300 group relative overflow-hidden"
          active-class="bg-white/80 !text-purple-700 shadow-sm border border-white/60 font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-gradient-to-b before:from-purple-400 before:to-purple-600 before:rounded-r-md"
        >
          <Bell class="shrink-0 group-hover:text-purple-600 w-5 h-5 transition-colors" stroke-width="2" />
          <span v-show="!isCollapsed" class="text-sm whitespace-nowrap">Inbox</span>
          <!-- Badge de Notificación -->
          <div class="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" v-if="hasUnreadNotifications"></div>
        </NuxtLink>
      </nav>
      
      <!-- Footer / Perfil Sidebar -->
      <div class="p-3 border-t border-white/50 shrink-0">
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/50 transition-colors">
            <div class="flex items-center gap-3 cursor-pointer overflow-hidden">
              <div class="w-6 h-6 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                <span class="text-[10px] font-bold text-purple-700">{{ authStore.user?.email ? authStore.user.email.charAt(0).toUpperCase() : 'U' }}</span>
              </div>
              <span v-show="!isCollapsed" class="text-[13px] text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ authStore.user?.name || 'Mi Perfil' }}
              </span>
            </div>
            
            <button 
              v-show="!isCollapsed"
              @click="authStore.logout()" 
              class="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
              title="Cerrar Sesión"
            >
              <LogOut class="w-4 h-4" stroke-width="2" />
            </button>
          </div>
          
          <div class="px-2" v-show="!isCollapsed">
            <ThemeSelector />
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <slot />
    </main>

    <!-- Global Command Menu -->
    <CommandMenu />

    <!-- Global Toasts -->
    <ToastContainer />
    
    <!-- Global Command Console (Shift + C) -->
    <CommandConsole />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from '#app';
import { LayoutDashboard, CalendarRange, FileText, Users, Bell, PanelLeftClose, PanelLeft, Settings, LifeBuoy, LogOut } from 'lucide-vue-next';
import CommandMenu from '../components/CommandMenu.vue';
import ToastContainer from '../components/ToastContainer.vue';
import ThemeSelector from '../components/ThemeSelector.vue';
import CommandConsole from '../components/ui/CommandConsole.vue';
import { useThemeStore } from '../stores/theme.store';
import { useAuthStore } from '../stores/auth.store';

const route = useRoute();
const themeStore = useThemeStore();
const authStore = useAuthStore();
const projectId = computed(() => route.params.id || 'default');

const isCollapsed = ref(false);
const zenMode = useState('zenMode', () => false);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

// Polling simple o estado de notificaciones no leídas (mock)
const hasUnreadNotifications = ref(true); // Se podría conectar a la store o socket

// Feature flags
const projectFeatures = ref<Record<string, boolean>>({
  kanban: true, backlog: true, docs: true, teams: true, reports: true, automation: true, support: true
});

const loadProjectFeatures = async () => {
  if (projectId.value && projectId.value !== 'default') {
    try {
      const p = await $fetch(`/api/projects/${projectId.value}`);
      if (p && p.enabled_features) {
        projectFeatures.value = { ...projectFeatures.value, ...p.enabled_features };
      }
    } catch (e) {
      console.error('Error fetching layout project', e);
    }
  }
};

const handleFeaturesUpdated = (event: Event) => {
  const customEvent = event as CustomEvent;
  if (customEvent.detail) {
    projectFeatures.value = { ...projectFeatures.value, ...customEvent.detail };
  }
};

onMounted(() => {
  loadProjectFeatures();
  if (import.meta.client) {
    window.addEventListener('project-features-updated', handleFeaturesUpdated);
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('project-features-updated', handleFeaturesUpdated);
  }
});

watch(projectId, () => {
  loadProjectFeatures();
});
</script>
