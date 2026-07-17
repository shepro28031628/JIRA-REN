<template>
  <div class="landing-layout">
    <!-- Navbar Minimalista -->
    <nav 
      class="premium-navbar"
      v-motion
      :initial="{ opacity: 0, y: -20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 600, type: 'spring', damping: 20 } }"
    >
      <div class="logo-box">
        <img src="/logo.png" alt="Logo" class="w-8 h-8 object-contain" />
        <span class="brand-name">Jira Clone</span>
      </div>
      
      <div class="nav-actions">
        <NuxtLink v-if="!authStore.isAuthenticated" to="/login" class="btn-ghost">Iniciar Sesión</NuxtLink>
        <NuxtLink v-if="!authStore.isAuthenticated" to="/register" class="btn-primary-glow">Regístrate</NuxtLink>
        <NuxtLink v-else to="/home" class="btn-primary-glow">Ir a mi Dashboard <span class="arrow">→</span></NuxtLink>
      </div>
    </nav>

    <!-- Hero Section -->
    <main class="hero-section">
      <div class="hero-content">
        <div 
          class="badge-pill"
          v-motion
          :initial="{ opacity: 0, scale: 0.8, y: 20 }"
          :enter="{ opacity: 1, scale: 1, y: 0, transition: { delay: 200, duration: 500, type: 'spring' } }"
        >
          <span class="badge-dot"></span>
          Gestión de Proyectos de Próxima Generación
        </div>
        
        <h1 
          class="hero-title"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 350, duration: 600, ease: 'easeOut' } }"
        >
          Planifica, construye y <br />
          <span class="text-gradient">envía a la velocidad de la luz.</span>
        </h1>
        
        <p 
          class="hero-subtitle"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 500, duration: 600, ease: 'easeOut' } }"
        >
          El estándar moderno en gestión de desarrollo de software. Experimenta un flujo de trabajo sin fricciones, diseñado para equipos de alto rendimiento.
        </p>
        
        <div 
          class="hero-cta"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 650, duration: 600, ease: 'easeOut' } }"
        >
          <NuxtLink v-if="!authStore.isAuthenticated" to="/register" class="btn-hero">Comenzar Gratis</NuxtLink>
          <NuxtLink v-else to="/home" class="btn-hero">Abrir Dashboard</NuxtLink>
          <a href="#features" class="btn-secondary">Explorar Funciones</a>
        </div>
      </div>
      
      <!-- Visual Element (Mockup Interface) -->
      <div 
        class="hero-visual"
        v-motion
        :initial="{ opacity: 0, rotateX: 20, scale: 0.9, y: 100 }"
        :enter="{ opacity: 1, rotateX: 5, scale: 0.95, y: 0, transition: { delay: 800, duration: 1000, type: 'spring', damping: 15 } }"
      >
        <div class="mockup-window">
          <div class="mockup-header">
            <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
          </div>
          <div class="mockup-body">
            <div class="mockup-sidebar"></div>
            <div class="mockup-content">
              <!-- Animated Columns -->
              <div 
                v-for="(height, i) in ['80%', '60%', '40%']" 
                :key="i"
                class="mockup-card" 
                :style="{ height }"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 1200 + (i * 150), duration: 500 } }"
              ></div>
            </div>
          </div>
        </div>
        <div class="glow-effect"></div>
      </div>
    </main>

    <!-- Features Section (Minimal) -->
    <section id="features" class="features-section">
      <div class="feature-grid">
        <div 
          class="feature-card"
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 600, delay: 100, ease: 'easeOut' } }"
        >
          <div class="feature-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#paint0_linear)" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <h3>Velocidad Incomparable</h3>
          <p>Construido con Nuxt 3 y Nitro para un rendimiento que se siente instantáneo en cada interacción.</p>
        </div>
        <div 
          class="feature-card"
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 600, delay: 250, ease: 'easeOut' } }"
        >
          <div class="feature-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#paint1_linear)" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <h3>Sincronización Real</h3>
          <p>WebSockets integrados para que todo tu equipo vea los cambios en tiempo real sin recargar.</p>
        </div>
        <div 
          class="feature-card"
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 600, delay: 400, ease: 'easeOut' } }"
        >
          <div class="feature-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#paint2_linear)" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/></svg>
          </div>
          <h3>Diseño Obsesivo</h3>
          <p>Modo oscuro por defecto, animaciones fluidas y una interfaz diseñada para no estorbar.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store';
const authStore = useAuthStore();
</script>

<style scoped>
/* Layout Base */
.landing-layout {
  min-height: 100vh;
  background-color: #09090b; /* Muy oscuro, tipo Zinc-950 */
  color: #fff;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  position: relative;
}

/* Background Gradients */
.landing-layout::before {
  content: '';
  position: absolute;
  top: -10%; left: 50%;
  transform: translateX(-50%);
  width: 80%; height: 60%;
  background: radial-gradient(circle, rgba(138,43,226,0.15) 0%, rgba(79,172,254,0.1) 40%, transparent 70%);
  filter: blur(100px);
  z-index: 0; pointer-events: none;
}

