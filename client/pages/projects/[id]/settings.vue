<template>
  <div class="settings-layout">
    <header class="settings-header">
      <div class="project-info">
        <NuxtLink to="/projects" class="back-link">
          <ArrowLeft class="w-5 h-5" stroke-width="1.5" />
        </NuxtLink>
        <div class="header-text" v-if="!loading">
          <h2>Ajustes del Proyecto</h2>
          <span class="project-key">{{ project?.key }}</span>
        </div>
        <div v-else class="header-skeleton"></div>
      </div>
      
      <!-- Navegación del Proyecto (Opcional, puede estar oculta en settings) -->
      <nav class="project-nav" v-if="!loading">
        <NuxtLink :to="`/board/${projectId}`" class="nav-item">Tablero</NuxtLink>
        <NuxtLink :to="`/projects/${projectId}/settings`" class="nav-item active">Ajustes</NuxtLink>
      </nav>
    </header>

    <div class="split-pane-layout" v-if="!loading">
      <!-- Navegación lateral de Ajustes -->
      <aside class="settings-sidebar bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-4">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Configuración</h3>
        <nav class="flex flex-col gap-1">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-white/60 hover:text-purple-600 transition-all duration-200 text-sm font-medium"
            :class="{ 'bg-white/80 text-purple-700 shadow-sm font-semibold border border-white/60': activeTab === tab.id }"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.name }}
          </button>
        </nav>
      </aside>

      <!-- Contenido Principal -->
      <main class="settings-content">
        <div v-if="activeTab === 'general'" class="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
          <h2 class="text-xl font-bold text-slate-800 mb-4">Información General</h2>
          <!-- Detalles básicos del proyecto -->
          <p class="text-slate-500">Opciones generales (WIP)</p>
        </div>

        <div v-if="activeTab === 'features'" class="transition-all duration-300">
          <FeatureGrid />
        </div>
        
        <div v-if="activeTab === 'import'" class="transition-all duration-300">
          <DataImporter />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from '#app';
import { ArrowLeft, Settings, ShieldAlert, Users, Database } from 'lucide-vue-next';
import FeatureGrid from '../../../modules/settings/components/FeatureGrid.vue';
import DataImporter from '../../../modules/settings/components/DataImporter.vue';
import { useAuthStore } from '../../../stores/auth.store';

definePageMeta({
  layout: 'project'
});

const route = useRoute();
const projectId = route.params.id as string;
const authStore = useAuthStore();

const project = ref<any>(null);
const loading = ref(true);
const activeTab = ref('general');

const tabs = ref([
  { id: 'general', name: 'General', icon: Settings },
  { id: 'import', name: 'Importar Datos', icon: Database }
]);

const loadData = async () => {
  try {
    project.value = await $fetch(`/api/projects/${projectId}`);
    
    // Si el usuario es master admin, mostramos la tab de Features
    if (authStore.user?.is_master_admin) {
      tabs.value.push({ id: 'features', name: 'Módulos (Master)', icon: ShieldAlert });
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.settings-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: #1e293b;
  overflow: hidden;
}

.settings-header {
  padding: 16px 24px;
  margin: 16px 24px 0 24px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.05);
  z-index: 10;
}

.project-info { display: flex; align-items: center; gap: 16px; }
.back-link { color: #64748b; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.back-link:hover { color: #9333ea; background: rgba(255, 255, 255, 0.5); }
.header-text { display: flex; align-items: center; gap: 12px; }
.header-text h2 { font-size: 18px; font-weight: 700; color: #1e293b; letter-spacing: -0.01em; }
.project-key { background: rgba(147, 51, 234, 0.1); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; color: #7e22ce; }

.project-nav { display: flex; gap: 4px; padding: 4px; }
.nav-item { padding: 6px 12px; border-radius: 6px; color: #64748b; font-size: 13px; font-weight: 500; text-decoration: none; transition: 0.2s; }
.nav-item:hover { color: #1e293b; background: rgba(255,255,255,0.4); }
.nav-item.active { color: #1e293b; font-weight: 600; border-bottom: 2px solid #9333ea; border-radius: 0; }

.split-pane-layout {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px;
  overflow: hidden;
}

.settings-sidebar {
  width: 250px;
  flex-shrink: 0;
  overflow-y: auto;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
}
</style>
