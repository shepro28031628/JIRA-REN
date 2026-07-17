<template>
  <div class="docs-layout">
    <!-- Sidebar / Árbol de Páginas -->
    <aside class="docs-sidebar transition-all duration-500 ease-in-out transform-gpu" :class="zenMode ? 'w-0 opacity-0 overflow-hidden border-none' : 'w-[300px]'">
      <div class="sidebar-header whitespace-nowrap overflow-hidden">
        <h3>Documentos</h3>
        <button class="btn-icon" @click="createRootPage" title="Nueva página raíz">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
      <div class="sidebar-content h-full p-2">
        <DocTree
          :pages="pages"
          :active-page-id="activePageId"
          @select="selectPage"
          @create-child="createChildPage"
        />
      </div>
    </aside>

    <!-- Área Principal / Editor -->
    <main class="docs-main">
      <div v-if="activePage" class="editor-container h-full p-6">
        <div v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 400, type: 'spring', stiffness: 250, damping: 25 } }" class="h-full">
          <DocumentEditor
            :key="activePage.id"
            :page="activePage"
            @update="onPageUpdate"
          />
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon text-purple-400 mb-4 opacity-50">
          <FileText class="w-12 h-12" stroke-width="1.5" />
        </div>
        <h2 class="text-xl font-semibold text-slate-800 mb-2">Bienvenido a Documentos</h2>
        <p>Selecciona una página en el panel izquierdo o crea una nueva para empezar a escribir.</p>
        <button class="btn-primary-glow mt-4" @click="createRootPage">Crear primera página</button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from '#app';
import DocTree from '../../../modules/docs/components/DocTree.vue';
import DocumentEditor from '../../../modules/docs/DocumentEditor.vue';
import { FileText, Plus } from 'lucide-vue-next';

definePageMeta({
  layout: 'project'
});

const route = useRoute();
const projectId = route.params.id as string;

const pages = ref<any[]>([]);
const activePageId = ref<string | null>(null);
const zenMode = useState('zenMode', () => false);

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
  height: 100vh;
  width: 100%;
  background: radial-gradient(circle at 0% 0%, rgba(147, 51, 234, 0.05) 0%, transparent 40%),
              radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.05) 0%, transparent 40%);
}

.docs-sidebar {
  border-right: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.sidebar-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.btn-icon {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(147, 51, 234, 0.1);
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-icon:hover {
  background: rgba(255, 255, 255, 0.9);
  color: #9333ea;
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.1);
  transform: translateY(-1px);
}

.docs-main {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: transparent;
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
  color: #64748b;
}
.empty-icon {
  color: #9333ea;
  opacity: 0.5;
  margin-bottom: 16px;
}
.empty-state h2 {
  font-size: 18px;
  color: #1e293b;
  margin-bottom: 8px;
}
.empty-state p {
  font-size: 14px;
}
</style>
