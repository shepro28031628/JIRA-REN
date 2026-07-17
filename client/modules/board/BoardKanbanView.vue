<template>
  <!-- Skeleton Loading -->
  <div class="board-container" v-if="loading">
    <div v-for="i in 3" :key="i" class="kanban-column skeleton-col">
      <div class="column-header"><div class="skel-text"></div></div>
      <div class="column-body">
        <div v-for="j in 3" :key="j" class="issue-card skeleton-card"></div>
      </div>
    </div>
  </div>

  <div class="board-container" v-else>
    <div v-for="(column, index) in columns" :key="column.id" class="kanban-column" v-motion-slide-visible-bottom :delay="index * 50">
      <div class="column-header">
        <div class="flex items-center gap-2">
          <h3>{{ column.name }}</h3>
          <span class="issue-count">{{ getColumnIssues(column.id).length }}</span>
        </div>
        <button class="add-issue-btn" @click="$emit('create', column.id)" title="Añadir tarea">
          <Plus class="w-3.5 h-3.5" stroke-width="2" />
        </button>
      </div>
      
      <draggable
        :list="getColumnIssues(column.id)"
        item-key="id"
        group="issues"
        class="column-body"
        ghost-class="ghost-card"
        drag-class="drag-card"
        v-bind="dragOptions"
        @change="$emit('dragChange', $event, column.id)"
      >
        <template #item="{ element }">
          <IssueCard 
            :issue="element" 
            :projectKey="projectKey" 
            @click="$emit('details', element)"
          />
        </template>
      </draggable>
      <EmptyState 
        v-if="!getColumnIssues(column.id).length" 
        title="Sin tareas" 
        description="Arrastra una tarea aquí o crea una nueva para comenzar." 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import draggable from 'vuedraggable';
import IssueCard from './IssueCard.vue';
import EmptyState from '../../components/EmptyState.vue';

defineProps<{
  loading: boolean;
  columns: any[];
  getColumnIssues: (id: string) => any[];
  dragOptions: any;
  projectKey: string;
}>();

defineEmits(['create', 'details', 'dragChange']);
</script>

<style scoped>
.board-container {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 24px;
  overflow-x: auto;
  overflow-y: hidden;
  align-items: flex-start;
}

.kanban-column {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 12px;
  width: 320px;
  min-width: 320px;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px -4px rgba(147, 51, 234, 0.05);
}

.column-header {
  padding: 8px 12px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-issue-btn {
  background: transparent;
  color: var(--txt-secondary);
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0;
}
.column-header:hover .add-issue-btn { opacity: 1; }
.add-issue-btn:hover { background: var(--bg-surface-2); color: var(--txt-primary); }

.column-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  text-transform: capitalize;
}

.issue-count {
  background: var(--bg-surface-2);
  color: var(--txt-secondary);
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
}

.column-body {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 150px;
}

:deep(.ghost-card) {
  opacity: 0.3 !important;
  background: rgba(147, 51, 234, 0.1) !important;
  border: 1px dashed rgba(147, 51, 234, 0.5) !important;
  transform: scale(0.98);
}

:deep(.drag-card) {
  transform: scale(1.02) rotate(2deg) !important;
  box-shadow: 0 12px 32px rgba(147, 51, 234, 0.25) !important;
  cursor: grabbing !important;
}

.skeleton-col {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.7);
}
.skeleton-card {
  height: 120px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.6);
}
.skel-text { position: relative; overflow: hidden; width: 100px; height: 16px; background: rgba(255,255,255,0.4); border-radius: 4px; }

.skeleton-card::after, .skel-text::after {
  content: "";
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
