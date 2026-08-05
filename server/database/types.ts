import type { Generated } from 'kysely';

export interface Database {
  users: UsersTable;
  projects: ProjectsTable;
  project_members: ProjectMembersTable;
  workflows: WorkflowsTable;
  workflow_transitions: WorkflowTransitionsTable;
  workflow_rules: WorkflowRulesTable;
  board_columns: BoardColumnsTable;
  project_versions: ProjectVersionsTable;
  issue_types: IssueTypesTable;
  custom_fields: CustomFieldsTable;
  issues: IssuesTable;
  issue_subtasks: IssueSubtasksTable;
  labels: LabelsTable;
  issue_labels: IssueLabelsTable;
  components: ComponentsTable;
  issue_components: IssueComponentsTable;
  issue_custom_values: IssueCustomValuesTable;
  sprints: SprintsTable;
  time_logs: TimeLogsTable;
  issue_comments: IssueCommentsTable;
  notifications: NotificationsTable;
  project_pages: ProjectPagesTable;
  permission_schemes: PermissionSchemesTable;
  notification_schemes: NotificationSchemesTable;
  saved_filters: SavedFiltersTable;
  automation_rules: AutomationRulesTable;
  issue_watchers: IssueWatchersTable;
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
  default_workflow_id: string | null;
  created_at: Generated<Date>;
}

export interface ProjectMembersTable {
  project_id: string;
  user_id: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export interface WorkflowsTable {
  id: Generated<string>;
  project_id: string;
  name: string;
  created_at: Generated<Date>;
}

export interface WorkflowTransitionsTable {
  id: Generated<string>;
  workflow_id: string;
  from_column_id: string;
  to_column_id: string;
  name: string;
  created_at: Generated<Date>;
}

export interface WorkflowRulesTable {
  id: Generated<string>;
  transition_id: string;
  rule_type: 'CONDITION' | 'POST_ACTION';
  action_key: string;
  value: any;
  created_at: Generated<Date>;
}

export interface ProjectVersionsTable {
  id: Generated<string>;
  project_id: string;
  name: string;
  description: string | null;
  status: Generated<'UNRELEASED' | 'RELEASED' | 'ARCHIVED'>;
  release_date: Date | null;
  created_at: Generated<Date>;
}

export interface IssueTypesTable {
  id: Generated<string>;
  project_id: string;
  name: string;
  icon: string | null;
  workflow_id: string | null;
  created_at: Generated<Date>;
}

export interface CustomFieldsTable {
  id: Generated<string>;
  project_id: string;
  name: string;
  field_type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'USER';
  options: any | null;
  created_at: Generated<Date>;
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
  issue_type_id: string;
  priority: Generated<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>;
  column_id: string | null;
  version_id: string | null;
  sprint_id: string | null;
  epic_id: string | null;
  parent_id: string | null;
  position: number;
  reporter_id: string | null;
  assignee_id: string | null;
  estimated_minutes: number | null;
  story_points: number | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface IssueSubtasksTable {
  id: Generated<string>;
  issue_id: string;
  title: string;
  completed: Generated<boolean>;
  position: Generated<number>;
  created_at: Generated<Date>;
}

export interface LabelsTable {
  id: Generated<string>;
  project_id: string;
  name: string;
  color: Generated<string>;
  created_at: Generated<Date>;
}

export interface IssueLabelsTable {
  issue_id: string;
  label_id: string;
}

export interface ComponentsTable {
  id: Generated<string>;
  project_id: string;
  name: string;
  description: string | null;
  lead_id: string | null;
  created_at: Generated<Date>;
}

export interface IssueComponentsTable {
  issue_id: string;
  component_id: string;
}

export interface IssueCustomValuesTable {
  issue_id: string;
  custom_field_id: string;
  value_text: string | null;
  value_number: number | null;
  value_date: Date | null;
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

export interface PermissionSchemesTable {
  id: Generated<string>;
  project_id: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  permissions: Generated<any>;
  created_at: Generated<Date>;
}

export interface NotificationSchemesTable {
  id: Generated<string>;
  project_id: string;
  event_key: string;
  recipients: Generated<any>;
  created_at: Generated<Date>;
}

export interface SavedFiltersTable {
  id: Generated<string>;
  project_id: string;
  name: string;
  jql_query: string;
  is_shared: Generated<boolean>;
  created_by: string | null;
  created_at: Generated<Date>;
}

export interface AutomationRulesTable {
  id: Generated<string>;
  project_id: string;
  name: string;
  trigger_event: string;
  condition_config: Generated<any>;
  action_config: Generated<any>;
  is_active: Generated<boolean>;
  created_at: Generated<Date>;
}

export interface IssueWatchersTable {
  issue_id: string;
  user_id: string;
  created_at: Generated<Date>;
}
