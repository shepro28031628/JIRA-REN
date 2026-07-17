<template>
  <div class="issue-card group transform-gpu" :class="`border-l-priority-${issue.priority.toLowerCase()}`" @click="$emit('click', issue)">
    <h4 class="issue-title">{{ issue.title }}</h4>
    <div class="issue-footer mt-3 flex items-center justify-between">
      <div class="footer-left flex items-center gap-2">
        <div :class="['type-icon', issue.type.toLowerCase()]">
          <CheckSquare v-if="issue.type.toLowerCase() === 'task'" class="w-3.5 h-3.5" stroke-width="2" />
          <Bug v-if="issue.type.toLowerCase() === 'bug'" class="w-3.5 h-3.5" stroke-width="2" />
          <Bookmark v-if="issue.type.toLowerCase() === 'story'" class="w-3.5 h-3.5" stroke-width="2" />
          <Zap v-if="issue.type.toLowerCase() === 'epic'" class="w-3.5 h-3.5" stroke-width="2" />
        </div>
        <span class="issue-key text-xs text-txt-secondary font-medium">{{ projectKey }}-{{ issue.key_number }}</span>
      </div>
      <div class="footer-right flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
        <span :class="['tag-priority', issue.priority.toLowerCase()]">{{ issue.priority }}</span>
        <div class="avatar w-5 h-5 rounded-full bg-brand-default border border-border-subtle flex items-center justify-center text-[9px] font-bold text-white" v-if="issue.assignee_id" :title="issue.assignee_id">
          {{ issue.assignee_id.substring(0, 1).toUpperCase() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckSquare, Bug, Bookmark, Zap } from 'lucide-vue-next';

defineProps<{
  issue: any;
  projectKey: string;
}>();
</script>

<style scoped>
.issue-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 1);
  box-shadow: 0 2px 4px rgba(147, 51, 234, 0.02);
  border-radius: 12px;
  padding: 16px;
  cursor: grab;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  position: relative;
  overflow: hidden;
}

.border-l-priority-low { border-left: 3px solid #e2e8f0; }
.border-l-priority-medium { border-left: 3px solid #a855f7; }
.border-l-priority-high { 
  border-left: 3px solid transparent; 
  background-image: linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), linear-gradient(to bottom, #fb7185, #a855f7);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}
.border-l-priority-critical { 
  border-left: 3px solid transparent; 
  background-image: linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), linear-gradient(to bottom, #ef4444, #fb7185);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}

.issue-card:active {
  cursor: grabbing;
}

.issue-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(147, 51, 234, 0.3);
  box-shadow: 0 12px 32px rgba(147, 51, 234, 0.15);
}

.issue-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.tag-type, .tag-priority {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: capitalize;
  letter-spacing: 0.2px;
}

.type-icon { display: flex; align-items: center; justify-content: center; }
.type-icon.task { color: var(--label-indigo-border); }
.type-icon.bug { color: var(--label-crimson-border); }
.type-icon.story { color: var(--label-emerald-border); }
.type-icon.epic { color: var(--label-purple-border); }

.tag-priority.low { color: var(--text-color-priority-low, #a1a1aa); border: 1px solid var(--border-subtle); background: var(--bg-surface-1); }
.tag-priority.medium { color: var(--text-color-priority-medium, #faad14); border: 1px solid var(--border-subtle); background: var(--bg-surface-1); }
.tag-priority.high { color: var(--text-color-priority-high, #ff4d4f); border: 1px solid var(--border-subtle); background: var(--bg-surface-1); }
.tag-priority.critical { color: var(--text-color-priority-urgent, #ff4d4f); border: 1px solid var(--border-danger-subtle); background: var(--bg-danger-subtle); }

.issue-title {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  color: #1e293b;
}

.issue-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.issue-key {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bg-accent-primary);
  border: 1px solid var(--border-subtle);
}
</style>
