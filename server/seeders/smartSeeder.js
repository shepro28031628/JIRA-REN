import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pg;

// Credenciales
const DB_USER = 'postgres';
const DB_PASS = 'postgres';
const DB_PORT = 5432;

const client = new Client({
  connectionString: `postgres://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/jira`
});

async function runSeeder() {
  try {
    await client.connect();
    console.log('🚀 Iniciando Smart Seeder (Fase 26)...');

    // 0. Crear tabla activity_logs si no existe (agregada en Fase 26)
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
          action VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 1. Limpieza total de la BD
    console.log('🧹 Limpiando base de datos (TRUNCATE CASCADE)...');
    await client.query(`TRUNCATE TABLE projects, users, issues, board_columns, time_logs, notifications, project_members, activity_logs CASCADE;`);

    // 2. Generación de Usuarios
    console.log('👥 Generando Usuarios...');
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    const usersData = [
      {
        email: 'ejgonzalez@renconsultores.com.co',
        name: 'Edinsson Gonzalez (Admin)',
        avatar_url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=150&q=80',
        is_master: true
      },
      {
        email: 'elena.rodriguez@example.com',
        name: 'Elena Rodríguez',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        is_master: false
      },
      {
        email: 'carlos.dev@example.com',
        name: 'Carlos Developer',
        avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
        is_master: false
      },
      {
        email: 'laura.qa@example.com',
        name: 'Laura QA',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
        is_master: false
      },
      {
        email: 'invitado@example.com',
        name: 'Usuario Invitado',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        is_master: false
      }
    ];

    const userIds = [];
    for (const u of usersData) {
      const res = await client.query(
        `INSERT INTO users (email, password_hash, name, avatar_url, is_master_admin) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [u.email, defaultPassword, u.name, u.avatar_url, u.is_master]
      );
      userIds.push(res.rows[0].id);
    }
    const adminId = userIds[0];

    // 3. Generación de Proyectos
    console.log('📂 Generando Proyectos...');
    const projectsData = [
      {
        key: 'ALFA',
        name: 'Proyecto Alfa (Full Suite)',
        desc: 'Proyecto con todas las características activadas.',
        features: { kanban: true, backlog: true, docs: true, teams: true, reports: true, automation: true, support: true, agile_views: true }
      },
      {
        key: 'BETA',
        name: 'Proyecto Beta (Helpdesk)',
        desc: 'Proyecto centrado en Soporte y Triaje.',
        features: { kanban: true, backlog: false, docs: false, teams: true, reports: false, automation: false, support: true, agile_views: false }
      },
      {
        key: 'GAMMA',
        name: 'Proyecto Gamma (Light)',
        desc: 'Proyecto ligero, solo Kanban y Backlog.',
        features: { kanban: true, backlog: true, docs: false, teams: false, reports: false, automation: false, support: false, agile_views: false }
      }
    ];

    const projectIds = [];
    for (const p of projectsData) {
      const res = await client.query(
        `INSERT INTO projects (key, name, description, owner_id, enabled_features) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [p.key, p.name, p.desc, adminId, JSON.stringify(p.features)]
      );
      projectIds.push(res.rows[0].id);
    }

    const alfaId = projectIds[0];
    const betaId = projectIds[1];
    const gammaId = projectIds[2];

    // Asignar Miembros
    for (const pid of projectIds) {
      await client.query(`INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'ADMIN')`, [pid, adminId]);
      await client.query(`INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'MEMBER')`, [pid, userIds[1]]);
      await client.query(`INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'MEMBER')`, [pid, userIds[2]]);
    }

    // 4. Columnas y Tareas
    console.log('📋 Generando Columnas y Tareas (Issues)...');
    
    // Función para crear columnas en un proyecto
    const createColumns = async (projectId) => {
      const cols = ['Backlog', 'Por Hacer', 'En Progreso', 'Listo'];
      const colIds = [];
      for (let i = 0; i < cols.length; i++) {
        const res = await client.query(
          `INSERT INTO board_columns (project_id, name, position) VALUES ($1, $2, $3) RETURNING id`,
          [projectId, cols[i], i]
        );
        colIds.push(res.rows[0].id);
      }
      return colIds;
    };

    const alfaCols = await createColumns(alfaId);
    const betaCols = await createColumns(betaId);
    const gammaCols = await createColumns(gammaId);

    // Tareas ALFA
    for (let i = 1; i <= 10; i++) {
      const colId = alfaCols[i % 4];
      const res = await client.query(
        `INSERT INTO issues (project_id, key_number, title, description, type, priority, column_id, position, reporter_id, assignee_id, estimated_minutes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [alfaId, i, `Tarea ALFA ${i}`, 'Descripción autogenerada...', 'TASK', i % 2 === 0 ? 'HIGH' : 'MEDIUM', colId, i, adminId, userIds[i % 4], 120]
      );
      // Logs de tiempo
      await client.query(
        `INSERT INTO time_logs (issue_id, user_id, duration_minutes, description) VALUES ($1, $2, $3, $4)`,
        [res.rows[0].id, userIds[i % 4], 60, 'Trabajando en frontend']
      );
    }

    // Tareas GAMMA
    for (let i = 1; i <= 5; i++) {
      const colId = gammaCols[i % 2]; // Solo backlog y por hacer
      await client.query(
        `INSERT INTO issues (project_id, key_number, title, description, type, priority, column_id, position, reporter_id, assignee_id, estimated_minutes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [gammaId, i, `Tarea GAMMA ${i}`, 'Descripción autogenerada...', 'STORY', 'LOW', colId, i, adminId, userIds[2], 240]
      );
    }

    // 5. Tickets de Soporte en BETA (Triaje y SLAs)
    console.log('🎧 Generando Tickets de Soporte en BETA...');
    const now = new Date();
    
    // Crear 8 tickets.
    for (let i = 1; i <= 8; i++) {
      let createdAt = new Date();
      // Tickets 1 y 2 los haremos "casi expirando" el SLA de 2 horas (1 hora y 55 min atrás)
      if (i === 1 || i === 2) {
        createdAt = new Date(now.getTime() - (115 * 60000));
      } else if (i === 3 || i === 4) {
        // Tickets recién llegados
        createdAt = new Date(now.getTime() - (10 * 60000));
      } else {
        createdAt = new Date(now.getTime() - (60 * 60000));
      }

      await client.query(
        `INSERT INTO issues (project_id, key_number, title, description, type, priority, column_id, position, reporter_id, assignee_id, estimated_minutes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [betaId, i, `Ticket Soporte ${i}`, `Problema técnico reportado por cliente ${i}`, 'BUG', 'CRITICAL', betaCols[1], i, userIds[4], null, 30, createdAt.toISOString()]
      );
    }

    // 6. Historial de Auditoría
    console.log('📜 Generando Historial de Auditoría...');
    // Para Alfa, Beta y Gamma, insertaremos algunos logs simulados.
    const auditEvents = [
      { project_id: alfaId, user_id: userIds[1], issue_id: null, action: 'UPDATE', description: 'Elena modificó la descripción de la tarea PROY-2' },
      { project_id: betaId, user_id: null, issue_id: null, action: 'AUTOMATION', description: 'Sistema ejecutó automatización Zap' },
      { project_id: alfaId, user_id: adminId, issue_id: null, action: 'CREATE', description: 'Edinsson creó el Tablero Principal' },
      { project_id: gammaId, user_id: userIds[2], issue_id: null, action: 'UPDATE', description: 'Carlos movió la tarea PROY-3 a En Progreso' },
      { project_id: betaId, user_id: userIds[4], issue_id: null, action: 'CREATE', description: 'Usuario Invitado reportó un nuevo incidente de soporte' }
    ];

    for (const event of auditEvents) {
      await client.query(
        `INSERT INTO activity_logs (project_id, user_id, issue_id, action, description) VALUES ($1, $2, $3, $4, $5)`,
        [event.project_id, event.user_id, event.issue_id, event.action, event.description]
      );
    }

    console.log('✅ ¡Seeder ejecutado con éxito! Entorno listo para pruebas de estrés visual.');
  } catch (error) {
    console.error('❌ Error ejecutando el seeder:', error);
  } finally {
    await client.end();
  }
}

runSeeder();
