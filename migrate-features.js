import pg from 'pg';

const { Client } = pg;
const DB_USER = 'postgres';
const DB_PASS = 'postgres';
const DB_PORT = 5432;

async function migrate() {
  const client = new Client({
    connectionString: `postgres://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/jira`
  });

  try {
    await client.connect();
    console.log('Aplicando Feature Flags y SuperAdmin a la base de datos...');

    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_master_admin BOOLEAN DEFAULT FALSE;`);
    await client.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS enabled_features JSONB DEFAULT '{"kanban": true, "backlog": true, "docs": false, "teams": false, "reports": false, "automation": false, "support": false}';`);

    console.log('Haciendo a ejgonzalez@renconsultores.com.co SuperAdmin...');
    await client.query(`UPDATE users SET is_master_admin = true WHERE email = 'adminjira@renconsultores.com.co';`);

    console.log('Migración completada.');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    
    await client.end();
  }
}

migrate();
