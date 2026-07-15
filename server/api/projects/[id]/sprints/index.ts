import { defineEventHandler, getRouterParam, readBody, createError } from 'h3';
import { SprintService } from '../../../../services/sprint.service';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const projectId = getRouterParam(event, 'id');

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de proyecto es requerido' });
  }

  if (method === 'GET') {
    return await SprintService.getProjectSprints(projectId);
  }

  if (method === 'POST') {
    const body = await readBody(event);
    if (!body.name) {
      throw createError({ statusCode: 400, statusMessage: 'El nombre del sprint es requerido' });
    }

    return await SprintService.createSprint({
      project_id: projectId,
      name: body.name,
      goal: body.goal,
      start_date: body.start_date,
      end_date: body.end_date
    });
  }
});
