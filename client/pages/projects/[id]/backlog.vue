<template>
  <div class="backlog-layout">
    <header class="backlog-header">
      <div class="project-info">
        <NuxtLink to="/projects" class="back-link">
          <ArrowLeft class="w-5 h-5" stroke-width="1.5" />
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
        <div class="sprint-header cursor-pointer group" @click="toggleSprint(sprint.id)">
          <div class="sprint-title flex-1">
            <ChevronDown 
              class="w-5 h-5 text-purple-500 transition-transform duration-300" 
              :class="{ '-rotate-90': collapsedSprints[sprint.id] }"
              stroke-width="1.5" 
            />
            <h3>{{ sprint.name }}</h3>
            <span class="sprint-badge" :class="sprint.status.toLowerCase()">{{ sprint.status }}</span>
            <span class="text-xs text-slate-400 font-medium ml-2">{{ getSprintIssues(sprint.id).length }} tareas</span>
          </div>
          
          <!-- Barra de Progreso Minimalista -->
          <div class="flex items-center gap-4 mr-4 opacity-80 group-hover:opacity-100 transition-opacity" v-if="getSprintIssues(sprint.id).length > 0">
            <div class="w-32 h-1.5 bg-purple-100/50 rounded-full overflow-hidden flex">
              <div class="h-full bg-emerald-400 transition-all duration-500" :style="{ width: getSprintProgress(sprint.id).done + '%' }"></div>
              <div class="h-full bg-blue-400 transition-all duration-500" :style="{ width: getSprintProgress(sprint.id).inProgress + '%' }"></div>
            </div>
            <span class="text-[10px] font-bold text-slate-500">{{ Math.round(getSprintProgress(sprint.id).done) }}%</span>
          </div>

          <button v-if="sprint.status === 'PENDING'" class="btn-secondary btn-sm" @click.stop="startSprint(sprint)">Iniciar Sprint</button>
          <button v-if="sprint.status === 'ACTIVE'" class="btn-secondary btn-sm" @click.stop="completeSprint(sprint)">Completar Sprint</button>
        </div>
        
        <div v-show="!collapsedSprints[sprint.id]" v-motion :initial="{ opacity: 0, height: 0 }" :enter="{ opacity: 1, height: 'auto', transition: { duration: 300 } }">
          <draggable
            :list="getSprintIssues(sprint.id)"
            item-key="id"
            group="issues"
            class="sprint-body"
            ghost-class="ghost-card"
            @change="onDragChange($event, sprint.id)"
          >
            <template #item="{ element }">
              <div class="backlog-issue-card group" @click="openIssueDetails(element)">
                <div class="flex items-center justify-center w-6 h-6 rounded-md" :class="['bg-slate-100', `type-${element.type.toLowerCase()}`]">
                  <CheckSquare v-if="element.type === 'TASK'" class="w-3.5 h-3.5 text-blue-500" stroke-width="2" />
                  <Bug v-if="element.type === 'BUG'" class="w-3.5 h-3.5 text-red-500" stroke-width="2" />
                  <Bookmark v-if="element.type === 'STORY'" class="w-3.5 h-3.5 text-emerald-500" stroke-width="2" />
                  <Zap v-if="element.type === 'EPIC'" class="w-3.5 h-3.5 text-purple-500" stroke-width="2" />
                </div>
                <span class="issue-key">{{ project?.key }}-{{ element.key_number }}</span>
                <span class="issue-title">{{ element.title }}</span>
                <div class="spacer"></div>
                <!-- Priority icon instead of text if preferred, or text + icon -->
                <div class="flex items-center gap-1 issue-priority" :class="element.priority.toLowerCase()">
                  <AlertCircle class="w-3.5 h-3.5" stroke-width="2" />
                  <span>{{ element.priority }}</span>
                </div>
              </div>
            </template>
          </draggable>
          <div v-if="getSprintIssues(sprint.id).length === 0" class="empty-state">
            Arrastra tareas aquí para planificar tu sprint
          </div>
        </div>
      </div>

      <!-- Backlog General -->
      <div class="sprint-section backlog-section">
        <div class="sprint-header cursor-pointer group" @click="toggleSprint('backlog')">
          <div class="sprint-title flex-1">
            <ChevronDown 
              class="w-5 h-5 text-purple-500 transition-transform duration-300" 
              :class="{ '-rotate-90': collapsedSprints['backlog'] }"
              stroke-width="1.5" 
            />
            <h3>Backlog General</h3>
            <span class="text-xs text-slate-400 font-medium ml-2">{{ getBacklogIssues().length }} tareas</span>
          </div>
        </div>
        
        <div v-show="!collapsedSprints['backlog']" v-motion :initial="{ opacity: 0, height: 0 }" :enter="{ opacity: 1, height: 'auto', transition: { duration: 300 } }">
          <draggable
            :list="getBacklogIssues()"
            item-key="id"
            group="issues"
            class="sprint-body backlog-body"
            ghost-class="ghost-card"
            @change="onDragChange($event, null)"
          >
            <template #item="{ element }">
              <div class="backlog-issue-card group" @click="openIssueDetails(element)">
                <div class="flex items-center justify-center w-6 h-6 rounded-md" :class="['bg-slate-100', `type-${element.type.toLowerCase()}`]">
                  <CheckSquare v-if="element.type === 'TASK'" class="w-3.5 h-3.5 text-blue-500" stroke-width="2" />
                  <Bug v-if="element.type === 'BUG'" class="w-3.5 h-3.5 text-red-500" stroke-width="2" />
                  <Bookmark v-if="element.type === 'STORY'" class="w-3.5 h-3.5 text-emerald-500" stroke-width="2" />
                  <Zap v-if="element.type === 'EPIC'" class="w-3.5 h-3.5 text-purple-500" stroke-width="2" />
                </div>
                <span class="issue-key">{{ project?.key }}-{{ element.key_number }}</span>
                <span class="issue-title">{{ element.title }}</span>
                <div class="spacer"></div>
                <div class="flex items-center gap-1 issue-priority" :class="element.priority.toLowerCase()">
                  <AlertCircle class="w-3.5 h-3.5" stroke-width="2" />
                  <span>{{ element.priority }}</span>
                </div>
              </div>
            </template>
          </draggable>
        
        <div class="create-inline" v-show="!collapsedSprints['backlog']">
          <input 
            v-model="newIssueTitle" 
            placeholder="+ Crear tarea" 
            @keyup.enter="quickCreateIssue"
          />
        </div>
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
import { ArrowLeft, ChevronDown, CheckSquare, Bug, Bookmark, Zap, AlertCircle } from 'lucide-vue-next';
import IssueDetailModal from '../../../modules/board/IssueDetailModal.vue';

