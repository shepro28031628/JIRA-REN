import { defineNitroPlugin } from 'nitropack/runtime/plugin';
import { db } from '../database/client';
import { sql } from 'kysely';

export default defineNitroPlugin(async () => {
  console.log('Running DB Migrations for Project Pages...');
  try {
    // Crear tabla project_pages
    await db.schema.createTable('project_pages')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
      .addColumn('project_id', 'uuid', (col) => col.notNull().references('projects.id').onDelete('cascade'))
      .addColumn('parent_id', 'uuid', (col) => col.references('project_pages.id').onDelete('cascade'))
      .addColumn('title', 'varchar(255)', (col) => col.notNull().defaultTo('Nueva Página'))
      .addColumn('content', 'jsonb')
      .addColumn('author_id', 'varchar(100)')
      .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
      .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
      .execute();
      
    console.log('Project Pages Migration Complete');
  } catch (err) {
    console.error('Error en migración de Project Pages:', err);
  }
});
