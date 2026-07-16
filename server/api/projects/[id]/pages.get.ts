import { db } from '../../../database/client';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id');
  
  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'Project ID is required' });
  }

  try {
    const pages = await db
      .selectFrom('project_pages')
      .selectAll()
      .where('project_id', '=', projectId)
      .orderBy('created_at', 'asc')
      .execute();
      
    return pages;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
