import { db } from '../../database/client';
import { sql } from 'kysely';

export default defineEventHandler(async (event) => {
  const pageId = getRouterParam(event, 'id');
  const body = await readBody(event);
  
  if (!pageId) {
    throw createError({ statusCode: 400, statusMessage: 'Page ID is required' });
  }

  try {
    const updatedPage = await db
      .updateTable('project_pages')
      .set({
        title: body.title,
        content: body.content,
        parent_id: body.parent_id,
        updated_at: sql`CURRENT_TIMESTAMP`
      })
      .where('id', '=', pageId)
      .returningAll()
      .executeTakeFirstOrThrow();
      
    return updatedPage;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
