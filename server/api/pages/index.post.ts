import { db } from '../../database/client';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body.project_id || !body.title) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' });
  }

  try {
    const newPage = await db
      .insertInto('project_pages')
      .values({
        project_id: body.project_id,
        parent_id: body.parent_id || null,
        title: body.title,
        content: body.content || null,
        author_id: body.author_id || 'anonymous'
      })
      .returningAll()
      .executeTakeFirstOrThrow();
      
    return newPage;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
