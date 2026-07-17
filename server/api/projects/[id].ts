import { defineEventHandler, getRouterParam } from 'h3';
import { ProjectService } from '../../services/project.service';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID es requerido' });
  }

  if (id === 'default') {
    return null;
  }

  if (method === 'GET') {
    const project = await ProjectService.getProjectById(id);
    if (!project) {
      throw createError({ statusCode: 404, statusMessage: 'Proyecto no encontrado' });
    }
    return project;
  }
});
