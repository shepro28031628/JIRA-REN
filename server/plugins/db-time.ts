import { defineNitroPlugin } from 'nitropack/runtime/plugin';
import { db } from '../database/client';
import { sql } from 'kysely';

export default defineNitroPlugin(async () => {
  console.log('Running DB Migrations for Time Tracking...');
  try {
    // 1. Crear tabla time_logs
    await db.schema.createTable('time_logs')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
      .addColumn('issue_id', 'uuid', (col) => col.notNull().references('issues.id').onDelete('cascade'))
      .addColumn('user_id', 'varchar(100)')
      .addColumn('duration_minutes', 'integer', (col) => col.notNull())
      .addColumn('description', 'text')
      .addColumn('logged_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
      .execute();

    // 2. Modificar la tabla issues para agregar estimated_minutes (solo si no existe)
    await db.schema.alterTable('issues')
      .addColumn('estimated_minutes', 'integer', (col) => col.defaultTo(0))
      .execute().catch(e => {
        if (e.code !== '42701') console.error('Error alterando issues para estimated_minutes:', e);
      });
      
    console.log('Time Tracking Migration Complete');
  } catch (err) {
    console.error('Error en migración de Time Tracking:', err);
  }
});
