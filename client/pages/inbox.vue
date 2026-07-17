<template>
  <NuxtLayout name="project">
    <div class="inbox-layout">
      <header class="inbox-header">
        <div class="header-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-txt-secondary">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <h2>Inbox</h2>
          <span class="unread-count" v-if="unreadCount > 0">{{ unreadCount }} nuevas</span>
        </div>
        <div class="header-actions">
          <button class="btn-secondary btn-sm" @click="markAllRead" v-if="unreadCount > 0">Marcar todo como leído</button>
        </div>
      </header>

      <div class="content-container">
        <div v-if="loading" class="empty-state">
          Cargando notificaciones...
        </div>
        <div v-else-if="notifications.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <p>No tienes notificaciones pendientes.</p>
          <span>Estás al día con todo.</span>
        </div>
        <div v-else class="notifications-list">
          <div 
            v-for="notif in notifications" 
            :key="notif.id" 
            class="notification-card"
            :class="{ 'unread': !notif.read_at }"
          >
            <div class="notif-indicator"></div>
            <div class="notif-avatar">
              <img v-if="notif.sender_avatar" :src="notif.sender_avatar" />
              <div v-else class="avatar-placeholder">{{ notif.sender_name?.charAt(0) || 'S' }}</div>
            </div>
            <div class="notif-content">
              <div class="notif-text">
                <span class="sender-name">{{ notif.sender_name || 'Sistema' }}</span>
                <span class="action-text">
                  {{ getActionText(notif.type) }}
                </span>
                <NuxtLink :to="`/board/${notif.issue_id}`" class="issue-link">
                  {{ notif.issue_key }}: {{ notif.issue_title }}
                </NuxtLink>
              </div>
              <span class="notif-time">{{ formatDate(notif.created_at) }}</span>
            </div>
            <div class="notif-actions">
              <button 
                v-if="!notif.read_at" 
                class="btn-icon" 
                title="Marcar como leída"
                @click="markRead(notif.id)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { $fetch } from 'ofetch';
import { useSocket } from '../composables/useSocket';

const notifications = ref<any[]>([]);
const loading = ref(true);

const { listenEvent } = useSocket();

const unreadCount = computed(() => notifications.value.filter(n => !n.read_at).length);

const loadNotifications = async () => {
  try {
    loading.value = true;
    const data = await $fetch('/api/notifications');
    notifications.value = data as any[];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const markRead = async (id: string) => {
  try {
    await $fetch('/api/notifications', {
      method: 'PATCH',
      body: { notification_id: id }
    });
    const n = notifications.value.find(x => x.id === id);
    if (n) n.read_at = new Date().toISOString();
  } catch (e) {
    console.error(e);
  }
};

const markAllRead = async () => {
  try {
    await $fetch('/api/notifications', {
      method: 'PATCH',
      body: { action: 'mark_all_read' }
    });
    notifications.value.forEach(n => n.read_at = new Date().toISOString());
  } catch (e) {
    console.error(e);
  }
};

const getActionText = (type: string) => {
  switch(type) {
    case 'ASSIGNMENT': return 'te ha asignado a la tarea';
    case 'MENTION': return 'te ha mencionado en';
    case 'COMMENT': return 'ha comentado en';
    case 'STATUS_CHANGE': return 'ha cambiado el estado de';
    default: return 'actualizó la tarea';
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('es-ES', { 
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
  }).format(d);
};

onMounted(() => {
  loadNotifications();
  
  listenEvent('notification:received', (newNotif: any) => {
    // Si la notificación es para mí, la añado arriba
    notifications.value.unshift(newNotif);
  });
});
</script>

<style scoped>
.inbox-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: #1e293b;
}

.inbox-header {
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(147, 51, 234, 0.1);
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-title h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}
.unread-count {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.btn-secondary {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.1);
  color: #9333ea;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
}
.btn-secondary:hover {
  background: rgba(147, 51, 234, 0.1);
}

.content-container {
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  color: #64748b;
  text-align: center;
}
.empty-icon {
  color: #10b981;
  margin-bottom: 16px;
  opacity: 0.8;
}
.empty-state p {
  color: #1e293b;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}
.empty-state span {
  font-size: 14px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(147, 51, 234, 0.1);
  border-radius: 12px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(147, 51, 234, 0.05);
}
.notification-card:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(147, 51, 234, 0.3);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.1);
}
.notification-card.unread {
  background: rgba(147, 51, 234, 0.05);
  border-color: rgba(147, 51, 234, 0.3);
}
.notif-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: transparent;
  transition: background 0.3s;
}
.notification-card.unread .notif-indicator {
  background: #9333ea;
  box-shadow: 0 0 8px rgba(147, 51, 234, 0.6);
}

.notif-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: #e2e8f0;
  flex-shrink: 0;
}
.notif-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #a855f7, #6366f1);
}

.notif-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.notif-text {
  font-size: 14px;
  line-height: 1.5;
  color: #64748b;
}
.sender-name {
  color: #1e293b;
  font-weight: 600;
}
.action-text {
  margin: 0 4px;
}
.issue-link {
  color: #9333ea;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.issue-link:hover {
  color: #a855f7;
  text-decoration: underline;
}
.notif-time {
  font-size: 11px;
  color: #94a3b8;
}

.notif-actions {
  display: flex;
  align-items: center;
}
.btn-icon {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-icon:hover {
  color: #9333ea;
  background: rgba(147, 51, 234, 0.1);
}
</style>
