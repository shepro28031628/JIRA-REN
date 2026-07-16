<template>
  <div class="page-tree-node">
    <div 
      class="node-content" 
      :class="{ 'is-active': activePageId === page.id }"
      @click="select(page.id)"
    >
      <div class="node-left">
        <button 
          v-if="hasChildren" 
          class="toggle-btn" 
          @click.stop="isExpanded = !isExpanded"
        >
          <svg 
            :class="{ 'is-expanded': isExpanded }"
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <div v-else class="empty-toggle"></div>
        
        <svg class="file-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <span class="node-title">{{ page.title || 'Sin título' }}</span>
      </div>
      
      <div class="node-actions">
        <button class="add-btn" @click.stop="$emit('create-child', page.id)" title="Añadir subpágina">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
    </div>

    <!-- Children -->
    <div v-if="isExpanded && hasChildren" class="node-children">
      <PageTreeNode
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

<style scoped>
.page-tree-node {
  display: flex;
  flex-direction: column;
}
.node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  transition: background 0.1s;
}
.node-content:hover {
  background: var(--bg-surface-2);
}
.node-content.is-active {
  background: var(--bg-surface-2);
  color: var(--txt-primary);
  font-weight: 500;
}
.node-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  overflow: hidden;
}
.toggle-btn {
  background: transparent;
  border: none;
  color: var(--txt-secondary);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}
.toggle-btn:hover {
  background: rgba(255,255,255,0.1);
}
.toggle-btn svg {
  transition: transform 0.2s;
}
.toggle-btn svg.is-expanded {
  transform: rotate(90deg);
}
.empty-toggle {
  width: 16px;
}
.file-icon {
  color: var(--txt-secondary);
}
.node-title {
  font-size: 13px;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.node-actions {
  display: flex;
  opacity: 0;
  transition: opacity 0.2s;
}
.node-content:hover .node-actions {
  opacity: 1;
}
.add-btn {
  background: transparent;
  border: none;
  color: var(--txt-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}
.add-btn:hover {
  background: rgba(255,255,255,0.1);
  color: var(--txt-primary);
}
.node-children {
  padding-left: 12px;
  margin-left: 8px;
  border-left: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 2px;
}
</style>
