<template>
  <div class="team-layout">
    <header class="team-header">
      <div class="project-info">
        <NuxtLink to="/projects" class="back-link">
          <ArrowLeft class="w-5 h-5" stroke-width="1.5" />
        </NuxtLink>
        <div class="header-text" v-if="!loading">
          <h2>Equipo</h2>
          <span class="project-key">{{ project?.key }}</span>
        </div>
        <div v-else class="header-skeleton"></div>
      </div>
      
      <!-- Navegación del Proyecto -->
      <nav class="project-nav" v-if="!loading">
        <NuxtLink :to="`/board/${projectId}`" class="nav-item">Tablero</NuxtLink>
        <NuxtLink :to="`/projects/${projectId}/backlog`" class="nav-item">Backlog</NuxtLink>
        <NuxtLink :to="`/projects/${projectId}/team`" class="nav-item active">Equipo</NuxtLink>
        <NuxtLink :to="`/projects/${projectId}/reports`" class="nav-item">Reportes</NuxtLink>
      </nav>

      <div class="actions" v-if="!loading">
        <button class="btn-primary-glow">Invitar Miembro</button>
      </div>
    </header>

    <div class="content-container" v-if="!loading">
      
      <div class="team-grid">
        <div 
          v-motion 
          :initial="{ opacity: 0, scale: 0.95, y: 10 }" 
          :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 400, delay: index * 100, type: 'spring', stiffness: 250, damping: 25 } }"
          class="team-card bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-purple-100/30" 
          v-for="(member, index) in team" 
          :key="member.id"
        >
          <div class="member-header">
            <div class="avatar shadow-inner" v-if="member.avatar_url">
              <img :src="member.avatar_url" alt="avatar" />
            </div>
            <div class="avatar placeholder shadow-inner" v-else>
              {{ member.name.charAt(0).toUpperCase() }}
            </div>
            <div class="member-info">
              <h3 class="text-slate-800 font-semibold">{{ member.name }}</h3>
              <span class="role-badge" :class="member.role.toLowerCase()">{{ member.role }}</span>
            </div>
          </div>
          
          <div class="workload-stats bg-white/40 border border-white/50 backdrop-blur-sm shadow-sm rounded-xl">
            <div class="stat-item">
              <span class="stat-label text-slate-500">Tareas</span>
              <span class="stat-value text-slate-700">{{ member.workload.issueCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label text-slate-500">Estimado</span>
              <span class="stat-value text-slate-700">{{ formatHours(member.workload.totalEstimatedMinutes) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label text-slate-500">Registrado</span>
              <span class="stat-value highlight text-purple-600">{{ formatHours(member.workload.totalLoggedMinutes) }}</span>
            </div>
          </div>

          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label text-slate-500">Progreso del Esfuerzo</span>
              <span class="progress-percent" :class="progressPercent(member.workload) > 100 ? 'text-red-500' : 'text-slate-700'">
                {{ progressPercent(member.workload) }}%
              </span>
            </div>
            <div class="progress-bar bg-slate-100/80 border border-slate-200/50 shadow-inner">
              <div class="progress-fill shadow-sm" 
                   :style="{ width: Math.min(progressPercent(member.workload), 100) + '%', background: progressColor(member.workload) }">
              </div>
            </div>
            <p v-if="progressPercent(member.workload) > 100" class="overload-warning text-red-500 font-medium">
              ¡Sobrecarga de trabajo detectada!
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from '#app';
import { $fetch } from 'ofetch';
import { ArrowLeft } from 'lucide-vue-next';

const route = useRoute();
const projectId = route.params.id as string;
const project = ref<any>(null);
const team = ref<any[]>([]);
const loading = ref(true);

const formatHours = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const progressPercent = (workload: any) => {
  const est = workload.totalEstimatedMinutes || 0;
  if (est === 0) return workload.totalLoggedMinutes > 0 ? 100 : 0;
  return Math.round((workload.totalLoggedMinutes / est) * 100);
};

const progressColor = (workload: any) => {
  const p = progressPercent(workload);
  if (p <= 70) return 'linear-gradient(90deg, #c4b5fd, #a78bfa)'; // lavender
  if (p <= 100) return 'linear-gradient(90deg, #a78bfa, #8b5cf6)'; // darker lavender
  return 'linear-gradient(90deg, #fca5a5, #ef4444)'; // lilac-red (overloaded)
};

const loadData = async () => {
  try {
    const [p, t] = await Promise.all([
      $fetch(`/api/projects/${projectId}`),
      $fetch(`/api/projects/${projectId}/team`)
    ]);
    project.value = p;
    team.value = t as any[];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
<style scoped>
.team-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: #1e293b;
  font-family: 'Inter', sans-serif;
}

.team-header {
  padding: 16px 32px; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.4); background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 10;
}
.project-info { display: flex; align-items: center; gap: 16px; }
.back-link { color: #64748b; padding: 6px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.back-link:hover { color: #1e293b; background: rgba(255, 255, 255, 0.5); }
.header-text { display: flex; align-items: center; gap: 12px; }
.header-text h2 { font-size: 18px; font-weight: 600; color: #1e293b; letter-spacing: -0.01em; }
.project-key { background: rgba(255, 255, 255, 0.5); padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; color: #64748b; }

.project-nav {
  display: flex; gap: 4px; padding: 4px;
}
.nav-item {
  padding: 6px 12px; border-radius: 6px; color: #64748b; font-size: 13px;
  font-weight: 500; text-decoration: none; transition: 0.2s;
}
.nav-item:hover { color: #1e293b; background: rgba(255,255,255,0.4); }
.nav-item.active { color: #1e293b; font-weight: 600; border-bottom: 2px solid #9333ea; border-radius: 0; }

.btn-primary-glow { background: var(--brand-default); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-primary-glow:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2); opacity: 0.95; }

.content-container { padding: 32px; max-width: 1200px; margin: 0 auto; width: 100%; }

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.team-card {
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.team-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 20px 40px -10px rgba(147, 51, 234, 0.15) !important;
}

.member-header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar.placeholder {
  font-size: 20px;
  font-weight: 600;
  color: #9333ea;
  background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
}
.member-info { display: flex; flex-direction: column; gap: 4px; }
.member-info h3 { font-size: 16px; font-weight: 600; color: #1e293b; margin: 0; }
.role-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 12px; display: inline-block; width: fit-content; }
.role-badge.admin { background: rgba(147, 51, 234, 0.1); color: #9333ea; border: 1px solid rgba(147, 51, 234, 0.2); }
.role-badge.member { background: rgba(99, 102, 241, 0.1); color: #6366f1; border: 1px solid rgba(99, 102, 241, 0.2); }

.workload-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-label { font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
.stat-value { font-size: 14px; font-weight: 500; }
.stat-value.highlight { font-weight: 600; }

.progress-section { display: flex; flex-direction: column; gap: 8px; }
.progress-header { display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 500; }

.progress-bar {
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1), background 0.5s ease;
}
.overload-warning {
  font-size: 11px;
  margin: 0;
  text-align: right;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

.header-skeleton { width: 150px; height: 28px; background: rgba(255,255,255,0.5); border-radius: 6px; animation: pulse 1.5s infinite; }
</style>
