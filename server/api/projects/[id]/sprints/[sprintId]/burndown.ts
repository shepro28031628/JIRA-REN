import { defineEventHandler, getRouterParam, createError } from 'h3';
import { db } from '../../../../../database/client';

export default defineEventHandler(async (event) => {
  const sprintId = getRouterParam(event, 'sprintId');

  if (!sprintId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de sprint es requerido' });
  }

  // 1. Obtener el sprint para conocer fechas
  const sprint = await db.selectFrom('sprints')
    .selectAll()
    .where('id', '=', sprintId)
    .executeTakeFirst();

  if (!sprint) {
    throw createError({ statusCode: 404, statusMessage: 'Sprint no encontrado' });
  }

  // 2. Obtener todas las issues del sprint
  const issues = await db.selectFrom('issues')
    .selectAll()
    .where('sprint_id', '=', sprintId)
    .execute();

  // MOCK o simplificación del burndown: 
  // Asumiremos que el Sprint dura 7 días por defecto si no tiene fechas
  const start = sprint.start_date ? new Date(sprint.start_date) : new Date();
  const end = sprint.end_date ? new Date(sprint.end_date) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
  const totalIssues = issues.length;

  const labels = [];
  const idealData = [];
  const realData = [];

  let remaining = totalIssues;
  
  // Agrupar tareas cerradas por fecha de actualización
  // Asumiendo que "Done" column tiene algún ID o simplemente usamos 'updated_at' 
  // para simplificar el gráfico de demostración.
  // En un caso real buscaríamos las que están en columna "Listo".
  
  for (let i = 0; i <= totalDays; i++) {
    const currentDay = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    labels.push(`Día ${i}`);
    
    // Linea ideal
    const idealRemaining = Math.max(0, totalIssues - (totalIssues / totalDays) * i);
    idealData.push(parseFloat(idealRemaining.toFixed(1)));
    
    // Linea real simulada: restamos tareas que se hayan actualizado antes o en este día
    const closedOnOrBefore = issues.filter(issue => {
      // Simplificamos: si ya pasaron 2 días, marcamos algunas como cerradas
      // Para un proyecto real aquí verificarías el historial o la columna 'Done'
      return new Date(issue.updated_at) <= currentDay && issue.column_id; // && column_id === 'DONE_ID'
    }).length;
    
    // Solo para dar datos de prueba (en un sistema con historial esto se consulta real)
    realData.push(totalIssues - closedOnOrBefore);
  }

  const resolvedIssues = issues.filter(i => new Date(i.updated_at) < new Date());
  
  // Tareas en los últimos 7 días
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const createdLastWeek = issues.filter(i => new Date(i.created_at) >= oneWeekAgo).length;
  const resolvedLastWeek = resolvedIssues.filter(i => new Date(i.updated_at) >= oneWeekAgo).length;

  return {
    labels,
    series: [
      { name: 'Línea Ideal', data: idealData },
      { name: 'Restantes', data: realData }
    ],
    kpis: {
      completionPercentage: totalIssues ? Math.round((resolvedIssues.length / totalIssues) * 100) : 0,
      createdVsResolved: `${createdLastWeek} / ${resolvedLastWeek}`,
      avgEstimatedTime: '4.5h' // Mock, ya que no tenemos campo de time tracking en la bd actual
    }
  };
});
