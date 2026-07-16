<template>
  <div class="page-tree">
    <div v-if="rootPages.length === 0" class="empty-tree">
      No hay páginas. Haz clic en "+" para crear una.
    </div>
    
    <div class="tree-nodes">
      <PageTreeNode
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
import PageTreeNode from './PageTreeNode.vue';

const props = defineProps<{
  pages: any[];
  activePageId: string | null;
}>();

defineEmits(['select', 'create-child']);

const rootPages = computed(() => {
  return props.pages.filter(p => !p.parent_id);
});
</script>

<style scoped>
.page-tree {
  display: flex;
  flex-direction: column;
}
.empty-tree {
  padding: 12px;
  font-size: 13px;
  color: var(--txt-secondary);
  text-align: center;
}
.tree-nodes {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
