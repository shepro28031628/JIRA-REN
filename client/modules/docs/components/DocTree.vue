<template>
  <div class="doc-tree bg-white/40 backdrop-blur-md h-full rounded-xl shadow-sm border border-white/50 p-2 overflow-y-auto">
    <div v-if="rootPages.length === 0" class="empty-tree text-slate-500 text-sm text-center py-4">
      No hay páginas. Haz clic en "+" para crear una.
    </div>
    
    <div class="tree-nodes flex flex-col gap-1">
      <DocTreeNode
        v-for="page in rootPages"
        :key="page.id"
        :page="page"
        :all-pages="pages"
        :active-page-id="activePageId"
        @select="$emit('select', $event)"
        @create-child="$emit('create-child', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DocTreeNode from './DocTreeNode.vue';

const props = defineProps<{
  pages: any[];
  activePageId: string | null;
}>();

defineEmits(['select', 'create-child']);

const rootPages = computed(() => {
  return props.pages.filter(p => !p.parent_id);
});
</script>
