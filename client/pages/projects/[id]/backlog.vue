<template>
  <div class="backlog-layout">
    <header class="backlog-header">
      <div class="project-info">
        <NuxtLink to="/projects" class="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </NuxtLink>
        <div class="header-text" v-if="!loading">
          <h2>Backlog</h2>
          <span class="project-key">{{ project?.key }}</span>
        </div>
        <div v-else class="header-skeleton"></div>
      </div>
      
      <!-- Navegación del Proyecto -->
      <nav class="project-nav" v-if="!loading">
        <NuxtLink :to="`/board/${projectId}`" class="nav-item">Tablero</NuxtLink>
        <NuxtLink :to="`/projects/${projectId}/backlog`" class="nav-item active">Backlog</NuxtLink>
        <NuxtLink :to="`/projects/${projectId}/reports`" class="nav-item">Reportes</NuxtLink>
      </nav>

      <div class="actions" v-if="!loading">
        <button class="btn-primary-glow" @click="createSprint">Crear Sprint</button>
      </div>
    </header>

    <div class="content-container" v-if="!loading">
      
      <!-- Sprints Activos / Planificados -->
      <div class="sprint-section" v-for="sprint in sprints" :key="sprint.id">
        <div class="sprint-header">
          <div class="sprint-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 2 13 9 20 9"/><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></svg>
            <h3>{{ sprint.name }}</h3>
            <span class="sprint-badge" :class="sprint.status.toLowerCase()">{{ sprint.status }}</span>
          </div>
          <button v-if="sprint.status === 'PENDING'" class="btn-secondary btn-sm" @click="startSprint(sprint)">Iniciar Sprint</button>
          <button v-if="sprint.status === 'ACTIVE'" class="btn-secondary btn-sm" @click="completeSprint(sprint)">Completar Sprint</button>
        </div>
        
        <draggable
          :list="getSprintIssues(sprint.id)"
          item-key="id"
          group="issues"
          class="sprint-body"
          ghost-class="ghost-card"
          @change="onDragChange($event, sprint.id)"
        >
          <template #item="{ element }">
            <div class="backlog-issue-card" @click="openIssueDetails(element)">
              <div class="issue-type-icon" :class="element.type.toLowerCase()"></div>
              <span class="issue-key">{{ project?.key }}-{{ element.key_number }}</span>
              <span class="issue-title">{{ element.title }}</span>
              <div class="spacer"></div>
              <span class="issue-priority" :class="element.priority.toLowerCase()">{{ element.priority }}</span>
            </div>
          </template>
        </draggable>
        <div v-if="getSprintIssues(sprint.id).length === 0" class="empty-state">
          Arrastra tareas aquí para planificar tu sprint
        </div>
      </div>

      <!-- Backlog General -->
      <div class="sprint-section backlog-section">
        <div class="sprint-header">
          <div class="sprint-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
            <h3>Backlog General</h3>
            <span class="issue-count">{{ getBacklogIssues().length }} tareas</span>
          </div>
        </div>
        
        <draggable
          :list="getBacklogIssues()"
          item-key="id"
          group="issues"
          class="sprint-body backlog-body"
          ghost-class="ghost-card"
          @change="onDragChange($event, null)"
        >
          <template #item="{ element }">
            <div class="backlog-issue-card" @click="openIssueDetails(element)">
              <div class="issue-type-icon" :class="element.type.toLowerCase()"></div>
              <span class="issue-key">{{ project?.key }}-{{ element.key_number }}</span>
              <span class="issue-title">{{ element.title }}</span>
              <div class="spacer"></div>
              <span class="issue-priority" :class="element.priority.toLowerCase()">{{ element.priority }}</span>
            </div>
          </template>
        </draggable>
        
        <div class="create-inline">
          <input 
            v-model="newIssueTitle" 
            placeholder="+ Crear tarea" 
            @keyup.enter="quickCreateIssue"
          />
        </div>
      </div>

    </div>

    <!-- Modales -->
    <IssueDetailModal
      :show="showDetailModal"
      :issue="selectedIssue"
      :projectKey="project?.key || ''"
      :columns="columns"
      :users="[]"
      @close="showDetailModal = false"
      @update="updateIssue"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from '#app';
