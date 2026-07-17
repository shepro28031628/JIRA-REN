<template>
  <div class="reports-layout">
    <header class="reports-header border-b border-white/50 bg-white/40 backdrop-blur-md relative z-10">
      <div class="project-info">
        <NuxtLink to="/projects" class="back-link">
          <ArrowLeft class="w-5 h-5 text-slate-500" stroke-width="1.5" />
        </NuxtLink>
        <div class="header-text" v-if="!loading">
          <h2 class="text-xl font-bold text-slate-800 tracking-tight">Dashboard Ejecutivo</h2>
          <span class="project-key">{{ project?.key }}</span>
        </div>
        <div v-else class="header-skeleton"></div>
      </div>
      
      <!-- Navegación del Proyecto -->
      <nav class="project-nav" v-if="!loading">
        <NuxtLink :to="`/board/${projectId}`" class="nav-item">Tablero</NuxtLink>
        <NuxtLink :to="`/projects/${projectId}/backlog`" class="nav-item">Planificación</NuxtLink>
        <NuxtLink :to="`/projects/${projectId}/docs`" class="nav-item">Documentos</NuxtLink>
        <NuxtLink :to="`/projects/${projectId}/teams`" class="nav-item">Equipos</NuxtLink>
        <NuxtLink :to="`/projects/${projectId}/reports`" class="nav-item active">Reportes</NuxtLink>
      </nav>

      <div class="actions" v-if="sprints.length > 0">
        <div class="relative">
          <select v-model="selectedSprintId" class="premium-select" @change="fetchBurndown">
            <option v-for="sprint in sprints" :key="sprint.id" :value="sprint.id">
              {{ sprint.name }}
            </option>
          </select>
          <ChevronDown class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-purple-600 pointer-events-none" />
        </div>
      </div>
    </header>

    <div class="content-container pb-20">
      <div v-if="loading" class="flex justify-center items-center h-64 text-purple-600 font-medium animate-pulse">
        Sincronizando métricas...
      </div>
      
      <div v-else-if="sprints.length === 0" class="empty-state">
        <PieChart class="w-12 h-12 text-purple-300 mb-2" stroke-width="1.5" />
        <h3 class="text-slate-800 font-semibold text-lg">No hay datos suficientes</h3>
        <p class="text-slate-500 text-sm">Crea y arranca un sprint en Planificación para visualizar el progreso.</p>
        <NuxtLink :to="`/projects/${projectId}/backlog`" class="btn-primary-glow mt-4">Ir a Planificación</NuxtLink>
      </div>

      <div v-else class="dashboard-grid">
        <!-- Top KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div v-for="(kpi, idx) in kpiData" :key="idx" 
               class="glass-widget flex items-center p-5 gap-4"
               v-motion
               :initial="{ opacity: 0, y: 20, scale: 0.95 }"
               :enter="{ opacity: 1, y: 0, scale: 1, transition: { delay: idx * 100, type: 'spring', stiffness: 250, damping: 20 } }">
            <div class="w-12 h-12 rounded-xl bg-purple-100/50 border border-purple-200/50 flex items-center justify-center text-purple-600">
              <component :is="kpi.icon" class="w-6 h-6" stroke-width="1.5" />
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ kpi.label }}</span>
              <span class="text-2xl font-bold text-slate-800">{{ kpi.value }}</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Velocidad de Sprint (Burndown) -->
          <div class="glass-widget lg:col-span-2 p-6 flex flex-col"
               v-motion
               :initial="{ opacity: 0, scale: 0.95 }"
               :enter="{ opacity: 1, scale: 1, transition: { delay: 400, type: 'spring' } }">
            <div class="flex items-center gap-2 mb-6">
              <Activity class="w-5 h-5 text-purple-600" />
              <h3 class="text-lg font-bold text-slate-800">Velocidad de Sprint</h3>
            </div>
            <div class="flex-1 min-h-[300px] relative w-full h-full flex items-end justify-center overflow-visible pb-4">
              <!-- Grid background -->
              <div class="absolute inset-0 flex flex-col justify-between opacity-30 pointer-events-none pb-4">
                <div v-for="i in 5" :key="i" class="w-full h-[1px] border-b border-dashed border-purple-300"></div>
              </div>
              
              <svg viewBox="0 0 1000 300" class="w-full h-full overflow-visible z-10" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="curveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#9333ea" stop-opacity="0.5" />
                    <stop offset="100%" stop-color="#9333ea" stop-opacity="0.01" />
                  </linearGradient>
                  <!-- Filtro de glow (resplandor) -->
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                
                <!-- Área rellena con gradiente -->
                <path 
                  :d="svgAreaPath" 
                  fill="url(#curveGrad)" 
                  class="transition-all duration-1000 ease-in-out" 
                />
                
                <!-- Línea principal con stroke-dasharray (animación dibujada) -->
                <path 
                  :d="svgLinePath" 
                  fill="none" 
                  stroke="#a855f7" 
                  stroke-width="4" 
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  filter="url(#glow)"
                  class="svg-line-anim"
                />
                
                <!-- Puntos en los nodos -->
                <circle 
                  v-for="(point, idx) in chartPoints" :key="idx"
                  :cx="point.x" :cy="point.y" r="5"
                  fill="#ffffff" stroke="#9333ea" stroke-width="3"
                  class="transition-all duration-1000 ease-in-out cursor-pointer hover:r-8 hover:stroke-rose-400"
                >
                  <title>{{ point.label }}: {{ point.value }}</title>
                </circle>
              </svg>
            </div>
          </div>

          <!-- Estado de Salud del Proyecto (Semicircular Dial) -->
          <div class="glass-widget p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
               v-motion
               :initial="{ opacity: 0, scale: 0.95 }"
               :enter="{ opacity: 1, scale: 1, transition: { delay: 500, type: 'spring' } }">
            <div class="flex items-center gap-2 w-full justify-start mb-4">
              <PieChart class="w-5 h-5 text-purple-600" />
              <h3 class="text-lg font-bold text-slate-800">Project Health</h3>
            </div>
            
            <div class="relative w-48 h-24 mb-4 mt-6">
              <!-- Semicircle background -->
              <svg viewBox="0 0 100 50" class="w-full h-full overflow-visible">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f1f5f9" stroke-width="12" stroke-linecap="round" />
                <!-- Foreground animated -->
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#health-grad)" stroke-width="12" stroke-linecap="round" 
                      :stroke-dasharray="251.2" 
                      :stroke-dashoffset="251.2 - (251.2 * (kpis.completionPercentage / 100) / 2)"
                      class="transition-all duration-1000 ease-out" />
                <defs>
                  <linearGradient id="health-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#9333ea" />
                    <stop offset="100%" stop-color="#c084fc" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="absolute bottom-0 left-0 right-0 flex flex-col items-center">
                <span class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
                  {{ kpis.completionPercentage }}%
                </span>
              </div>
            </div>
            <p class="text-sm font-medium text-slate-500 mt-2">Porcentaje de completitud</p>
          </div>

          <!-- Distribución de Carga de Trabajo -->
          <div class="glass-widget lg:col-span-3 p-6"
               v-motion
               :initial="{ opacity: 0, y: 20 }"
               :enter="{ opacity: 1, y: 0, transition: { delay: 600, type: 'spring' } }">
            <div class="flex items-center gap-2 mb-6">
              <Users class="w-5 h-5 text-purple-600" />
              <h3 class="text-lg font-bold text-slate-800">Carga de Trabajo por Miembro</h3>
            </div>
            <div class="flex flex-col gap-5">
              <div v-for="(member, idx) in workloadData" :key="member.id" class="flex flex-col gap-1.5">
                <div class="flex justify-between items-center text-sm">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">{{ member.name.charAt(0) }}</div>
                    <span class="font-semibold text-slate-700">{{ member.name }}</span>
                  </div>
                  <span class="text-xs font-medium text-slate-500">{{ member.logged }}h / {{ member.estimated }}h</span>
                </div>
                <!-- Barra apilada -->
                <div class="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div class="h-full bg-gradient-to-r from-purple-400 to-purple-500 transition-all duration-1000 ease-out" 
                       :style="{ width: `${Math.min((member.logged / (member.estimated || 1)) * 100, 100)}%` }"
                       v-motion :initial="{ width: '0%' }" :enter="{ width: `${Math.min((member.logged / (member.estimated || 1)) * 100, 100)}%`, transition: { duration: 1000, delay: 700 + (idx * 100) } }">
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from '#app';
import { ArrowLeft, TrendingUp, PieChart, Activity, DollarSign, Users, ChevronDown } from 'lucide-vue-next';

