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
}
