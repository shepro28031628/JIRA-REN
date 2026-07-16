<template>
  <div class="board-layout">
    <header class="board-header">
      <div class="project-info">
        <NuxtLink to="/projects" class="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
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

      <div class="actions" v-if="!loading">
        <button class="btn-primary-glow" @click="showCreateModal = true">Crear Tarea</button>
      </div>
    </header>

    <div class="board-container" v-if="!loading">
      <div v-for="column in columns" :key="column.id" class="kanban-column">
        <div class="column-header">
          <div class="flex items-center gap-2">
            <h3>{{ column.name }}</h3>
            <span class="issue-count">{{ getColumnIssues(column.id).length }}</span>
          </div>
          <button class="add-issue-btn" @click="openCreateForColumn(column.id)" title="Añadir tarea">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
        
        <!-- Contenedor Draggable -->
        <draggable
          :list="getColumnIssues(column.id)"
          item-key="id"
          group="issues"
          class="column-body"
          ghost-class="ghost-card"
          drag-class="drag-card"
          @change="onDragChange($event, column.id)"
        >
          <template #item="{ element }">
            <IssueCard 
              :issue="element" 
              :projectKey="project?.key" 
              @click="openIssueDetails(element)"
            />
          </template>
        </draggable>
      </div>
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
import draggable from 'vuedraggable';
import IssueCard from '../../modules/board/IssueCard.vue';
import CreateIssueModal from '../../modules/board/CreateIssueModal.vue';
import IssueDetailModal from '../../modules/board/IssueDetailModal.vue';

const route = useRoute();
const boardStore = useBoardStore();

const projectId = route.params.id as string;
const project = ref<any>(null);
const loading = ref(true);

const columns = computed(() => boardStore.columns);
const allIssues = computed(() => boardStore.issues);
const projectUsers = ref<any[]>([]); // To populate assignee dropdown

// Para vuedraggable, necesitamos listas reactivas por columna que se actualicen al cambiar
const localColumnIssues = ref<Record<string, any[]>>({});

// Sincronizar store a local
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
  return localColumnIssues.value[columnId];
};

// Controladores de Modales
const showCreateModal = ref(false);
const showDetailModal = ref(false);
const selectedIssue = ref<any>(null);
const initialColumnForCreate = ref<string | null>(null);

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
  } catch (e) {
    console.error('Error creando tarea', e);
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
  background-color: var(--bg-canvas);
  color: var(--txt-primary);
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

.board-header {
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface-1);
  z-index: 10;
}

.project-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-link {
  color: var(--txt-secondary);
  padding: 6px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.back-link:hover { color: var(--txt-primary); background: var(--bg-surface-2); }

.header-text { display: flex; align-items: center; gap: 12px; }
.header-text h2 { font-size: 18px; font-weight: 600; color: var(--txt-primary); letter-spacing: -0.01em; }

.project-key {
  background: var(--bg-surface-2);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--txt-secondary);
  letter-spacing: 0.5px;
}

.btn-primary-glow {
  background: var(--brand-default);
  color: white; border: none; padding: 8px 16px;
  border-radius: 6px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
}
.btn-primary-glow:hover { opacity: 0.9; }

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
  background: transparent;
  border-right: 1px dashed var(--border-subtle);
  border-left: 1px dashed transparent;
  padding: 0 8px;
  width: 320px;
  min-width: 320px;
  max-height: 100%;
  display: flex;
  flex-direction: column;
}
.kanban-column:first-child {
  border-left: none;
}
.kanban-column:last-child {
  border-right: none;
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
  font-size: 13px;
  font-weight: 500;
  color: var(--txt-primary);
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
  opacity: 0.5;
  background: var(--bg-surface-2) !important;
  border: 1px dashed var(--border-strong) !important;
}

.drag-card {
  transform: rotate(2deg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* Skeleton Loading */
.header-skeleton { width: 200px; height: 30px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; animation: pulse 2s infinite ease-in-out; }
.skel-text { width: 100px; height: 16px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; animation: pulse 2s infinite ease-in-out; }
.skeleton-card { height: 120px; background: rgba(255, 255, 255, 0.03); border: none; animation: pulse 2s infinite ease-in-out; }
@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}
</style>
