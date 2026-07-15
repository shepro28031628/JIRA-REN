import { db } from '../database/client';

export class ProjectService {
  static async getAllProjects() {
    return await db.selectFrom('projects')
      .selectAll()
      .orderBy('created_at', 'desc')
      .execute();
  }

  static async getProjectById(id: string) {
    return await db.selectFrom('projects')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static async createProject(data: { key: string; name: string; description?: string; owner_id?: string }) {
    return await db.insertInto('projects')
      .values({
        key: data.key.toUpperCase(),
        name: data.name,
        description: data.description || null,
        owner_id: data.owner_id || null,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async getProjectColumns(projectId: string) {
    const columns = await db.selectFrom('board_columns')
      .selectAll()
      .where('project_id', '=', projectId)
      .orderBy('position', 'asc')
      .execute();

    if (columns.length === 0) {
      // Generar columnas por defecto si el proyecto no tiene ninguna
      const defaultColumns = [
        { project_id: projectId, name: 'Por Hacer', position: 1000 },
        { project_id: projectId, name: 'En Progreso', position: 2000 },
        { project_id: projectId, name: 'Listo', position: 3000 }
      ];
      
      const inserted = await db.insertInto('board_columns')
        .values(defaultColumns)
        .returningAll()
        .execute();
        
      return inserted.sort((a, b) => a.position - b.position);
    }
    
    return columns;
  }
}
