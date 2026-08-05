import { db } from '../database/client';

export class IssueService {
  static async getIssuesByProject(projectId: string) {
    return await db.selectFrom('issues')
      .selectAll()
      .where('project_id', '=', projectId)
      .orderBy('position', 'asc')
      .execute();
  }

  static async createIssue(data: { 
    project_id: string; 
    title: string; 
    description?: string; 
    type?: 'STORY' | 'TASK' | 'BUG' | 'EPIC';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    column_id?: string;
  }) {
    // Transacción para autoincrementar el key_number del proyecto
    return await db.transaction().execute(async (trx) => {
      // Obtener el último key_number para este proyecto
      const lastIssue = await trx.selectFrom('issues')
        .select('key_number')
        .where('project_id', '=', data.project_id)
        .orderBy('key_number', 'desc')
        .limit(1)
        .executeTakeFirst();

      const nextKeyNumber = lastIssue ? lastIssue.key_number + 1 : 1;

      // Obtener la posición más alta en la columna para insertar al final
      const lastInColumn = data.column_id ? await trx.selectFrom('issues')
        .select('position')
        .where('column_id', '=', data.column_id)
        .orderBy('position', 'desc')
        .limit(1)
        .executeTakeFirst() : null;

      const nextPosition = lastInColumn ? lastInColumn.position + 1024 : 1024; // Espaciado amplio para drag & drop

      return await trx.insertInto('issues')
        .values({
          project_id: data.project_id,
          key_number: nextKeyNumber,
          title: data.title,
          description: data.description || null,
          type: data.type || 'TASK',
          priority: data.priority || 'MEDIUM',
          column_id: data.column_id || null,
          position: nextPosition,
        })
        .returningAll()
        .executeTakeFirst();
    });
  }

  static async updateIssuePosition(issueId: string, toColumnId: string, newPosition: number, currentUserId?: string) {
    // 1. Obtener columna de origen
    const issue = await db.selectFrom('issues').select('column_id').where('id', '=', issueId).executeTakeFirst();
    if (!issue) throw new Error('Issue no encontrado');
    
    // 2. Si se cambia de columna, validar workflow
    let postActions = [];
    if (issue.column_id && issue.column_id !== toColumnId && currentUserId) {
        // En importar WorkflowEngine asíncronamente para evitar dependencias circulares u organizar import arriba
        const { WorkflowEngine } = await import('../utils/workflowEngine');
        postActions = await WorkflowEngine.executeTransition(issueId, issue.column_id, toColumnId, currentUserId) || [];
    }

    let updateData: any = {
        column_id: toColumnId,
        position: newPosition,
        updated_at: new Date()
    };

    // 3. Procesar POST ACTIONS del Workflow
    if (postActions.length > 0) {
        for (const action of postActions) {
            if (action.action_key === 'ASSIGN_TO_CURRENT_USER' && currentUserId) {
                updateData.assignee_id = currentUserId;
            } else if (action.action_key === 'UNASSIGN') {
                updateData.assignee_id = null;
            } else if (action.action_key === 'SET_REMAINING_ZERO') {
                updateData.estimated_minutes = 0;
            }
        }
    }

    // Automatización por defecto: Al mover a una columna "Done" / "Listo", registrar tiempo faltante a 0
    const targetColumn = await db.selectFrom('board_columns').select('name').where('id', '=', toColumnId).executeTakeFirst();
    if (targetColumn && (targetColumn.name.toLowerCase().includes('done') || targetColumn.name.toLowerCase().includes('listo') || targetColumn.name.toLowerCase().includes('finalizad'))) {
      updateData.estimated_minutes = 0;
    }

    return await db.updateTable('issues')
      .set(updateData)
      .where('id', '=', issueId)
      .returningAll()
      .executeTakeFirst();
  }

