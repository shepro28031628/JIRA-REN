<template>
  <div class="doc-tree-node">
    <div 
      class="node-content group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-200"
      :class="activePageId === page.id ? 'bg-purple-100/50 text-purple-700 font-medium shadow-sm border border-purple-200/30' : 'text-slate-600 hover:bg-white/50'"
      @click="select(page.id)"
    >
      <div class="node-left flex items-center gap-1.5 overflow-hidden flex-1">
        <button 
          v-if="hasChildren" 
          class="toggle-btn p-0.5 rounded transition-colors text-slate-400 hover:text-purple-600 hover:bg-purple-100/50"
          @click.stop="isExpanded = !isExpanded"
        >
          <ChevronRight 
            class="w-3.5 h-3.5 transition-transform duration-200" 
            :class="{ 'rotate-90': isExpanded }" 
            stroke-width="2" 
          />
        </button>
        <div v-else class="w-4"></div>
        
        <Folder v-if="hasChildren" class="w-4 h-4 text-purple-400" stroke-width="1.5" />
        <FileText v-else class="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" stroke-width="1.5" />
        
        <span class="node-title text-sm truncate">{{ page.title || 'Sin título' }}</span>
      </div>
      
      <div class="node-actions opacity-0 group-hover:opacity-100 transition-opacity">
        <button class="add-btn p-1 rounded text-slate-400 hover:text-purple-600 hover:bg-purple-100/50 transition-colors" @click.stop="$emit('create-child', page.id)" title="Añadir subpágina">
          <Plus class="w-3.5 h-3.5" stroke-width="2" />
        </button>
      </div>
    </div>

    <!-- Children -->
    <div v-show="isExpanded && hasChildren" class="node-children ml-3 pl-3 border-l border-purple-100/50 flex flex-col gap-0.5 mt-0.5">
      <DocTreeNode
        v-for="child in children"
        :key="child.id"
        :page="child"
        :all-pages="allPages"
        :active-page-id="activePageId"
        @select="$emit('select', $event)"
        @create-child="$emit('create-child', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChevronRight, Folder, FileText, Plus } from 'lucide-vue-next';

const props = defineProps<{
  page: any;
  allPages: any[];
  activePageId: string | null;
}>();

const emit = defineEmits(['select', 'create-child']);

const isExpanded = ref(true);

const children = computed(() => {
  return props.allPages.filter(p => p.parent_id === props.page.id);
});

const hasChildren = computed(() => children.value.length > 0);

const select = (id: string) => emit('select', id);
</script>
