<template>
  <div class="board-layout">
    <header class="board-header">
      <div class="project-info">
        <NuxtLink to="/projects" class="back-link">
          <ArrowLeft class="w-5 h-5" stroke-width="1.5" />
        </NuxtLink>
        <div class="header-text" v-if="!loading">
          <h2>{{ project?.name }}</h2>
          <span class="project-key">{{ project?.key }}</span>
        </div>
        <div v-else class="header-skeleton"></div>
      </div>
      
      <!-- Navegación del Proyecto -->
      <nav class="project-nav" v-if="!loading">
        <NuxtLink :to="`/board/${projectId}`" class="nav-item active">Tablero</NuxtLink>
        <NuxtLink :to="`/projects/${projectId}/backlog`" class="nav-item">Backlog</NuxtLink>
        <NuxtLink :to="`/projects/${projectId}/reports`" class="nav-item">Reportes</NuxtLink>
      </nav>

      <!-- Selector de Vistas Ágiles (Flotante) -->
      <div v-if="!loading && project?.enabled_features?.agile_views" class="absolute left-1/2 -translate-x-1/2 top-4 bg-white/40 backdrop-blur-xl border border-white/60 p-1 rounded-xl shadow-lg flex gap-1 z-20">
        <button 
          @click="activeView = 'kanban'" 
          class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300"
          :class="activeView === 'kanban' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:bg-white/50'"
        >Kanban</button>
        <button 
          @click="activeView = 'calendar'" 
          class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300"
          :class="activeView === 'calendar' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:bg-white/50'"
        >Calendario</button>
        <button 
          @click="activeView = 'gantt'" 
          class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300"
          :class="activeView === 'gantt' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:bg-white/50'"
        >Cronograma</button>
      </div>

      <div class="actions" v-if="!loading">
        <button class="btn-icon text-purple-600 hover:bg-purple-100 hover:text-purple-700 mr-2 relative" @click="showPredictive = !showPredictive" title="Analítica Predictiva">
          <BrainCircuit class="w-5 h-5" stroke-width="2" />
          <span class="absolute -top-1 -right-1 flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
          </span>
        </button>
        <button class="btn-primary-glow active:scale-95 transition-transform" @click="showCreateModal = true">Crear Tarea</button>
      </div>
    </header>

    <div class="filter-bar px-8 py-3" v-if="!loading">
      <div class="bg-white/30 backdrop-blur-md rounded-xl border border-white/50 p-2 flex gap-2 items-center shadow-sm">
        <button class="filter-btn" @click="toggleSearch">
          <Search class="w-4 h-4" stroke-width="2" />
          <span class="text-xs font-medium">Buscar (Cmd+K)</span>
        </button>
        <div class="h-4 w-[1px] bg-white/50 mx-1"></div>
        <button class="filter-btn group" @click="activePopover = activePopover === 'assignee' ? null : 'assignee'">
          <Users class="w-4 h-4" stroke-width="2" />
          <span class="text-xs font-medium">Asignados</span>
          <ChevronDown class="w-3 h-3 opacity-50 group-hover:opacity-100" />
        </button>
        <button class="filter-btn group" @click="activePopover = activePopover === 'priority' ? null : 'priority'">
          <AlertCircle class="w-4 h-4" stroke-width="2" />
          <span class="text-xs font-medium">Prioridad</span>
          <ChevronDown class="w-3 h-3 opacity-50 group-hover:opacity-100" />
        </button>
        <button class="filter-btn group" @click="activePopover = activePopover === 'tags' ? null : 'tags'">
          <Tag class="w-4 h-4" stroke-width="2" />
          <span class="text-xs font-medium">Etiquetas</span>
          <ChevronDown class="w-3 h-3 opacity-50 group-hover:opacity-100" />
        </button>
        <div class="flex-1"></div>
        <button v-if="hasActiveFilters" class="text-xs font-medium text-purple-600 hover:text-purple-700 px-3 py-1 transition-colors" @click="clearFilters">
          Limpiar filtros
        </button>
      </div>

      <!-- Popovers -->
      <div class="relative z-50">
        <!-- Filtros Priority Popover (existing) -->
        <div v-if="activePopover === 'priority'" v-motion :initial="{ opacity: 0, y: -10, scale: 0.95 }" :enter="{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }" class="absolute top-2 left-32 w-48 bg-white/90 backdrop-blur-lg border border-purple-100/60 shadow-xl rounded-xl p-2 flex flex-col gap-1">
          <button v-for="p in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']" :key="p" @click="toggleFilter('priority', p)" class="text-left px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-purple-50 transition-colors flex justify-between items-center" :class="{ 'bg-purple-100 text-purple-700': activeFilters.priority.includes(p), 'text-slate-700': !activeFilters.priority.includes(p) }">
            {{ p }}
            <Check v-if="activeFilters.priority.includes(p)" class="w-3 h-3" />
          </button>
        </div>

        <!-- Predictive Analytics Panel -->
        <div v-if="showPredictive" v-motion :initial="{ opacity: 0, scale: 0.9, x: 20 }" :enter="{ opacity: 1, scale: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }" class="absolute top-2 right-4 w-80 bg-white/70 backdrop-blur-xl border border-white shadow-2xl shadow-purple-200/50 rounded-2xl p-4 overflow-hidden transform-gpu">
          <div class="flex items-center gap-2 mb-4 border-b border-purple-100 pb-2">
            <Sparkles class="w-5 h-5 text-purple-500" />
            <h3 class="font-bold text-slate-800 text-sm">Predicciones del Sprint</h3>
          </div>
          <div class="space-y-3">
            <div class="flex gap-3 p-3 bg-red-50/80 border border-red-100 rounded-xl">
              <AlertTriangle class="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p class="text-xs font-bold text-red-800">Riesgo de Cuello de Botella</p>
                <p class="text-[11px] text-red-600 leading-snug mt-1">La columna 'En Progreso' tiene demasiadas tareas complejas. El equipo de Frontend está sobrecargado.</p>
              </div>
            </div>
            <div class="flex gap-3 p-3 bg-emerald-50/80 border border-emerald-100 rounded-xl">
              <Check class="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p class="text-xs font-bold text-emerald-800">Ritmo Excelente</p>
                <p class="text-[11px] text-emerald-600 leading-snug mt-1">Velocidad actual proyecta cierre del Sprint 1 día antes de lo previsto. ¡Buen trabajo!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="views-wrapper relative flex-1 flex flex-col min-h-0 overflow-hidden" v-if="!loading">
      <transition name="view-fade" mode="out-in">
        <BoardKanbanView 
          v-if="activeView === 'kanban'"
          :loading="loading"
          :columns="columns"
          :getColumnIssues="getColumnIssues"
          :dragOptions="dragOptions"
          :projectKey="project?.key || ''"
          @dragChange="onDragChange"
          @create="openCreateForColumn"
          @details="openIssueDetails"
        />
        <BoardCalendarView 
          v-else-if="activeView === 'calendar'"
          :issues="allIssues"
          :projectKey="project?.key || ''"
          @details="openIssueDetails"
        />
        <BoardGanttView 
          v-else-if="activeView === 'gantt'"
          :issues="allIssues"
          :projectKey="project?.key || ''"
          @details="openIssueDetails"
        />
      </transition>
    </div>

    <!-- Skeleton Loading -->
    <div class="board-container" v-else>
      <div v-for="i in 3" :key="i" class="kanban-column skeleton-col">
        <div class="column-header"><div class="skel-text"></div></div>
        <div class="column-body">
          <div v-for="j in 3" :key="j" class="issue-card skeleton-card"></div>
        </div>
      </div>
    </div>

    <!-- Modales Modulares -->
    <CreateIssueModal 
      :show="showCreateModal" 
      :columns="columns"
      :initial-column="initialColumnForCreate"
      @close="showCreateModal = false; initialColumnForCreate = null;"
      @create="createIssue"
    />

    <IssueDetailModal
      :show="showDetailModal"
      :issue="selectedIssue"
      :projectKey="project?.key || ''"
      :columns="columns"
      :users="projectUsers"
      @close="showDetailModal = false"
      @update="updateIssue"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from '#app';

