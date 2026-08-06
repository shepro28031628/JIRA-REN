import { defineEventHandler, getRouterParam, readBody, getMethod, createError } from 'h3';
import { db } from '../../../database/client';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id');
  const method = getMethod(event);

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de proyecto requerido' });
  }

  if (method === 'GET') {
    const [columns, workflow] = await Promise.all([
      db.selectFrom('board_columns').selectAll().where('project_id', '=', projectId).orderBy('position', 'asc').execute(),
      db.selectFrom('workflows').selectAll().where('project_id', '=', projectId).executeTakeFirst()
    ]);

    let workflowId = workflow?.id;
    if (!workflowId) {
      const created = await db.insertInto('workflows')
        .values({ project_id: projectId, name: 'Workflow Estándar' })
        .returningAll()
        .executeTakeFirst();
      workflowId = created?.id;
    }

    const transitions = workflowId ? await db.selectFrom('workflow_transitions')
      .selectAll()
      .where('workflow_id', '=', workflowId)
      .execute() : [];

    const rules = transitions.length > 0 ? await db.selectFrom('workflow_rules')
      .selectAll()
      .where('transition_id', 'in', transitions.map(t => t.id))
      .execute() : [];

    return {
      columns,
      workflowId,
      transitions,
      rules
    };
  }

  if (method === 'POST') {
    const body = await readBody(event);
    if (!body?.workflowId || !body?.from_col_id || !body?.to_col_id) {
      throw createError({ statusCode: 400, statusMessage: 'workflowId, from_col_id y to_col_id son requeridos' });
    }

    const transitionName = body.name || 'Transición';

    return await db.insertInto('workflow_transitions')
      .values({
        workflow_id: body.workflowId,
        from_column_id: body.from_col_id,
        to_column_id: body.to_col_id,
        name: transitionName
      })
      .onConflict((oc) => oc.column('workflow_id').column('from_column_id').column('to_column_id').doNothing())
      .returningAll()
      .executeTakeFirst();
  }

  if (method === 'DELETE') {
    const body = await readBody(event);
    if (!body?.transitionId) {
      throw createError({ statusCode: 400, statusMessage: 'transitionId es requerido' });
    }

    await db.deleteFrom('workflow_transitions').where('id', '=', body.transitionId).execute();
    return { success: true };
  }

  throw createError({ statusCode: 405, statusMessage: 'Método no permitido' });
});