const route = useRoute();
const boardStore = useBoardStore();

const projectId = route.params.id as string;
const project = ref<any>(null);
const loading = ref(true);

const sprints = computed(() => boardStore.sprints);
const columns = computed(() => boardStore.columns);

const localIssues = ref<any[]>([]);
const collapsedSprints = ref<Record<string, boolean>>({});

const toggleSprint = (id: string) => {
  collapsedSprints.value[id] = !collapsedSprints.value[id];
};

const getSprintProgress = (sprintId: string) => {
  const issues = getSprintIssues(sprintId);
  if (!issues.length || !columns.value.length) return { done: 0, inProgress: 0, todo: 0 };
  
  const doneColId = columns.value[columns.value.length - 1].id;
  const todoColId = columns.value[0].id;
  
  let doneCount = 0;
  let inProgressCount = 0;
  
  issues.forEach(i => {
    if (i.column_id === doneColId) doneCount++;
    else if (i.column_id !== todoColId) inProgressCount++;
  });
  
  return {
    done: (doneCount / issues.length) * 100,
    inProgress: (inProgressCount / issues.length) * 100,
    todo: ((issues.length - doneCount - inProgressCount) / issues.length) * 100
  };
};

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
  background-color: transparent;
  color: #1e293b;
  font-family: 'Inter', sans-serif;
}