  static async updateIssue(issueId: string, updates: Partial<{
    title: string;
    description: string;
    type: string;
    priority: string;
    assignee_id: string;
    column_id: string;
    sprint_id: string;
    epic_id: string;
    parent_id: string;
    estimated_minutes: number;
  }>) {
    if (Object.keys(updates).length === 0) return null;

    const oldIssue = await db.selectFrom('issues').select(['assignee_id', 'project_id']).where('id', '=', issueId).executeTakeFirst();

    const updateData = {
      ...updates,
      updated_at: new Date()
    };

    const updated = await db.updateTable('issues')
      .set(updateData)
      .where('id', '=', issueId)
      .returningAll()
      .executeTakeFirst();

    // Automatización: Notificación si se reasigna la tarea
    if (updates.assignee_id && oldIssue && updates.assignee_id !== oldIssue.assignee_id) {
      await db.insertInto('notifications').values({
        user_id: updates.assignee_id,
        issue_id: issueId,
        type: 'ASSIGNMENT'
      }).execute();
    }

    return updated;
  }

  // --- Sub-tareas ---
  static async getSubtasks(issueId: string) {
    return await db.selectFrom('issue_subtasks')
      .selectAll()
      .where('issue_id', '=', issueId)
      .orderBy('position', 'asc')
      .orderBy('created_at', 'asc')
      .execute();
  }

  static async createSubtask(issueId: string, title: string) {
    return await db.insertInto('issue_subtasks')
      .values({ issue_id: issueId, title, completed: false })
      .returningAll()
      .executeTakeFirst();
  }

  static async updateSubtask(subtaskId: string, updates: { completed?: boolean; title?: string }) {
    return await db.updateTable('issue_subtasks')
      .set(updates)
      .where('id', '=', subtaskId)
      .returningAll()
      .executeTakeFirst();
  }

  static async deleteSubtask(subtaskId: string) {
    return await db.deleteFrom('issue_subtasks')
      .where('id', '=', subtaskId)
      .execute();
  }

  // --- Labels (Etiquetas) ---
  static async getProjectLabels(projectId: string) {
    return await db.selectFrom('labels')
      .selectAll()
      .where('project_id', '=', projectId)
      .orderBy('name', 'asc')
      .execute();
  }

  static async getIssueLabels(issueId: string) {
    return await db.selectFrom('issue_labels')
      .innerJoin('labels', 'issue_labels.label_id', 'labels.id')
      .selectAll('labels')
      .where('issue_labels.issue_id', '=', issueId)
      .execute();
  }

  static async createLabel(projectId: string, name: string, color?: string) {
    return await db.insertInto('labels')
      .values({ project_id: projectId, name, color: color || '#3B82F6' })
      .returningAll()
      .executeTakeFirst();
  }

  static async setIssueLabels(issueId: string, labelIds: string[]) {
    await db.deleteFrom('issue_labels').where('issue_id', '=', issueId).execute();
    if (labelIds && labelIds.length > 0) {
      const values = labelIds.map(label_id => ({ issue_id: issueId, label_id }));
      await db.insertInto('issue_labels').values(values).execute();
    }
    return await this.getIssueLabels(issueId);
  }

  // --- Componentes ---
  static async getProjectComponents(projectId: string) {
    return await db.selectFrom('components')
      .selectAll()
      .where('project_id', '=', projectId)
      .orderBy('name', 'asc')
      .execute();
  }

  static async getIssueComponents(issueId: string) {
    return await db.selectFrom('issue_components')
      .innerJoin('components', 'issue_components.component_id', 'components.id')
      .selectAll('components')
      .where('issue_components.issue_id', '=', issueId)
      .execute();
  }

  static async createComponent(projectId: string, name: string, description?: string, lead_id?: string) {
    return await db.insertInto('components')
      .values({ project_id: projectId, name, description: description || null, lead_id: lead_id || null })
      .returningAll()
      .executeTakeFirst();
  }

  static async setIssueComponents(issueId: string, componentIds: string[]) {
    await db.deleteFrom('issue_components').where('issue_id', '=', issueId).execute();
    if (componentIds && componentIds.length > 0) {
      const values = componentIds.map(component_id => ({ issue_id: issueId, component_id }));
      await db.insertInto('issue_components').values(values).execute();
    }
    return await this.getIssueComponents(issueId);
  }
}
