import { defineEventHandler, readBody, getRouterParam, createError } from 'h3';
import { db } from '../../../database/client';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id');
  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'Project ID es requerido' });
  }

  // TODO: Obtener el user logueado (ej: de la sesión/token)
  // Por ahora simularemos que viene en el header x-user-id
  const userId = event.node.req.headers['x-user-id'] as string;
  
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' });
  }

  // Verificar que el usuario tenga is_master_admin = true
  const user = await db.selectFrom('users')
    .select('is_master_admin')
    .where('id', '=', userId)
    .executeTakeFirst();

  if (!user || !user.is_master_admin) {
    throw createError({ statusCode: 403, statusMessage: 'Acceso denegado: Se requiere rol de SuperAdmin' });
  }

  const body = await readBody(event);
  
  // Actualizar los features en la base de datos
  // 'body' debe ser un objeto JSON de features: { kanban: true, docs: false, ... }
  const updatedProject = await db.updateTable('projects')
    .set({ enabled_features: JSON.stringify(body) })
    .where('id', '=', projectId)
    .returningAll()
    .executeTakeFirst();

  if (!updatedProject) {
    throw createError({ statusCode: 404, statusMessage: 'Proyecto no encontrado' });
  }

  return updatedProject.enabled_features;
});