import { useBoardStore } from '../../../stores/board.store';
import draggable from 'vuedraggable';
import IssueDetailModal from '../../../modules/board/IssueDetailModal.vue';

const route = useRoute();
const boardStore = useBoardStore();

const projectId = route.params.id as string;
const project = ref<any>(null);
const loading = ref(true);

const sprints = computed(() => boardStore.sprints);
const columns = computed(() => boardStore.columns);

const localIssues = ref<any[]>([]);

// Sync from store to local for draggable
watch(() => boardStore.issues, (newIssues) => {
  localIssues.value = [...newIssues];
}, { deep: true });

const getSprintIssues = (sprintId: string) => {
  return localIssues.value.filter(i => i.sprint_id === sprintId).sort((a,b) => a.position - b.position);
};

const getBacklogIssues = () => {
  return localIssues.value.filter(i => !i.sprint_id).sort((a,b) => a.position - b.position);
};

const loadData = async () => {
  try {
    const [p, ists, sprs, cols] = await Promise.all([
      $fetch(`/api/projects/${projectId}`),
      $fetch(`/api/issues?projectId=${projectId}`),
      $fetch(`/api/projects/${projectId}/sprints`),
      $fetch(`/api/projects/${projectId}/columns`)
    ]);
    
    project.value = p;
    boardStore.issues = ists as any[];
    boardStore.sprints = sprs as any[];
    boardStore.columns = cols as any[];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const createSprint = async () => {
  try {
    const name = `Sprint ${sprints.value.length + 1}`;
    const newSprint = await $fetch(`/api/projects/${projectId}/sprints`, {
      method: 'POST',
      body: { name }
    });
    boardStore.sprints.push(newSprint);
  } catch (e) {
    console.error(e);
  }
};

const startSprint = async (sprint: any) => {
  try {
    const active = sprints.value.find(s => s.status === 'ACTIVE');
    if (active) return alert('Ya hay un sprint activo.');
    
    const updated = await $fetch(`/api/sprints/${sprint.id}`, {
      method: 'PATCH',
      body: { status: 'ACTIVE', start_date: new Date() }
    });
    
    Object.assign(sprint, updated);
  } catch (e) {
    console.error(e);
  }
};

const completeSprint = async (sprint: any) => {
  try {
    const updated = await $fetch(`/api/sprints/${sprint.id}`, {
      method: 'PATCH',
      body: { status: 'COMPLETED', end_date: new Date() }
    });
    Object.assign(sprint, updated);
  } catch (e) {
    console.error(e);
  }
};

const onDragChange = async (event: any, toSprintId: string | null) => {
  if (event.added) {
    const issue = event.added.element;
    
    // Update locally
    issue.sprint_id = toSprintId;
    boardStore.moveIssueOptimistic(issue.id, undefined, undefined, toSprintId);
    
    // Update DB
    try {
      await $fetch(`/api/issues/${issue.id}`, {
        method: 'PATCH',
        body: { sprint_id: toSprintId === null ? '' : toSprintId }
      });
    } catch (e) {
      console.error(e);
    }
  }
};

// Modals
const showDetailModal = ref(false);
const selectedIssue = ref<any>(null);
const newIssueTitle = ref('');

const openIssueDetails = (issue: any) => {
  selectedIssue.value = issue;
  showDetailModal.value = true;
};

const updateIssue = async (data: { issueId: string, updates: any }) => {
  boardStore.updateIssueOptimistic(data.issueId, data.updates);
  try {
    await $fetch(`/api/issues/${data.issueId}`, {
      method: 'PATCH',
      body: data.updates
    });
  } catch (e) {}
};

const quickCreateIssue = async () => {
  if (!newIssueTitle.value.trim()) return;
  try {
    const created = await $fetch('/api/issues', {
      method: 'POST',
      body: { project_id: projectId, title: newIssueTitle.value, sprint_id: null }
    });
    boardStore.createIssueOptimistic(created);
    newIssueTitle.value = '';
  } catch (e) {}
};

onMounted(() => {
  loadData();
  boardStore.connectRealtime();
});
</script>

<style scoped>
.backlog-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0d0d12;
  background-image: radial-gradient(circle at 0% 0%, rgba(79, 172, 254, 0.03) 0%, transparent 40%),
                    radial-gradient(circle at 100% 100%, rgba(138, 43, 226, 0.03) 0%, transparent 40%);
  color: #fff;
  font-family: 'Inter', sans-serif;
}

.backlog-header {
  padding: 20px 32px; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05); background: rgba(13, 13, 18, 0.8);
  backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 10;
}
.project-info { display: flex; align-items: center; gap: 16px; }
.back-link { color: #a1a1aa; padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.back-link:hover { color: #fff; background: rgba(255, 255, 255, 0.1); }
.header-text { display: flex; align-items: center; gap: 12px; }
.header-text h2 { font-size: 20px; font-weight: 600; color: #fff; letter-spacing: -0.01em; }
.project-key { background: rgba(255, 255, 255, 0.1); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; color: #a1a1aa; }

.project-nav {
  display: flex; gap: 8px; background: rgba(255,255,255,0.03); padding: 4px;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);
}
.nav-item {
  padding: 8px 16px; border-radius: 8px; color: #a1a1aa; font-size: 13px;
  font-weight: 500; text-decoration: none; transition: 0.2s;
}
.nav-item:hover { color: #fff; background: rgba(255,255,255,0.05); }
.nav-item.active { color: #fff; background: rgba(255,255,255,0.1); font-weight: 600; }

.btn-primary-glow { background: linear-gradient(90deg, #4facfe, #8a2be2); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.btn-primary-glow:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(138, 43, 226, 0.4); }

.btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.btn-secondary:hover { background: rgba(255,255,255,0.1); }
.btn-sm { padding: 6px 12px; font-size: 12px; font-weight: 500; }

.content-container { padding: 32px; max-width: 1000px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 32px; }

.sprint-section {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden;
}

.sprint-header {
  padding: 16px 20px; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex; justify-content: space-between; align-items: center;
}
.sprint-title { display: flex; align-items: center; gap: 12px; color: #e4e4e7; }
.sprint-title h3 { font-size: 15px; font-weight: 600; }
.sprint-badge { font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 12px; }
.sprint-badge.pending { background: rgba(255,255,255,0.1); color: #a1a1aa; }
.sprint-badge.active { background: rgba(79,172,254,0.15); color: #4facfe; }
.sprint-badge.completed { background: rgba(52,211,153,0.15); color: #34d399; }
.issue-count { font-size: 13px; color: #71717a; }

.sprint-body { min-height: 40px; padding: 8px; display: flex; flex-direction: column; gap: 4px; }
.empty-state { text-align: center; padding: 24px; color: #71717a; font-size: 13px; font-style: italic; border: 2px dashed rgba(255,255,255,0.05); border-radius: 8px; margin: 8px; }

.backlog-issue-card {
  display: flex; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.02);
  border: 1px solid transparent; border-radius: 8px; cursor: pointer; transition: 0.2s; gap: 12px;
}
.backlog-issue-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); }

.issue-type-icon { width: 14px; height: 14px; border-radius: 3px; }
.issue-type-icon.task { background: #4facfe; }
.issue-type-icon.bug { background: #ef4444; }
.issue-type-icon.story { background: #10b981; }

.issue-key { font-size: 13px; color: #a1a1aa; font-weight: 500; min-width: 60px; }
.issue-title { font-size: 14px; color: #e4e4e7; }
.spacer { flex: 1; }
.issue-priority { font-size: 11px; font-weight: 700; text-transform: uppercase; }
.issue-priority.low { color: #34d399; }
.issue-priority.medium { color: #fbbf24; }
.issue-priority.high { color: #f97316; }
.issue-priority.critical { color: #ef4444; }

.create-inline { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.05); }
.create-inline input { 
  width: 100%; background: transparent; border: none; outline: none; 
  color: #fff; font-size: 14px; font-family: inherit;
}
.create-inline input::placeholder { color: #71717a; }

.ghost-card { opacity: 0.4; background: rgba(79, 172, 254, 0.1) !important; border: 1px dashed #4facfe !important; }
</style>
