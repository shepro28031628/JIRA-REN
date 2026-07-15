import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { IssueService } from '../../services/issue.service';

export default defineEventHandler(async (event) => {
  const issueId = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!issueId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de incidencia es requerido' });
  }

  if (body.action === 'move') {
    if (!body.toColumnId || body.newPosition === undefined) {
      throw createError({ statusCode: 400, statusMessage: 'Faltan parámetros para mover (toColumnId, newPosition)' });
    }
    
    // Aquí actualizamos la DB
    const result = await IssueService.updateIssuePosition(issueId, body.toColumnId, body.newPosition);
    
    // También podríamos emitir el evento de Socket desde aquí si tuviéramos acceso a la instancia en el servidor
    // Para simplificar, actualmente se emite desde el frontend (optimistic UI + broadcast).
    // Lo ideal en un entorno de producción es que el backend valide y emita.
    
    return result;
  }
  
  // Lógica para otras actualizaciones si fueran necesarias
  throw createError({ statusCode: 400, statusMessage: 'Acción no soportada' });
});
