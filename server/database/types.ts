import type { Generated } from 'kysely';

export interface Database {
  users: UsersTable;
  projects: ProjectsTable;
  project_members: ProjectMembersTable;
  board_columns: BoardColumnsTable;
  issues: IssuesTable;
  sprints: SprintsTable;
  time_logs: TimeLogsTable;
  issue_comments: IssueCommentsTable;
  notifications: NotificationsTable;
  project_pages: ProjectPagesTable;
}

export interface UsersTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  name: string;
  avatar_url: string | null;
  is_master_admin: Generated<boolean>;
  created_at: Generated<Date>;
}

export interface ProjectsTable {
  id: Generated<string>;
  key: string;
  name: string;
  description: string | null;
  owner_id: string | null;
  enabled_features: Generated<any>;
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
  estimated_minutes: number | null;
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

export interface TimeLogsTable {
  id: Generated<string>;
  issue_id: string;
  user_id: string;
  duration_minutes: number;
  description: string | null;
  logged_at: Generated<Date>;
}

export interface IssueCommentsTable {
  id: Generated<string>;
  issue_id: string;
  user_id: string;
  content: string;
  created_at: Generated<Date>;
}

export interface NotificationsTable {
  id: Generated<string>;
  user_id: string;
  sender_id: string | null;
  issue_id: string;
  type: 'ASSIGNMENT' | 'MENTION' | 'COMMENT' | 'STATUS_CHANGE';
  read_at: Date | null;
  created_at: Generated<Date>;
}

export interface ProjectPagesTable {
  id: Generated<string>;
  project_id: string;
  parent_id: string | null;
  title: string;
  content: string | null;
  author_id: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}
