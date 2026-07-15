import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useSocket } from '../composables/useSocket';

export const useBoardStore = defineStore('board', () => {
  const issues = ref<any[]>([]);
  const columns = ref<any[]>([]);
  const sprints = ref<any[]>([]);

  const { initSocket, emitEvent, listenEvent } = useSocket();

  const connectRealtime = async () => {
    await initSocket();
    
    // Escuchar movimientos de tareas hechos por otros clientes
    listenEvent('issue:moved', (data: any) => {
      const issue = issues.value.find(i => i.id === data.issueId);
      if (issue) {
        if (data.toColumnId !== undefined) issue.column_id = data.toColumnId;
        if (data.newPosition !== undefined) issue.position = data.newPosition;
        if (data.toSprintId !== undefined) issue.sprint_id = data.toSprintId;
      }
    });

    listenEvent('issue:created', (data: any) => {
      // Verificar que no exista ya para evitar duplicados en el cliente creador
      const exists = issues.value.some(i => i.id === data.id);
      if (!exists) {
        issues.value.push(data);
      }
    });

    listenEvent('issue:updated', (data: any) => {
      const issue = issues.value.find(i => i.id === data.issueId);
      if (issue) {
        // Merge updates
        Object.assign(issue, data.updates);
      }
    });
  };

  const moveIssueOptimistic = (issueId: string, toColumnId?: string, newPosition?: number, toSprintId?: string | null) => {
    // Actualizar optimísticamente en la UI actual
    const issue = issues.value.find(i => i.id === issueId);
    if (issue) {
      if (toColumnId !== undefined) issue.column_id = toColumnId;
      if (newPosition !== undefined) issue.position = newPosition;
      if (toSprintId !== undefined) issue.sprint_id = toSprintId;
    }
    
    // Emitir evento para otros clientes
    emitEvent('issue:moved', { issueId, toColumnId, newPosition, toSprintId });
  };

  const createIssueOptimistic = (newIssue: any) => {
    const exists = issues.value.some(i => i.id === newIssue.id);
    if (!exists) issues.value.push(newIssue);
    emitEvent('issue:created', newIssue);
  };

  const updateIssueOptimistic = (issueId: string, updates: any) => {
    const issue = issues.value.find(i => i.id === issueId);
    if (issue) Object.assign(issue, updates);
    emitEvent('issue:updated', { issueId, updates });
  };

  return {
    issues,
    columns,
    sprints,
    connectRealtime,
    moveIssueOptimistic,
    createIssueOptimistic,
    updateIssueOptimistic
  };
});