/* Navbar */
.premium-navbar {
  position: sticky; top: 0; z-index: 50;
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 48px;
  background: rgba(9, 9, 11, 0.7);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo-box {
  display: flex; align-items: center; gap: 12px;
}
.brand-name { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; }

.nav-actions { display: flex; align-items: center; gap: 16px; }

/* Botones */
.btn-ghost {
  color: #a1a1aa; font-size: 14px; font-weight: 500;
  text-decoration: none; padding: 8px 16px; border-radius: 8px;
  transition: all 0.2s;
}
.btn-ghost:hover { color: #fff; background: rgba(255, 255, 255, 0.1); }

.btn-primary-glow {
  background: linear-gradient(135deg, #4facfe, #8a2be2);
  color: white; text-decoration: none; padding: 10px 24px;
  border-radius: 12px; font-size: 14px; font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex; align-items: center; gap: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-primary-glow:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 10px 25px -5px rgba(138, 43, 226, 0.5);
}
.arrow { transition: transform 0.2s; }
.btn-primary-glow:hover .arrow { transform: translateX(4px); }

/* Hero Section */
.hero-section {
  position: relative; z-index: 1;
  max-width: 1200px; margin: 0 auto;
  padding: 100px 24px 60px;
  display: flex; flex-direction: column; align-items: center; text-align: center;
}

.badge-pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 16px; border-radius: 100px; font-size: 13px; color: #d4d4d8;
  margin-bottom: 32px; font-weight: 500;
  backdrop-filter: blur(10px);
}
.badge-dot { width: 8px; height: 8px; border-radius: 50%; background: #4facfe; box-shadow: 0 0 10px #4facfe; }

.hero-title {
  font-size: 72px; font-weight: 800; line-height: 1.05; letter-spacing: -0.04em;
  margin-bottom: 24px;
}
.text-gradient {
  background: linear-gradient(to right, #4facfe, #8a2be2, #ff0844);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-size: 200% auto; animation: gradientShift 5s ease infinite;
}

.hero-subtitle {
  font-size: 20px; color: #a1a1aa; max-width: 600px; line-height: 1.6;
  margin-bottom: 48px;
}

.hero-cta {
  display: flex; gap: 16px;
}

.btn-hero {
  background: #fff; color: #09090b;
  text-decoration: none; padding: 16px 36px;
  border-radius: 12px; font-size: 16px; font-weight: 600;
  transition: all 0.3s;
}
.btn-hero:hover { background: #e4e4e7; transform: translateY(-2px) scale(1.02); box-shadow: 0 10px 20px rgba(255, 255, 255, 0.1); }

.btn-secondary {
  background: rgba(255, 255, 255, 0.05); color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1); text-decoration: none;
  padding: 16px 36px; border-radius: 12px; font-size: 16px; font-weight: 600;
  transition: all 0.3s; backdrop-filter: blur(10px);
}
.btn-secondary:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); transform: translateY(-2px); }

/* Mockup Visual */
.hero-visual {
  margin-top: 80px; position: relative;
  width: 100%; max-width: 900px;
  perspective: 1000px;
}
/* Flotación continua por encima de la animación de entrada */
.mockup-window {
  background: #18181b; border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 40px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05);
  transform-style: preserve-3d;
  animation: float 6s ease-in-out infinite;
}
.mockup-header { padding: 12px 16px; background: rgba(255, 255, 255, 0.02); display: flex; gap: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.red { background: #ff5f56; } .dot.yellow { background: #ffbd2e; } .dot.green { background: #27c93f; }

.mockup-body { display: flex; height: 400px; }
.mockup-sidebar { width: 200px; background: rgba(0, 0, 0, 0.2); border-right: 1px solid rgba(255, 255, 255, 0.05); }
.mockup-content { flex: 1; padding: 32px; display: flex; gap: 24px; }
.mockup-card { flex: 1; border-radius: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); }

.glow-effect {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 100%; height: 100%; background: linear-gradient(135deg, #4facfe, #8a2be2);
  filter: blur(120px); opacity: 0.15; z-index: -1; pointer-events: none;
}

/* Features */
.features-section { padding: 100px 24px; max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }
.feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
.feature-card {
  background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 32px; border-radius: 20px; transition: all 0.3s;
  backdrop-filter: blur(10px);
}
.feature-card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.04); border-color: rgba(255, 255, 255, 0.1); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5); }
.feature-icon-box { 
  width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 255, 255, 0.05);
  display: flex; align-items: center; justify-content: center; margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.feature-card h3 { font-size: 20px; font-weight: 600; margin-bottom: 12px; }
.feature-card p { color: #a1a1aa; line-height: 1.6; }

/* Keyframes para animaciones continuas */
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
@keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
</style>
