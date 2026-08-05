<template>
  <div class="releases-config p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Versiones y Releases</h2>
        <p class="text-sm text-slate-500 mt-1">Gestiona las entregas de tu proyecto y genera notas de lanzamiento automáticamente.</p>
      </div>
      <button @click="showCreateModal = true" class="btn-primary-glow px-4 py-2 text-sm font-semibold rounded-xl text-white">
        Crear Versión
      </button>
    </div>

    <!-- Lista de Versiones -->
    <div v-if="loading" class="animate-pulse space-y-4">
      <div v-for="i in 3" :key="i" class="h-16 bg-white/50 rounded-xl"></div>
    </div>
    <div v-else-if="versions.length === 0" class="text-center py-12 bg-white/20 rounded-xl border border-white/40">
      <div class="text-4xl mb-3">🚀</div>
      <h3 class="text-lg font-bold text-slate-700">Sin versiones</h3>
      <p class="text-sm text-slate-500">No has creado ninguna versión (Release) todavía.</p>
    </div>
    <div v-else class="space-y-4">
      <div v-for="version in versions" :key="version.id" class="version-card bg-white/60 backdrop-blur-md rounded-xl p-4 border border-white/60 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-0.5">
        <div class="flex items-center gap-4">
          <div class="status-badge" :class="version.status.toLowerCase()">
            {{ version.status }}
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800">{{ version.name }}</h3>
            <p class="text-xs text-slate-500 line-clamp-1">{{ version.description || 'Sin descripción' }}</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha Estimada</p>
            <p class="text-sm font-medium text-slate-700">{{ version.release_date ? new Date(version.release_date).toLocaleDateString() : 'TBD' }}</p>
          </div>
          <button @click="generateReleaseNotes(version.id)" class="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
            Release Notes
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Crear Versión -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl p-6 w-[400px] shadow-2xl" v-motion-pop>
        <h3 class="text-lg font-bold text-slate-800 mb-4">Nueva Versión</h3>
        <form @submit.prevent="createVersion" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Nombre (ej. v1.0.0)</label>
            <input v-model="newVersion.name" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Descripción</label>
            <textarea v-model="newVersion.description" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" rows="3"></textarea>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Fecha de Lanzamiento</label>
            <input v-model="newVersion.release_date" type="date" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div class="flex justify-end gap-2 pt-4">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md shadow-purple-500/20">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Release Notes -->
    <div v-if="showNotesModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl" v-motion-slide-visible-bottom>
        <div class="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
            📄 Notas de Lanzamiento
          </h3>
          <button @click="showNotesModal = false" class="text-slate-400 hover:text-slate-600 p-1">✕</button>
        </div>
        <div class="p-6 overflow-y-auto flex-1 bg-slate-50">
          <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm font-mono text-sm whitespace-pre-wrap text-slate-700">
            {{ releaseNotesMarkdown }}
          </div>
        </div>
        <div class="p-4 border-t border-slate-100 flex justify-end">
          <button @click="copyToClipboard" class="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
            Copiar al Portapapeles
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from '#app';
import { useToast } from '../../../composables/useToast';

const route = useRoute();
const projectId = route.params.id as string;
const toast = useToast();

const versions = ref<any[]>([]);
const loading = ref(true);

const showCreateModal = ref(false);
const newVersion = ref({ name: '', description: '', release_date: '' });

const showNotesModal = ref(false);
const releaseNotesMarkdown = ref('');

const loadVersions = async () => {
  try {
    versions.value = await $fetch(`/api/projects/${projectId}/versions`);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const createVersion = async () => {
  try {
    const v = await $fetch(`/api/projects/${projectId}/versions`, {
      method: 'POST',
      body: newVersion.value
    });
    versions.value.unshift(v);
    showCreateModal.value = false;
    newVersion.value = { name: '', description: '', release_date: '' };
    toast.success('Versión creada');
  } catch (e) {
    toast.error('Error al crear versión');
  }
};

const generateReleaseNotes = async (versionId: string) => {
  try {
    const res = await $fetch(`/api/projects/${projectId}/versions/${versionId}/release-notes`);
    releaseNotesMarkdown.value = res.releaseNotesMarkdown;
    showNotesModal.value = true;
  } catch (e) {
    toast.error('Error generando Release Notes');
  }
};

const copyToClipboard = () => {
  navigator.clipboard.writeText(releaseNotesMarkdown.value);
  toast.success('Copiado al portapapeles');
};

onMounted(() => {
  loadVersions();
});
</script>

<style scoped>
.status-badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.status-badge.unreleased {
  background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0;
}
.status-badge.released {
  background: #ecfdf5; color: #059669; border: 1px solid #d1fae5;
}
.status-badge.archived {
  background: #fff1f2; color: #e11d48; border: 1px solid #ffe4e6;
}
</style>
