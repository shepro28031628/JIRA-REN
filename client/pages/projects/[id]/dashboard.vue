<template>
  <div class="dashboard-layout p-8 min-h-screen">
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <LayoutGrid class="w-7 h-7 text-purple-600" /> Dashboard Personalizado por Widgets
        </h1>
        <p class="text-xs text-slate-500 font-medium mt-1">Lienzo dinámico con gadgets configurables por filtros guardados y métricas en tiempo real.</p>
      </div>

      <div class="flex items-center gap-3">
        <select v-model="selectedSprintFilter" class="premium-select text-xs">
          <option value="">Todos los Sprints</option>
          <option v-for="s in sprints" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <button @click="resetDashboardLayout" class="btn-secondary text-xs flex items-center gap-1.5">
          <RotateCcw class="w-3.5 h-3.5" /> Resetear Layout
        </button>
      </div>
    </header>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 4" :key="i" class="h-64 bg-white/40 backdrop-blur-md rounded-2xl animate-pulse"></div>
    </div>

    <!-- Canvas de Gadgets Configurables (Grid Reordenable) -->
    <draggable 
      v-else 
      v-model="widgetsList" 
      item-key="id" 
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      handle=".drag-handle"
    >
      <template #item="{ element: widget }">
        <div class="glass-widget p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl relative border border-white/60">
          
          <!-- Widget Header -->
          <div class="flex items-center justify-between mb-4 border-b border-purple-100/60 pb-3">
            <div class="flex items-center gap-2 drag-handle cursor-grab active:cursor-grabbing">
              <GripVertical class="w-4 h-4 text-slate-400" />
              <component :is="widget.icon" class="w-5 h-5 text-purple-600" />
              <h3 class="text-sm font-bold text-slate-800">{{ widget.title }}</h3>
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-mono">{{ widget.type }}</span>
          </div>

          <!-- Widget 1: Mis Tareas Pendientes -->
          <div v-if="widget.id === 'my-tasks'" class="flex-1 overflow-y-auto max-h-56 flex flex-col gap-2">
            <div v-for="task in myTasks" :key="task.id" class="p-2.5 rounded-xl bg-white/60 border border-slate-200/60 flex items-center justify-between text-xs hover:border-purple-200 transition-colors">
              <div class="truncate max-w-[200px]">
                <span class="font-bold text-slate-800 block truncate">{{ task.title }}</span>
                <span class="text-[10px] text-slate-400 font-mono">{{ project?.key }}-{{ task.key_number }}</span>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase" :class="getPriorityBadgeClass(task.priority)">{{ task.priority }}</span>
            </div>
            <div v-if="myTasks.length === 0" class="text-center py-8 text-xs text-slate-400 italic">No tienes tareas asignadas pendientes.</div>
          </div>

          <!-- Widget 2: Gráfico de Pastel de Prioridades -->
          <div v-else-if="widget.id === 'priority-pie'" class="flex-1 flex flex-col items-center justify-center p-2">
            <div class="w-full flex items-center justify-around">
              <div v-for="(count, prio) in priorityDistribution" :key="prio" class="flex flex-col items-center gap-1">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm" :class="getPriorityCircleClass(prio)">
                  {{ count }}
                </div>
                <span class="text-[10px] font-bold text-slate-600 uppercase">{{ prio }}</span>
              </div>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex mt-4 border border-slate-200">
              <div v-for="(count, prio) in priorityDistribution" :key="prio" :style="{ width: getPriorityPercent(count) + '%' }" :class="getPriorityBarClass(prio)"></div>
            </div>
          </div>

          <!-- Widget 3: Resumen de Bugs Abiertos -->
          <div v-else-if="widget.id === 'open-bugs'" class="flex-1 flex flex-col justify-between">
            <div class="flex items-center justify-between bg-red-50/70 border border-red-100 rounded-xl p-4">
              <div>
                <span class="text-xs text-slate-500 font-semibold block">Bugs Abiertos</span>
                <span class="text-3xl font-black text-red-600">{{ openBugsList.length }}</span>
              </div>
              <Bug class="w-10 h-10 text-red-400 opacity-80" />
            </div>
            <div class="mt-3 flex flex-col gap-1 max-h-32 overflow-y-auto">
              <div v-for="b in openBugsList.slice(0, 3)" :key="b.id" class="text-[11px] text-slate-700 bg-white/60 p-2 rounded-lg border border-slate-100 truncate">
                🐞 {{ b.title }}
              </div>
            </div>
          </div>

          <!-- Widget 4: Gadget de Filtro Guardado JQL -->
          <div v-else-if="widget.id === 'jql-gadget'" class="flex-1 flex flex-col gap-3">
            <select v-model="selectedSavedFilterId" @change="executeFilterGadget" class="premium-select text-xs w-full">
              <option value="">Seleccionar Filtro JQL Guardado...</option>
              <option v-for="sf in savedFilters" :key="sf.id" :value="sf.id">{{ sf.name }} ({{ sf.jql_query }})</option>
            </select>
            <div class="flex-1 overflow-y-auto max-h-40 flex flex-col gap-1.5">
              <div v-for="res in filterResults" :key="res.id" class="p-2 rounded-lg bg-white/60 text-xs text-slate-700 truncate border border-slate-100">
                📌 {{ res.title }}
              </div>
              <div v-if="filterResults.length === 0" class="text-center py-6 text-xs text-slate-400 italic">Selecciona un filtro para ver resultados.</div>
            </div>
          </div>

          <!-- Widget 5: Burndown del Sprint -->
          <div v-else-if="widget.id === 'sprint-burndown'" class="flex-1 flex flex-col justify-between">
            <div class="bg-purple-50/70 border border-purple-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span class="text-xs text-slate-500 font-semibold block">Progreso de Puntos</span>
                <span class="text-2xl font-bold text-purple-700">{{ activeSprintPoints.completed }} / {{ activeSprintPoints.total }} pts</span>
              </div>
              <Activity class="w-8 h-8 text-purple-500 opacity-80" />
            </div>
            <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-3">
              <div class="bg-gradient-to-r from-purple-500 to-indigo-600 h-full transition-all duration-500" :style="{ width: activeSprintProgress + '%' }"></div>
            </div>
          </div>

        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from '#app';
