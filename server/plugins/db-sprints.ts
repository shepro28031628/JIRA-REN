import { defineNitroPlugin } from 'nitropack/runtime/plugin';
import { db } from '../database/client';
import { sql } from 'kysely';

export default defineNitroPlugin(async () => {
  console.log('Running DB Migrations for Sprints...');
  try {
    // 1. Crear tabla Sprints si no existe
    await db.schema.createTable('sprints')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
      .addColumn('project_id', 'uuid', (col) => col.notNull().references('projects.id').onDelete('cascade'))
      .addColumn('name', 'varchar(100)', (col) => col.notNull())
      .addColumn('goal', 'text')
      .addColumn('start_date', 'timestamp')
      .addColumn('end_date', 'timestamp')
      .addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('PENDING'))
      .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
      .execute();

    // 2. Modificar la tabla issues para soportar sprint_id (solo si no existe)
    // Kysely no tiene un alterTable().addColumn().ifNotExists() por lo que usaremos raw SQL para evitar errores si ya existe
    await db.schema.alterTable('issues')
      .addColumn('sprint_id', 'uuid', (col) => col.references('sprints.id').onDelete('set null'))
      .execute().catch(e => {
        // Ignorar si la columna ya existe (código 42701 en PostgreSQL)
        if (e.code !== '42701') console.error('Error alterando issues:', e);
      });
      
    // 3. Modificar la tabla issues para permitir column_id nulo de forma más robusta si es que no lo estaba
    // Ya debería permitirlo según schema.sql, pero por si acaso.
    
    console.log('Sprints Migration Complete');
  } catch (err) {
    console.error('Error en migración de Sprints:', err);
  }
});
