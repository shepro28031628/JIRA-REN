<template>
  <div class="calendar-container p-6 w-full overflow-y-auto">
    <div class="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm">
      
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-slate-800">Calendario del Proyecto</h2>
        <div class="flex gap-2">
          <button class="px-3 py-1.5 rounded-lg bg-white/60 border border-purple-100 text-purple-700 font-semibold text-sm hover:bg-white active:scale-95 transition-all">Hoy</button>
          <div class="flex items-center gap-1 bg-white/40 rounded-lg p-1 border border-white">
            <button class="p-1 rounded-md hover:bg-white/60 text-slate-500"><ChevronLeft class="w-4 h-4" /></button>
            <span class="text-sm font-bold text-slate-700 px-2">Julio 2026</span>
            <button class="p-1 rounded-md hover:bg-white/60 text-slate-500"><ChevronRight class="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-4 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
        <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
      </div>
      
      <div class="grid grid-cols-7 gap-2">
        <!-- Generar días del mes simulados -->
        <div v-for="day in 31" :key="day" 
             class="calendar-day group relative rounded-xl border border-white/40 bg-white/30 p-2 min-h-[100px] transition-all hover:bg-white/60 hover:border-purple-200"
             :class="{ 'opacity-50': day < 1 }">
          <span class="text-xs font-bold text-slate-500 mb-2 block group-hover:text-purple-600 transition-colors">{{ day }}</span>
          
          <!-- Tareas en este día -->
          <div v-if="day === 15" class="task-pill bg-purple-100/80 border border-purple-200 text-purple-700 p-1.5 rounded-md text-[10px] font-semibold truncate cursor-pointer hover:bg-purple-200/80 active:scale-95 transition-transform" @click="$emit('details', mockIssue)">
            SUP-2: No puedo acceder
          </div>
          <div v-if="day === 18" class="task-pill bg-emerald-100/80 border border-emerald-200 text-emerald-700 p-1.5 rounded-md text-[10px] font-semibold truncate mt-1 cursor-pointer hover:bg-emerald-200/80 active:scale-95 transition-transform" @click="$emit('details', mockIssue)">
            FRONT-1: Tablero
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

defineProps<{
  issues: any[];
  projectKey: string;
}>();

defineEmits(['details']);

const mockIssue = {
  id: 'mock',
  key: 'PROY-X',
  title: 'Tarea desde el calendario',
  description: 'Simulando apertura de detalle',
  priority: 'HIGH'
};
</script>

<style scoped>
.calendar-container {
  height: 100%;
}
</style>
