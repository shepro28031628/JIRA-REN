import { Generated } from 'kysely';

export interface Database {
  users: UsersTable;
  projects: ProjectsTable;
  project_members: ProjectMembersTable;
  board_columns: BoardColumnsTable;
  issues: IssuesTable;
  sprints: SprintsTable;
}

export interface UsersTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  name: string;
  avatar_url: string | null;
  created_at: Generated<Date>;
}

export interface ProjectsTable {
  id: Generated<string>;
  key: string;
  name: string;
  description: string | null;
  owner_id: string | null;
  created_at: Generated<Date>;
}

export interface ProjectMembersTable {
  project_id: string;
  user_id: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export interface BoardColumnsTable {
  id: Generated<string>;
  project_id: string;
  name: string;
  position: number;
  created_at: Generated<Date>;
}

export interface IssuesTable {
  id: Generated<string>;
  project_id: string;
  key_number: number;
  title: string;
  description: string | null;
  type: Generated<'STORY' | 'TASK' | 'BUG' | 'EPIC'>;
  priority: Generated<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>;
  column_id: string | null;
  sprint_id: string | null; // Added sprint_id
  position: number;
  reporter_id: string | null;
  assignee_id: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface SprintsTable {
  id: Generated<string>;
  project_id: string;
  name: string;
  goal: string | null;
  start_date: Date | null;
  end_date: Date | null;
  status: Generated<'PENDING' | 'ACTIVE' | 'COMPLETED'>;
  created_at: Generated<Date>;
}
