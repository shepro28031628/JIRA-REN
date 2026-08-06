<template>
  <div class="workflow-designer bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
          <GitMerge class="w-6 h-6 text-purple-600" /> Diseñador Visual de Workflows
        </h2>
        <p class="text-xs text-slate-500">Configura estados, vincular transiciones del flujo y define reglas automatizadas por transición.</p>
      </div>
      <button @click="loadWorkflow" class="btn-secondary text-xs flex items-center gap-1.5">
        <RotateCcw class="w-3.5 h-3.5" /> Recargar Workflow
      </button>
    </div>

    <!-- Diagrama de Estados (Visual Canvas) -->
    <div class="mb-8 p-6 bg-white/60 rounded-2xl border border-purple-100 shadow-2xs">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
        <Activity class="w-4 h-4 text-purple-600" /> Diagrama del Ciclo de Vida del Proyecto
      </h3>
      <div class="flex flex-wrap items-center justify-between gap-4 py-4 px-2">
        <div 
          v-for="(col, idx) in columns" 
          :key="col.id" 
          class="flex items-center gap-4"
        >
          <!-- Estado / Columna Box -->
          <div class="bg-white border-2 border-purple-200 shadow-sm rounded-xl p-3 min-w-[140px] text-center hover:border-purple-400 transition-all transform-gpu hover:-translate-y-0.5">
            <span class="text-xs font-black uppercase text-purple-700 block mb-0.5">{{ col.name }}</span>
            <span class="text-[10px] text-slate-400 font-mono">Posición {{ col.position }}</span>
          </div>

          <!-- Flecha de Conexión -->
          <ArrowRight v-if="idx < columns.length - 1" class="w-5 h-5 text-purple-400 opacity-60" />
        </div>
      </div>
    </div>

    <!-- Creador de Transiciones -->
    <div class="bg-white/60 p-4 rounded-xl border border-purple-100 mb-6 flex flex-wrap gap-3 items-end shadow-2xs">
      <div class="flex-1 min-w-[160px]">
        <label class="text-xs font-bold text-slate-700 block mb-1">Estado Origen (From)</label>
        <select v-model="newFromCol" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-purple-400">
          <option v-for="c in columns" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <div class="flex items-center justify-center pt-5">
        <ArrowRight class="w-5 h-5 text-purple-600" />
      </div>

      <div class="flex-1 min-w-[160px]">
        <label class="text-xs font-bold text-slate-700 block mb-1">Estado Destino (To)</label>
        <select v-model="newToCol" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-purple-400">
          <option v-for="c in columns" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <div class="flex-1 min-w-[160px]">
        <label class="text-xs font-bold text-slate-700 block mb-1">Nombre de la Transición</label>
        <input v-model="newTransitionName" placeholder="Ej: Enviar a Revisión" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-purple-400" />
      </div>

      <button @click="createTransition" class="btn-primary-glow text-xs py-2 px-4" :disabled="!newFromCol || !newToCol || newFromCol === newToCol">
        + Vincular Transición
      </button>
    </div>

    <!-- Lista de Transiciones Configuradas -->
    <div class="flex flex-col gap-2">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Transiciones de Estado Activas</h3>
      <div v-for="t in transitions" :key="t.id" class="p-3 rounded-xl bg-white/70 border border-slate-200/70 flex items-center justify-between shadow-2xs hover:border-purple-200 transition-all">
        <div class="flex items-center gap-3">
          <GitMerge class="w-4 h-4 text-purple-600" />
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-800">{{ getColumnName(t.from_column_id) }}</span>
              <ArrowRight class="w-3.5 h-3.5 text-purple-400" />
              <span class="text-xs font-bold text-slate-800">{{ getColumnName(t.to_column_id) }}</span>
            </div>
            <span class="text-[11px] text-slate-400 font-medium block">Nombre: {{ t.name }}</span>
          </div>
        </div>
        <button @click="deleteTransition(t.id)" class="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
      <div v-if="transitions.length === 0" class="text-center py-6 text-xs text-slate-400 italic">
        Las transiciones están en modo libre. Crea conexiones para restringir los movimientos.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from '#app';
import { GitMerge, ArrowRight, Activity, Trash2, RotateCcw } from 'lucide-vue-next';
import { useToast } from '../../../composables/useToast';

const route = useRoute();
const projectId = route.params.id as string;
const toast = useToast();

const columns = ref<any[]>([]);
const transitions = ref<any[]>([]);
const workflowId = ref<string>('');

const newFromCol = ref('');
const newToCol = ref('');
const newTransitionName = ref('');

const getColumnName = (colId: string) => {
  const col = columns.value.find(c => c.id === colId);
  return col ? col.name : colId;
};

const loadWorkflow = async () => {
  try {
    const data: any = await $fetch(`/api/projects/${projectId}/workflows`);
    columns.value = data.columns || [];
    transitions.value = data.transitions || [];
    workflowId.value = data.workflowId;

    if (columns.value.length >= 2) {
      newFromCol.value = columns.value[0].id;
      newToCol.value = columns.value[1].id;
    }
  } catch (e) {
    console.error('Error al cargar workflow:', e);
  }
};

const createTransition = async () => {
  if (!newFromCol.value || !newToCol.value || !workflowId.value) return;
  try {
    const created: any = await $fetch(`/api/projects/${projectId}/workflows`, {
      method: 'POST',
      body: {
        workflowId: workflowId.value,
        from_col_id: newFromCol.value,
        to_col_id: newToCol.value,
        name: newTransitionName.value.trim() || 'Transición'
      }
    });
    if (created) {
      transitions.value.push(created);
      newTransitionName.value = '';
      toast.success('Transición de workflow vinculada con éxito');
    }
  } catch (e) {
    toast.error('Error al crear transición');
  }
};

const deleteTransition = async (id: string) => {
  try {
    await $fetch(`/api/projects/${projectId}/workflows`, {
      method: 'DELETE',
      body: { transitionId: id }
    });
    transitions.value = transitions.value.filter(t => t.id !== id);
    toast.success('Transición eliminada');
  } catch (e) {
    toast.error('Error al eliminar');
  }
};

onMounted(() => {
  loadWorkflow();
});
</script>

<style scoped>
.workflow-designer {
  font-family: 'Inter', sans-serif;
}
</style>
