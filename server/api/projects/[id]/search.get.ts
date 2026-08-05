import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3';
import { db } from '../../../database/client';
import { JQLParser } from '../../../utils/jqlParser';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id');
  const query = getQuery(event);
  const jql = query.jql as string;

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'Se requiere ID del proyecto' });
  }

  // Obtenemos el usuario autenticado (simulado para este contexto)
  const user = event.context.user; // Esto asume que hay un middleware de Auth que inyecta user
  const currentUserId = user?.id;

  // Analizar la consulta JQL
  let jqlCondition;
  try {
    jqlCondition = JQLParser.parse(jql, currentUserId);
  } catch (e: any) {
    throw createError({ statusCode: 400, statusMessage: 'Error de sintaxis JQL: ' + e.message });
  }

  // Construir la consulta a la base de datos
  // Hacemos JOIN con board_columns, users (assignee), y projects para poder filtrar adecuadamente
  let baseQuery = db.selectFrom('issues')
    .leftJoin('board_columns', 'issues.column_id', 'board_columns.id')
    .leftJoin('projects', 'issues.project_id', 'projects.id')
    .leftJoin('users as assignee_user', 'issues.assignee_id', 'assignee_user.id')
    .selectAll('issues')
    .select([
      'board_columns.name as column_name',
      'assignee_user.name as assignee_name',
      'projects.key as project_key'
    ])
    .where('issues.project_id', '=', projectId);

  // Si hay una condición JQL generada, la aplicamos (usando db.raw o andWhere)
  if (jql && jql.trim() !== '') {
    baseQuery = baseQuery.where(jqlCondition);
  }

  const results = await baseQuery.execute();

  return {
    results,
    count: results.length
  };
});
