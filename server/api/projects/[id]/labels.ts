import { defineEventHandler, getRouterParam, readBody, getMethod, createError } from 'h3';
import { IssueService } from '../../../services/issue.service';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id');
  const method = getMethod(event);

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de proyecto requerido' });
  }

  if (method === 'GET') {
    return await IssueService.getProjectLabels(projectId);
  }

  if (method === 'POST') {
    const body = await readBody(event);
    if (!body?.name) {
      throw createError({ statusCode: 400, statusMessage: 'Nombre de etiqueta requerido' });
    }
    return await IssueService.createLabel(projectId, body.name, body.color);
  }

  throw createError({ statusCode: 405, statusMessage: 'Método no permitido' });
});
