import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

// Usamos las credenciales por defecto configuradas en tu cliente
const DB_USER = 'postgres';
const DB_PASS = 'postgres';
const DB_PORT = 5432;

async function setup() {
  console.log('Conectando a PostgreSQL (servidor principal)...');
  const clientMaster = new Client({
    connectionString: `postgres://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/postgres`
  });
  
  try {
    await clientMaster.connect();
    console.log('Creando la base de datos "jira"...');
    await clientMaster.query('CREATE DATABASE jira;');
    console.log('Base de datos creada exitosamente.');
  } catch (e) {
    if (e.code === '42P04') {
      console.log('La base de datos "jira" ya existe. Omitiendo creación.');
    } else {
      console.error('Error conectando a PostgreSQL:', e.message);
      console.log('\nAsegúrate de que la contraseña del usuario postgres sea "postgres". Si es otra, actualiza este archivo temporalmente.');
      process.exit(1);
    }
  } finally {
    await clientMaster.end();
  }

  console.log('\nConectando a la nueva base de datos "jira"...');
  const clientJira = new Client({
    connectionString: `postgres://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/jira`
  });
  
  try {
    await clientJira.connect();
    console.log('Leyendo esquema SQL...');
    const schema = fs.readFileSync('./server/database/schema.sql', 'utf8');
    
    console.log('Ejecutando tablas...');
    await clientJira.query(schema);
    console.log('¡Tablas creadas correctamente! El entorno está listo.');
  } catch (e) {
    console.error('Error ejecutando el esquema:', e.message);
  } finally {
    await clientJira.end();
  }
}

setup();
