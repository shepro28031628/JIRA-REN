<template>
  <Transition name="kmenu-fade">
    <div v-if="isOpen" class="kmenu-overlay" @click.self="closeMenu">
      <div 
        class="kmenu-modal bg-white/60 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-purple-900/20 transform-gpu"
        v-motion
        :initial="{ opacity: 0, scale: 0.95, y: -20 }"
        :enter="{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }"
      >
        <div class="kmenu-header flex items-center px-5 py-4 border-b border-white/50">
          <Search class="w-5 h-5 text-purple-400 mr-3" stroke-width="2" />
          <input 
            ref="searchInput"
            v-model="searchQuery" 
            class="flex-1 bg-transparent border-none outline-none text-slate-800 text-lg placeholder-slate-400" 
            placeholder="Buscar tareas, documentos o personas..." 
            @keydown.esc="closeMenu"
          />
          <div class="flex gap-1">
            <span class="kbd">Esc</span>
          </div>
        </div>

        <div class="kmenu-body max-h-[50vh] overflow-y-auto p-3">
          <!-- Resultados -->
          <div v-if="filteredResults.length > 0" class="flex flex-col gap-1">
            <div 
              v-for="(item, index) in filteredResults" 
              :key="item.id || index"
              class="result-item group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200"
              :class="{ 'bg-purple-50/80 text-purple-700 shadow-sm border border-purple-100/50': selectedIndex === index, 'border border-transparent': selectedIndex !== index }"
              @mouseenter="selectedIndex = index"
              @click="executeAction(item)"
            >
              <div class="icon-wrapper w-8 h-8 rounded-lg flex items-center justify-center" :class="item.iconClass">
                <component :is="item.icon" class="w-4 h-4" stroke-width="2" />
              </div>
              <div class="flex flex-col flex-1">
                <span class="text-sm font-semibold text-slate-700">{{ item.title }}</span>
                <span class="text-xs text-slate-500">{{ item.subtitle }}</span>
              </div>
              <Command class="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          
          <div v-else class="py-12 flex flex-col items-center justify-center text-slate-400">
            <Search class="w-8 h-8 mb-3 opacity-20" />
            <p class="text-sm font-medium">No se encontraron resultados para "{{ searchQuery }}"</p>
          </div>
        </div>

        <div class="kmenu-footer px-5 py-3 border-t border-white/50 flex justify-between items-center text-xs text-slate-500 bg-white/40">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1"><Command class="w-3 h-3" /> para navegar</span>
            <span class="flex items-center gap-1"><span class="kbd">Enter</span> seleccionar</span>
          </div>
          <div class="flex items-center gap-1">
            <SlidersHorizontal class="w-3.5 h-3.5" /> JIRA-REN Global Search
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
import { Search, Command, SlidersHorizontal, Tag, FileText, User, CheckCircle2 } from 'lucide-vue-next';
import { useRouter } from '#app';

const isOpen = ref(false);
const searchQuery = ref('');
const searchInput = ref<HTMLInputElement | null>(null);
const selectedIndex = ref(0);
const router = useRouter();

// Mock data for search
const allItems = [
  { id: '1', title: 'Implementar WebSockets', subtitle: 'Tarea en JIRA-101', type: 'issue', icon: CheckCircle2, iconClass: 'bg-emerald-100 text-emerald-600' },
  { id: '2', title: 'Diseño de Base de Datos', subtitle: 'Documento en Wiki', type: 'doc', icon: FileText, iconClass: 'bg-blue-100 text-blue-600' },
  { id: '3', title: 'María González', subtitle: 'Frontend Developer', type: 'user', icon: User, iconClass: 'bg-purple-100 text-purple-600' },
  { id: '4', title: 'Corregir Bug de Login', subtitle: 'Tarea en JIRA-105', type: 'issue', icon: CheckCircle2, iconClass: 'bg-emerald-100 text-emerald-600' },
  { id: '5', title: 'Guía de Estilos', subtitle: 'Documento en Wiki', type: 'doc', icon: FileText, iconClass: 'bg-blue-100 text-blue-600' },
];

const filteredResults = computed(() => {
  if (!searchQuery.value) return allItems.slice(0, 4);
  const q = searchQuery.value.toLowerCase();
  return allItems.filter(i => i.title.toLowerCase().includes(q) || i.subtitle.toLowerCase().includes(q));
});

const openMenu = () => {
  isOpen.value = true;
  searchQuery.value = '';
  selectedIndex.value = 0;
  nextTick(() => {
    if (searchInput.value) searchInput.value.focus();
  });
};

const closeMenu = () => {
  isOpen.value = false;
};

const executeAction = (item: any) => {
  // En un caso real, navegarías al item
  console.log('Navigating to', item);
  closeMenu();
};

const handleGlobalKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    openMenu();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
  
  // Soporte de navegación por teclado en el modal
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!isOpen.value || filteredResults.value.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex.value = (selectedIndex.value + 1) % filteredResults.value.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex.value = (selectedIndex.value - 1 + filteredResults.value.length) % filteredResults.value.length;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeAction(filteredResults.value[selectedIndex.value]);
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<style scoped>
.kmenu-overlay {
  position: fixed; inset: 0; background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px); display: flex; align-items: flex-start; justify-content: center; 
  padding-top: 15vh; z-index: 9999;
}
.kmenu-fade-enter-active, .kmenu-fade-leave-active { transition: opacity 0.3s ease; }
.kmenu-fade-enter-from, .kmenu-fade-leave-to { opacity: 0; }

.kmenu-modal {
  width: 100%; max-width: 600px; border-radius: 16px; overflow: hidden;
}

.kbd {
  background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.1); border-radius: 4px;
  padding: 2px 6px; font-size: 10px; font-weight: 600; color: #64748b; font-family: monospace;
}
</style>
