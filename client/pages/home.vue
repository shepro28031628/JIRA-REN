<template>
  <div class="command-center p-8 h-full overflow-y-auto">
    <!-- Header -->
    <div class="mb-8" v-motion-slide-visible-bottom>
      <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">Buenos días, Edinsson</h1>
      <p class="text-slate-500 mt-1">Este es tu centro de mando. Tienes <span class="font-semibold text-purple-600">3 tareas urgentes</span> para hoy.</p>
    </div>

    <!-- Grid Principal -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <!-- Widget 1: Mi Enfoque Diario -->
      <div 
        class="glass-widget col-span-1 lg:col-span-2"
        v-motion-slide-visible-bottom
        :delay="100"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2 text-slate-700 font-bold">
            <Target class="w-5 h-5 text-purple-600" />
            <h2>Mi Enfoque Diario</h2>
          </div>
          <button class="text-xs text-purple-600 font-medium hover:underline">Ver todas</button>
        </div>
        
        <div class="space-y-3">
          <div v-for="i in 3" :key="i" class="task-card flex items-center justify-between p-3 bg-white/60 rounded-xl border border-white/80 hover:shadow-md transition-shadow group">
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 rounded border border-slate-300 flex items-center justify-center cursor-pointer hover:border-purple-500"></div>
              <div>
                <p class="text-sm font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">Diseñar el módulo de automatizaciones</p>
                <p class="text-[11px] text-slate-500">PROY-{{ 100 + i }} • Vence hoy</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">Alta</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Widget 4: Métricas Personales -->
      <div 
        class="glass-widget col-span-1"
        v-motion-slide-visible-bottom
        :delay="200"
      >
        <div class="flex items-center gap-2 text-slate-700 font-bold mb-6">
          <Activity class="w-5 h-5 text-purple-600" />
          <h2>Métricas Semanales</h2>
        </div>
        
        <div class="flex flex-col items-center justify-center">
          <div class="relative w-32 h-32 flex items-center justify-center mb-4">
            <!-- SVG Circular -->
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" class="stroke-white/50" stroke-width="10" />
              <!-- Progreso (80%) -->
              <circle cx="50" cy="50" r="45" fill="none" class="stroke-purple-500" stroke-width="10" stroke-dasharray="282.7" stroke-dashoffset="56.54" stroke-linecap="round" />
            </svg>
            <div class="absolute flex flex-col items-center">
              <span class="text-2xl font-extrabold text-slate-800">80%</span>
              <span class="text-[10px] text-slate-500 uppercase font-semibold">Eficiencia</span>
            </div>
          </div>
          <div class="flex gap-4 w-full justify-between text-xs font-medium text-slate-600 px-4">
            <div class="text-center"><span class="block text-lg font-bold text-slate-800">12</span> Completadas</div>
            <div class="text-center"><span class="block text-lg font-bold text-slate-800">15</span> Estimadas</div>
          </div>
        </div>
      </div>

      <!-- Widget 2: Actividad Reciente -->
      <div 
        class="glass-widget col-span-1 lg:col-span-2"
        v-motion-slide-visible-bottom
        :delay="300"
      >
        <div class="flex items-center gap-2 text-slate-700 font-bold mb-4">
          <BellRing class="w-5 h-5 text-purple-600" />
          <h2>Actividad Reciente</h2>
        </div>
        
        <div class="space-y-4 relative before:absolute before:inset-y-0 before:left-3 before:w-0.5 before:bg-purple-100/50">
          <div v-for="i in 4" :key="i" class="relative pl-8 flex gap-3 items-start">
            <div class="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-purple-400 shadow-sm shadow-purple-200"></div>
            <img :src="`https://i.pravatar.cc/150?u=${i}`" class="w-8 h-8 rounded-full border border-white" />
            <div>
              <p class="text-sm text-slate-700"><span class="font-bold">Elena</span> comentó en <span class="font-medium text-purple-600 cursor-pointer">Revisión de UI/UX</span></p>
              <p class="text-[11px] text-slate-400">Hace {{ i * 15 }} minutos</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Widget 3: Documentos Rápidos -->
      <div 
        class="glass-widget col-span-1"
        v-motion-slide-visible-bottom
        :delay="400"
      >
        <div class="flex items-center gap-2 text-slate-700 font-bold mb-4">
          <FileText class="w-5 h-5 text-purple-600" />
          <h2>Documentos Rápidos</h2>
        </div>
        
        <div class="flex flex-col gap-2">
          <div v-for="doc in ['Arquitectura Frontend', 'Guía de Estilos UI', 'Notas de Reunión']" :key="doc" class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/50 cursor-pointer transition-colors group">
            <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText class="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-700 group-hover:text-purple-700">{{ doc }}</p>
              <p class="text-[11px] text-slate-400">Editado ayer</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { Target, Activity, BellRing, FileText } from 'lucide-vue-next';

definePageMeta({
  layout: 'project'
});
</script>

<style scoped>
.glass-widget {
  @apply bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg;
}
</style>