definePageMeta({
  layout: 'project'
});
import { useBoardStore } from '../../stores/board.store';
import { useToast } from '../../composables/useToast';
import draggable from 'vuedraggable';
import { ArrowLeft, Plus, Search, Users, AlertCircle, Tag, ChevronDown, Check, BrainCircuit, Sparkles, AlertTriangle } from 'lucide-vue-next';
import IssueCard from '../../modules/board/IssueCard.vue';
import CreateIssueModal from '../../modules/board/CreateIssueModal.vue';
import IssueDetailModal from '../../modules/board/IssueDetailModal.vue';
import EmptyState from '../../components/EmptyState.vue';
import BoardKanbanView from '../../modules/board/BoardKanbanView.vue';
import BoardCalendarView from '../../modules/board/BoardCalendarView.vue';
import BoardGanttView from '../../modules/board/BoardGanttView.vue';

const route = useRoute();
const boardStore = useBoardStore();
const toast = useToast();

const projectId = route.params.id as string;
const project = ref<any>(null);
const loading = ref(true);

const activeView = ref<'kanban' | 'calendar' | 'gantt'>('kanban');

const columns = computed(() => boardStore.columns);
const allIssues = computed(() => boardStore.issues);
const projectUsers = ref<any[]>([]); // To populate assignee dropdown

