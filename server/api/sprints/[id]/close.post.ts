import { defineEventHandler, getRouterParam, readBody, createError } from 'h3';
import { SprintService } from '../../../services/sprint.service';

export default defineEventHandler(async (event) => {
  const sprintId = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!sprintId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de sprint es requerido' });
  }

  try {
    const targetSprintId = body?.targetSprintId || null;
    return await SprintService.closeSprint(sprintId, targetSprintId);
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error al cerrar el sprint'
    });
  }
});
