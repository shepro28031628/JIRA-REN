<template>
  <div class="gantt-container p-6 w-full overflow-y-auto">
    <div class="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm">
      
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-slate-800">Cronograma (Gantt)</h2>
        <div class="flex gap-2">
          <div class="flex items-center gap-1 bg-white/40 rounded-lg p-1 border border-white">
            <button class="px-2 py-1 text-xs font-semibold rounded hover:bg-white text-slate-600">Semana</button>
            <button class="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-700">Mes</button>
            <button class="px-2 py-1 text-xs font-semibold rounded hover:bg-white text-slate-600">Trimestre</button>
          </div>
        </div>
      </div>

      <!-- Gantt Area -->
      <div class="overflow-x-auto">
        <div class="min-w-[800px] border border-white/50 rounded-2xl bg-white/20">
          <!-- Timeline Header -->
          <div class="flex border-b border-white/50 bg-white/30 rounded-t-2xl">
            <div class="w-64 p-3 font-bold text-sm text-slate-700 border-r border-white/50">Tareas</div>
            <div class="flex-1 flex text-xs font-semibold text-slate-500">
              <div v-for="w in 4" :key="w" class="flex-1 text-center py-3 border-r border-white/20 last:border-0">
                Semana {{ w }}
              </div>
            </div>
          </div>
          
          <!-- Rows -->
          <div v-for="(task, i) in simulatedGanttTasks" :key="i" class="flex border-b border-white/30 hover:bg-white/40 transition-colors group">
            <div class="w-64 p-3 border-r border-white/50 flex flex-col justify-center cursor-pointer" @click="$emit('details', mockIssue)">
              <span class="text-sm font-semibold text-slate-700 group-hover:text-purple-600 transition-colors line-clamp-1">{{ task.title }}</span>
              <span class="text-[10px] font-bold text-slate-400">{{ task.key }}</span>
            </div>
            
            <div class="flex-1 relative py-2 px-1 flex items-center">
              <!-- Grid lines -->
              <div class="absolute inset-0 flex">
                <div v-for="w in 4" :key="w" class="flex-1 border-r border-white/10 last:border-0"></div>
              </div>
              
              <!-- Timeline Bar -->
              <div 
                class="absolute h-6 rounded-full bg-gradient-to-r cursor-pointer hover:shadow-md hover:shadow-purple-200/50 active:scale-[0.98] transition-all"
                :class="task.colorClass"
                :style="`left: ${task.start}%; width: ${task.width}%;`"
                @click="$emit('details', mockIssue)"
              >
                <div class="w-full h-full rounded-full border border-white/40 backdrop-blur-sm"></div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  issues: any[];
  projectKey: string;
}>();

defineEmits(['details']);

const mockIssue = {
  id: 'mock',
  key: 'PROY-X',
  title: 'Tarea desde Gantt',
  description: 'Simulando apertura de detalle',
  priority: 'MEDIUM'
};

const simulatedGanttTasks = ref([
  { title: 'Diseño UI/UX de Tablero', key: 'PROY-1', start: 5, width: 20, colorClass: 'from-purple-400 to-fuchsia-400' },
  { title: 'Integración API Backend', key: 'PROY-2', start: 25, width: 30, colorClass: 'from-blue-400 to-indigo-400' },
  { title: 'Testing QA', key: 'PROY-3', start: 55, width: 15, colorClass: 'from-emerald-400 to-teal-400' },
  { title: 'Despliegue a Producción', key: 'PROY-4', start: 70, width: 10, colorClass: 'from-rose-400 to-pink-400' },
]);
</script>

<style scoped>
.gantt-container {
  height: 100%;
}
</style>
