<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div class="premium-modal">
        <div class="modal-header">
          <h3>Nueva Tarea</h3>
          <button type="button" class="btn-icon" @click="close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form @submit.prevent="submit" class="modal-form">
          <div class="input-group">
            <label>Título</label>
            <input v-model="form.title" placeholder="¿Qué hay que hacer?" required autofocus />
          </div>
          <div class="input-group">
            <label>Descripción</label>
            <textarea v-model="form.description" placeholder="Añade más detalles..." rows="3"></textarea>
          </div>
          <div class="form-row">
            <div class="input-group">
              <label>Tipo</label>
              <div class="custom-select-wrapper">
                <select v-model="form.type">
                  <option value="TASK">Tarea</option>
                  <option value="BUG">Bug</option>
                  <option value="STORY">Historia</option>
                  <option value="EPIC">Épica</option>
                </select>
                <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
            <div class="input-group">
              <label>Prioridad</label>
              <div class="custom-select-wrapper">
                <select v-model="form.priority">
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="CRITICAL">Crítica</option>
                </select>
                <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
          </div>
          <div class="input-group" v-if="columns && columns.length > 0">
            <label>Columna Inicial</label>
            <div class="custom-select-wrapper">
              <select v-model="form.column_id">
                <option v-for="col in columns" :key="col.id" :value="col.id">{{ col.name }}</option>
              </select>
              <svg class="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="close" :disabled="loading">Cancelar</button>
            <button type="submit" class="btn-primary-glow" :disabled="loading">
              <span v-if="!loading">Crear Tarea</span>
              <span v-else class="loader"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  columns: any[];
  initialColumn?: string | null;
  loading?: boolean;
}>();

const emit = defineEmits(['close', 'create']);

const form = reactive({
  title: '',
  description: '',
  type: 'TASK',
  priority: 'MEDIUM',
  column_id: ''
});

// Inicializar column_id por defecto
watch([() => props.columns, () => props.show, () => props.initialColumn], ([cols, isShow, initCol]) => {
  if (isShow && cols && cols.length > 0) {
    if (initCol) {
      form.column_id = initCol;
    } else if (!form.column_id) {
      form.column_id = cols[0].id;
    }
  }
}, { immediate: true });

const close = () => emit('close');

const submit = () => {
  emit('create', { ...form });
  // Reset form
  form.title = '';
  form.description = '';
  form.type = 'TASK';
  form.priority = 'MEDIUM';
  if (props.columns.length > 0) form.column_id = props.columns[0].id;
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.95) translateY(10px); }

.premium-modal {
  background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px; padding: 32px; width: 100%; max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(147, 51, 234, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.modal-header h3 { font-size: 20px; font-weight: 600; letter-spacing: -0.01em; color: #1e293b; }
.btn-icon { background: transparent; color: #64748b; border: none; cursor: pointer; padding: 6px; border-radius: 8px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.btn-icon:hover { color: #1e293b; background: rgba(147, 51, 234, 0.1); }

.modal-form { display: flex; flex-direction: column; gap: 20px; }
.input-group { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.input-group label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.form-row { display: flex; gap: 16px; }

.modal-form input, .modal-form textarea, .custom-select-wrapper select {
  width: 100%;
  background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(147, 51, 234, 0.2);
  padding: 14px 16px; border-radius: 12px; color: #1e293b; font-family: inherit; font-size: 14px;
  transition: all 0.2s ease; outline: none; box-sizing: border-box; font-weight: 500;
}

.custom-select-wrapper {
  position: relative;
  display: flex; align-items: center;
}
.custom-select-wrapper select {
  appearance: none;
  cursor: pointer;
  padding-right: 40px;
}
.select-icon {
  position: absolute; right: 16px; color: #64748b; pointer-events: none; transition: color 0.2s;
}

.modal-form input:focus, .modal-form textarea:focus, .custom-select-wrapper select:focus {
  border-color: #9333ea; box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.15); background: #fff;
}
.custom-select-wrapper select:focus ~ .select-icon { color: #9333ea; }

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
.btn-secondary {
  background: rgba(255, 255, 255, 0.4); color: #475569;
  border: 1px solid rgba(147, 51, 234, 0.2); padding: 12px 24px;
  border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover:not(:disabled) { background: rgba(255, 255, 255, 0.8); color: #1e293b; }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary-glow {
  background: linear-gradient(135deg, #a855f7, #6366f1);
  color: white; border: none; padding: 12px 24px; min-width: 120px;
  border-radius: 12px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.3s;
  display: flex; justify-content: center; align-items: center;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}
.btn-primary-glow:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(147, 51, 234, 0.4); }
.btn-primary-glow:disabled { opacity: 0.7; cursor: not-allowed; }

.loader {
  width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
  border-bottom-color: #fff; border-radius: 50%; display: inline-block;
  animation: rotation 1s linear infinite;
}
@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