// Para vuedraggable, necesitamos listas reactivas por columna que se actualicen al cambiar
const localColumnIssues = ref<Record<string, any[]>>({});

// Sincronizar store a local
const dragOptions = {
  animation: 200,
  easing: "cubic-bezier(1, 0, 0, 1)"
};
watch(() => boardStore.issues, (newIssues) => {
  const map: Record<string, any[]> = {};
  columns.value.forEach(col => {
    map[col.id] = [...newIssues.filter(i => i.column_id === col.id).sort((a, b) => a.position - b.position)];
  });
  localColumnIssues.value = map;
}, { deep: true });

const getColumnIssues = (columnId: string) => {
  if (!localColumnIssues.value[columnId]) {
    localColumnIssues.value[columnId] = [];
  }
  let issues = localColumnIssues.value[columnId];
  if (activeFilters.value.priority.length > 0) {
    issues = issues.filter(i => activeFilters.value.priority.includes(i.priority));
  }
  // add other filters here when available
  return issues;
};

// State for Smart Filters
const activePopover = ref<string | null>(null);
const activeFilters = ref({
  priority: [] as string[],
  assignee: [] as string[],
  tags: [] as string[]
});

const hasActiveFilters = computed(() => {
  return activeFilters.value.priority.length > 0 || activeFilters.value.assignee.length > 0 || activeFilters.value.tags.length > 0;
});

const toggleFilter = (type: 'priority' | 'assignee' | 'tags', value: string) => {
  const idx = activeFilters.value[type].indexOf(value);
  if (idx > -1) {
    activeFilters.value[type].splice(idx, 1);
  } else {
    activeFilters.value[type].push(value);
  }
};

const clearFilters = () => {
  activeFilters.value = { priority: [], assignee: [], tags: [] };
  activePopover.value = null;
};

const toggleSearch = () => {
  // Disparar evento para CommandMenu global
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
};

// Ocultar popovers al hacer click fuera (mocked for simplicity)
const closePopovers = () => { activePopover.value = null; };

// Controladores de Modales
const showCreateModal = ref(false);
const showDetailModal = ref(false);
const selectedIssue = ref<any>(null);
const initialColumnForCreate = ref<string | null>(null);
const showPredictive = ref(false);

const openIssueDetails = (issue: any) => {
  selectedIssue.value = issue;
  showDetailModal.value = true;
};

const openCreateForColumn = (columnId: string) => {
  initialColumnForCreate.value = columnId;
  showCreateModal.value = true;
};

const loadData = async () => {
  try {
    const [p, cols, ists] = await Promise.all([
      $fetch(`/api/projects/${projectId}`),
      $fetch(`/api/projects/${projectId}/columns`),
      $fetch(`/api/issues?projectId=${projectId}`)
    ]);
    
    project.value = p;
    boardStore.columns = cols as any[];
    boardStore.issues = ists as any[];
    
    // Mock de usuarios del proyecto por ahora (idealmente vendría de la API)
    // projectUsers.value = await $fetch(`/api/projects/${projectId}/members`);
    projectUsers.value = []; // Placeholder until members API exists

  } catch (e) {
    console.error('Error cargando tablero:', e);
  } finally {
    loading.value = false;
  }
};

const onDragChange = async (event: any, toColumnId: string) => {
  if (event.added) {
    const issue = event.added.element;
    const newIndex = event.added.newIndex;
    const list = localColumnIssues.value[toColumnId];
    
    // Calcular nueva posición basado en elementos adyacentes
    let newPosition = 1024;
    if (list.length > 1) {
      if (newIndex === 0) {
        newPosition = list[1].position / 2;
      } else if (newIndex === list.length - 1) {
        newPosition = list[list.length - 2].position + 1024;
      } else {
        newPosition = (list[newIndex - 1].position + list[newIndex + 1].position) / 2;
      }
    }
    
    // Actualizar optimísticamente
    issue.column_id = toColumnId;
    issue.position = newPosition;
    boardStore.moveIssueOptimistic(issue.id, toColumnId, newPosition);
    
    // Guardar en backend (el endpoint .put que ya existía para mover)
    try {
      await $fetch(`/api/issues/${issue.id}`, {
        method: 'PUT',
        body: { action: 'move', toColumnId, newPosition }
      });
    } catch (e) {
      console.error('Error moviendo', e);
    }
  }
};

