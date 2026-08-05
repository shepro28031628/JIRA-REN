import { defineEventHandler, getRouterParam, readBody, getMethod, createError } from 'h3';
import { IssueService } from '../../../services/issue.service';

export default defineEventHandler(async (event) => {
  const issueId = getRouterParam(event, 'id');
  const method = getMethod(event);

  if (!issueId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de incidencia requerido' });
  }

  if (method === 'GET') {
    return await IssueService.getIssueLabels(issueId);
  }

  if (method === 'POST' || method === 'PUT') {
    const body = await readBody(event);
    const labelIds: string[] = body.labelIds || [];
    return await IssueService.setIssueLabels(issueId, labelIds);
  }

  throw createError({ statusCode: 405, statusMessage: 'Método no permitido' });
});
