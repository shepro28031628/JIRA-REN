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

  static async updateIssuePosition(issueId: string, toColumnId: string, newPosition: number) {
    return await db.updateTable('issues')
      .set({
        column_id: toColumnId,
        position: newPosition,
        updated_at: new Date()
      })
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
  }>) {
    // Evitamos actualizar si no hay campos
    if (Object.keys(updates).length === 0) return null;

    // Aseguramos que se actualice la fecha de modificación
    const updateData = {
      ...updates,
      updated_at: new Date()
    };

    return await db.updateTable('issues')
      .set(updateData)
      .where('id', '=', issueId)
      .returningAll()
      .executeTakeFirst();
  }
}
