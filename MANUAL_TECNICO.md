# MANUAL TÉCNICO - Sistema San Miguel Porres Backend

## Índice

1. [Introducción](#introducción)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Base de Datos](#base-de-datos)
7. [Módulos del Sistema](#módulos-del-sistema)
8. [Sistema de Autenticación y Autorización](#sistema-de-autenticación-y-autorización)
9. [API REST](#api-rest)
10. [Generación de Reportes Excel](#generación-de-reportes-excel)
11. [Manejo de Errores](#manejo-de-errores)
12. [Testing](#testing)
13. [Despliegue](#despliegue)
14. [Mantenimiento](#mantenimiento)
15. [Anexos](#anexos)

---

## 1. Introducción

### 1.1 Descripción del Proyecto

El Sistema San Miguel Porres Backend es una aplicación servidor construida con NestJS que proporciona servicios de gestión escolar integral. El sistema gestiona información de estudiantes, personal docente, administrativo, cursos, inscripciones, contratos y genera reportes de nómina.

### 1.2 Objetivo

Proveer una API REST robusta y escalable para:
- Gestión de estudiantes, representantes y empleados (docentes y personal administrativo)
- Administración de cursos y años escolares
- Control de inscripciones y evaluaciones
- Gestión de contratos de personal
- Generación automatizada de nóminas y reportes en Excel
- Sistema de autenticación y autorización basado en roles

### 1.3 Tecnologías Principales

- **Framework:** NestJS 10.0.0
- **Lenguaje:** TypeScript 5.1.3
- **Base de Datos:** PostgreSQL
- **ORM:** TypeORM 0.3.21
- **Autenticación:** JWT + Passport.js
- **Validación:** class-validator + Joi
- **Generación de Reportes:** ExcelJS
- **Testing:** Jest

---

## 2. Requisitos del Sistema

### 2.1 Requisitos de Software

- **Node.js:** >= 18.x
- **npm/yarn:** >= 8.x / >= 1.22.x
- **PostgreSQL:** >= 13.x
- **Sistema Operativo:** Linux, macOS, Windows

### 2.2 Variables de Entorno Requeridas

```env
# Servidor
PORT=3001
ENVIRONMENT=dev|local|stage|prod

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=san-miguel-db

# Autenticación
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

---

## 3. Arquitectura del Sistema

### 3.1 Patrón de Arquitectura

El proyecto implementa una **arquitectura modular en capas** siguiendo los principios de NestJS:

```
┌─────────────────────────────────────┐
│        Controllers Layer            │  ← Manejo de HTTP Requests
├─────────────────────────────────────┤
│         Services Layer              │  ← Lógica de Negocio
├─────────────────────────────────────┤
│       Repository Layer              │  ← Acceso a Datos (TypeORM)
├─────────────────────────────────────┤
│        Database (PostgreSQL)        │  ← Persistencia
└─────────────────────────────────────┘
```

### 3.2 Patrones de Diseño Implementados

1. **Dependency Injection (DI):** Inyección de dependencias nativa de NestJS
2. **Repository Pattern:** Abstracción de acceso a datos con TypeORM
3. **DTO Pattern:** Validación y transferencia de datos
4. **Action Pattern:** Encapsulación de operaciones complejas (usado en inscripciones)
5. **Guard Pattern:** Control de autorización y autenticación
6. **Middleware Pattern:** Procesamiento de requests HTTP
7. **Decorator Pattern:** Metadatos para autenticación y roles
8. **Strategy Pattern:** Múltiples estrategias de autenticación (Local, JWT)

### 3.3 Diagrama de Módulos

```
app.module
├── auth.module
├── users.module
├── people.module
│   ├── student.module
│   ├── employee.module
│   └── representative.module
├── courses.module
├── school-year.module
├── course-school-year.module
├── inscriptions.module
├── contracts.module
├── evaluations.module
└── excel.module
```

---

## 4. Instalación y Configuración

### 4.1 Instalación de Dependencias

```bash
# Clonar el repositorio
git clone <repository-url>
cd san-miguel-porres-backend

# Instalar dependencias
npm install
# o
yarn install
```

### 4.2 Configuración de Base de Datos

1. Crear base de datos PostgreSQL:
```sql
CREATE DATABASE "san-miguel-db";
```

2. Configurar variables de entorno en archivo `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=san-miguel-db
```

### 4.3 Migraciones

```bash
# Generar nueva migración (después de cambios en entidades)
npm run migration:generate

# Ejecutar migraciones pendientes
npm run migration:run

# Revertir última migración
npm run migration:revert
```

### 4.4 Seeds (Datos Iniciales)

```bash
# Poblar base de datos con datos iniciales
npm run seed
```

Esto ejecutará los siguientes seeds en orden:
1. Usuario administrador
2. Año escolar 2024 con lapsos y cortes
3. Cursos por grado
4. Profesores y trabajadores
5. Estudiantes y representantes
6. Contratos
7. Inscripciones
8. Evaluaciones

### 4.5 Ejecución del Proyecto

```bash
# Modo desarrollo
npm run start:dev

# Modo desarrollo con SWC (más rápido)
npm run dev:swc

# Modo producción
npm run build
npm run start:prod

# Modo debug
npm run start:debug
```

El servidor estará disponible en `http://localhost:3001`

---

## 5. Estructura del Proyecto

### 5.1 Árbol de Directorios

```
src/
├── app.controller.ts           # Controlador raíz
├── app.module.ts               # Módulo raíz
├── app.service.ts              # Servicio raíz
├── main.ts                     # Punto de entrada
│
├── common/                     # Código compartido
│   ├── constants/             # Constantes globales
│   ├── decorators/            # Decoradores personalizados
│   ├── dto/                   # DTOs compartidos (Page, PageOptions)
│   ├── enum/                  # Enumeraciones (Roles, EmployeeType)
│   ├── errors/                # Manejo de errores
│   ├── filters/               # Filtros globales de excepciones
│   └── transformers/          # Transformadores de datos (Decimal)
│
├── config/                     # Configuración
│   ├── database.config.ts     # Config PostgreSQL
│   ├── datasource.config.ts   # DataSource TypeORM
│   ├── environment.ts         # Validación variables entorno
│   ├── typeorm.config.ts      # Config TypeORM con transacciones
│   └── seeds/                 # Scripts de seeds
│
├── core/                       # Módulos de negocio
│   ├── auth/                  # Autenticación y autorización
│   │   ├── dto/
│   │   ├── guards/            # JWT, Local, Roles guards
│   │   ├── strategy/          # Passport strategies
│   │   └── types/
│   │
│   ├── contracts/             # Gestión de contratos
│   │   ├── dto/
│   │   └── entities/          # ContractProfessor, ContractWorker
│   │
│   ├── courses/               # Gestión de cursos
│   ├── course-school-year/    # Relación Curso-Año
│   ├── evaluations/           # Evaluaciones académicas
│   │
│   ├── excel/                 # Generación de reportes Excel
│   │   ├── actions/           # Generadores de reportes
│   │   ├── templates/         # Plantillas Excel
│   │   └── generated/         # Archivos generados
│   │
│   ├── inscriptions/          # Inscripciones de estudiantes
│   │   ├── actions/           # CRUD actions
│   │   ├── dto/
│   │   └── entities/          # Inscription, CourseInscription
│   │
│   ├── people/                # Gestión de personas
│   │   ├── people/            # Entidad base Person
│   │   ├── student/           # Estudiantes
│   │   ├── employee/          # Empleados (docentes/trabajadores)
│   │   └── representative/    # Representantes
│   │
│   ├── school-year/           # Años escolares
│   │   └── entities/          # SchoolYear, SchoolLapse, SchoolCourt
│   │
│   └── users/                 # Usuarios del sistema
│
├── middleware/                 # Middleware HTTP
│   └── auth.middleware.ts     # Validación JWT
│
└── migrations/                 # Migraciones de base de datos
```

### 5.2 Convenciones de Código

#### Nomenclatura de Archivos
- **Entidades:** `*.entity.ts` (ej: `user.entity.ts`)
- **DTOs:** `*.dto.ts` (ej: `create-user.dto.ts`)
- **Servicios:** `*.service.ts` (ej: `users.service.ts`)
- **Controladores:** `*.controller.ts` (ej: `users.controller.ts`)
- **Módulos:** `*.module.ts` (ej: `users.module.ts`)
- **Guards:** `*.guard.ts` (ej: `jwt.guard.ts`)
- **Enums:** `*.enum.ts` (ej: `role.enum.ts`)

#### Nomenclatura de Clases
- **PascalCase:** `UserEntity`, `CreateUserDto`, `UsersService`
- **Interfaces:** Prefijo `I` opcional (ej: `IUser`)

#### Nomenclatura de Variables/Funciones
- **camelCase:** `findUserById`, `userData`, `isAuthenticated`

---

## 6. Base de Datos

### 6.1 Diagrama Entidad-Relación

```
┌──────────────┐
│    Person    │ ◄────────────────────┐
│ (Base Table) │                      │
└──────┬───────┘                      │
       │                              │
       ├──── OneToOne ────► Student ──┤
       │                              │ ManyToOne
       ├──── OneToOne ────► Employee ─┤ to Representative
       │                              │
       └──── OneToOne ────► Representative
```

### 6.2 Tablas Principales

#### people (Personas)
```sql
- id: UUID (PK)
- dni: VARCHAR (UNIQUE)
- name: VARCHAR
- lastName: VARCHAR
- phone: VARCHAR
- direction: VARCHAR
- birthDate: DATE
- deletedAt: TIMESTAMP (Soft Delete)
```

#### students (Estudiantes)
```sql
- id: UUID (PK, FK → people.id)
- representativeId: UUID (FK → representatives.id)
```

#### employees (Empleados)
```sql
- id: UUID (PK, FK → people.id)
- employeeType: ENUM (professor, substitute, worker)
```

#### contracts_professors (Contratos Docentes)
```sql
- id: UUID (PK)
- professorId: UUID (FK → employees.id)
- [Múltiples campos numéricos de salario y bonificaciones]
```

#### contracts_workers (Contratos Trabajadores)
```sql
- id: UUID (PK)
- workerId: UUID (FK → employees.id)
- [Múltiples campos numéricos de salario y bonificaciones]
```

#### courses (Cursos)
```sql
- id: UUID (PK)
- name: VARCHAR
- publicName: VARCHAR
- grade: INTEGER
```

#### school_years (Años Escolares)
```sql
- id: UUID (PK)
- code: VARCHAR (UNIQUE)
- name: VARCHAR
- startDate: DATE
- endDate: DATE
```

#### school_lapses (Lapsos Escolares)
```sql
- id: UUID (PK)
- schoolYearId: UUID (FK → school_years.id)
- startDate: DATE
- endDate: DATE
- order: INTEGER
```

#### school_courts (Cortes Escolares)
```sql
- id: UUID (PK)
- schoolLapseId: UUID (FK → school_lapses.id)
- startDate: DATE
- endDate: DATE
- order: INTEGER
```

#### course_school_years (Curso-Año Escolar)
```sql
- id: UUID (PK)
- courseId: UUID (FK → courses.id)
- schoolYearId: UUID (FK → school_years.id)
- professorId: UUID (FK → employees.id)
```

#### inscriptions (Inscripciones)
```sql
- id: UUID (PK)
- studentId: UUID (FK → students.id)
- schoolYearId: UUID (FK → school_years.id)
- grade: INTEGER
- attemptType: ENUM
```

#### course_inscriptions (Inscripciones por Curso)
```sql
- id: UUID (PK)
- inscriptionId: UUID (FK → inscriptions.id)
- courseSchoolYearId: UUID (FK → course_school_years.id)
```

#### evaluations (Evaluaciones)
```sql
- id: UUID (PK)
- courseSchoolYearId: UUID (FK → course_school_years.id)
- schoolCourtId: UUID (FK → school_courts.id)
- evaluationType: ENUM
- maxGrade: DECIMAL
- description: VARCHAR
```

#### users (Usuarios)
```sql
- id: UUID (PK)
- name: VARCHAR
- email: VARCHAR (UNIQUE)
- password: VARCHAR (Hashed with bcrypt)
- role: ENUM (ADMIN, MODERATOR, TEACHER)
```

### 6.3 Relaciones Importantes

1. **Person → Student/Employee/Representative:** OneToOne (herencia por delegación)
2. **Representative → Students:** OneToMany
3. **Employee → ContractProfessor/ContractWorker:** OneToOne
4. **SchoolYear → SchoolLapses:** OneToMany
5. **SchoolLapse → SchoolCourts:** OneToMany
6. **CourseSchoolYear → Course, SchoolYear, Employee:** ManyToOne
7. **Inscription → Student, SchoolYear:** ManyToOne
8. **Inscription → CourseInscriptions:** OneToMany
9. **Evaluation → CourseSchoolYear, SchoolCourt:** ManyToOne

### 6.4 Características Especiales

#### Soft Deletes
La entidad `Person` implementa soft deletes usando `@DeleteDateColumn`:
```typescript
@DeleteDateColumn({ type: 'timestamp', nullable: true })
deletedAt: Date;
```

Esto permite "eliminar" registros sin borrarlos físicamente de la base de datos.

#### Transformador Decimal
Para campos monetarios se usa `DecimalTransformer`:
```typescript
@Column({
  type: 'decimal',
  precision: 10,
  scale: 2,
  transformer: new DecimalTransformer(),
})
salary: Decimal;
```

Esto convierte entre `Decimal.js` (en código) y `string` (en BD) para mantener precisión.

---

## 7. Módulos del Sistema

### 7.1 Módulo Auth

**Ubicación:** `src/core/auth`

**Responsabilidades:**
- Autenticación de usuarios (login)
- Registro de usuarios
- Generación y validación de tokens JWT
- Estrategias de autenticación (Local, JWT)
- Guards de seguridad

**Endpoints:**
```
POST   /auth/login       - Iniciar sesión
POST   /auth/register    - Registrar usuario (requiere ADMIN)
```

**DTOs:**
- `LoginCredentials`: email, password
- `RegisterCredentials`: name, email, password

**Servicios:**
- `validateUser(email, password)`: Valida credenciales
- `login(user)`: Genera token JWT
- `register(credentials)`: Crea nuevo usuario

**Estrategias:**
1. **LocalStrategy:** Valida email/password en login
2. **JwtStrategy:** Extrae y valida JWT de header Authorization

**Guards:**
1. **JwtGuard:** Protege rutas requiriendo JWT válido
2. **RoleGuard:** Valida roles requeridos
3. **LocalGuard:** Autenticación local

### 7.2 Módulo Users

**Ubicación:** `src/core/users`

**Responsabilidades:**
- CRUD de usuarios del sistema
- Gestión de roles y permisos
- Hasheo de contraseñas con bcrypt

**Endpoints:**
```
GET    /users           - Listar usuarios (ADMIN)
GET    /users/:id       - Obtener usuario (ADMIN)
POST   /users           - Crear usuario (ADMIN)
PUT    /users/:id       - Actualizar usuario (ADMIN)
DELETE /users/:id       - Eliminar usuario (ADMIN)
```

**Roles:**
- `ADMIN`: Acceso completo
- `MODERATOR`: Acceso a gestión de personas y cursos
- `TEACHER`: Rol reservado para futuras funcionalidades

### 7.3 Módulo People

**Ubicación:** `src/core/people/people`

**Responsabilidades:**
- CRUD de la entidad base Person
- Búsqueda por DNI
- Soft delete de personas

**Endpoints:**
```
GET    /people          - Listar personas
GET    /people/:id      - Obtener persona
POST   /people          - Crear persona
PUT    /people/:id      - Actualizar persona
DELETE /people/:id      - Eliminar (soft delete) persona
```

**DTOs:**
- `CreatePersonDto`: dni, name, lastName, phone, direction, birthDate
- `UpdatePersonDto`: Partial de CreatePersonDto

### 7.4 Módulo Student

**Ubicación:** `src/core/people/student`

**Responsabilidades:**
- CRUD de estudiantes
- Relación con representantes
- Gestión de inscripciones

**Endpoints:**
```
GET    /students        - Listar estudiantes
GET    /students/:id    - Obtener estudiante
POST   /students        - Crear estudiante
PUT    /students/:id    - Actualizar estudiante
DELETE /students/:id    - Eliminar estudiante
```

### 7.5 Módulo Employee

**Ubicación:** `src/core/people/employee`

**Responsabilidades:**
- CRUD de empleados (profesores, sustitutos, trabajadores)
- Búsqueda por tipo de empleado
- Paginación de resultados

**Endpoints:**
```
GET    /employees                  - Listar empleados
GET    /employees/paginate         - Paginación de empleados
GET    /employees/:id              - Obtener empleado
POST   /employees                  - Crear empleado
PUT    /employees/:id              - Actualizar empleado
DELETE /employees/:id              - Eliminar empleado
GET    /employees/search?type=...  - Buscar por tipo
```

**Tipos de Empleado:**
- `professor`: Docentes
- `substitute`: Suplentes
- `worker`: Personal administrativo/obrero

### 7.6 Módulo Representative

**Ubicación:** `src/core/people/representative`

**Responsabilidades:**
- CRUD de representantes
- Relación con estudiantes

**Endpoints:**
```
GET    /representatives     - Listar representantes
GET    /representatives/:id - Obtener representante
POST   /representatives     - Crear representante
PUT    /representatives/:id - Actualizar representante
DELETE /representatives/:id - Eliminar representante
```

### 7.7 Módulo Courses

**Ubicación:** `src/core/courses`

**Responsabilidades:**
- CRUD de cursos/asignaturas
- Organización por grado
- Nombres públicos y nombres internos

**Endpoints:**
```
GET    /courses         - Listar cursos
GET    /courses/:id     - Obtener curso
POST   /courses         - Crear curso
PUT    /courses/:id     - Actualizar curso
DELETE /courses/:id     - Eliminar curso
```

**DTOs:**
- `CreateCourseDto`: name, publicName, grade
- `CourseByGradeDto`: Agrupa cursos por grado

### 7.8 Módulo SchoolYear

**Ubicación:** `src/core/school-year`

**Responsabilidades:**
- CRUD de años escolares
- Gestión de lapsos escolares
- Gestión de cortes escolares

**Endpoints:**
```
GET    /school-years    - Listar años escolares
GET    /school-years/:id - Obtener año escolar
POST   /school-years    - Crear año escolar
PUT    /school-years/:id - Actualizar año escolar
DELETE /school-years/:id - Eliminar año escolar
```

### 7.9 Módulo CourseSchoolYear

**Ubicación:** `src/core/course-school-year`

**Responsabilidades:**
- Relación de curso con año escolar
- Asignación de profesores a cursos
- Listado de estudiantes por curso

**Endpoints:**
```
GET    /course-school-years           - Listar relaciones
GET    /course-school-years/paginate  - Paginación
GET    /course-school-years/:id       - Obtener relación
POST   /course-school-years           - Crear relación
PUT    /course-school-years/:id       - Actualizar relación
DELETE /course-school-years/:id       - Eliminar relación
```

**Pattern:** Usa **Action Pattern** para operaciones complejas:
- `CreateCourseSchoolYearAction`
- `FindCourseSchoolYearAction`
- `PaginateCourseSchoolYearAction`
- `UpdateCourseSchoolYearAction`
- `RemoveCourseSchoolYearAction`

### 7.10 Módulo Inscriptions

**Ubicación:** `src/core/inscriptions`

**Responsabilidades:**
- Inscripción de estudiantes en año escolar
- Inscripción de estudiantes en cursos específicos
- Paginación de inscripciones

**Endpoints:**
```
GET    /inscriptions           - Listar inscripciones
GET    /inscriptions/paginate  - Paginación
GET    /inscriptions/:id       - Obtener inscripción
POST   /inscriptions           - Crear inscripción
PUT    /inscriptions/:id       - Actualizar inscripción
DELETE /inscriptions/:id       - Eliminar inscripción
```

**Pattern:** Usa **Action Pattern** para operaciones:
- `CreateInscriptionAction`
- `FindInscriptionAction`
- `PaginateInscriptionAction`
- `UpdateInscriptionAction`
- `RemoveInscriptionAction`

### 7.11 Módulo Contracts

**Ubicación:** `src/core/contracts`

**Responsabilidades:**
- Gestión de contratos de profesores
- Gestión de contratos de trabajadores
- Búsqueda de contratos por DNI

**Endpoints:**
```
GET    /contracts              - Listar todos los contratos
GET    /contracts/professors   - Listar contratos profesores
GET    /contracts/workers      - Listar contratos trabajadores
GET    /contracts/:dni         - Buscar contrato por DNI
POST   /contracts              - Crear contrato
PUT    /contracts/:dni         - Actualizar contrato por DNI
DELETE /contracts/:dni         - Eliminar contrato por DNI
```

**Características:**
- Determina automáticamente el tipo de contrato según `employeeType`
- Múltiples campos decimales para cálculos precisos
- Validación con `class-validator`

### 7.12 Módulo Evaluations

**Ubicación:** `src/core/evaluations`

**Responsabilidades:**
- CRUD de evaluaciones académicas
- Tipos de evaluación (tarea, examen, proyecto, etc.)
- Relación con cursos y cortes escolares

**Endpoints:**
```
GET    /evaluations     - Listar evaluaciones
GET    /evaluations/:id - Obtener evaluación
POST   /evaluations     - Crear evaluación
PUT    /evaluations/:id - Actualizar evaluación
DELETE /evaluations/:id - Eliminar evaluación
```

**Tipos de Evaluación:**
- Tarea
- Examen
- Proyecto
- Asignación
- Taller
- Práctica
- Examen de Lapso

### 7.13 Módulo Excel

**Ubicación:** `src/core/excel`

**Responsabilidades:**
- Generación de reportes de nómina de profesores
- Generación de reportes de nómina de trabajadores
- Generación de registros de personal
- Organización de archivos por fecha

**Endpoints:**
```
GET    /excel/teachers-payroll    - Generar nómina docentes
GET    /excel/teachers-report     - Generar reporte docentes
GET    /excel/workers-payroll     - Generar nómina trabajadores
GET    /excel/workers-report      - Generar reporte trabajadores
```

**Pattern:** Usa **Action Pattern**:
- `GenerateTeachersPayrollAction`
- `GenerateTeachersReportAction`
- `GenerateWorkersPayrollAction`
- `GenerateWorkersReportAction`

**Características:**
- Usa plantillas Excel como base
- Completa datos desde contratos
- Calcula fórmulas automáticamente
- Agrupa en múltiples hojas si excede límite
- Organiza archivos: `/generated/YYYY-MM/DD/archivo.xlsx`

---

## 8. Sistema de Autenticación y Autorización

### 8.1 Flujo de Autenticación

```
1. Usuario envía credenciales (email, password)
   ↓
2. LocalStrategy valida credenciales
   ↓
3. AuthService genera JWT token
   ↓
4. Cliente recibe token
   ↓
5. Cliente envía token en header Authorization: Bearer <token>
   ↓
6. JwtStrategy valida token
   ↓
7. Request.user contiene datos del usuario
   ↓
8. RoleGuard valida permisos
   ↓
9. Acceso concedido/denegado
```

### 8.2 JWT Token Payload

```typescript
{
  email: string;
  userId: string;
  iat: number;    // Issued at
  exp: number;    // Expiration
}
```

### 8.3 Configuración JWT

```typescript
// src/core/auth/auth.module.ts
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
})
```

### 8.4 Decoradores Personalizados

#### @Public()
Marca una ruta como pública (sin autenticación):
```typescript
@Public()
@Post('login')
async login(@Body() credentials: LoginCredentials) {
  return this.authService.login(credentials);
}
```

#### @Roles(Role.ADMIN, Role.MODERATOR)
Especifica roles permitidos:
```typescript
@Roles(Role.ADMIN)
@Get('users')
async getUsers() {
  return this.usersService.findAll();
}
```

#### @User()
Inyecta usuario autenticado:
```typescript
@Get('profile')
async getProfile(@User() user: AuthUser) {
  return user;
}
```

### 8.5 Guards

#### JwtGuard
Valida que el request tenga un JWT válido:
```typescript
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler());
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

#### RoleGuard
Valida que el usuario tenga el rol requerido:
```typescript
@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get(ROLES_KEY, context.getHandler());
    if (!requiredRoles) return true;

    const user = context.switchToHttp().getRequest().user;
    return requiredRoles.includes(user.role);
  }
}
```

### 8.6 Middleware de Autenticación

```typescript
// src/middleware/auth.middleware.ts
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new ForbiddenException('Token not provided');

    try {
      const payload = this.jwtService.verify(token);
      req.user = payload;
      next();
    } catch {
      throw new ForbiddenException('Invalid token');
    }
  }
}
```

### 8.7 Matriz de Permisos

| Módulo | ADMIN | MODERATOR | TEACHER |
|--------|-------|-----------|---------|
| Users | ✅ CRUD | ❌ | ❌ |
| Students | ✅ CRUD | ✅ CRUD | ❌ |
| Representatives | ✅ CRUD | ✅ CRUD | ❌ |
| Employees | ✅ CRUD | ✅ CRUD | ❌ |
| Courses | ✅ CRUD | ✅ CRUD | ❌ |
| SchoolYears | ✅ CRUD | ✅ CRUD | ❌ |
| Inscriptions | ✅ CRUD | ✅ CRUD | ❌ |
| Contracts | ✅ CRUD | ✅ CRUD | ❌ |
| Evaluations | ✅ CRUD | ✅ CRUD | ❌ |
| Excel Reports | ✅ | ✅ | ❌ |

---

## 9. API REST

### 9.1 Formato de Respuestas

#### Respuesta Exitosa
```json
{
  "statusCode": 200,
  "data": { ... }
}
```

#### Respuesta con Paginación
```json
{
  "statusCode": 200,
  "data": {
    "items": [ ... ],
    "meta": {
      "page": 1,
      "perPage": 10,
      "itemCount": 5,
      "pageCount": 1,
      "hasPreviousPage": false,
      "hasNextPage": false
    }
  }
}
```

#### Respuesta de Error
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "errors": ["email must be an email"]
    }
  ]
}
```

### 9.2 Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permisos
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

### 9.3 Parámetros de Paginación

```
GET /resource?page=1&perPage=10&order=ASC
```

**Parámetros:**
- `page`: Número de página (default: 1)
- `perPage`: Items por página (default: 10)
- `order`: Orden (ASC|DESC, default: ASC)

### 9.4 Headers Requeridos

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### 9.5 Documentación Swagger

La documentación de la API está disponible en:
```
http://localhost:3001/docs
```

---

## 10. Generación de Reportes Excel

### 10.1 Arquitectura de Reportes

```
ExcelService
  └── Actions
       ├── GenerateTeachersPayrollAction
       ├── GenerateTeachersReportAction
       ├── GenerateWorkersPayrollAction
       └── GenerateWorkersReportAction
```

### 10.2 Flujo de Generación

```
1. Request a endpoint de reporte
   ↓
2. ExcelService ejecuta Action correspondiente
   ↓
3. Action carga plantilla Excel desde /templates
   ↓
4. Action consulta datos desde BD (contratos, personas)
   ↓
5. Action completa celdas de la plantilla
   ↓
6. Action calcula fórmulas si es necesario
   ↓
7. Si excede límite de filas, crea múltiples hojas
   ↓
8. Guarda archivo en /generated/YYYY-MM/DD/
   ↓
9. Retorna ruta del archivo generado
```

### 10.3 Plantillas Excel

Las plantillas se encuentran en `/src/core/excel/templates/`:
- `teachers-payroll-template.xlsx`: Nómina docentes
- `workers-payroll-template.xlsx`: Nómina trabajadores
- `teachers-report-template.xlsx`: Reporte docentes
- `workers-report-template.xlsx`: Reporte trabajadores

### 10.4 Ejemplo: Generar Nómina de Docentes

```typescript
// GET /excel/teachers-payroll
async generateTeachersPayroll() {
  // 1. Obtener contratos de profesores
  const contracts = await this.contractsRepository.find({
    relations: ['professor', 'professor.person'],
  });

  // 2. Cargar plantilla
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('templates/teachers-payroll-template.xlsx');
  const worksheet = workbook.getWorksheet(1);

  // 3. Completar datos
  let row = 3; // Fila inicial de datos
  for (const contract of contracts) {
    worksheet.getCell(`A${row}`).value = contract.professor.person.dni;
    worksheet.getCell(`B${row}`).value = contract.professor.person.name;
    worksheet.getCell(`C${row}`).value = contract.salary;
    // ... más campos
    row++;
  }

  // 4. Guardar archivo
  const filePath = this.dateOrganizedPathHelper.getPath('teachers-payroll.xlsx');
  await workbook.xlsx.writeFile(filePath);

  return { filePath };
}
```

### 10.5 Organización de Archivos

Los archivos generados se organizan por fecha:
```
src/core/excel/generated/
└── 2024-03/
    └── 15/
        ├── teachers-payroll-123456.xlsx
        ├── workers-payroll-123457.xlsx
        └── teachers-report-123458.xlsx
```

### 10.6 Límite de Filas por Hoja

Si el reporte excede las 50 filas (configurable), se crean múltiples hojas:
- Hoja 1: filas 1-50
- Hoja 2: filas 51-100
- Hoja 3: filas 101-150
- ...

---

## 11. Manejo de Errores

### 11.1 HttpExceptionFilter

Filtro global que captura todas las excepciones:

```typescript
// src/common/filters/http-exception.filter.ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = exception.getStatus?.() || 500;
    const message = exception.message || 'Internal server error';

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 11.2 Excepciones Personalizadas

```typescript
// src/common/errors/status-error.ts
export class StatusError extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super(message, status);
  }
}
```

### 11.3 Errores de Validación

Cuando `class-validator` detecta errores:
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password is required"],
  "error": "Bad Request"
}
```

### 11.4 Errores Comunes

| Error | Código | Causa |
|-------|--------|-------|
| Token inválido | 403 | JWT expirado o malformado |
| Rol insuficiente | 403 | Usuario sin permisos |
| Recurso no encontrado | 404 | ID no existe en BD |
| DNI duplicado | 409 | Constraint UNIQUE violado |
| Error de BD | 500 | Error en consulta SQL |

---

## 12. Testing

### 12.1 Configuración Jest

```json
// package.json
"jest": {
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": ["**/*.(t|j)s"],
  "coverageDirectory": "../coverage",
  "testEnvironment": "node"
}
```

### 12.2 Comandos de Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Debug mode
npm run test:debug
```

### 12.3 Ejemplo de Unit Test

```typescript
// users.service.spec.ts
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should find all users', async () => {
    const users = [{ id: '1', email: 'test@test.com' }];
    jest.spyOn(repository, 'find').mockResolvedValue(users);

    expect(await service.findAll()).toEqual(users);
  });
});
```

---

## 13. Despliegue

### 13.1 Variables de Entorno para Producción

```env
PORT=3001
ENVIRONMENT=prod

