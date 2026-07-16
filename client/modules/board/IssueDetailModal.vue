<template>
  <Transition name="modal-fade">
    <div v-if="show && issue" class="modal-overlay" @click.self="close">
      <div class="detail-modal">
        <div class="modal-header">
          <div class="issue-breadcrumb">
            <span class="project-key">{{ projectKey }}</span>
            <span class="separator">/</span>
            <span class="issue-key">{{ projectKey }}-{{ issue.key_number }}</span>
          </div>
          <div class="header-actions">
            <button type="button" class="btn-icon" title="Eliminar (Próximamente)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
            <button type="button" class="btn-icon" @click="close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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

            <!-- Descripción -->
            <div class="section">
              <h4>Descripción</h4>
              <textarea 
                v-model="localIssue.description" 
                class="editable-desc" 
                placeholder="Agrega una descripción detallada..." 
                rows="6"
                @blur="saveChanges('description')"
              ></textarea>
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
                <svg class="select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
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
                <svg class="select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
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
                <svg class="select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>

            <div class="sidebar-section">
              <label>Asignado a</label>
              <div class="custom-select-wrapper">
                <select v-model="localIssue.assignee_id" @change="saveChanges('assignee_id')">
                  <option value="">Sin asignar</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
                </select>
                <svg class="select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
            
            <!-- Time Tracking Section -->
            <div class="sidebar-section">
              <label>Tiempo</label>
              <div class="time-info">
                <div class="time-stats">
                  <span>Estimado: {{ formatMinutes(localIssue.estimated_minutes) }}</span>
                  <span>Registrado: {{ formatMinutes(loggedMinutes) }}</span>
                </div>
                <div class="progress-bar" style="height:8px;background:#333;border-radius:4px;margin-top:4px;overflow:hidden;">
                  <div class="progress-fill" :style="{ width: progressPercent + '%', background: progressColor, height: '100%' }"></div>
                </div>
              </div>
              <div class="log-entry" style="margin-top:8px;display:flex;gap:4px;align-items:center;">
                <input type="number" v-model.number="newLogMinutes" min="0" placeholder="Minutos" class="log-input" style="width:60px;padding:4px;border-radius:4px;border:none;background:#222;color:#fff;" />
                <input type="text" v-model="newLogDesc" placeholder="Descripción (opcional)" class="log-desc" style="flex:1;padding:4px;border-radius:4px;border:none;background:#222;color:#fff;" />
                <button class="btn-primary-glow" @click="logTime" style="padding:4px 8px;background:#4facfe;color:#fff;border:none;border-radius:4px;">Registrar</button>
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
import { ref, watch, computed } from 'vue';
import { $fetch } from 'ofetch';

const props = defineProps<{
  show: boolean;
  issue: any;
  projectKey: string;
  columns: any[];
  users?: any[]; // Lista de usuarios del proyecto (opcional por ahora)
}>();

const emit = defineEmits(['close', 'update']);

const localIssue = ref<any>({});
const isSaving = ref(false);

watch(() => props.issue, (newVal) => {
  if (newVal) {
    localIssue.value = JSON.parse(JSON.stringify(newVal)); // Clone to avoid direct mutation
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
  return Math.min(100, (loggedMinutes.value / est) * 100);
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

// Load logs when issue changes
watch(() => localIssue.value.id, (id) => {
  if (id) fetchLogs();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.95) translateY(10px); }

.detail-modal {
  background: #18181f; border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px; width: 100%; max-width: 900px; max-height: 90vh;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  display: flex; flex-direction: column; overflow: hidden;
}

.modal-header { 
  display: flex; justify-content: space-between; align-items: center; 
  padding: 20px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.issue-breadcrumb {
  display: flex; align-items: center; gap: 8px; font-size: 14px;
}
.project-key { color: #a1a1aa; }
.separator { color: #52525b; }
.issue-key { color: #4facfe; font-weight: 600; }

.header-actions { display: flex; gap: 12px; }
.btn-icon { 
  background: transparent; color: #a1a1aa; border: none; cursor: pointer; 
  padding: 8px; border-radius: 8px; transition: all 0.2s; 
  display: flex; align-items: center; justify-content: center; 
}
.btn-icon:hover { color: #fff; background: rgba(255, 255, 255, 0.1); }

.modal-body {
  display: flex; flex: 1; overflow-y: auto;
}

.main-content {
  flex: 2; padding: 32px;
  position: relative;
}

.editable-title {
  width: 100%; background: transparent; border: 2px solid transparent;
  color: #fff; font-size: 28px; font-weight: 700; letter-spacing: -0.02em;
  padding: 8px 12px; border-radius: 12px; margin-left: -12px; margin-bottom: 24px;
  transition: all 0.2s; outline: none; font-family: inherit;
}
.editable-title:hover { background: rgba(255,255,255,0.02); }
.editable-title:focus { background: rgba(0,0,0,0.2); border-color: rgba(79,172,254,0.3); }

.section h4 {
  font-size: 16px; font-weight: 600; color: #e4e4e7; margin-bottom: 12px;
}

.editable-desc {
  width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05);
  color: #d4d4d8; font-size: 15px; line-height: 1.6;
  padding: 16px; border-radius: 12px; transition: all 0.2s; outline: none; font-family: inherit;
  resize: vertical;
}
.editable-desc:hover { border-color: rgba(255,255,255,0.1); }
.editable-desc:focus { border-color: #4facfe; background: rgba(0,0,0,0.4); box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.15); }

.sidebar {
  flex: 1; background: rgba(0, 0, 0, 0.2);
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  padding: 32px 24px; display: flex; flex-direction: column; gap: 24px;
}

.sidebar-section {
  display: flex; flex-direction: column; gap: 8px;
}
.sidebar-section label {
  font-size: 13px; color: #a1a1aa; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
}

.custom-select-wrapper {
  position: relative; display: flex; align-items: center;
}
.custom-select-wrapper select {
  width: 100%; appearance: none; cursor: pointer;
  background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 14px; padding-right: 36px; border-radius: 10px; color: #fff; 
  font-family: inherit; font-size: 14px; font-weight: 500; transition: all 0.2s; outline: none;
}
.select-icon {
  position: absolute; right: 12px; color: #71717a; pointer-events: none; transition: color 0.2s;
}
.custom-select-wrapper select:hover { background: rgba(255,255,255,0.06); }
.custom-select-wrapper select:focus {
  border-color: #4facfe; box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.15); background: rgba(0,0,0,0.5);
}
.custom-select-wrapper select:focus ~ .select-icon { color: #4facfe; }

.status-select {
  background: rgba(79, 172, 254, 0.1) !important;
  color: #4facfe !important;
  border-color: rgba(79, 172, 254, 0.2) !important;
}

.meta-data {
  margin-top: auto; padding-top: 24px; border-top: 1px dashed rgba(255,255,255,0.1);
}
.meta-data p {
  font-size: 12px; color: #71717a; margin-bottom: 4px;
}

.save-status {
  position: absolute; top: 32px; right: 32px;
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #a1a1aa; font-weight: 500;
  opacity: 0; transition: opacity 0.3s;
}
.save-status.visible { opacity: 1; }

.loader-small {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.2);
  border-bottom-color: #a1a1aa; border-radius: 50%; display: inline-block;
  animation: rotation 1s linear infinite;
}
@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
