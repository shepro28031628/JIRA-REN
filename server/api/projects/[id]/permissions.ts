import { defineEventHandler, getRouterParam, readBody, getMethod, createError } from 'h3';
import { PermissionEngine } from '../../../utils/permissionEngine';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id');
  const method = getMethod(event);

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de proyecto requerido' });
  }

  if (method === 'GET') {
    return await PermissionEngine.getProjectPermissions(projectId);
  }

  if (method === 'PUT' || method === 'POST') {
    const body = await readBody(event);
    if (!body?.role || !Array.isArray(body?.permissions)) {
      throw createError({ statusCode: 400, statusMessage: 'Parámetros inválidos (role, permissions)' });
    }
    return await PermissionEngine.updateRolePermissions(projectId, body.role, body.permissions);
  }

  throw createError({ statusCode: 405, statusMessage: 'Método no permitido' });
});
