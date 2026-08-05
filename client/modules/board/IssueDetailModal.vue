<template>
  <Transition name="modal-fade">
    <div v-if="show && issue" class="modal-overlay" @click.self="close">
      <div :class="cn('detail-modal', 'backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl shadow-purple-100/40 transform-gpu')">
        <div class="modal-header">
          <div class="issue-breadcrumb">
            <span class="project-key">{{ projectKey }}</span>
            <span class="separator">/</span>
            <span class="issue-key">{{ projectKey }}-{{ issue.key_number }}</span>
          </div>
          <div class="header-actions">
            <button type="button" class="btn-icon" title="Eliminar (Próximamente)">
              <Trash2 class="w-4 h-4" stroke-width="1.5" />
            </button>
            <button type="button" class="btn-icon" @click="close">
              <X class="w-5 h-5" stroke-width="1.5" />
            </button>
          </div>
        </div>
        
        <div class="modal-body">
          <div class="main-content">
            <!-- Título Editable -->
            <input 
              v-model="localIssue.title" 
              class="editable-title" 
              placeholder="Título de la tarea" 
              @blur="saveChanges('title')"
            />

            <!-- Tabs Navigation -->
            <div class="tabs-nav">
              <button class="tab-btn" :class="{active: activeTab === 'details'}" @click="activeTab = 'details'">Detalles</button>
              <button class="tab-btn" :class="{active: activeTab === 'activity'}" @click="activeTab = 'activity'">Actividad</button>
            </div>

            <!-- Panel Detalles -->
            <div v-show="activeTab === 'details'" class="tab-pane">
              <div class="section">
                <h4>Descripción</h4>
                <textarea 
                  v-model="localIssue.description" 
                  class="editable-desc" 
                  placeholder="Agrega una descripción detallada..." 
                  rows="4"
                  @blur="saveChanges('description')"
                ></textarea>
              </div>

              <!-- Sección de Sub-tareas / Checklist -->
              <div class="section mt-5 border-t border-purple-100/60 pt-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <CheckSquare class="w-4 h-4 text-purple-600" /> Sub-tareas
                  </h4>
                  <span class="text-xs text-slate-500 font-medium">
                    {{ completedSubtasksCount }} de {{ subtasks.length }} completadas
                  </span>
                </div>

                <!-- Barra de progreso de subtareas -->
                <div v-if="subtasks.length > 0" class="w-full bg-slate-200/60 rounded-full h-1.5 mb-3 overflow-hidden border border-slate-200/40">
                  <div class="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300" :style="{ width: subtaskProgressPercent + '%' }"></div>
                </div>

                <!-- Lista de Subtareas -->
                <div class="subtask-list flex flex-col gap-1.5 mb-3">
                  <div v-for="subtask in subtasks" :key="subtask.id" class="flex items-center justify-between p-2 rounded-lg bg-white/80 border border-slate-200/80 hover:border-purple-200 transition-colors shadow-2xs">
                    <label class="flex items-center gap-2.5 cursor-pointer flex-1">
                      <input type="checkbox" :checked="subtask.completed" @change="toggleSubtask(subtask)" class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer" />
                      <span class="text-xs text-slate-700 font-medium" :class="{ 'line-through text-slate-400': subtask.completed }">{{ subtask.title }}</span>
                    </label>
                    <button @click="deleteSubtask(subtask.id)" class="text-slate-400 hover:text-red-500 p-1 rounded transition-colors" title="Eliminar sub-tarea">
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <!-- Input para agregar nueva subtarea -->
                <div class="flex items-center gap-2">
                  <input v-model="newSubtaskTitle" placeholder="Agregar una sub-tarea..." class="flex-1 bg-white/70 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-purple-400 shadow-2xs" @keyup.enter="addSubtask" />
                  <button @click="addSubtask" class="btn-primary-glow text-xs py-1.5 px-3 font-semibold" :disabled="!newSubtaskTitle.trim()">+ Agregar</button>
                </div>
              </div>
            </div>

            <!-- Panel Actividad -->
            <div v-show="activeTab === 'activity'" class="tab-pane">
              <AuditTimeline 
                :logs="activityLogs" 
                @time-travel="openTimeTravel"
              />
              
              <!-- Time-Travel Sliding Panel -->
              <div 
                v-if="showTimeTravel" 
                class="absolute inset-y-0 right-0 w-[450px] bg-white/95 backdrop-blur-xl border-l border-purple-200/60 shadow-2xl z-50 p-6 overflow-y-auto transform-gpu"
                v-motion-slide-right
              >
                <div class="flex items-center justify-between mb-6 pb-4 border-b border-purple-100">
                  <div class="flex items-center gap-2">
                    <GitBranch class="w-5 h-5 text-purple-600" />
                    <h3 class="text-lg font-bold text-slate-800">Time-Travel: Comparador</h3>
                  </div>
                  <button @click="showTimeTravel = false" class="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-500">
                    <X class="w-5 h-5" />
                  </button>
                </div>
                
                <div class="text-[13px] text-slate-500 mb-6 flex flex-col gap-1">
                  <span>Cambio realizado por <strong>{{ selectedLog?.user_name }}</strong></span>
                  <span>Fecha: {{ formatDate(selectedLog?.created_at) }}</span>
                </div>

                <div class="diff-container bg-white rounded-xl border border-purple-100 shadow-sm overflow-hidden">
                  <div class="diff-header bg-slate-50 border-b border-purple-100 px-4 py-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <span>Versión Anterior</span>
                    <ArrowRight class="w-3.5 h-3.5 text-slate-300" />
                    <span>Versión Nueva</span>
                  </div>
                  <div class="p-4 flex flex-col gap-4 text-[13px] font-mono whitespace-pre-wrap">
                    <div class="bg-pink-50/50 text-pink-700/80 p-3 rounded-lg border border-pink-100/50 line-through">
                      {{ selectedLog?.changes?.before?.description || 'Vacío' }}
                    </div>
                    <div class="bg-purple-50 text-purple-800 p-3 rounded-lg border border-purple-100 shadow-inner">
                      {{ selectedLog?.changes?.after?.description || 'Vacío' }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="comment-box">
                <textarea 
                  v-model="newCommentText" 
                  placeholder="Escribe un comentario..." 
                  rows="2"
                  @keyup.enter.exact="addComment"
                ></textarea>
                <div class="comment-actions">
                  <span class="hint">Presiona Enter para enviar</span>
                  <button class="btn-primary-glow" @click="addComment" :disabled="!newCommentText.trim()">Comentar</button>
                </div>
              </div>
            </div>
            
            <div class="save-status" :class="{ visible: isSaving }">
              <span class="loader-small"></span> Guardando...
            </div>
          </div>

          <div class="sidebar">
            <div class="sidebar-section">
              <label>Estado</label>
              <div class="custom-select-wrapper">
                <select v-model="localIssue.column_id" @change="saveChanges('column_id')" class="status-select">
                  <option v-for="col in columns" :key="col.id" :value="col.id">{{ col.name }}</option>
                </select>
                <ChevronDown class="select-icon w-4 h-4" stroke-width="1.5" />
              </div>
            </div>

            <div class="sidebar-section">
              <label>Tipo</label>
              <div class="custom-select-wrapper">
                <select v-model="localIssue.type" @change="saveChanges('type')">
                  <option value="TASK">Tarea</option>
                  <option value="BUG">Bug</option>
                  <option value="STORY">Historia</option>
                  <option value="EPIC">Épica</option>
                </select>
                <ChevronDown class="select-icon w-4 h-4" stroke-width="1.5" />
              </div>
            </div>

            <div class="sidebar-section">
              <label>Prioridad</label>
              <div class="custom-select-wrapper">
                <select v-model="localIssue.priority" @change="saveChanges('priority')">
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="CRITICAL">Crítica</option>
                </select>
                <ChevronDown class="select-icon w-4 h-4" stroke-width="1.5" />
              </div>
            </div>

            <div class="sidebar-section">
              <label>Asignado a</label>
              <div class="custom-select-wrapper">
                <select v-model="localIssue.assignee_id" @change="saveChanges('assignee_id')">
                  <option value="">Sin asignar</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
                </select>
                <ChevronDown class="select-icon w-4 h-4" stroke-width="1.5" />
              </div>
            </div>

            <!-- Épica Vinculada -->
            <div class="sidebar-section">
              <label class="flex items-center gap-1 text-purple-700 font-semibold">
                <Zap class="w-3.5 h-3.5 text-purple-600" /> Épica
              </label>
              <div class="custom-select-wrapper">
                <select v-model="localIssue.epic_id" @change="saveChanges('epic_id')">
                  <option :value="null">Sin Épica</option>
                  <option v-for="epic in epicsList" :key="epic.id" :value="epic.id">
                    {{ epic.title }}
                  </option>
                </select>
                <ChevronDown class="select-icon w-4 h-4" stroke-width="1.5" />
              </div>
            </div>

            <!-- Etiquetas (Labels) -->
            <div class="sidebar-section">
              <label class="flex items-center gap-1 text-indigo-700 font-semibold">
                <Tag class="w-3.5 h-3.5 text-indigo-500" /> Etiquetas
              </label>
              <div class="flex flex-wrap gap-1 mb-2">
                <span v-for="lbl in issueLabels" :key="lbl.id" class="px-2 py-0.5 text-[10px] font-bold rounded-md text-white shadow-xs" :style="{ backgroundColor: lbl.color }">
                  {{ lbl.name }}
                </span>
                <span v-if="issueLabels.length === 0" class="text-[11px] text-slate-400 italic">Sin etiquetas</span>
              </div>
              <div class="flex gap-1">
                <input v-model="newLabelName" placeholder="Nueva etiqueta..." class="flex-1 bg-white/70 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 outline-none focus:border-purple-400" @keyup.enter="addLabel" />
                <button @click="addLabel" class="bg-purple-600 text-white rounded-md px-2 py-1 text-xs font-semibold hover:bg-purple-700 active:scale-95 transition-all">+</button>
              </div>
            </div>
            
            <!-- Time Tracking Section (Pro Max) -->
            <div class="sidebar-section">
              <label class="flex items-center gap-2">
                <Clock class="w-4 h-4 text-purple-500" stroke-width="2" />
                Carga de Trabajo
              </label>
              
              <div class="time-tracking-card bg-white/50 backdrop-blur-md rounded-xl p-4 border border-white shadow-sm mt-1">
                <div class="flex justify-between items-end mb-3">
                  <div class="flex flex-col gap-1">
                    <span class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Estimado</span>
                    <input 
                      type="number" 
                      v-model.number="localIssue.estimated_minutes" 
                      @blur="saveChanges('estimated_minutes')" 
                      class="w-16 bg-white/60 border border-purple-100 rounded-md px-2 py-1 text-sm text-slate-700 font-medium outline-none focus:border-purple-400 focus:bg-white transition-colors"
                      placeholder="Min" 
                    />
                  </div>
                  <div class="flex flex-col items-end gap-1">
                    <span class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Registrado</span>
                    <span class="text-lg font-bold text-slate-800">
                      {{ formatMinutes(loggedMinutes + Math.floor(trackingSeconds / 60)) }}
                    </span>
                  </div>
                </div>

                <!-- Animated Progress Bar -->
                <div class="relative h-2.5 bg-slate-200/50 rounded-full overflow-hidden border border-slate-300/50 shadow-inner mb-4">
                  <div 
                    class="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 ease-out"
                    :style="{ width: progressPercent + '%' }"
                  ></div>
                </div>

                <!-- Stopwatch Controls -->
                <div class="flex items-center gap-2">
                  <button 
                    @click="toggleTimer"
                    class="flex items-center justify-center gap-1.5 flex-1 py-1.5 rounded-lg font-medium text-xs transition-all active:scale-95"
                    :class="isTracking ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'"
                  >
                    <Pause v-if="isTracking" class="w-3.5 h-3.5" stroke-width="2.5" />
                    <Play v-else class="w-3.5 h-3.5" stroke-width="2.5" />
                    {{ isTracking ? 'Pausar' : 'Iniciar' }}
                  </button>
                  <button 
                    v-if="trackingSeconds > 0 || isTracking"
                    @click="saveTrackedTime"
                    class="flex items-center justify-center px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-medium text-xs transition-all active:scale-95"
                  >
                    Guardar
                  </button>
                </div>

                <!-- Manual Log Entry (Collapsible) -->
                <div class="mt-3 pt-3 border-t border-slate-200/50 flex gap-2">
                  <input 
                    type="number" 
                    v-model.number="newLogMinutes" 
                    min="0" 
                    placeholder="Min" 
                    class="w-14 bg-white/60 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 outline-none focus:border-purple-400" 
                  />
                  <input 
                    type="text" 
                    v-model="newLogDesc" 
                    placeholder="Nota (opcional)" 
                    class="flex-1 bg-white/60 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 outline-none focus:border-purple-400" 
                    @keyup.enter="logTime" 
                  />
                  <button 
                    @click="logTime" 
                    class="bg-slate-800 text-white rounded-md px-2.5 py-1 text-xs font-semibold hover:bg-slate-700 transition-colors active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div class="meta-data">
              <p>Creado: {{ formatDate(issue.created_at) }}</p>
              <p>Actualizado: {{ formatDate(issue.updated_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue';
import { $fetch } from 'ofetch';
import { cn } from '../../utils/cn';
import { Trash2, X, ChevronDown, Clock, Play, Pause, GitBranch, ArrowRight, CheckSquare, Zap, Tag } from 'lucide-vue-next';
import AuditTimeline from '../../components/history/AuditTimeline.vue';

const props = defineProps<{
  show: boolean;
  issue: any;
  projectKey: string;
  columns: any[];
  users?: any[];
  epicsList?: any[];
}>();

const emit = defineEmits(['close', 'update']);

const localIssue = ref<any>({});
const isSaving = ref(false);
const activeTab = ref('details');

const comments = ref<any[]>([]);
const activityLogs = ref<any[]>([]);
const newCommentText = ref('');

// Sub-tareas
const subtasks = ref<any[]>([]);
const newSubtaskTitle = ref('');

const completedSubtasksCount = computed(() => subtasks.value.filter(s => s.completed).length);
const subtaskProgressPercent = computed(() => subtasks.value.length ? Math.round((completedSubtasksCount.value / subtasks.value.length) * 100) : 0);

const fetchSubtasks = async () => {
  if (!localIssue.value?.id) return;
  try {
    subtasks.value = await $fetch(`/api/issues/${localIssue.value.id}/subtasks`);
  } catch (e) {
    console.error('Error al cargar subtareas', e);
  }
};

const addSubtask = async () => {
  if (!newSubtaskTitle.value.trim() || !localIssue.value?.id) return;
  try {
    const created = await $fetch(`/api/issues/${localIssue.value.id}/subtasks`, {
      method: 'POST',
      body: { title: newSubtaskTitle.value.trim() }
    });
    subtasks.value.push(created);
    newSubtaskTitle.value = '';
  } catch (e) {
    console.error('Error al agregar subtarea', e);
  }
};

const toggleSubtask = async (subtask: any) => {
  subtask.completed = !subtask.completed;
  try {
    await $fetch(`/api/issues/${localIssue.value.id}/subtasks`, {
      method: 'PUT',
      body: { subtaskId: subtask.id, completed: subtask.completed }
    });
  } catch (e) {
    subtask.completed = !subtask.completed;
  }
};

const deleteSubtask = async (subtaskId: string) => {
  try {
    await $fetch(`/api/issues/${localIssue.value.id}/subtasks`, {
      method: 'DELETE',
      body: { subtaskId }
    });
    subtasks.value = subtasks.value.filter(s => s.id !== subtaskId);
  } catch (e) {
    console.error('Error al eliminar subtarea', e);
  }
};

// Etiquetas (Labels)
const issueLabels = ref<any[]>([]);
const newLabelName = ref('');

const fetchLabels = async () => {
  if (!localIssue.value?.id) return;
  try {
    issueLabels.value = await $fetch(`/api/issues/${localIssue.value.id}/labels`);
  } catch (e) {
    console.error('Error al cargar etiquetas', e);
  }
};

const addLabel = async () => {
  if (!newLabelName.value.trim() || !localIssue.value?.id || !localIssue.value?.project_id) return;
  try {
    const created = await $fetch(`/api/projects/${localIssue.value.project_id}/labels`, {
      method: 'POST',
      body: { name: newLabelName.value.trim() }
    });
    const currentIds = issueLabels.value.map(l => l.id);
    if (!currentIds.includes(created.id)) {
      currentIds.push(created.id);
    }
    issueLabels.value = await $fetch(`/api/issues/${localIssue.value.id}/labels`, {
      method: 'POST',
      body: { labelIds: currentIds }
    });
    newLabelName.value = '';
  } catch (e) {
    console.error('Error al agregar etiqueta', e);
  }
};

// Time Travel State
const showTimeTravel = ref(false);
const selectedLog = ref<any>(null);

const openTimeTravel = (log: any) => {
  selectedLog.value = log;
  showTimeTravel.value = true;
};

watch(() => props.issue, (newVal) => {
  if (newVal) {
    localIssue.value = JSON.parse(JSON.stringify(newVal));
    fetchSubtasks();
    fetchLabels();
  }
}, { immediate: true, deep: true });

const close = () => emit('close');

const saveChanges = async (field: string) => {
  // If the value hasn't changed, don't save
  if (localIssue.value[field] === props.issue[field]) return;
  
  isSaving.value = true;
  
  try {
    // Notify parent to handle the API call
    emit('update', { 
      issueId: localIssue.value.id, 
      updates: { [field]: localIssue.value[field] } 
    });
  } catch (error) {
    console.error('Error saving field:', field, error);
    // Rollback to original value
    localIssue.value[field] = props.issue[field];
  } finally {
    // Small timeout for better UX on the saving indicator
    setTimeout(() => {
      isSaving.value = false;
    }, 500);
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('es-ES', { 
    day: '2-digit', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  }).format(d);
};

// Time tracking state
const loggedMinutes = ref(0);
const newLogMinutes = ref<number | null>(null);
const newLogDesc = ref('');

const formatMinutes = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const progressPercent = computed(() => {
  const est = localIssue.value.estimated_minutes || 0;
  if (est === 0) return 0;
  const currentTotal = loggedMinutes.value + Math.floor(trackingSeconds.value / 60);
  return Math.min(100, (currentTotal / est) * 100);
});

// Stopwatch Logic
const isTracking = ref(false);
const trackingSeconds = ref(0);
let trackingInterval: any = null;

const toggleTimer = () => {
  if (isTracking.value) {
    clearInterval(trackingInterval);
    isTracking.value = false;
  } else {
    isTracking.value = true;
    trackingInterval = setInterval(() => {
      trackingSeconds.value++;
    }, 1000);
  }
};

const saveTrackedTime = async () => {
  if (isTracking.value) {
    toggleTimer();
  }
  const minutes = Math.floor(trackingSeconds.value / 60);
  if (minutes > 0) {
    newLogMinutes.value = minutes;
    newLogDesc.value = 'Cronómetro de trabajo';
    await logTime();
  }
  trackingSeconds.value = 0;
};

onBeforeUnmount(() => {
  if (trackingInterval) clearInterval(trackingInterval);
});

const progressColor = computed(() => {
  const p = progressPercent.value;
  if (p < 70) return '#4facfe'; // greenish blue
  if (p < 100) return '#ffa500'; // orange
  return '#ff4500'; // red
});

const fetchLogs = async () => {
  try {
    const logs: any[] = await $fetch(`/api/issues/${localIssue.value.id}/time`);
    loggedMinutes.value = logs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
  } catch (e) {
    console.error('Error fetching time logs', e);
  }
};

const logTime = async () => {
  if (!newLogMinutes.value) return;
  try {
    await $fetch(`/api/issues/${localIssue.value.id}/time`, {
      method: 'POST',
      body: {
        duration_minutes: newLogMinutes.value,
        description: newLogDesc.value
      }
    });
    // Reset inputs
    newLogMinutes.value = null;
    newLogDesc.value = '';
    await fetchLogs();
  } catch (e) {
    console.error('Error logging time', e);
  }
};

const fetchComments = async () => {
  try {
    const data = await $fetch(`/api/issues/${localIssue.value.id}/comments`);
    comments.value = data as any[];
  } catch (e) {
    console.error('Error fetching comments', e);
  }
};

const addComment = async () => {
  if (!newCommentText.value.trim()) return;
  try {
    const newComment = await $fetch(`/api/issues/${localIssue.value.id}/comments`, {
      method: 'POST',
      body: { content: newCommentText.value }
    });
    comments.value.push(newComment);
    newCommentText.value = '';
  } catch (e) {
    console.error('Error adding comment', e);
  }
};

const mockActivityLogs = () => {
  // Mock Data for Audit Log Timeline
  activityLogs.value = [
    {
      id: 1,
      user_name: 'Edinsson',
      action: 'STATUS_CHANGE',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      changes: { before: { column_name: 'Por Hacer' }, after: { column_name: 'En Progreso' } }
    },
    {
      id: 2,
      user_name: 'Elena',
      action: 'EDIT',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      changes: {
        before: { description: 'Descripción antigua de la tarea sin muchos detalles.' },
        after: { description: 'Descripción detallada con nuevos requerimientos y más contexto para el equipo.' }
      }
    }
  ];
};

// Load logs when issue changes
watch(() => localIssue.value.id, (id) => {
  if (id) {
    fetchLogs();
    fetchComments();
    mockActivityLogs();
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease; }
.modal-fade-enter-active .detail-modal, .modal-fade-leave-active .detail-modal { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; filter: blur(8px); }
.modal-fade-enter-from .detail-modal, .modal-fade-leave-to .detail-modal { transform: scale(0.95); }

.detail-modal {
  /* Some properties overridden by tailwind */
  border-radius: 20px; width: 100%; max-width: 900px; max-height: 90vh;
  box-shadow: 0 25px 50px -12px rgba(147, 51, 234, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  display: flex; flex-direction: column; overflow: hidden;
  color: #1e293b;
}

.modal-header { 
  display: flex; justify-content: space-between; align-items: center; 
  padding: 20px 32px; border-bottom: 1px solid rgba(147, 51, 234, 0.1);
}

.issue-breadcrumb {
  display: flex; align-items: center; gap: 8px; font-size: 14px;
}
.project-key { color: #64748b; }
.separator { color: #94a3b8; }
.issue-key { color: #9333ea; font-weight: 600; }

.header-actions { display: flex; gap: 12px; }
.btn-icon { 
  background: transparent; color: #64748b; border: none; cursor: pointer; 
  padding: 8px; border-radius: 8px; transition: all 0.2s; 
  display: flex; align-items: center; justify-content: center; 
}
.btn-icon:hover { color: #1e293b; background: rgba(147, 51, 234, 0.1); }

.modal-body {
  display: flex; flex: 1; overflow-y: auto;
}

.main-content {
  flex: 2; padding: 32px;
  position: relative;
}

.editable-title {
  width: 100%; background: transparent; border: 2px solid transparent;
  color: #0f172a; font-size: 28px; font-weight: 700; letter-spacing: -0.02em;
  padding: 8px 12px; border-radius: 12px; margin-left: -12px; margin-bottom: 24px;
  transition: all 0.2s; outline: none; font-family: inherit;
}
.editable-title:hover { background: rgba(255,255,255,0.4); }
.editable-title:focus { background: #fff; border-color: rgba(147, 51, 234, 0.3); }

.section h4 {
  font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 12px;
}

.editable-desc {
  width: 100%; background: rgba(255, 255, 255, 0.5); border: 1px solid rgba(147, 51, 234, 0.1);
  color: #334155; font-size: 15px; line-height: 1.6;
  padding: 16px; border-radius: 12px; transition: all 0.2s; outline: none; font-family: inherit;
  resize: vertical;
}
.editable-desc:hover { border-color: rgba(147, 51, 234, 0.3); background: rgba(255, 255, 255, 0.8); }
.editable-desc:focus { border-color: #9333ea; background: #fff; box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.15); }

.tabs-nav {
  display: flex; gap: 16px; border-bottom: 1px solid rgba(147, 51, 234, 0.1); margin-bottom: 24px;
}
.tab-btn {
  background: transparent; border: none; color: #64748b; font-size: 14px; font-weight: 500;
  padding: 8px 0; border-bottom: 2px solid transparent; cursor: pointer; transition: 0.2s;
}
.tab-btn:hover { color: #1e293b; }
.tab-btn.active { color: #9333ea; border-bottom-color: #9333ea; font-weight: 600; }

.tab-pane {
  display: flex; flex-direction: column; gap: 24px;
}

.activity-feed {
  display: flex; flex-direction: column; gap: 16px; max-height: 300px; overflow-y: auto; padding-right: 8px;
}
.activity-item {
  display: flex; gap: 12px;
}
.activity-avatar {
  width: 32px; height: 32px; border-radius: 50%; overflow: hidden; background: #e2e8f0; flex-shrink: 0;
}
.activity-avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  font-weight: 600; color: #fff; background: linear-gradient(135deg, #a855f7, #6366f1); font-size: 14px;
}
.activity-content {
  flex: 1; background: rgba(255,255,255,0.6); border: 1px solid rgba(147, 51, 234, 0.1); border-radius: 8px; padding: 12px;
}
.activity-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.activity-user { font-weight: 600; font-size: 13px; color: #1e293b; }
.activity-time { font-size: 11px; color: #64748b; }
.activity-body { font-size: 14px; color: #334155; line-height: 1.5; white-space: pre-wrap; }

.comment-box {
  margin-top: 16px; background: rgba(255,255,255,0.5); border: 1px solid rgba(147, 51, 234, 0.1); border-radius: 8px; padding: 12px;
}
.comment-box textarea {
  width: 100%; background: transparent; border: none; color: #1e293b; font-size: 14px; resize: none; outline: none; font-family: inherit;
}
.comment-actions {
  display: flex; justify-content: space-between; align-items: center; margin-top: 8px;
}
.comment-actions .hint { font-size: 11px; color: #64748b; }
.comment-actions button {
  padding: 6px 12px; background: linear-gradient(135deg, #9333ea, #6366f1); border: none; border-radius: 6px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s;
}
.comment-actions button:disabled { opacity: 0.5; cursor: not-allowed; }

.sidebar {
  flex: 1; background: rgba(255, 255, 255, 0.4);
  border-left: 1px solid rgba(147, 51, 234, 0.1);
  padding: 32px 24px; display: flex; flex-direction: column; gap: 24px;
}

.sidebar-section {
  display: flex; flex-direction: column; gap: 8px;
}
.sidebar-section label {
  font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
}

.custom-select-wrapper {
  position: relative; display: flex; align-items: center;
}
.custom-select-wrapper select {
  width: 100%; appearance: none; cursor: pointer;
  background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(147, 51, 234, 0.2);
  padding: 10px 14px; padding-right: 36px; border-radius: 10px; color: #1e293b; 
  font-family: inherit; font-size: 14px; font-weight: 500; transition: all 0.2s; outline: none;
}
.select-icon {
  position: absolute; right: 12px; color: #64748b; pointer-events: none; transition: color 0.2s;
}
.custom-select-wrapper select:hover { background: rgba(255, 255, 255, 0.9); }
.custom-select-wrapper select:focus {
  border-color: #9333ea; box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.15); background: #fff;
}
.custom-select-wrapper select:focus ~ .select-icon { color: #9333ea; }

.status-select {
  background: rgba(147, 51, 234, 0.1) !important;
  color: #9333ea !important;
  border-color: rgba(147, 51, 234, 0.2) !important;
}

.meta-data {
  margin-top: auto; padding-top: 24px; border-top: 1px dashed rgba(147, 51, 234, 0.2);
}
.meta-data p {
  font-size: 12px; color: #64748b; margin-bottom: 4px;
}

.save-status {
  position: absolute; top: 32px; right: 32px;
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #64748b; font-weight: 500;
  opacity: 0; transition: opacity 0.3s;
}
.save-status.visible { opacity: 1; }

.loader-small {
  width: 14px; height: 14px; border: 2px solid rgba(147, 51, 234, 0.2);
  border-bottom-color: #64748b; border-radius: 50%; display: inline-block;
  animation: rotation 1s linear infinite;
}
@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
