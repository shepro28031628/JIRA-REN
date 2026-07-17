import { defineEventHandler, getRouterParam } from 'h3';
import { db } from '../../../database/client';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id');

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de proyecto es requerido' });
  }

  if (projectId === 'default') {
    return [];
  }

  // Obtenemos los miembros del proyecto
  const members = await db
    .selectFrom('project_members')
    .innerJoin('users', 'users.id', 'project_members.user_id')
    .select([
      'users.id',
      'users.name',
      'users.email',
      'users.avatar_url',
      'project_members.role'
    ])
    .where('project_members.project_id', '=', projectId)
    .execute();

  // Para cada miembro, calculamos su carga de trabajo en el proyecto
  const workloadPromises = members.map(async (member) => {
    // Buscar issues asignados al miembro en este proyecto
    const issues = await db
      .selectFrom('issues')
      .select(['id', 'estimated_minutes'])
      .where('project_id', '=', projectId)
      .where('assignee_id', '=', member.id)
      .execute();

    const issueCount = issues.length;
    const totalEstimated = issues.reduce((sum, issue) => sum + (issue.estimated_minutes || 0), 0);

    // Sumar el tiempo registrado en estas tareas, sin importar quién lo registró (o solo el tiempo registrado por el miembro, depende del enfoque, asumiremos que cuenta todo el tiempo registrado en sus tareas asignadas, o mejor, todo el tiempo registrado *por él* en el proyecto).
    // Tomaremos el tiempo que el usuario haya registrado en los time_logs de las issues de este proyecto.
    
    // Mejor enfoque: tiempo registrado en sus tareas
    const issueIds = issues.map(i => i.id);
    let totalLogged = 0;
    
    if (issueIds.length > 0) {
      const logs = await db
        .selectFrom('time_logs')
        .select(['duration_minutes'])
        .where('issue_id', 'in', issueIds)
        .execute();
        
      totalLogged = logs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
    }

    return {
      ...member,
      workload: {
        issueCount,
        totalEstimatedMinutes: totalEstimated,
        totalLoggedMinutes: totalLogged
      }
    };
  });

  const teamWithWorkload = await Promise.all(workloadPromises);

  return teamWithWorkload;
});