definePageMeta({
  layout: 'project'
});

const route = useRoute();
const projectId = route.params.id as string;

const loading = ref(true);
const project = ref<any>(null);
const sprints = ref<any[]>([]);
const selectedSprintId = ref<string>('');

const kpis = ref({ completionPercentage: 0, createdVsResolved: '0 / 0', avgEstimatedTime: '0h', totalCost: '$0' });

const kpiData = computed(() => [
  { label: 'Completitud', value: `${kpis.value.completionPercentage}%`, icon: PieChart },
  { label: 'Ratio Resolución', value: kpis.value.createdVsResolved, icon: Activity },
  { label: 'Est. Promedio', value: kpis.value.avgEstimatedTime, icon: TrendingUp },
  { label: 'Presupuesto', value: kpis.value.totalCost || '$24.5k', icon: DollarSign },
]);

const workloadData = ref([
  { id: '1', name: 'Ana Silva', logged: 32, estimated: 40 },
  { id: '2', name: 'Carlos Ruiz', logged: 45, estimated: 40 },
  { id: '3', name: 'Laura Gómez', logged: 12, estimated: 20 },
]);

// Organic SVG Chart Logic
const svgLinePath = ref('');
const svgAreaPath = ref('');
const chartPoints = ref<{x: number, y: number, value: number, label: string}[]>([]);
const chartSeries = ref<any[]>([]);
const chartOptions = ref<any>({ xaxis: { categories: [] } });

