<template>
  <div class="audit-timeline-container w-full relative">
    <!-- Filtros Superiores -->
    <div class="flex items-center gap-3 mb-6 bg-white/40 backdrop-blur-md p-3 rounded-2xl border border-white/50 shadow-sm">
      <span class="text-xs font-semibold text-purple-700/80 uppercase tracking-wider ml-2">Filtros</span>
      
      <button 
        v-for="filter in ['Todos', 'Cambio de Estado', 'Edición de Tarea']" 
        :key="filter"
        @click="activeFilter = filter"
        class="px-4 py-1.5 rounded-xl text-[13px] font-medium transition-all active:scale-95 border"
        :class="activeFilter === filter 
          ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/30' 
          : 'bg-white/60 text-slate-600 border-white hover:bg-white hover:text-purple-600'"
      >
        {{ filter }}
      </button>
    </div>

    <!-- Timeline -->
    <div class="timeline border-l-2 border-purple-100/50 ml-4 pl-6 relative">
      <div 
        v-for="(log, index) in filteredLogs" 
        :key="log.id"
        class="timeline-item mb-8 relative group"
        v-motion-slide-visible-bottom
        :delay="index * 100"
      >
        <!-- Nodo del Timeline -->
        <div class="absolute -left-[35px] w-8 h-8 rounded-full bg-white border border-purple-200 shadow-sm flex items-center justify-center text-purple-500 group-hover:scale-110 group-hover:border-purple-400 transition-transform">
          <History v-if="log.action === 'STATUS_CHANGE'" class="w-4 h-4" stroke-width="2" />
          <FileEdit v-else-if="log.action === 'EDIT'" class="w-4 h-4" stroke-width="2" />
          <UserCheck v-else class="w-4 h-4" stroke-width="2" />
        </div>

        <!-- Tarjeta de Contenido de Cristal -->
        <div class="log-card bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2 text-[13px] text-slate-500">
              <span class="font-semibold text-slate-800">{{ log.user_name }}</span>
              <span>{{ getActionText(log.action) }}</span>
            </div>
            <span class="text-[11px] text-slate-400 font-medium bg-white/50 px-2 py-1 rounded-md">{{ formatDate(log.created_at) }}</span>
          </div>

          <p v-if="log.action === 'STATUS_CHANGE'" class="text-sm text-slate-700 font-medium">
            Movió la tarea de 
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">{{ log.changes.before.column_name }}</span> 
            a 
            <span class="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">{{ log.changes.after.column_name }}</span>
          </p>

          <p v-else-if="log.action === 'EDIT'" class="text-sm text-slate-700">
            Editó la descripción de la tarea.
          </p>

          <!-- Botón de Time-Travel para ver Diffs -->
          <button 
            v-if="log.action === 'EDIT' && log.changes"
            @click="$emit('time-travel', log)"
            class="mt-3 flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors active:scale-95"
          >
            <GitBranch class="w-3.5 h-3.5" />
            Ver Historial (Time-Travel)
          </button>
        </div>
      </div>
      
      <div v-if="filteredLogs.length === 0" class="text-sm text-slate-400 italic mt-8 text-center bg-white/30 rounded-xl p-4 border border-dashed border-purple-200/50">
        No hay registros en el historial para este filtro.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { History, GitBranch, FileEdit, UserCheck } from 'lucide-vue-next';

const props = defineProps<{
  logs: any[];
}>();

const emit = defineEmits(['time-travel']);

const activeFilter = ref('Todos');

const filteredLogs = computed(() => {
  if (activeFilter.value === 'Todos') return props.logs;
  if (activeFilter.value === 'Cambio de Estado') return props.logs.filter(l => l.action === 'STATUS_CHANGE');
  if (activeFilter.value === 'Edición de Tarea') return props.logs.filter(l => l.action === 'EDIT');
  return props.logs;
});

const getActionText = (action: string) => {
  const map: Record<string, string> = {
    'STATUS_CHANGE': 'actualizó el estado',
    'EDIT': 'editó los detalles',
    'ASSIGNED': 'reasignó la tarea'
  };
  return map[action] || 'realizó una acción';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('es-ES', { 
    day: '2-digit', month: 'short', 
    hour: '2-digit', minute: '2-digit' 
  }).format(d);
};
</script>

<style scoped>
.timeline-item::before {
  content: '';
  position: absolute;
  top: 16px;
  left: -20px;
  width: 20px;
  height: 2px;
  background: rgba(147, 51, 234, 0.2);
  z-index: 0;
}
</style>
