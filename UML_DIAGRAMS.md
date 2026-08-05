# Ecosistema UML & Arquitectura de Software - JIRA-REN

Documentación arquitectónica completa y especificación técnica visual del sistema **JIRA-REN**, elaborada mediante diagramas UML estandarizados en formato Mermaid.

---

## 📋 Índice de Diagramas UML

1. [Diagrama 1: Arquitectura General de Componentes (C4 Model)](#diagrama-1-arquitectura-general-de-componentes-c4-model)
2. [Diagrama 2: Modelo Entidad-Relación de la Base de Datos (ERD)](#diagrama-2-modelo-entidad-relación-de-la-base-de-datos-erd)
3. [Diagrama 3: Casos de Uso del Sistema (Use Case Diagram)](#diagrama-3-casos-de-uso-del-sistema-use-case-diagram)
4. [Diagrama 4: Diagrama de Clases del Dominio y Servicios (Class Diagram)](#diagrama-4-diagrama-de-clases-del-dominio-y-servicios-class-diagram)
5. [Diagrama 5: Secuencia - Procesamiento y Parseo de Consultas JQL](#diagrama-5-secuencia---procesamiento-y-parseo-de-consultas-jql)
6. [Diagrama 6: Secuencia - Transición de Estados y Automatizaciones](#diagrama-6-secuencia---transición-de-estados-y-automatizaciones)
7. [Diagrama 7: Máquina de Estados - Ciclo de Vida de una Incidencia](#diagrama-7-máquina-de-estados---ciclo-de-vida-de-una-incidencia)
8. [Diagrama 8: Diagrama de Despliegue e Infraestructura (Deployment Diagram)](#diagrama-8-diagrama-de-despliegue-e-infraestructura-deployment-diagram)
9. [Diagrama 9: Diagrama de Actividades - Exportación de Informes](#diagrama-9-diagrama-de-actividades---exportación-de-informes)

---

## Diagrama 1: Arquitectura General de Componentes (C4 Model)

Representación modular de la separación entre la capa de presentación SPA en Nuxt 3, el servidor de API en Nitro, el motor de persistencia Kysely/PostgreSQL y los servicios de automatización.

```mermaid
graph TD
    subgraph Cliente ["Cliente Web (Nuxt 3 SPA)"]
        UI["Interfaz de Usuario (Vue 3 + Glassmorphism)"]
        Store["Store de Estado (Pinia / Board Store)"]
        Components["Componentes (IssueDetailModal, IssueCard, BoardView)"]
        UI --> Components
        Components --> Store
    end

    subgraph Backend ["Servidor de Aplicación (Nitro Engine)"]
        API["Servidor HTTP / Endpoints API (H3 / Nuxt Server API)"]
        JQL["Motor JQL (JQLParser)"]
        WFE["Motor de Workflows (WorkflowEngine)"]
        IssueSvc["Servicio de Incidencias (IssueService)"]
        ExportSvc["Servicio de Exportación (CSV/JSON/PDF)"]
        
        API --> JQL
        API --> WFE
        API --> IssueSvc
        API --> ExportSvc
        WFE --> IssueSvc
    end

    subgraph DB ["Persistencia de Datos"]
        Kysely["Kysely ORM (Type-Safe Query Builder)"]
        Postgres[(Base de Datos PostgreSQL)]
        
        IssueSvc --> Kysely
        JQL --> Kysely
        WFE --> Kysely
        Kysely --> Postgres
    end

    Store <-->|"HTTP / REST API"| API
```

---

## Diagrama 2: Modelo Entidad-Relación de la Base de Datos (ERD)

Esquema de base de datos relacional PostgreSQL con soporte para jerarquía profunda de épicas, subtareas, workflows, automatizaciones, etiquetas y componentes.

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : "owns"
    USERS ||--o{ PROJECT_MEMBERS : "belongs_to"
    PROJECTS ||--o{ PROJECT_MEMBERS : "contains"
    PROJECTS ||--o{ BOARD_COLUMNS : "has"
    PROJECTS ||--o{ WORKFLOWS : "defines"
    PROJECTS ||--o{ LABELS : "owns"
    PROJECTS ||--o{ COMPONENTS : "owns"
    PROJECTS ||--o{ ISSUES : "contains"

    WORKFLOWS ||--o{ WORKFLOW_TRANSITIONS : "has"
    BOARD_COLUMNS ||--o{ WORKFLOW_TRANSITIONS : "from_col"
    BOARD_COLUMNS ||--o{ WORKFLOW_TRANSITIONS : "to_col"
    WORKFLOW_TRANSITIONS ||--o{ WORKFLOW_RULES : "triggers"

    ISSUES ||--o{ ISSUE_SUBTASKS : "contains"
    ISSUES ||--o{ ISSUE_LABELS : "tagged_with"
    LABELS ||--o{ ISSUE_LABELS : "belongs_to"
    ISSUES ||--o{ ISSUE_COMPONENTS : "categorized_in"
    COMPONENTS ||--o{ ISSUE_COMPONENTS : "belongs_to"
    ISSUES ||--o{ TIME_LOGS : "logs_time"
    ISSUES ||--o{ ISSUE_COMMENTS : "has_comments"

    USERS ||--o{ ISSUES : "assigned_to"
    USERS ||--o{ ISSUES : "reported_by"
    ISSUES }o--o| ISSUES : "epic_id / parent_id"

    USERS {
        uuid id PK
        string email
        string name
        boolean is_master_admin
    }

    PROJECTS {
        uuid id PK
        string key
        string name
        jsonb enabled_features
    }

    ISSUES {
        uuid id PK
        uuid project_id FK
        int key_number
        string title
        string type
        string priority
        uuid column_id FK
        uuid epic_id FK
        uuid parent_id FK
        int estimated_minutes
    }

    ISSUE_SUBTASKS {
        uuid id PK
        uuid issue_id FK
        string title
        boolean completed
    }

    LABELS {
        uuid id PK
        uuid project_id FK
        string name
        string color
    }

    COMPONENTS {
        uuid id PK
        uuid project_id FK
        string name
        string description
    }
```

---

## Diagrama 3: Casos de Uso del Sistema (Use Case Diagram)

Interacciones principales entre los actores del sistema (Usuario Miembro, Administrador de Proyecto y SuperAdmin) y las funcionalidades del software.

```mermaid
usecaseDiagram
    actor "Usuario / Miembro" as Member
    actor "Administrador de Proyecto" as ProjectAdmin
    actor "SuperAdmin (Master)" as SuperAdmin

    package "Sistema JIRA-REN" {
        usecase "Gestionar Incidencias & Subtareas" as UC_ManageIssues
        usecase "Vincular Épicas a Historias" as UC_LinkEpics
        usecase "Ejecutar Búsqueda Avanzada JQL" as UC_JQL
        usecase "Categorizar por Etiquetas y Componentes" as UC_Labels
        usecase "Exportar Reportes (CSV, JSON, PDF)" as UC_Export
        usecase "Configurar Flujos y Reglas de Automatización" as UC_Workflows
        usecase "Gobernanza & Inyección de Módulos (Feature Flags)" as UC_FeatureFlags
    }

    Member --> UC_ManageIssues
    Member --> UC_LinkEpics
    Member --> UC_JQL
    Member --> UC_Labels
    Member --> UC_Export

    ProjectAdmin --> UC_Workflows
    ProjectAdmin --> UC_ManageIssues
    ProjectAdmin --> UC_Export

    SuperAdmin --> UC_FeatureFlags
    SuperAdmin --> UC_Workflows
```

---

## Diagrama 4: Diagrama de Clases del Dominio y Servicios (Class Diagram)

Estructura orientada a objetos de los servicios backend y modelos de datos.

```mermaid
classDiagram
    class IssueService {
        +getIssuesByProject(projectId: String)
        +createIssue(data: CreateIssueDTO)
        +updateIssue(issueId: String, updates: Object)
        +updateIssuePosition(issueId: String, toColumnId: String, position: Number)
        +getSubtasks(issueId: String)
        +createSubtask(issueId: String, title: String)
        +toggleSubtask(subtaskId: String, completed: Boolean)
        +getProjectLabels(projectId: String)
        +setIssueLabels(issueId: String, labelIds: String[])
    }

    class WorkflowEngine {
        +executeTransition(issueId: String, fromCol: String, toCol: String, userId: String)
        +runAutomations(eventKey: String, issue: Object, extraData: Object)
    }

    class JQLParser {
        +parse(jqlString: String, currentUserId: String) : SqlFragment
    }

    class Issue {
        +String id
        +String key
        +String title
        +String type
        +String priority
        +String columnId
        +String epicId
        +String parentId
        +Number estimatedMinutes
    }

    class Subtask {
        +String id
        +String issueId
        +String title
        +Boolean completed
    }

    class Label {
        +String id
        +String projectId
        +String name
        +String color
    }

    IssueService --> WorkflowEngine : "ejecuta reglas en transiciones"
    IssueService --> Issue : "gestiona"
    Issue --> Subtask : "contiene 0..*"
    Issue --> Label : "etiquetado con 0..*"
```

---

## Diagrama 5: Secuencia - Procesamiento y Parseo de Consultas JQL

Flujo paso a paso desde que el usuario introduce una consulta sintáctica JQL en la interfaz hasta la resolución en la base de datos PostgreSQL.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Usuario en Frontend
    participant SearchUI as Barra de Filtro JQL (Board.vue)
    participant API as API Server (/api/projects/:id/search)
    participant Parser as JQLParser Engine
    participant DB as PostgreSQL (Kysely ORM)

    Usuario->>SearchUI: Escribe "project = ALFA AND priority = HIGH AND label = frontend"
    SearchUI->>API: GET /api/projects/123/search?jql=...
    API->>Parser: JQLParser.parse(jqlString, currentUserId)
    Note over Parser: Analiza lexemas por Regex,<br/>limpia comillas y traduce campos a columnas SQL
    Parser-->>API: Retorna fragmento SQL compilado
    API->>DB: Exec selectFrom('issues').where(jqlCondition)
    DB-->>API: Retorna array de incidencias encontradas
    API-->>SearchUI: 200 OK { results, count }
    SearchUI-->>Usuario: Renderiza tarjetas en el tablero en < 10ms
```

---

## Diagrama 6: Secuencia - Transición de Estados y Automatizaciones

Proceso de movimiento drag & drop de tarjetas, validación de reglas de workflow y ejecución automática del reseteo de tiempo restante a 0.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Usuario
    participant Kanban as Tablero Kanban (UI)
    participant API as API Server (/api/issues/:id/put)
    participant Service as IssueService
    participant WFE as WorkflowEngine
    participant DB as PostgreSQL

    Usuario->>Kanban: Arrastra ticket a columna "Done"
    Kanban->>API: PUT /api/issues/456 { action: 'move', toColumnId: 'done-col' }
    API->>Service: updateIssuePosition(issueId, 'done-col', newPosition)
    Service->>WFE: executeTransition(issueId, oldCol, newCol, userId)
    WFE-->>Service: Retorna PostActions (ej: SET_REMAINING_ZERO)
    
    Note over Service: Detecta columna de cierre "Done"<br/>y aplica automatización de tiempo restante = 0
    Service->>DB: UPDATE issues SET column_id = 'done-col', estimated_minutes = 0
    DB-->>Service: Registro actualizado
    Service-->>API: Retorna Incidencia Actualizada
    API-->>Kanban: Respuesta exitosa
    Kanban-->>Usuario: Notificación visual & actualización optimista
```

---

## Diagrama 7: Máquina de Estados - Ciclo de Vida de una Incidencia

Transiciones de estado permitidas en el ciclo de vida de un ticket dentro de JIRA-REN.

```mermaid
stateDiagram-v2
    [*] --> PorHacer: Creación de Incidencia
    
    PorHacer --> EnProgreso: Asignar e Iniciar Trabajo
    EnProgreso --> EnRevision: Solicitar Code Review / QA
    EnRevision --> EnProgreso: Rechazar Review / Bugs
    EnRevision --> Listo: Aprobar y Fusionar
    
    EnProgreso --> Listo: Transición Directa (Done)
    
    state Listo {
        [*] --> ReseteoTiempo: Ejecutar Automatización (estimated_minutes = 0)
        ReseteoTiempo --> Cerrado: Marcar Notificación
    }

    Cerrado --> PorHacer: Reabrir Ticket
    Cerrado --> [*]: Archivar en Release
```

---

## Diagrama 8: Diagrama de Despliegue e Infraestructura (Deployment Diagram)

Topología de despliegue en entorno corporativo o cloud.

```mermaid
graph TB
    subgraph ClientLayer ["Capa de Cliente (Navegador Web)"]
        Browser["Navegador Web Chrome / Firefox / Safari"]
    end

    subgraph ServerLayer ["Servidor Node.js (Enterprise Host)"]
        Nitro["Nuxt 3 / Nitro Server (Port 3000)"]
        WS["WebSocket Server (Event Broadcast)"]
    end

    subgraph DBLayer ["Capa de Base de Datos"]
        PostgresDB[(PostgreSQL 15 Database Server - Port 5432)]
    end

    Browser <-->|"HTTPS / REST API"| Nitro
    Browser <-->|"WSS / WebSockets"| WS
    Nitro <-->|"Connection Pool (Kysely)"| PostgresDB
```

---

## Diagrama 9: Diagrama de Actividades - Exportación de Informes

Flujo de decisiones y procesamiento para exportar reportes de sprint en CSV, JSON o PDF.

```mermaid
flowchart TD
    A[Inicio: Usuario presiona botón Exportar] --> B{¿Qué formato seleccionó?}
    
    B -->|CSV| C[Solicitar GET /api/projects/:id/export?format=csv]
    B -->|JSON| D[Solicitar GET /api/projects/:id/export?format=json]
    B -->|PDF| E[Ejecutar window.print / Estilo de Impresión PDF]

    C --> F[Servidor consulta incidencias y formatea cabeceras CSV UTF-8]
    D --> G[Servidor serializa JSON con metadatos del proyecto y sprint]
    
    F --> H[Establece Content-Type: text/csv y descarga archivo .csv]
    G --> I[Descarga de archivo .json formateado]
    E --> J[Genera documento listo para guardar como PDF]

    H --> K[Fin]
    I --> K
    J --> K
```
