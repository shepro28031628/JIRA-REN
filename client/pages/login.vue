<template>
  <div class="pro-auth-layout">
    <!-- Panel Izquierdo: Visual (Solo visible en desktop) -->
    <div class="auth-visual">
      <div class="visual-content" v-motion :initial="{ opacity: 0, x: -50 }" :enter="{ opacity: 1, x: 0, transition: { duration: 800, ease: 'easeOut' } }">
        <div class="logo-box-large">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="visual-title">Donde los mejores equipos construyen el futuro.</h1>
        <p class="visual-subtitle">Una plataforma de gestión de proyectos diseñada para la velocidad, la claridad y el rendimiento implacable.</p>
        
        <div class="testimonial">
          <div class="testimonial-stars">★★★★★</div>
          <p>"Jira Clone cambió por completo nuestra forma de trabajar. Las tareas se mueven con la fluidez del agua."</p>
          <div class="testimonial-author">
            <div class="author-avatar">E</div>
            <div>
              <strong>Elena M.</strong>
              <span>VP de Ingeniería en TechNova</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Fondo animado premium -->
      <div class="animated-mesh"></div>
    </div>

    <!-- Panel Derecho: Formulario -->
    <div class="auth-form-container">
      <div class="form-wrapper" v-motion :initial="{ opacity: 0, y: 30 }" :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 200, type: 'spring' } }">
        
        <div class="mobile-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7L12 12L22 7L12 2Z"/><path d="M2 17L12 22L22 17"/><path d="M2 12L12 17L22 12"/></svg>
        </div>

        <div class="header">
          <h2>Inicia Sesión</h2>
          <p>Nos alegra verte de nuevo por aquí.</p>
        </div>

        <form @submit.prevent="login" class="form">
          
          <div class="input-field">
            <input v-model="email" type="email" id="email" required placeholder=" " />
            <label for="email">Correo electrónico</label>
            <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          
          <div class="input-field">
            <input v-model="password" type="password" id="password" required placeholder=" " />
            <label for="password">Contraseña</label>
            <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>

          <div v-if="error" class="error-banner" v-motion :initial="{ opacity: 0, scale: 0.95 }" :enter="{ opacity: 1, scale: 1 }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ error }}
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="!loading">Continuar</span>
            <span v-else class="loader"></span>
            <svg v-if="!loading" class="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </form>

        <div class="footer">
          ¿No tienes una cuenta? <NuxtLink to="/register" class="link">Regístrate</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from '#app';
import { useAuthStore } from '~/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const login = async () => {
  loading.value = true;
  error.value = '';
  try {
    await authStore.login(email.value, password.value);
    router.push('/projects');
  } catch (e: any) {
    error.value = e.response?._data?.message || 'Credenciales incorrectas';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Layout Principal Dividido */
.pro-auth-layout {
  display: flex;
  min-height: 100vh;
  background-color: #09090b; /* Zinc 950 */
  font-family: 'Inter', sans-serif;
  color: #fff;
}

/* --- PANEL IZQUIERDO (Visual) --- */
.auth-visual {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 64px;
  overflow: hidden;
  background: #000;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

@media (max-width: 900px) {
  .auth-visual { display: none; }
}

.visual-content {
  position: relative;
  z-index: 10;
  max-width: 480px;
}

.logo-box-large {
  width: 56px; height: 56px;
  background: linear-gradient(135deg, rgba(79,172,254,0.2), rgba(138,43,226,0.2));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(79,172,254,0.3);
}

.visual-title {
  font-size: 40px; font-weight: 700; line-height: 1.1;
  letter-spacing: -0.03em; margin-bottom: 16px;
}

.visual-subtitle {
  font-size: 16px; color: #a1a1aa; line-height: 1.6;
  margin-bottom: 64px;
}

.testimonial {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 24px; border-radius: 16px;
  backdrop-filter: blur(10px);
}
.testimonial-stars { color: #f59e0b; margin-bottom: 12px; font-size: 14px; letter-spacing: 2px;}
.testimonial p { font-size: 15px; font-style: italic; color: #e4e4e7; margin-bottom: 20px; line-height: 1.5; }
.testimonial-author { display: flex; align-items: center; gap: 12px; }
.author-avatar { width: 32px; height: 32px; border-radius: 50%; background: #4facfe; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; color: #000; }
.testimonial-author strong { display: block; font-size: 14px; font-weight: 600; }
.testimonial-author span { color: #71717a; font-size: 12px; }

/* Mesh Gradient Animado */
.animated-mesh {
  position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle at 50% 50%, rgba(138,43,226,0.15), transparent 60%),
              radial-gradient(circle at 80% 20%, rgba(79,172,254,0.15), transparent 50%);
  filter: blur(80px);
  animation: mesh-rotate 20s linear infinite;
  z-index: 1; pointer-events: none;
}
@keyframes mesh-rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* --- PANEL DERECHO (Formulario) --- */
.auth-form-container {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  background: #09090b;
  position: relative;
}

.form-wrapper {
  width: 100%; max-width: 380px;
  padding: 32px;
}

.mobile-logo { display: none; margin-bottom: 32px; color: #fff; }
@media (max-width: 900px) { .mobile-logo { display: block; } }

.header { margin-bottom: 40px; }
.header h2 { font-size: 28px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.02em; }
.header p { color: #a1a1aa; font-size: 15px; }

.form { display: flex; flex-direction: column; gap: 24px; }

/* Campos de entrada estilo flotante (Float Label) */
.input-field {
  position: relative;
  width: 100%;
}
.input-field input {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 16px 16px 16px 44px;
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  transition: all 0.2s;
  outline: none;
}
.input-field input:focus, .input-field input:not(:placeholder-shown) {
  border-color: #4facfe;
  background: rgba(255, 255, 255, 0.02);
}
.input-field label {
  position: absolute;
  left: 44px; top: 50%; transform: translateY(-50%);
  color: #71717a; font-size: 15px;
  transition: all 0.2s;
  pointer-events: none;
}
.input-field input:focus ~ label, .input-field input:not(:placeholder-shown) ~ label {
  top: -8px; left: 12px; font-size: 12px;
  background: #09090b; padding: 0 4px;
  color: #4facfe; font-weight: 500;
}
.input-field .icon {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: #71717a; transition: color 0.2s;
}
.input-field input:focus ~ .icon { color: #4facfe; }

/* Botón Ultra Premium */
.btn-submit {
  background: #fff; color: #000;
  border: none; padding: 16px;
  border-radius: 12px; font-size: 15px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.3s;
  margin-top: 8px;
}
.btn-submit:hover:not(:disabled) {
  background: #e4e4e7;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255,255,255,0.1);
}
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-submit .arrow { transition: transform 0.2s; }
.btn-submit:hover:not(:disabled) .arrow { transform: translateX(4px); }

.error-banner {
  display: flex; align-items: center; gap: 8px;
  background: rgba(239, 68, 68, 0.1); color: #ef4444;
  padding: 12px 16px; border-radius: 10px;
  font-size: 13px; font-weight: 500;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.footer {
  margin-top: 32px; text-align: center; color: #71717a; font-size: 14px;
}
.footer .link {
  color: #fff; font-weight: 500; text-decoration: none; transition: color 0.2s;
}
.footer .link:hover { color: #4facfe; }

.loader {
  width: 20px; height: 20px; border: 2px solid rgba(0,0,0,0.2);
  border-bottom-color: #000; border-radius: 50%; display: inline-block;
  animation: rotation 1s linear infinite;
}
@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
