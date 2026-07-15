<template>
  <div class="reports-layout">
    <header class="reports-header">
      <div class="project-info">
        <NuxtLink to="/projects" class="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </NuxtLink>
        <div class="header-text" v-if="!loading">
          <h2>Dashboard Analítico</h2>
          <span class="project-key">{{ project?.key }}</span>
        </div>
        <div v-else class="header-skeleton"></div>
      </div>
      
      <!-- Navegación del Proyecto -->
      <nav class="project-nav" v-if="!loading">
        <NuxtLink :to="`/board/${projectId}`" class="nav-item">Tablero</NuxtLink>
        <NuxtLink :to="`/projects/${projectId}/backlog`" class="nav-item">Backlog</NuxtLink>
        <NuxtLink :to="`/projects/${projectId}/reports`" class="nav-item active">Reportes</NuxtLink>
      </nav>

      <div class="actions" v-if="sprints.length > 0">
        <select v-model="selectedSprintId" class="premium-select" @change="fetchBurndown">
          <option v-for="sprint in sprints" :key="sprint.id" :value="sprint.id">
            {{ sprint.name }}
          </option>
        </select>
      </div>
    </header>

    <div class="content-container">
      <div v-if="loading" class="loading-state">Cargando métricas...</div>
      
      <div v-else-if="sprints.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
        <h3>No hay Sprints</h3>
        <p>Crea un sprint en el Backlog para poder visualizar reportes de progreso.</p>
        <NuxtLink :to="`/projects/${projectId}/backlog`" class="btn-primary-glow">Ir al Backlog</NuxtLink>
      </div>

      <div v-else class="dashboard-grid">
        <!-- KPIs -->
        <div class="kpi-row">
          <div class="kpi-card">
            <div class="kpi-icon progress"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
            <div class="kpi-data">
              <span class="kpi-label">Completitud del Sprint</span>
              <span class="kpi-value">{{ kpis.completionPercentage }}%</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon created"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20v-8m0 0V4m0 8h8m-8 0H4"/></svg></div>
            <div class="kpi-data">
              <span class="kpi-label">Creadas vs. Resueltas (7d)</span>
              <span class="kpi-value">{{ kpis.createdVsResolved }}</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon resolved"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
            <div class="kpi-data">
              <span class="kpi-label">Tiempo Estimado Promedio</span>
              <span class="kpi-value">{{ kpis.avgEstimatedTime }}</span>
            </div>
          </div>
        </div>

        <!-- Burndown Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Burndown Chart</h3>
            <p>Velocidad de resolución vs tiempo estimado</p>
          </div>
          <div class="chart-wrapper">
            <!-- Solo montamos ApexCharts en el cliente para evitar errores de SSR -->
            <ClientOnly>
              <apexchart 
                type="line" 
                height="350" 
                :options="chartOptions" 
                :series="chartSeries"
              ></apexchart>
              <template #fallback>
                <div class="chart-skeleton"></div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from '#app';

const route = useRoute();
const projectId = route.params.id as string;

const loading = ref(true);
const project = ref<any>(null);
const sprints = ref<any[]>([]);
const selectedSprintId = ref<string>('');

const kpis = ref({ completionPercentage: 0, createdVsResolved: '0 / 0', avgEstimatedTime: '0h' });

const chartSeries = ref<any[]>([]);
const chartOptions = ref({
  chart: {
    type: 'line',
    fontFamily: 'Inter, sans-serif',
    toolbar: { show: false },
    background: 'transparent'
  },
  colors: ['#a1a1aa', '#4facfe'], // Ideal (gris), Real (azul glow)
  stroke: { width: [3, 4], curve: 'smooth' },
  xaxis: { categories: [], labels: { style: { colors: '#71717a' } }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { style: { colors: '#71717a' } } },
  grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
  legend: { labels: { colors: '#fff' }, position: 'top', horizontalAlign: 'right' },
  theme: { mode: 'dark' },
  fill: {
    type: ['solid', 'gradient'],
    gradient: { shade: 'dark', type: 'vertical', shadeIntensity: 0.5, opacityFrom: 0.8, opacityTo: 0.1 }
  },
  markers: { size: [0, 5], colors: ['#4facfe'], strokeColors: '#fff', strokeWidth: 2, hover: { size: 7 } },
  tooltip: { theme: 'dark' }
});

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
    
    chartOptions.value = {
      ...chartOptions.value,
      xaxis: { ...chartOptions.value.xaxis, categories: data.labels }
    };
    chartSeries.value = data.series;
    kpis.value = data.kpis;
    
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
  background-color: #0d0d12;
  color: #fff;
  font-family: 'Inter', sans-serif;
}

.reports-header {
  padding: 20px 32px; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05); background: rgba(13, 13, 18, 0.8);
  backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 10;
}
.project-info { display: flex; align-items: center; gap: 16px; }
.back-link { color: #a1a1aa; padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.back-link:hover { color: #fff; background: rgba(255, 255, 255, 0.1); }
.header-text h2 { font-size: 20px; font-weight: 600; color: #fff; }
.project-key { background: rgba(255, 255, 255, 0.1); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; color: #a1a1aa; }

.project-nav {
  display: flex; gap: 8px; background: rgba(255,255,255,0.03); padding: 4px;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);
}
.nav-item {
  padding: 8px 16px; border-radius: 8px; color: #a1a1aa; font-size: 13px;
  font-weight: 500; text-decoration: none; transition: 0.2s;
}
.nav-item:hover { color: #fff; background: rgba(255,255,255,0.05); }
.nav-item.active { color: #fff; background: rgba(255,255,255,0.1); font-weight: 600; }

.premium-select {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff;
  padding: 10px 16px; border-radius: 8px; font-size: 14px; outline: none; cursor: pointer;
  appearance: none; min-width: 200px;
}

.content-container { padding: 32px; max-width: 1200px; margin: 0 auto; width: 100%; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 20px; text-align: center; color: #71717a; background: rgba(255,255,255,0.02);
  border: 1px dashed rgba(255,255,255,0.1); border-radius: 16px; gap: 16px;
}
.empty-state h3 { color: #fff; font-size: 18px; margin: 0; }
.btn-primary-glow { background: linear-gradient(90deg, #4facfe, #8a2be2); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }

.dashboard-grid { display: flex; flex-direction: column; gap: 32px; }

.kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
.kpi-card {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px;
  padding: 24px; display: flex; align-items: center; gap: 20px; transition: 0.3s;
}
.kpi-card:hover { transform: translateY(-3px); background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); }
.kpi-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; justify-content: center; align-items: center; }
.kpi-icon.progress { background: rgba(138, 43, 226, 0.1); color: #8a2be2; }
.kpi-icon.created { background: rgba(79, 172, 254, 0.1); color: #4facfe; }
.kpi-icon.resolved { background: rgba(52, 211, 153, 0.1); color: #34d399; }
.kpi-data { display: flex; flex-direction: column; gap: 4px; }
.kpi-label { font-size: 13px; color: #a1a1aa; font-weight: 500; }
.kpi-value { font-size: 28px; font-weight: 700; color: #fff; }

.chart-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; }
.chart-header h3 { font-size: 18px; font-weight: 600; margin: 0 0 4px; }
.chart-header p { font-size: 13px; color: #a1a1aa; margin: 0 0 24px; }
.chart-skeleton { height: 350px; background: rgba(255,255,255,0.05); border-radius: 8px; animation: pulse 2s infinite; }

@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
</style>
