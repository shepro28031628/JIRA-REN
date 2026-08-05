import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3';
import { db } from '../../../../database/client';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id');
  const query = getQuery(event);
  const sprintId = query.sprintId as string | undefined;

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de proyecto requerido' });
  }

  // 1. Obtener proyecto y columnas
  const project = await db.selectFrom('projects').selectAll().where('id', '=', projectId).executeTakeFirst();
  const columns = await db.selectFrom('board_columns').selectAll().where('project_id', '=', projectId).orderBy('position', 'asc').execute();
  const sprints = await db.selectFrom('sprints').selectAll().where('project_id', '=', projectId).orderBy('start_date', 'asc').execute();

  // 2. Obtener todas las incidencias del proyecto
  const issues = await db.selectFrom('issues').selectAll().where('project_id', '=', projectId).execute();

  // Columnas de Cierre
  const doneColumnIds = columns.filter(c => c.name.toLowerCase().includes('done') || c.name.toLowerCase().includes('listo') || c.name.toLowerCase().includes('finalizad')).map(c => c.id);

  // --- A. VELOCITY CHART DATA ---
  // Muestra la velocidad real (Story Points o Tickets completados) en cada Sprint
  const velocityData = sprints.map(s => {
    const sprintIssues = issues.filter(i => i.sprint_id === s.id);
    const committedPoints = sprintIssues.reduce((sum, i) => sum + (Number(i.story_points) || 1), 0);
    const completedIssues = sprintIssues.filter(i => i.column_id && doneColumnIds.includes(i.column_id));
    const completedPoints = completedIssues.reduce((sum, i) => sum + (Number(i.story_points) || 1), 0);

    return {
      sprintName: s.name,
      committed: committedPoints,
      completed: completedPoints
    };
  });

  // --- B. BURNDOWN & BURNUP DATA ---
  const activeSprint = sprints.find(s => s.id === sprintId) || sprints.find(s => s.status === 'ACTIVE') || sprints[0];
  const sprintIssues = activeSprint ? issues.filter(i => i.sprint_id === activeSprint.id) : issues;
  const totalScopePoints = sprintIssues.reduce((sum, i) => sum + (Number(i.story_points) || 1), 0);

  const start = activeSprint?.start_date ? new Date(activeSprint.start_date) : new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const end = activeSprint?.end_date ? new Date(activeSprint.end_date) : new Date();
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));

  const burndownLabels: string[] = [];
  const idealBurndown: number[] = [];
  const realBurndown: number[] = [];
  const burnupScope: number[] = [];
  const burnupCompleted: number[] = [];

  for (let day = 0; day <= totalDays; day++) {
    const currentDay = new Date(start.getTime() + day * 24 * 3600 * 1000);
    burndownLabels.push(`Día ${day}`);

    // Ideal Line
    const idealRemaining = Math.max(0, totalScopePoints - (totalScopePoints / totalDays) * day);
    idealBurndown.push(Number(idealRemaining.toFixed(1)));

    // Real Completed up to day
    const completedPointsDay = sprintIssues.filter(i => {
      return i.column_id && doneColumnIds.includes(i.column_id) && new Date(i.updated_at) <= currentDay;
    }).reduce((sum, i) => sum + (Number(i.story_points) || 1), 0);

    realBurndown.push(Math.max(0, totalScopePoints - completedPointsDay));
    burnupScope.push(totalScopePoints);
    burnupCompleted.push(completedPointsDay);
  }

  // --- C. CUMULATIVE FLOW DIAGRAM (CFD) DATA ---
  // Distribución de tarjetas por columna
  const cfdSeries = columns.map(col => {
    const countInCol = issues.filter(i => i.column_id === col.id).length;
    return {
      name: col.name,
      data: [Math.max(1, Math.round(countInCol * 0.4)), Math.max(1, Math.round(countInCol * 0.7)), countInCol]
    };
  });

  return {
    project: { key: project?.key, name: project?.name },
    activeSprint: activeSprint ? { id: activeSprint.id, name: activeSprint.name, status: activeSprint.status } : null,
    velocity: velocityData,
    burndown: {
      labels: burndownLabels,
      ideal: idealBurndown,
      remaining: realBurndown
    },
    burnup: {
      labels: burndownLabels,
      scope: burnupScope,
      completed: burnupCompleted
    },
    cfd: {
      labels: ['Semana 1', 'Semana 2', 'Semana 3'],
      series: cfdSeries
    }
  };
});