.backlog-header {
  padding: 16px 32px; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.4); background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 10;
}
.project-info { display: flex; align-items: center; gap: 16px; }
.back-link { color: #64748b; padding: 6px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.back-link:hover { color: #1e293b; background: rgba(255, 255, 255, 0.5); }
.header-text { display: flex; align-items: center; gap: 12px; }
.header-text h2 { font-size: 18px; font-weight: 600; color: #1e293b; letter-spacing: -0.01em; }
.project-key { background: rgba(255, 255, 255, 0.5); padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; color: #64748b; }

.project-nav {
  display: flex; gap: 4px; padding: 4px;
}
.nav-item {
  padding: 6px 12px; border-radius: 6px; color: #64748b; font-size: 13px;
  font-weight: 500; text-decoration: none; transition: 0.2s;
}
.nav-item:hover { color: #1e293b; background: rgba(255,255,255,0.4); }
.nav-item.active { color: #1e293b; font-weight: 600; border-bottom: 2px solid #9333ea; border-radius: 0; }

.btn-primary-glow { background: var(--brand-default); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-primary-glow:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2); opacity: 0.95; }

.btn-secondary { background: rgba(255,255,255,0.5); border: 1px solid rgba(147, 51, 234, 0.1); color: #64748b; border-radius: 6px; cursor: pointer; transition: 0.2s; }
.btn-secondary:hover { background: rgba(255,255,255,0.8); color: #1e293b; }
.btn-sm { padding: 6px 12px; font-size: 12px; font-weight: 500; }

.content-container { padding: 32px; max-width: 1100px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 24px; }

.sprint-section {
  background: rgba(255,255,255,0.3); 
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.5); 
  border-radius: 16px; 
  box-shadow: 0 4px 6px -1px rgba(147, 51, 234, 0.05);
}

.sprint-header {
  padding: 12px 20px; background: rgba(255,255,255,0.4); border-bottom: 1px solid rgba(255,255,255,0.3);
  display: flex; justify-content: space-between; align-items: center; border-radius: 16px 16px 0 0;
  transition: background 0.2s;
}
.sprint-header:hover { background: rgba(255,255,255,0.6); }
.sprint-title { display: flex; align-items: center; gap: 12px; color: #1e293b; }
.sprint-title h3 { font-size: 14px; font-weight: 600; }
.sprint-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; letter-spacing: 0.5px; }
.sprint-badge.pending { background: rgba(147,51,234,0.1); color: #9333ea; border: 1px solid rgba(147,51,234,0.2); }
.sprint-badge.active { background: rgba(79,172,254,0.15); color: #0284c7; border: 1px solid rgba(79,172,254,0.2); }
.sprint-badge.completed { background: rgba(52,211,153,0.15); color: #059669; border: 1px solid rgba(52,211,153,0.2); }

.sprint-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.empty-state { text-align: center; padding: 24px; color: #64748b; font-size: 13px; font-style: italic; border: 1px dashed rgba(147, 51, 234, 0.2); border-radius: 12px; margin: 8px; }

/* Backlog Glassmorphism Cards */
.backlog-issue-card {
  display: flex; align-items: center; padding: 10px 16px; 
  background: rgba(255,255,255,0.5); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.6); border-radius: 12px; 
  cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); gap: 14px;
  box-shadow: 0 1px 2px rgba(147, 51, 234, 0.05);
}
.backlog-issue-card:hover { 
  background: rgba(255,255,255,0.8); 
  border-color: rgba(147,51,234,0.3); 
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.1);
}

.issue-key { font-size: 12px; color: #64748b; font-weight: 500; min-width: 65px; }
.issue-title { font-size: 14px; color: #334155; font-weight: 500; }
.spacer { flex: 1; }

.issue-priority { font-size: 11px; font-weight: 600; text-transform: capitalize; padding: 2px 6px; border-radius: 4px; }
.issue-priority.low { color: #64748b; background: rgba(255,255,255,0.6); border: 1px solid rgba(147,51,234,0.1); }
.issue-priority.medium { color: #d97706; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.2); }
.issue-priority.high { color: #ea580c; background: rgba(234,88,12,0.1); border: 1px solid rgba(234,88,12,0.2); }
.issue-priority.critical { color: #e11d48; background: rgba(225,29,72,0.1); border: 1px solid rgba(225,29,72,0.2); }

.create-inline { padding: 12px 20px; border-top: 1px solid rgba(147,51,234,0.1); background: rgba(255,255,255,0.2); }
.create-inline input { 
  width: 100%; background: transparent; border: none; outline: none; 
  color: #1e293b; font-size: 13px; font-family: inherit; font-weight: 500;
}
.create-inline input::placeholder { color: #94a3b8; }

.ghost-card { opacity: 0.3 !important; background: rgba(147, 51, 234, 0.1) !important; border: 1px dashed rgba(147, 51, 234, 0.5) !important; transform: scale(0.98); }
</style>
