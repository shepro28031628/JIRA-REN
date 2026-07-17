<template>
  <div class="projects-layout">
    <!-- Navbar Premium -->
    <nav class="premium-navbar">
      <div class="nav-left">
        <div class="logo-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#paint0_linear)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="url(#paint1_linear)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="url(#paint2_linear)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="paint0_linear" x1="2" y1="7" x2="22" y2="7" gradientUnits="userSpaceOnUse">
                <stop stop-color="#4facfe"/>
                <stop offset="1" stop-color="#8a2be2"/>
              </linearGradient>
              <linearGradient id="paint1_linear" x1="2" y1="19.5" x2="22" y2="19.5" gradientUnits="userSpaceOnUse">
                <stop stop-color="#4facfe"/>
                <stop offset="1" stop-color="#8a2be2"/>
              </linearGradient>
              <linearGradient id="paint2_linear" x1="2" y1="14.5" x2="22" y2="14.5" gradientUnits="userSpaceOnUse">
                <stop stop-color="#4facfe"/>
                <stop offset="1" stop-color="#8a2be2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span class="brand-name">Jira Clone</span>
      </div>
      <div class="nav-right">
        <div class="user-profile">
          <div class="avatar">{{ authStore.user?.name?.charAt(0) || 'U' }}</div>
          <span class="user-name">{{ authStore.user?.name || 'Usuario' }}</span>
        </div>
        <button class="btn-icon" @click="authStore.logout()" title="Cerrar Sesión">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <header class="header-section">
        <div>
          <h1 class="page-title">Bienvenido de nuevo</h1>
          <p class="page-subtitle">Selecciona un proyecto para continuar tu trabajo o crea uno nuevo.</p>
        </div>
        <button class="btn-primary-glow" @click="showCreateModal = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          Nuevo Proyecto
        </button>
      </header>

      <!-- Grid de Proyectos -->
      <div class="projects-grid" v-if="!loading && projects.length > 0">
        <NuxtLink 
          v-for="project in projects" 
          :key="project.id" 
          :to="`/board/${project.id}`" 
          class="modern-card group"
        >
          <div class="card-glow"></div>
          <div class="card-content">
            <div class="card-header">
              <div class="project-badge">{{ project.key }}</div>
              <button class="btn-icon subtle"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
            </div>
            <h3 class="project-name">{{ project.name }}</h3>
            <p class="project-desc">{{ project.description || 'Sin descripción detallada.' }}</p>
            
            <div class="card-footer">
              <div class="members">
                <div class="avatar-sm">E</div>
                <div class="avatar-sm" style="margin-left: -8px; background: #8a2be2;">J</div>
              </div>
              <span class="updated-at">Actualizado recientemente</span>
            </div>
          </div>
        </NuxtLink>
      </div>
      
      <!-- Estado vacío -->
      <div v-else-if="!loading && projects.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#paint0_linear)" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
        </div>
        <h3>No tienes proyectos activos</h3>
        <p>Crea tu primer proyecto para empezar a gestionar tus tareas.</p>
        <button class="btn-primary-glow mt-4" @click="showCreateModal = true">Crear Proyecto</button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="projects-grid">
        <div v-for="i in 3" :key="i" class="modern-card skeleton-card"></div>
      </div>
    </main>

    <!-- Modal Neumorphism/Glass -->
    <Transition name="modal-fade">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="premium-modal">
          <div class="modal-header">
            <h3>Crear Nuevo Proyecto</h3>
            <button class="btn-icon" @click="showCreateModal = false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <form @submit.prevent="createProject" class="modal-form">
            <div class="input-group">
              <label>Nombre del proyecto</label>
              <input v-model="newProject.name" placeholder="Ej: Rediseño App Móvil" required />
            </div>
            <div class="input-group">
              <label>Clave del proyecto</label>
              <input v-model="newProject.key" placeholder="Ej: APP" required maxlength="5" style="text-transform: uppercase;" />
              <span class="input-hint">Un identificador corto para las tareas (Ej. APP-1)</span>
            </div>
            <div class="input-group">
              <label>Descripción (Opcional)</label>
              <textarea v-model="newProject.description" placeholder="¿De qué trata este proyecto?" rows="3"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="showCreateModal = false">Cancelar</button>
              <button type="submit" class="btn-primary-glow">Crear Proyecto</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth.store';

const authStore = useAuthStore();
const projects = ref<any[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);
const newProject = ref({ name: '', key: '', description: '' });

const loadProjects = async () => {
  try {
    projects.value = await $fetch('/api/projects');
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const createProject = async () => {
  try {
    const p = await $fetch('/api/projects', {
      method: 'POST',
      body: { ...newProject.value, owner_id: authStore.user?.id }
    });
    projects.value.unshift(p);
    showCreateModal.value = false;
    newProject.value = { name: '', key: '', description: '' };
  } catch (e) {
    console.error('Error creando proyecto', e);
  }
};

onMounted(loadProjects);
</script>

<style scoped>
/* Base Layout */
.projects-layout {
  min-height: 100vh;
  background-color: #0d0d12;
  background-image: radial-gradient(circle at 50% 0%, rgba(79, 172, 254, 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 100% 100%, rgba(138, 43, 226, 0.05) 0%, transparent 50%);
  color: #fff;
  font-family: 'Inter', sans-serif;
}

/* Navbar */
.premium-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  background: rgba(13, 13, 18, 0.7);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 0;
  z-index: 40;
}

.nav-left { display: flex; align-items: center; gap: 12px; }
.logo-box {
  width: 36px; height: 36px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.brand-name { font-size: 16px; font-weight: 600; letter-spacing: -0.02em; }

.nav-right { display: flex; align-items: center; gap: 24px; }
.user-profile { display: flex; align-items: center; gap: 12px; }
.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, #4facfe, #8a2be2);
  display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 14px;
}
.user-name { font-size: 14px; color: #a1a1aa; font-weight: 500; }

.btn-icon {
  background: transparent; color: #71717a; border: none;
  cursor: pointer; padding: 6px; border-radius: 8px;
  transition: all 0.2s; display: flex; align-items: center; justify-content: center;
}
.btn-icon:hover { color: #fff; background: rgba(255, 255, 255, 0.1); }

/* Main Content */
.main-content {
  max-width: 1200px; margin: 0 auto; padding: 64px 40px;
}

.header-section {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 48px;
}

.page-title {
  font-size: 36px; font-weight: 700; letter-spacing: -0.03em;
  margin-bottom: 8px;
  background: linear-gradient(to right, #fff, #a1a1aa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.page-subtitle { color: #71717a; font-size: 16px; }

/* Botones Modernos */
.btn-primary-glow {
  background: linear-gradient(90deg, #4facfe, #8a2be2);
  color: white; border: none; padding: 12px 24px;
  border-radius: 12px; font-size: 14px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative; overflow: hidden;
}
.btn-primary-glow::before {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%); transition: transform 0.5s;
}
.btn-primary-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(138, 43, 226, 0.5);
}
.btn-primary-glow:hover::before { transform: translateX(100%); }

.btn-secondary {
  background: rgba(255, 255, 255, 0.05); color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1); padding: 12px 24px;
  border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }

/* Grid y Tarjetas tipo Linear/Vercel */
.projects-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px;
}

.modern-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  position: relative;
  text-decoration: none; color: inherit;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  display: flex; flex-direction: column;
}

.card-glow {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 80%; height: 40%; background: radial-gradient(ellipse at top, rgba(79, 172, 254, 0.15), transparent 70%);
  opacity: 0; transition: opacity 0.4s; pointer-events: none;
}

.modern-card:hover {
  transform: translateY(-6px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
}
.modern-card:hover .card-glow { opacity: 1; }

.card-content { padding: 24px; position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.project-badge {
  background: rgba(79, 172, 254, 0.1); color: #4facfe;
  border: 1px solid rgba(79, 172, 254, 0.2);
  padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
}

.project-name { font-size: 20px; font-weight: 600; margin-bottom: 8px; letter-spacing: -0.01em; }
.project-desc { font-size: 14px; color: #a1a1aa; line-height: 1.5; flex: 1; margin-bottom: 24px; }

.card-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.members { display: flex; }
.avatar-sm {
  width: 24px; height: 24px; border-radius: 50%;
  background: #4facfe; border: 2px solid #141419;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: bold;
}
.updated-at { font-size: 12px; color: #71717a; }

/* Empty State */
.empty-state {
  text-align: center; padding: 80px 0;
  border: 1px dashed rgba(255, 255, 255, 0.1); border-radius: 24px;
}
.empty-icon { margin-bottom: 24px; display: inline-flex; }
.empty-state h3 { font-size: 20px; margin-bottom: 8px; }
.empty-state p { color: #a1a1aa; margin-bottom: 24px; }
.mt-4 { margin-top: 16px; display: inline-flex; }

/* Skeleton */
.skeleton-card { height: 220px; animation: pulse 2s infinite ease-in-out; }
@keyframes pulse {
  0% { background: rgba(255, 255, 255, 0.03); }
  50% { background: rgba(255, 255, 255, 0.06); }
  100% { background: rgba(255, 255, 255, 0.03); }
}

/* Modal Premium */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.95) translateY(10px); }

.premium-modal {
  background: #18181f; border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px; padding: 32px; width: 100%; max-width: 480px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.modal-header h3 { font-size: 20px; font-weight: 600; }

.modal-form { display: flex; flex-direction: column; gap: 20px; }
.input-group { display: flex; flex-direction: column; gap: 8px; }
.input-group label { font-size: 13px; color: #a1a1aa; font-weight: 500; }
.input-hint { font-size: 11px; color: #71717a; }

.modal-form input, .modal-form textarea {
  background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 16px; border-radius: 12px; color: #fff; font-family: inherit; font-size: 14px;
  transition: all 0.2s;
}
.modal-form input:focus, .modal-form textarea:focus {
  outline: none; border-color: #4facfe; box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.15);
}

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px; }
</style>