# Base de Datos
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=san-miguel-db

# JWT
JWT_SECRET=your-strong-secret-key
JWT_EXPIRES_IN=7d
```

### 13.2 Build de Producción

```bash
# Compilar proyecto
npm run build

# El código compilado estará en /dist
```

### 13.3 Ejecución en Producción

```bash
# Ejecutar migraciones
npm run migration:run

# Iniciar servidor
npm run start:prod
```

### 13.4 Despliegue con Docker (Ejemplo)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=password
      - DB_NAME=san-miguel-db
      - JWT_SECRET=secret
    depends_on:
      - postgres

  postgres:
    image: postgres:13-alpine
    environment:
      POSTGRES_DB: san-miguel-db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 13.5 Nginx Reverse Proxy (Ejemplo)

```nginx
server {
    listen 80;
    server_name api.sanmiguelporres.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 14. Mantenimiento

### 14.1 Migraciones

#### Crear Migración Manual
```bash
npm run migration:create -- src/migrations/add-new-field
```

#### Generar Migración Automática
```bash
# Después de modificar entidades
npm run migration:generate
```

#### Ejecutar Migraciones
```bash
npm run migration:run
```

#### Revertir Última Migración
```bash
npm run migration:revert
```

### 14.2 Seeds

Para regenerar datos de desarrollo:
```bash
npm run seed
```

### 14.3 Respaldo de Base de Datos

```bash
# Backup
pg_dump -U postgres -d san-miguel-db > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres -d san-miguel-db < backup_20240315.sql
```

### 14.4 Logs

NestJS usa su propio sistema de logs. Para producción se recomienda integrar:
- **Winston:** Logger estructurado
- **Morgan:** Logs HTTP
- **PM2:** Process manager con logs

### 14.5 Monitoreo

Recomendaciones:
- **Health Check Endpoint:** `/health`
- **Métricas:** Prometheus + Grafana
- **APM:** New Relic o Datadog
- **Alertas:** PagerDuty o similar

---

## 15. Anexos

### 15.1 Path Aliases

El proyecto usa path aliases configurados en `tsconfig.json`:

```typescript
// En lugar de:
import { User } from '../../../core/users/entities/user.entity';

// Se puede usar:
import { User } from '@/users/entities/user.entity';
```

**Aliases disponibles:**
- `@/*` → `src/*`
- `@/users/*` → `src/core/users/*`
- `@/auth/*` → `src/core/auth/*`
- `@/people/*` → `src/core/people/*`
- `@/courses/*` → `src/core/courses/*`
- `@/employee/*` → `src/core/people/employee`

### 15.2 Dependencias Principales

```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/typeorm": "^11.0.0",
  "@nestjs/jwt": "^11.0.0",
  "@nestjs/passport": "^11.0.5",
  "typeorm": "^0.3.21",
  "pg": "^8.13.3",
  "passport-jwt": "^4.0.1",
  "bcryptjs": "^3.0.2",
  "class-validator": "^0.14.1",
  "class-transformer": "^0.5.1",
  "exceljs": "^4.4.0",
  "decimal.js": "^10.5.0"
}
```

### 15.3 Scripts NPM Completos

```json
{
  "build": "nest build",
  "build:swc": "nest build -b swc --type-check",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:swc": "nest start -b swc --type-check",
  "dev:swc": "nest start -b swc --watch --type-check",
  "start:prod": "node dist/main",
  "start:debug": "nest start --debug --watch",
  "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli -d src/config/datasource.config.ts",
  "migration:generate": "npm run typeorm migration:generate src/migrations/schema-update",
  "migration:create": "npm run typeorm migration:create",
  "migration:run": "npm run typeorm migration:run",
  "migration:revert": "npm run typeorm migration:revert",
  "seed": "ts-node -r tsconfig-paths/register src/config/seeds/run-seeds.ts",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:e2e": "jest --config ./test/jest-e2e.json"
}
```

### 15.4 Convenciones de Commits (Recomendado)

```
feat: agregar nueva funcionalidad
fix: corregir bug
refactor: refactorizar código
docs: actualizar documentación
test: agregar tests
chore: tareas de mantenimiento
style: cambios de formato
perf: mejoras de rendimiento
```

### 15.5 Recursos Adicionales

- **Documentación NestJS:** https://docs.nestjs.com
- **Documentación TypeORM:** https://typeorm.io
- **Documentación Passport.js:** http://www.passportjs.org
- **Documentación ExcelJS:** https://github.com/exceljs/exceljs

### 15.6 Contacto y Soporte

Para reportar issues o solicitar nuevas funcionalidades, contactar al equipo de desarrollo.

---

**Fecha de última actualización:** 2025-10-21
**Versión del manual:** 1.0.0
**Versión del proyecto:** 0.0.1
