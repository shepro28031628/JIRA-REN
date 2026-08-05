import { sql } from 'kysely';

export class JQLParser {
  /**
   * Transpila un string JQL a fragmentos SQL para Kysely.
   * Soporta sintaxis: project = ALFA AND priority = HIGH AND label = frontend
   */
  static parse(jqlString: string, currentUserId?: string) {
    if (!jqlString || jqlString.trim() === '') {
      return sql`1 = 1`;
    }

    const tokenRegex = /(\w+)\s*(=|!=|>|<|>=|<=)\s*(".*?"|'.*?'|\w+\(\)|[\w-]+)\s*(AND|OR)?/gi;
    let match;
    const parts = [];

    while ((match = tokenRegex.exec(jqlString)) !== null) {
      let [ , field, operator, value, logicOp ] = match;
      const cleanField = field.toLowerCase();

      // Limpiar comillas
      if (value.startsWith('"') || value.startsWith("'")) {
        value = value.substring(1, value.length - 1);
      }

      // Resolver variables especiales
      if (value.toLowerCase() === 'currentuser()') {
        value = currentUserId || '';
      }

      if (cleanField === 'label' || cleanField === 'labels') {
        parts.push(sql.raw(`issues.id IN (SELECT issue_id FROM issue_labels JOIN labels ON issue_labels.label_id = labels.id WHERE labels.name ${operator} `));
        parts.push(value);
        parts.push(sql.raw(`)`));
      } else if (cleanField === 'component' || cleanField === 'components') {
        parts.push(sql.raw(`issues.id IN (SELECT issue_id FROM issue_components JOIN components ON issue_components.component_id = components.id WHERE components.name ${operator} `));
        parts.push(value);
        parts.push(sql.raw(`)`));
      } else {
        let sqlField = `issues.${field}`;
        
        if (cleanField === 'status') {
          sqlField = `board_columns.name`;
        } else if (cleanField === 'project') {
          sqlField = `projects.key`;
        } else if (cleanField === 'type') {
          sqlField = `issues.type`;
        } else if (cleanField === 'priority') {
          sqlField = `issues.priority`;
        } else if (cleanField === 'assignee') {
          if (value === currentUserId) {
             sqlField = `issues.assignee_id`;
          } else {
             sqlField = `assignee_user.name`;
          }
        }

        parts.push(sql.raw(`${sqlField} ${operator} `));
        parts.push(value);
      }

      if (logicOp) {
        parts.push(sql.raw(` ${logicOp.toUpperCase()} `));
      }
    }

    if (parts.length === 0) {
       return sql`1 = 1`;
    }

    return sql.join(parts, sql``);
  }
}