const calculateSvgPaths = () => {
  if (!chartSeries.value || chartSeries.value.length === 0) return;
  const data = chartSeries.value[1]?.data || chartSeries.value[0]?.data || []; // Use 'Restante' or fallback
  const labels = chartOptions.value.xaxis.categories || [];
  
  if (data.length === 0) return;

  const maxVal = Math.max(...data, 100);
  const minVal = 0;
  
  const width = 1000;
  const height = 280; // Leaving room at the bottom
  
  const points = data.map((val: number, idx: number) => {
    const x = (idx / (data.length - 1 || 1)) * width;
    const y = height - ((val - minVal) / (maxVal - minVal)) * height;
    return { x, y, value: val, label: labels[idx] || `Punto ${idx + 1}` };
  });
  
  chartPoints.value = points;
  
  if (points.length < 2) {
    svgLinePath.value = `M 0,${height} L ${width},${height}`;
    svgAreaPath.value = `M 0,${height} L ${width},${height} L ${width},300 L 0,300 Z`;
    return;
  }

  // Build Catmull-Rom or Bezier curve approx (Simplified to Catmull-Rom like tension)
  // For simplicity, we use cubic beziers generated from points
  let path = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[0];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i !== points.length - 2 ? points[i + 2] : p2;
    
    // Tension
    const tension = 0.2;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    
    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  
  svgLinePath.value = path;
  svgAreaPath.value = `${path} L ${width},300 L 0,300 Z`;
};