const createIssue = async (formData: any) => {
  try {
    const data = {
      project_id: projectId,
      ...formData
    };
    
    const created = await $fetch('/api/issues', {
      method: 'POST',
      body: data
    });
    
    boardStore.createIssueOptimistic(created); // Llamamos al action del store (broadcast socket)
    showCreateModal.value = false;
    toast.success('Tarea creada correctamente');
  } catch (e) {
    console.error('Error creando tarea', e);
    toast.error('Ocurrió un error al crear la tarea');
  }
};

const updateIssue = async (data: { issueId: string, updates: any }) => {
  // Actualización optimista local y broadcast
  boardStore.updateIssueOptimistic(data.issueId, data.updates);

  try {
    await $fetch(`/api/issues/${data.issueId}`, {
      method: 'PATCH',
      body: data.updates
    });
  } catch (e) {
    console.error('Error guardando cambios:', e);
    // Podríamos recargar los issues si falla
  }
};

onMounted(() => {
  loadData();
  boardStore.connectRealtime();
});
</script>

<style scoped>
.board-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: #1e293b;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

.board-header {
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

.project-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-link {
  color: #64748b;
  padding: 6px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.back-link:hover { color: #9333ea; background: rgba(255, 255, 255, 0.5); }

.header-text { display: flex; align-items: center; gap: 12px; }
.header-text h2 { font-size: 18px; font-weight: 700; color: #1e293b; letter-spacing: -0.01em; }

.project-key {
  background: rgba(147, 51, 234, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #7e22ce;
  letter-spacing: 0.5px;
}

.btn-primary-glow {
  background: linear-gradient(135deg, #a855f7, #6366f1);
  color: white; border: none; padding: 8px 16px;
  border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}
.btn-primary-glow:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(147, 51, 234, 0.4); }

.filter-btn {
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #475569;
  padding: 6px 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.filter-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  color: #9333ea;
  border-color: rgba(147, 51, 234, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.1);
}

.project-nav {
  display: flex;
  gap: 4px;
  padding: 4px;
}

.nav-item {
  padding: 6px 12px;
  border-radius: 6px;
  color: var(--txt-secondary);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: 0.2s;
}

.nav-item:hover { color: var(--txt-primary); background: var(--bg-surface-2); }
.nav-item.active { color: var(--txt-primary); font-weight: 600; border-bottom: 2px solid var(--brand-default); border-radius: 0; }

.board-container {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 24px;
  overflow-x: auto;
  overflow-y: hidden;
  align-items: flex-start;
}

.kanban-column {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 12px;
  width: 320px;
  min-width: 320px;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px -4px rgba(147, 51, 234, 0.05);
}

.column-header {
  padding: 8px 12px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-issue-btn {
  background: transparent;
  color: var(--txt-secondary);
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0;
}
.column-header:hover .add-issue-btn {
  opacity: 1;
}
.add-issue-btn:hover {
  background: var(--bg-surface-2);
  color: var(--txt-primary);
}

.column-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  text-transform: capitalize;
}

.issue-count {
  background: var(--bg-surface-2);
  color: var(--txt-secondary);
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
}

.column-body {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 150px;
}

/* Clases de Drag & Drop (vuedraggable) */
.ghost-card {
  opacity: 0.3 !important;
  background: rgba(147, 51, 234, 0.1) !important;
  border: 1px dashed rgba(147, 51, 234, 0.5) !important;
  transform: scale(0.98);
}

.drag-card {
  transform: scale(1.02) rotate(2deg) !important;
  box-shadow: 0 12px 32px rgba(147, 51, 234, 0.25) !important;
  cursor: grabbing !important;
}

/* Transiciones para list filtering */
.column-body > div {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Remove static stagger css */

/* Skeleton Loading */
.skeleton-col {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.7);
}
.skeleton-card {
  height: 120px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.6);
}
.skel-text { position: relative; overflow: hidden; width: 100px; height: 16px; background: rgba(255,255,255,0.4); border-radius: 4px; }
.header-skeleton { position: relative; overflow: hidden; width: 200px; height: 30px; background: rgba(255,255,255,0.4); border-radius: 8px; }

.skeleton-card::after, .skel-text::after, .header-skeleton::after {
  content: "";
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.view-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.view-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
