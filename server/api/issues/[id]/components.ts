import { defineEventHandler, getRouterParam, readBody, getMethod, createError } from 'h3';
import { IssueService } from '../../../services/issue.service';

export default defineEventHandler(async (event) => {
  const issueId = getRouterParam(event, 'id');
  const method = getMethod(event);

  if (!issueId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de incidencia requerido' });
  }

  if (method === 'GET') {
    return await IssueService.getIssueComponents(issueId);
  }

  if (method === 'POST' || method === 'PUT') {
    const body = await readBody(event);
    const componentIds: string[] = body.componentIds || [];
    return await IssueService.setIssueComponents(issueId, componentIds);
  }

  throw createError({ statusCode: 405, statusMessage: 'Método no permitido' });
});
