import { db } from '../database/client';

export class SprintService {
  static async getProjectSprints(projectId: string) {
    return await db.selectFrom('sprints')
      .selectAll()
      .where('project_id', '=', projectId)
      .orderBy('start_date', 'asc')
      .execute();
  }

  static async createSprint(data: { project_id: string; name: string; goal?: string; start_date?: Date; end_date?: Date }) {
    return await db.insertInto('sprints')
      .values({
        project_id: data.project_id,
        name: data.name,
        goal: data.goal || null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        status: 'PENDING'
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async updateSprint(sprintId: string, updates: any) {
    if (Object.keys(updates).length === 0) return null;
    
    return await db.updateTable('sprints')
      .set(updates)
      .where('id', '=', sprintId)
      .returningAll()
      .executeTakeFirst();
  }

  static async closeSprint(sprintId: string, targetSprintId?: string | null) {
    const sprint = await db.selectFrom('sprints').selectAll().where('id', '=', sprintId).executeTakeFirst();
    if (!sprint) throw new Error('Sprint no encontrado');

    // Marcar como COMPLETED
    await db.updateTable('sprints')
      .set({ status: 'COMPLETED', end_date: new Date() })
      .where('id', '=', sprintId)
      .execute();

    // Obtener columnas Done
    const doneColumns = await db.selectFrom('board_columns')
      .select('id')
      .where('project_id', '=', sprint.project_id)
      .where((eb) => eb.or([
        eb('name', 'ilike', '%done%'),
        eb('name', 'ilike', '%listo%'),
        eb('name', 'ilike', '%finalizad%')
      ]))
      .execute();

    const doneColumnIds = doneColumns.map(c => c.id);

    let pendingIssuesQuery = db.selectFrom('issues')
      .selectAll()
      .where('sprint_id', '=', sprintId);

    if (doneColumnIds.length > 0) {
      pendingIssuesQuery = pendingIssuesQuery.where('column_id', 'not in', doneColumnIds);
    }

    const pendingIssues = await pendingIssuesQuery.execute();
    const newSprintId = targetSprintId || null;

    if (pendingIssues.length > 0) {
      const pendingIds = pendingIssues.map(i => i.id);
      await db.updateTable('issues')
        .set({ sprint_id: newSprintId, updated_at: new Date() })
        .where('id', 'in', pendingIds)
        .execute();
    }

    return {
      success: true,
      completedSprintId: sprintId,
      movedCount: pendingIssues.length,
      targetSprintId: newSprintId
    };
  }
}
