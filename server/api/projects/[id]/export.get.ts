import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3';
import { db } from '../../../database/client';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id');
  const query = getQuery(event);
  const format = ((query.format as string) || 'json').toLowerCase();
  const sprintId = query.sprintId as string | undefined;

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de proyecto requerido' });
  }

  // Obtener información del proyecto
  const project = await db.selectFrom('projects')
    .selectAll()
    .where('id', '=', projectId)
    .executeTakeFirst();

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Proyecto no encontrado' });
  }

  // Obtener incidencias
  let issueQuery = db.selectFrom('issues')
    .leftJoin('board_columns', 'issues.column_id', 'board_columns.id')
    .leftJoin('users as assignee_user', 'issues.assignee_id', 'assignee_user.id')
    .leftJoin('users as reporter_user', 'issues.reporter_id', 'reporter_user.id')
    .selectAll('issues')
    .select([
      'board_columns.name as column_name',
      'assignee_user.name as assignee_name',
      'reporter_user.name as reporter_name'
    ])
    .where('issues.project_id', '=', projectId);

  if (sprintId) {
    issueQuery = issueQuery.where('issues.sprint_id', '=', sprintId);
  }

  const issues = await issueQuery.orderBy('issues.key_number', 'asc').execute();

  if (format === 'csv') {
    const headers = ['Clave', 'Titulo', 'Tipo', 'Prioridad', 'Estado', 'Asignado', 'Reportador', 'Tiempo Estimado (min)', 'Fecha Creacion'];
    const rows = issues.map(i => [
      `"${project.key}-${i.key_number}"`,
      `"${(i.title || '').replace(/"/g, '""')}"`,
      `"${i.type}"`,
      `"${i.priority}"`,
      `"${i.column_name || ''}"`,
      `"${i.assignee_name || ''}"`,
      `"${i.reporter_name || ''}"`,
      i.estimated_minutes || 0,
      `"${i.created_at}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    event.node.res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    event.node.res.setHeader('Content-Disposition', `attachment; filename="${project.key}-reporte.csv"`);
    return csvContent;
  }

  if (format === 'json') {
    return {
      project: {
        key: project.key,
        name: project.name,
        description: project.description
      },
      total_issues: issues.length,
      exported_at: new Date(),
      issues
    };
  }

  // Default: JSON report snapshot
  return {
    project: {
      key: project.key,
      name: project.name
    },
    count: issues.length,
    issues
  };
});
