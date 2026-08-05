import { defineEventHandler, getRouterParam, readBody, getMethod, createError } from 'h3';
import { IssueService } from '../../../services/issue.service';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id');
  const method = getMethod(event);

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de proyecto requerido' });
  }

  if (method === 'GET') {
    return await IssueService.getProjectComponents(projectId);
  }

  if (method === 'POST') {
    const body = await readBody(event);
    if (!body?.name) {
      throw createError({ statusCode: 400, statusMessage: 'Nombre del componente requerido' });
    }
    return await IssueService.createComponent(projectId, body.name, body.description, body.lead_id);
  }

  throw createError({ statusCode: 405, statusMessage: 'Método no permitido' });
});
