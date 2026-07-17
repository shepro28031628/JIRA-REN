<div align="center">
  <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/vue/vue.png" width="80" alt="Vue Logo" />
  <h1 align="center">JIRA-REN</h1>

  <p align="center">
    <strong>Un clon premium de Jira con estética Light-Glassmorphism optimizado a 60 FPS.</strong>
  </p>

  <p align="center">
    <a href="#arquitectura">Arquitectura</a> •
    <a href="#fusión-tecnológica">Fusión Tecnológica</a> •
    <a href="#gobernanza">Gobernanza</a> •
    <a href="#optimizaciones">Optimizaciones</a> •
    <a href="#quickstart">Quickstart</a>
  </p>
</div>

---

> **Autoría y Dirección de Ingeniería**  
> Todo el ecosistema JIRA-REN, su arquitectura central, el diseño de base de datos, la integración de servicios y la capa de experiencia de usuario (UI/UX) fueron conceptualizados y desarrollados en su totalidad por **Edinsson Gonzalez** (Lead Software Architect & Developer).

---

## 🌌 Visión General

**JIRA-REN** representa el pináculo de la gestión de proyectos moderna. Diseñado desde cero para superar los estándares de la industria, el proyecto fusiona las capacidades robustas del seguimiento de incidencias tradicional con una estética visual sin precedentes (Glassmorphism de última generación).

El sistema está impulsado por **Nuxt 3** en el cliente y **Nitro Server** en el backend, consolidando una plataforma rápida, reactiva y orientada a entornos corporativos de alto estrés sin sacrificar ni un solo frame de rendimiento.

---

## 🏗 Arquitectura del Sistema & Fusión Tecnológica

Como Arquitecto Principal, **Edinsson Gonzalez** logró integrar armónicamente el ADN y los mejores patrones de ingeniería extraídos de repositorios líderes en la industria para crear un ecosistema unificado y superior:

### 1. Plane (Módulo Ágil Avanzado)
El núcleo ágil de JIRA-REN hereda la fluidez de *Plane*. Incorpora un motor de **Gestión de Sprints y Ciclos** capaz de manejar proyecciones de tiempo, vistas híbridas de **Gantt y Calendario interactivo**, junto con una bandeja de Triaje de Soporte y cálculos de **SLAs dinámicos** en tiempo real. 

### 2. Platform (Gestión del Conocimiento y Tiempo Real)
La estructura de datos documental y colaborativa se nutrió de la infraestructura de *Platform*. Introduce una **Wiki Zen** con colaboración concurrente (soportada en estructuras CRDT), **Presencia Activa en Tiempo Real** (para ver quién está editando y dónde) y un potente motor de **Búsqueda Indexada local** capaz de filtrar cientos de documentos e incidencias al instante desde el Command Menu.

### 3. Ever-Teams (Organización y Rendimiento)
Las jerarquías corporativas están gobernadas por el motor de *Ever-Teams*. Presenta una **Estructura de Equipos** escalable con una compleja **Matriz de Roles** (Admin, Member, Viewer, Guest). El Tracking de Rendimiento es impulsado por Dashboards ejecutivos con curvas de progreso orgánicas generadas mediante **SVG nativo animado**, eliminando la dependencia de librerías pesadas y garantizando un impacto cero en el hilo principal (Main Thread).

---

## 👑 Manual del Usuario Maestro & Gobernanza (Feature Flags)

JIRA-REN opera bajo un principio de **Modularidad Controlada**, gobernado de forma exclusiva por el **SuperAdmin** del sistema (*Edinsson Gonzalez*). El atributo `is_master_admin` concede acceso privilegiado a la red de control arquitectónico.

### Feature Grid de Inyección en Caliente
A través de un elegante panel translúcido de cristal, el SuperAdmin puede activar o desactivar módulos del sistema (Tableros, Wiki, Equipos, Soporte, Reportes) **dinámicamente y por proyecto**. Este `FeatureGrid` ajusta la experiencia de los equipos al vuelo sin necesidad de reiniciar el servidor ni afectar la integridad de los datos.

### Interfaz Híbrida: Consola CLI Omnipresente
Para los power-users, JIRA-REN esconde una Terminal de Comandos Flotante. Pulsando `Shift + C`, se despliega una consola minimalista de cristal oscuro lavanda que permite la ejecución de comandos de texto de forma directa:
- `/move <id> <columna>`: Transición instantánea de tickets.
- `/assign @usuario`: Asignación ultrarrápida.
- `/wiki-search <query>`: Búsqueda indexada profunda.

*Nota Confidencial:* La arquitectura cuenta con un panel oculto de diagnóstico de estrés para Pruebas de QA Visual, accesible únicamente mediante el atajo de teclado maestro: `Ctrl + Shift + D`.

---

## 🚀 Stack Tecnológico y Optimizaciones UX

Para asegurar que los efectos de cristal difuminado (Backdrop Blur) no comprometieran los FPS, el ecosistema utiliza un stack altamente curado:

- **Base de Datos & ORM**: **PostgreSQL** orquestado por **Kysely** para proporcionar queries 100% tipadas en tiempo de compilación y tiempos de respuesta ultra-bajos.
- **Sincronización Inmediata**: Comunicación bidireccional por **WebSockets**, habilitando updates en el tablero de todos los usuarios en milisegundos.
- **Actualizaciones Optimistas**: En lugar de esperar al backend, la interfaz asume el éxito de una operación inmediatamente (Mutaciones Optimistas en `< 10ms`), con rollback automático sin parpadeos visuales si la transacción falla en la red.
- **Aceleración por Hardware Obligatoria**: Todo el Glassmorphism y las animaciones elásticas (rebote tipo resorte) están delegadas a la GPU utilizando la directiva CSS `transform-gpu` y opacidades, dejando el Main Thread de JavaScript completamente libre para procesar lógica de negocios.

---

## 🛠 Guía de Despliegue Rápido (Quickstart)

El proyecto está diseñado para ser desplegado en entornos corporativos con una curva de fricción cero.

### 1. Clonar e Instalar
```bash
# Navegar al directorio del proyecto
cd JIRA-REN

# Instalar dependencias puras y dependencias de UI/UX
npm install
```

### 2. Configurar Entorno
Crear el archivo `.env` en la raíz del servidor (`server/.env`) y proveer la cadena de conexión a PostgreSQL:
```env
DATABASE_URL="postgres://usuario:password@localhost:5432/jira"
```

### 3. Sembrar la Base de Datos (Smart Seeders)
Ejecutar la suite de seeders inteligentes desarrollada por Edinsson. Este script inyectará la estructura, usuarios de prueba y proyectos simulados con Feature Flags variables para pruebas de estrés.
```bash
npm run seed
```

### 4. Compilación y Ejecución
**Para entorno de desarrollo (Hot Reload Habilitado):**
```bash
npm run dev
```

**Para entorno de Producción (Enterprise):**
```bash
npm run build
npm run start
```

---

<div align="center">
  <p>Construido con pasión, precisión y elegancia por <strong>Edinsson Gonzalez</strong>.</p>
  <p><em>© 2026 RenConsultores. Todos los derechos reservados.</em></p>
</div>
