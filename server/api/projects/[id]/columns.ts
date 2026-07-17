import { defineEventHandler, getRouterParam } from 'h3';
import { ProjectService } from '../../../services/project.service';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const projectId = getRouterParam(event, 'id');

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de proyecto es requerido' });
  }

  if (projectId === 'default') {
    return [];
  }

  if (method === 'GET') {
    return await ProjectService.getProjectColumns(projectId);
  }
});