const loadData = async () => {
  try {
    const [pData, sData] = await Promise.all([
      $fetch(`/api/projects/${projectId}`),
      $fetch(`/api/projects/${projectId}/sprints`)
    ]);
    
    project.value = pData;
    sprints.value = sData as any[];
    
    if (sprints.value.length > 0) {
      selectedSprintId.value = sprints.value[0].id;
      await fetchBurndown();
    } else {
      // Mock data para previsualizar si no hay sprints, útil para el UX display
      kpis.value = { completionPercentage: 68, createdVsResolved: '12 / 8', avgEstimatedTime: '4.5h', totalCost: '$12.4k' };
      chartSeries.value = [
        { name: 'Ideal', data: [50, 40, 30, 20, 10, 0] },
        { name: 'Restante', data: [50, 45, 35, 28, 22, 18] }
      ];
      chartOptions.value = { xaxis: { categories: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'] } } as any;
      calculateSvgPaths();
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const fetchBurndown = async () => {
  if (!selectedSprintId.value) return;
  try {
    const data: any = await $fetch(`/api/projects/${projectId}/sprints/${selectedSprintId.value}/burndown`);
    
    chartOptions.value = { xaxis: { categories: data.labels } } as any;
    chartSeries.value = data.series;
    kpis.value = { ...kpis.value, ...data.kpis };
    calculateSvgPaths();
    
  } catch (e) {
    console.error('Error cargando burndown:', e);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.reports-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  font-family: 'Inter', sans-serif;
}

.reports-header {
  padding: 16px 32px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center;
}

.project-info { display: flex; align-items: center; gap: 16px; }
.back-link { padding: 8px; border-radius: 8px; transition: all 0.2s; }
.back-link:hover { background: rgba(147, 51, 234, 0.1); }
.project-key { background: rgba(147, 51, 234, 0.1); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; color: #7e22ce; }

.project-nav {
  display: flex; gap: 4px; background: rgba(255,255,255,0.4); padding: 4px;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.6);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
}
.nav-item {
  padding: 8px 16px; border-radius: 8px; color: #64748b; font-size: 13px;
  font-weight: 600; text-decoration: none; transition: 0.2s;
}
.nav-item:hover { color: #9333ea; background: rgba(255,255,255,0.6); }
.nav-item.active { color: #9333ea; background: #fff; box-shadow: 0 2px 8px rgba(147, 51, 234, 0.1); }

.premium-select {
  background: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,1); color: #475569;
  padding: 8px 36px 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; outline: none; cursor: pointer;
  appearance: none; min-width: 180px; box-shadow: 0 2px 10px rgba(147, 51, 234, 0.05);
  transition: all 0.2s;
}
.premium-select:hover { border-color: rgba(147, 51, 234, 0.3); }

.content-container { padding: 32px; max-width: 1400px; margin: 0 auto; width: 100%; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 20px; text-align: center;
  background: rgba(255,255,255,0.4); backdrop-filter: blur(12px);
  border: 1px dashed rgba(147, 51, 234, 0.3); border-radius: 24px;
}

.btn-primary-glow { 
  background: linear-gradient(135deg, #a855f7, #7e22ce); 
  color: white; border: none; padding: 10px 24px; border-radius: 12px; 
  font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; 
  display: inline-block; transition: all 0.2s; box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}
.btn-primary-glow:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(147, 51, 234, 0.4); }
.btn-primary-glow:active { transform: translateY(0) scale(0.98); }

.glass-widget {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  box-shadow: 0 10px 40px -10px rgba(147, 51, 234, 0.1), inset 0 1px 0 rgba(255, 255, 255, 1);
}

.chart-skeleton { height: 100%; min-height: 300px; background: rgba(147, 51, 234, 0.05); border-radius: 16px; animation: pulse 2s infinite; }

.svg-line-anim {
  stroke-dasharray: 2000;
  stroke-dashoffset: 2000;
  animation: drawLine 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
