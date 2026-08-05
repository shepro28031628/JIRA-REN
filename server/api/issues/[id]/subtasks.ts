import { defineEventHandler, getRouterParam, readBody, getMethod, createError } from 'h3';
import { IssueService } from '../../../services/issue.service';

export default defineEventHandler(async (event) => {
  const issueId = getRouterParam(event, 'id');
  const method = getMethod(event);

  if (!issueId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de incidencia es requerido' });
  }

  if (method === 'GET') {
    return await IssueService.getSubtasks(issueId);
  }

  const body = await readBody(event);

  if (method === 'POST') {
    if (!body?.title) {
      throw createError({ statusCode: 400, statusMessage: 'El título de la subtarea es requerido' });
    }
    return await IssueService.createSubtask(issueId, body.title);
  }

  if (method === 'PUT') {
    if (!body?.subtaskId) {
      throw createError({ statusCode: 400, statusMessage: 'subtaskId es requerido' });
    }
    return await IssueService.updateSubtask(body.subtaskId, {
      completed: body.completed,
      title: body.title
    });
  }

  if (method === 'DELETE') {
    if (!body?.subtaskId) {
      throw createError({ statusCode: 400, statusMessage: 'subtaskId es requerido' });
    }
    await IssueService.deleteSubtask(body.subtaskId);
    return { success: true };
  }

  throw createError({ statusCode: 405, statusMessage: 'Método no permitido' });
});
