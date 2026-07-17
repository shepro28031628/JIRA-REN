import { defineEventHandler, getRouterParam, readBody, createError } from 'h3';
import { IssueService } from '../../services/issue.service';

export default defineEventHandler(async (event) => {
  const issueId = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!issueId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de incidencia es requerido' });
  }

  // Sanitizamos el body para solo permitir campos válidos para PATCH
  const allowedFields = ['title', 'description', 'type', 'priority', 'assignee_id', 'column_id', 'sprint_id'];
  const updates: any = {};

  for (const key of Object.keys(body)) {
    if (allowedFields.includes(key)) {
      // Manejamos strings vacíos como nulos para foreign keys (ej. assignee_id)
      if (body[key] === '' && (key === 'assignee_id' || key === 'column_id' || key === 'sprint_id')) {
        updates[key] = null;
      } else {
        updates[key] = body[key];
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No se enviaron campos válidos para actualizar' });
  }

  try {
    const updatedIssue = await IssueService.updateIssue(issueId, updates);
    
    if (!updatedIssue) {
      throw createError({ statusCode: 404, statusMessage: 'Incidencia no encontrada' });
    }
    
    return updatedIssue;
  } catch (error: any) {
    console.error('Error updating issue:', error);
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Error interno actualizando la incidencia',
      data: error.message
    });
  }
});
