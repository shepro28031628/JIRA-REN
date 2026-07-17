<template>
  <div class="feature-grid-container" v-if="authStore.user?.is_master_admin">
    <div class="mb-6 flex items-center gap-3">
      <ShieldAlert class="w-7 h-7 text-rose-500" />
      <div>
        <h2 class="text-xl font-bold text-slate-800 tracking-tight">Zona Maestro: Módulos del Proyecto</h2>
        <p class="text-sm text-slate-500">Activa o desactiva las características para adaptar el ecosistema a las necesidades del proyecto.</p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div 
        v-for="(feature, key) in availableFeatures" 
        :key="key"
        class="bg-white/50 backdrop-blur-md p-5 rounded-2xl border transition-all duration-300 shadow-sm"
        :class="projectFeatures[key] ? 'border-purple-200/80 shadow-purple-100/50' : 'border-white/60 opacity-80'"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl" :class="projectFeatures[key] ? 'bg-purple-100/80 text-purple-600' : 'bg-slate-100/80 text-slate-400'">
              <component :is="feature.icon" class="w-5 h-5" />
            </div>
            <h3 class="font-semibold text-slate-700" :class="{ 'text-slate-500': !projectFeatures[key] }">{{ feature.title }}</h3>
          </div>
          
          <button 
            @click="toggleFeature(key)"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
            :class="projectFeatures[key] ? 'bg-purple-500' : 'bg-slate-300'"
          >
            <span class="sr-only">Toggle {{ feature.title }}</span>
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="projectFeatures[key] ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
        <p class="text-xs text-slate-500 leading-relaxed">{{ feature.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { ShieldAlert, LayoutDashboard, CalendarRange, FileText, Users, BarChart3, Bot, HeadphonesIcon } from 'lucide-vue-next';
import { useAuthStore } from '../../../stores/auth.store';
import { useBoardStore } from '../../../stores/board.store'; // Asumiendo que guardamos features allí, o hacer fetch
import { useToast } from '../../../composables/useToast';
import { useRoute } from '#app';

const authStore = useAuthStore();
const toast = useToast();
const route = useRoute();
const projectId = route.params.id as string;

// TODO: fetch actual features del proyecto
const projectFeatures = ref<Record<string, boolean>>({
  kanban: true,
  backlog: true,
  docs: false,
  teams: false,
  reports: false,
  automation: false,
  support: false,
  agile_views: false
});

const availableFeatures = {
  kanban: { title: 'Tablero Kanban', description: 'Visualización visual del flujo de trabajo y gestión ágil de tareas.', icon: LayoutDashboard },
  agile_views: { title: 'Vistas Ágiles (Gantt/Cal)', description: 'Planificación avanzada usando diagramas de Gantt y Calendarios.', icon: CalendarRange },
  backlog: { title: 'Backlog / Planificación', description: 'Gestión de la pila de producto y planificación de sprints.', icon: CalendarRange },
  docs: { title: 'Documentación (Wiki)', description: 'Base de conocimiento y documentación colaborativa centralizada.', icon: FileText },
  teams: { title: 'Equipos y Carga', description: 'Gestión de miembros, roles y análisis de carga de trabajo.', icon: Users },
  reports: { title: 'Reportes y Métricas', description: 'Dashboards ejecutivos de velocidad y analítica de proyecto.', icon: BarChart3 },
  automation: { title: 'Automatizaciones', description: 'Reglas de flujo dinámicas y triggers automatizados sin código.', icon: Bot },
  support: { title: 'Módulo de Soporte', description: 'Service Management para tickets de soporte y SLA.', icon: HeadphonesIcon }
};

const fetchFeatures = async () => {
  try {
    const project = await $fetch(`/api/projects/${projectId}`);
    if (project && project.enabled_features) {
      projectFeatures.value = { ...projectFeatures.value, ...(project.enabled_features as Record<string, boolean>) };
    }
  } catch (e) {
    console.error('Error fetching project features', e);
  }
};

const toggleFeature = async (key: string) => {
  if (!authStore.user?.is_master_admin) {
    toast.error('Acceso denegado. Solo el SuperAdmin puede cambiar esto.');
    return;
  }
  
  const originalState = { ...projectFeatures.value };
  projectFeatures.value[key] = !projectFeatures.value[key];
  
  try {
    const userId = authStore.user?.id || 'mock-admin-id'; // Reemplazar con lógica real de user ID
    await $fetch(`/api/projects/${projectId}/features`, {
      method: 'PATCH',
      headers: {
        'x-user-id': userId // Mock auth middleware temporal
      },
      body: projectFeatures.value
    });
    toast.success(`Módulo ${key} ${projectFeatures.value[key] ? 'activado' : 'desactivado'}`);
    
    // Disparar evento o mutación para actualizar la sidebar
    window.dispatchEvent(new CustomEvent('project-features-updated', { detail: projectFeatures.value }));
  } catch (e) {
    // Revertir optimístico
    projectFeatures.value = originalState;
    console.error('Error updating feature', e);
    toast.error('Hubo un error al guardar los ajustes.');
  }
};

onMounted(() => {
  fetchFeatures();
});
</script>
