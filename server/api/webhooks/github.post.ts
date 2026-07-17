import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const payload = await readBody(event);
    
    // Validar el webhook de GitHub (se podría validar la firma HMAC usando los headers en un caso real)
    
    let textToParse = '';

    // Si es un evento Push (commits)
    if (payload.commits && Array.isArray(payload.commits)) {
      textToParse = payload.commits.map((c: any) => c.message).join(' ');
    } 
    // Si es un Pull Request
    else if (payload.pull_request) {
      // Verificar si se acaba de cerrar (merged)
      if (payload.action === 'closed' && payload.pull_request.merged) {
        textToParse = payload.pull_request.title + ' ' + (payload.pull_request.body || '');
      } else {
        return { status: 'ignored', reason: 'PR not merged' };
      }
    } else {
      return { status: 'ignored', reason: 'Unsupported event type' };
    }

    // Extraer el código de la tarea, por ejemplo 1234-2 o JIRA-REN-2
    // Esta RegEx busca un patrón tipo numero-numero (ej: 1234-2)
    const issueKeyRegex = /(\d+-\d+)/g;
    const matches = textToParse.match(issueKeyRegex);

    if (!matches || matches.length === 0) {
      return { status: 'ignored', reason: 'No issue key found in payload' };
    }

    // Extraer identificadores únicos encontrados
    const uniqueKeys = [...new Set(matches)];

    // Aquí iría la lógica de actualización en base de datos.
    // Como es un mock por ahora para esta fase de UI/UX, simularemos la actualización y emisión por WebSockets.
    
    // Obtenemos la conexión de WebSockets si existe en el contexto global (simulado o a través de un canal pub/sub)
    // En Nuxt 3 / Nitro, una forma de emitir globalmente con un backend mockeado
    // es usar server hooks si se implementó un WS handler propio, o usar `$fetch` a un endpoint interno.
    // Para simplificar, asumiremos que logramos mover la tarea a 'Listo' ("Done").

    console.log(`[Webhooks - GitHub] Tareas encontradas: ${uniqueKeys.join(', ')}`);
    console.log(`[Webhooks - GitHub] Moviendo tareas a 'Listo'...`);

    // ... lógica real (DB Update) ...

    return { 
      status: 'success', 
      message: `Issues processed successfully: ${uniqueKeys.join(', ')}`,
      updated_issues: uniqueKeys
    };

  } catch (error: any) {
    console.error('[Webhooks - GitHub] Error:', error.message);
    return {
      status: 'error',
      message: 'Failed to process webhook'
    };
  }
});
