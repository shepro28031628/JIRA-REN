import { defineEventHandler, getRouterParam, readBody, getMethod, createError } from 'h3';
import { db } from '../../../database/client';

export default defineEventHandler(async (event) => {
  const issueId = getRouterParam(event, 'id');
  const method = getMethod(event);

  if (!issueId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de incidencia requerido' });
  }

  if (method === 'GET') {
    return await db.selectFrom('issue_custom_values')
      .innerJoin('custom_fields', 'issue_custom_values.custom_field_id', 'custom_fields.id')
      .selectAll('issue_custom_values')
      .select(['custom_fields.name as field_name', 'custom_fields.field_type'])
      .where('issue_custom_values.issue_id', '=', issueId)
      .execute();
  }

  if (method === 'POST' || method === 'PUT') {
    const body = await readBody(event);
    if (!body?.customFieldId) {
      throw createError({ statusCode: 400, statusMessage: 'customFieldId es requerido' });
    }

    const valueText = body.valueText !== undefined ? String(body.valueText) : null;
    const valueNumber = body.valueNumber !== undefined ? Number(body.valueNumber) : null;
    const valueDate = body.valueDate ? new Date(body.valueDate) : null;

    return await db.insertInto('issue_custom_values')
      .values({
        issue_id: issueId,
        custom_field_id: body.customFieldId,
        value_text: valueText,
        value_number: valueNumber,
        value_date: valueDate
      })
      .onConflict((oc) => oc.column('issue_id').column('custom_field_id').doUpdateSet({
        value_text: valueText,
        value_number: valueNumber,
        value_date: valueDate
      }))
      .returningAll()
      .executeTakeFirst();
  }

  throw createError({ statusCode: 405, statusMessage: 'Método no permitido' });
});
