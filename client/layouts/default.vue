<template>
  <div class="app-layout">
    <aside :class="['sidebar', { 'is-collapsed': isCollapsed }]">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon"></div>
          <span v-if="!isCollapsed" class="brand-name">Jira Clone</span>
        </div>
        <button class="collapse-btn" @click="toggleSidebar">
          <svg v-if="!isCollapsed" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink to="/projects" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <span v-if="!isCollapsed">Proyectos</span>
        </NuxtLink>
        <div class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          <span v-if="!isCollapsed">Mis Tareas</span>
        </div>
      </nav>
    </aside>

    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isCollapsed = ref(false);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-canvas);
  color: var(--txt-primary);
}

.sidebar {
  width: 260px;
  background-color: var(--bg-surface-1);
  border-right: 1px solid var(--border-subtle);
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar.is-collapsed {
  width: 70px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  height: 64px;
  border-bottom: 1px solid var(--border-subtle);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, #4facfe, #8a2be2);
}

.brand-name {
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;
}

.collapse-btn {
  background: transparent;
  border: none;
  color: var(--txt-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.collapse-btn:hover {
  background: var(--bg-surface-2);
  color: var(--txt-primary);
}

.sidebar-nav {
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  color: var(--txt-secondary);
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
  white-space: nowrap;
}

.sidebar.is-collapsed .nav-item {
  justify-content: center;
  padding: 10px;
}

.nav-item:hover, .nav-item.router-link-active {
  background-color: var(--bg-surface-2);
  color: var(--txt-primary);
}

.main-content {
  flex: 1;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}
</style>
