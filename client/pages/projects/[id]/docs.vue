<template>
  <div class="docs-layout">
    <!-- Sidebar / Árbol de Páginas -->
    <aside class="docs-sidebar">
      <div class="sidebar-header">
        <h3>Documentos</h3>
        <button class="btn-icon" @click="createRootPage" title="Nueva página raíz">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
      <div class="sidebar-content">
        <PageTree
          :pages="pages"
          :active-page-id="activePageId"
          @select="selectPage"
          @create-child="createChildPage"
        />
      </div>
    </aside>

    <!-- Área Principal / Editor -->
    <main class="docs-main">
      <div v-if="activePage" class="editor-container">
        <DocumentEditor
          :key="activePage.id"
          :page="activePage"
          @update="onPageUpdate"
        />
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        </div>
        <h2>Bienvenido a Documentos</h2>
        <p>Selecciona una página en el panel izquierdo o crea una nueva para empezar a escribir.</p>
        <button class="btn-primary-glow mt-4" @click="createRootPage">Crear primera página</button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from '#app';
import PageTree from '../../../modules/docs/PageTree.vue';
import DocumentEditor from '../../../modules/docs/DocumentEditor.vue';

definePageMeta({
  layout: 'project'
});

const route = useRoute();
const projectId = route.params.id as string;

const pages = ref<any[]>([]);
const activePageId = ref<string | null>(null);

const activePage = computed(() => pages.value.find(p => p.id === activePageId.value) || null);

const loadPages = async () => {
  try {
    const res = await $fetch(`/api/projects/${projectId}/pages`);
    pages.value = res as any[];
  } catch (err) {
    console.error('Error loading pages:', err);
  }
};

const createPage = async (parentId: string | null = null) => {
  try {
    const res = await $fetch('/api/pages', {
      method: 'POST',
      body: {
        project_id: projectId,
        title: 'Página sin título',
        parent_id: parentId
      }
    });
    pages.value.push(res as any);
    activePageId.value = (res as any).id;
  } catch (err) {
    console.error('Error creating page:', err);
  }
};

const createRootPage = () => createPage(null);
const createChildPage = (parentId: string) => createPage(parentId);

const selectPage = (id: string) => {
  activePageId.value = id;
};

const onPageUpdate = (updatedPage: any) => {
  const index = pages.value.findIndex(p => p.id === updatedPage.id);
  if (index !== -1) {
    pages.value[index] = { ...pages.value[index], ...updatedPage };
  }
};

onMounted(() => {
  loadPages();
});
</script>

<style scoped>
.docs-layout {
  display: flex;
  height: 100%;
  width: 100%;
  background: var(--bg-canvas);
}

.docs-sidebar {
  width: 280px;
  border-right: 1px solid var(--border-subtle);
  background: var(--bg-surface-1);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
}

.sidebar-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--txt-primary);
}

.btn-icon {
  background: transparent;
  border: none;
  color: var(--txt-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}
.btn-icon:hover {
  background: var(--bg-surface-2);
  color: var(--txt-primary);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 8px;
}

.docs-main {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--txt-secondary);
}
.empty-icon {
  color: var(--border-strong);
  margin-bottom: 16px;
}
.empty-state h2 {
  font-size: 18px;
  color: var(--txt-primary);
  margin-bottom: 8px;
}
.empty-state p {
  font-size: 14px;
}
</style>
