import { defineEventHandler, getRouterParam, readBody, createError } from 'h3';
import { SprintService } from '../../services/sprint.service';

export default defineEventHandler(async (event) => {
  const sprintId = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!sprintId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de sprint es requerido' });
  }

  const allowedFields = ['name', 'goal', 'start_date', 'end_date', 'status'];
  const updates: any = {};

  for (const key of Object.keys(body)) {
    if (allowedFields.includes(key)) {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No hay campos válidos para actualizar' });
  }

  try {
    const updatedSprint = await SprintService.updateSprint(sprintId, updates);
    if (!updatedSprint) throw createError({ statusCode: 404, statusMessage: 'Sprint no encontrado' });
    return updatedSprint;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Error actualizando sprint' });
  }
});
