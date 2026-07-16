<template>
  <div class="issue-card group" @click="$emit('click', issue)">
    <h4 class="issue-title">{{ issue.title }}</h4>
    <div class="issue-footer mt-3 flex items-center justify-between">
      <div class="footer-left flex items-center gap-2">
        <div :class="['type-icon', issue.type.toLowerCase()]">
          <!-- SVG Icons matching Plane types -->
          <svg v-if="issue.type.toLowerCase() === 'task'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
          <svg v-if="issue.type.toLowerCase() === 'bug'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <svg v-if="issue.type.toLowerCase() === 'story'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <svg v-if="issue.type.toLowerCase() === 'epic'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
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
defineProps<{
  issue: any;
  projectKey: string;
}>();
</script>

<style scoped>
.issue-card {
  background: var(--bg-surface-1);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 12px 14px;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.issue-card:active {
  cursor: grabbing;
}

.issue-card:hover {
  background: var(--bg-surface-2);
  border-color: var(--border-strong);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
  color: var(--txt-primary);
}

.issue-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.issue-key {
  font-size: 12px;
  color: var(--txt-secondary);
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