import draggable from 'vuedraggable';
import { LayoutGrid, GripVertical, CheckSquare, PieChart, Bug, Bookmark, Activity, RotateCcw } from 'lucide-vue-next';
import { useAuthStore } from '../../../stores/auth.store';

definePageMeta({
  layout: 'project'
});

const route = useRoute();
const projectId = route.params.id as string;
const authStore = useAuthStore();

const loading = ref(true);
const project = ref<any>(null);
const issues = ref<any[]>([]);
const sprints = ref<any[]>([]);
const savedFilters = ref<any[]>([]);

const selectedSprintFilter = ref('');
const selectedSavedFilterId = ref('');
const filterResults = ref<any[]>([]);

const defaultWidgets = [
  { id: 'my-tasks', title: 'Mis Tareas Pendientes', type: 'Personal', icon: CheckSquare },
  { id: 'priority-pie', title: 'Distribución por Prioridad', type: 'Métricas', icon: PieChart },
  { id: 'open-bugs', title: 'Bugs Abiertos Críticos', type: 'Quality', icon: Bug },
  { id: 'jql-gadget', title: 'Filtro JQL Guardado (Gadget)', type: 'Búsqueda', icon: Bookmark },
  { id: 'sprint-burndown', title: 'Sprint Burndown & Avance', type: 'Agile', icon: Activity }
];

const widgetsList = ref([...defaultWidgets]);

const resetDashboardLayout = () => {
  widgetsList.value = [...defaultWidgets];
};

const myTasks = computed(() => {
  const currentUserId = authStore.user?.id;
  return issues.value.filter(i => i.assignee_id === currentUserId || !i.assignee_id);
});

const openBugsList = computed(() => {
  return issues.value.filter(i => i.type === 'BUG' || i.title.toLowerCase().includes('bug'));
});

const priorityDistribution = computed(() => {
  const counts: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };
  issues.value.forEach(i => {
    const p = (i.priority || 'MEDIUM').toUpperCase();
    if (counts[p] !== undefined) counts[p]++;
    else counts.MEDIUM++;
  });
  return counts;
});

const totalIssuesCount = computed(() => issues.value.length || 1);

const getPriorityPercent = (count: number) => {
  return Math.round((count / totalIssuesCount.value) * 100);
};

const getPriorityBadgeClass = (priority: string) => {
  switch (priority) {
    case 'URGENT': case 'HIGH': return 'bg-red-100 text-red-700';
    case 'MEDIUM': return 'bg-amber-100 text-amber-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getPriorityCircleClass = (priority: string) => {
  switch (priority) {
    case 'URGENT': case 'HIGH': return 'bg-red-100 text-red-700 border border-red-200';
    case 'MEDIUM': return 'bg-amber-100 text-amber-700 border border-amber-200';
    default: return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  }
};

const getPriorityBarClass = (priority: string) => {
  switch (priority) {
    case 'URGENT': case 'HIGH': return 'bg-red-500';
    case 'MEDIUM': return 'bg-amber-500';
    default: return 'bg-emerald-500';
  }
};

const activeSprintPoints = computed(() => {
  let completed = 0;
  let total = 0;
  issues.value.forEach(i => {
    const pts = Number(i.story_points || 0);
    total += pts;
    if (i.column_id?.toLowerCase().includes('done') || i.column_id?.toLowerCase().includes('listo')) {
      completed += pts;
    }
  });
  return { completed, total };
});

const activeSprintProgress = computed(() => {
  if (activeSprintPoints.value.total === 0) return 0;
  return Math.min(100, Math.round((activeSprintPoints.value.completed / activeSprintPoints.value.total) * 100));
});

const executeFilterGadget = async () => {
  if (!selectedSavedFilterId.value) {
    filterResults.value = [];
    return;
  }
  const filterObj = savedFilters.value.find(s => s.id === selectedSavedFilterId.value);
  if (!filterObj) return;
  try {
    filterResults.value = await $fetch(`/api/projects/${projectId}/search?jql=${encodeURIComponent(filterObj.jql_query)}`);
  } catch (e) {
    console.error(e);
  }
};

const loadData = async () => {
  try {
    const [p, ists, sprs, sfs] = await Promise.all([
      $fetch(`/api/projects/${projectId}`),
      $fetch(`/api/issues?projectId=${projectId}`),
      $fetch(`/api/projects/${projectId}/sprints`),
      $fetch(`/api/projects/${projectId}/saved-filters`)
    ]);
    project.value = p;
    issues.value = ists as any[];
    sprints.value = sprs as any[];
    savedFilters.value = sfs as any[];
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
.dashboard-layout {
  font-family: 'Inter', sans-serif;
}
</style>
