<template>
  <div class="issue-card" @click="$emit('click', issue)">
    <div class="issue-tags">
      <span :class="['tag-type', issue.type.toLowerCase()]">{{ issue.type }}</span>
      <span :class="['tag-priority', issue.priority.toLowerCase()]">{{ issue.priority }}</span>
    </div>
    <h4 class="issue-title">{{ issue.title }}</h4>
    <div class="issue-footer">
      <span class="issue-key">{{ projectKey }}-{{ issue.key_number }}</span>
      <div class="avatar" v-if="issue.assignee_id" :title="issue.assignee_id"></div>
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.issue-card:active {
  cursor: grabbing;
}

.issue-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.15);
}

.issue-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.tag-type, .tag-priority {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tag-type.task { background: rgba(79, 172, 254, 0.15); color: #4facfe; }
.tag-type.bug { background: rgba(255, 77, 79, 0.15); color: #ff4d4f; }
.tag-type.story { background: rgba(82, 196, 26, 0.15); color: #52c41a; }
.tag-type.epic { background: rgba(138, 43, 226, 0.15); color: #8a2be2; }

.tag-priority.low { color: #a1a1aa; background: rgba(255, 255, 255, 0.05); }
.tag-priority.medium { color: #faad14; background: rgba(250, 173, 20, 0.15); }
.tag-priority.high { color: #ff4d4f; background: rgba(255, 77, 79, 0.1); }
.tag-priority.critical { color: #fff; background: #ff4d4f; }

.issue-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 12px;
  color: #fff;
}

.issue-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.issue-key {
  font-size: 12px;
  color: #71717a;
  font-weight: 600;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4facfe, #8a2be2);
  border: 2px solid #1e1e2f;
}
</style>
