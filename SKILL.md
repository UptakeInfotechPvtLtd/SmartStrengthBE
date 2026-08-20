---
name: smart-strength-api-development-standards
description: >
  Strict development standards for this Express, TypeScript, TypeORM API codebase.
  Use before every coding task in this repository, especially when creating new APIs,
  modules, database entities, relationships, migrations, validations, DTOs, services,
  repositories, configuration, enums, interfaces, or feature changes.
---

# Smart Strength API Development Standards

This file is the single source of truth for all future code generation and feature implementation in this repository. Before any coding task, read this file first, inspect the existing codebase, find the most similar and most recent existing module, and follow that module as the primary reference. User-specified requirements have priority, but implementation must still preserve this repository's architecture, naming, response shape, error handling, authentication, authorization, database, and validation standards.

## Mandatory Workflow

For every coding prompt, follow this exact process:

1. Read this `SKILL.md`.
2. Inspect the existing codebase before editing.
3. Find the most similar and most recent module or feature.
4. Understand its complete flow: route, controller, validation, DTO, service, repository, entity, relations, database operations, responses, auth, messages, and exports.
5. Search before creating any new file, helper, validator, repository method, interface, enum, constant, utility, DTO, config entry, or message.
6. Reuse existing implementations and patterns whenever possible.
7. Plan affected files before editing.
8. Implement only required changes.
9. Register routes, exports, repositories, services, entities, DTOs, validations, config, messages, enums, and interfaces in the same style as existing modules.
10. Add or update migrations for database schema changes.
11. Verify route flow, validation, auth, permissions, entities, relations, joins, cascade behavior, migrations, responses, messages, and type safety.
12. Run relevant checks when possible, such as `npm run build`, targeted tests if present, or TypeScript checks.
13. Provide a concise summary of changed files, APIs added or modified, database changes, and important business logic.

Never introduce a new architecture or style when an existing pattern can handle the task.

## Codebase Architecture

This project uses:

- Express routes in `src/routes`.
- Controllers in `src/controllers`.
- Services in `src/services`.
- TypeORM repositories in `src/utils/database/db/repository`.
- TypeORM entities in `src/utils/database/db/entity`.
- TypeORM migrations in `src/utils/database/db/migration`.
- Zod validations in `src/validations`.
- DTOs in `src/dto`.
- Shared config, interfaces, enums, and constants in `src/config`.
- Messages in `src/lang/api-messages.ts`.
- Dependency wiring in `src/utils/di.ts`.
- Route wrapping via `routeHandler`.
- Auth guards via `verifyToken` and `optionalVerifyToken`.
- Standard success response via `BaseResponseDto`.
- Pagination helpers via `getOffset` and `buildPagination`.
- Repository error wrapper via `handleError`.

Always follow the route to controller to service to repository to entity flow unless existing code for that exact module does otherwise.

## Module Structure

When creating a new module, mirror the closest existing module. Strong references:

- Simple CRUD module: package.
- CRUD with many-to-many join entity: session.
- Auth and user-role behavior: auth and user.
- File upload or dropdown behavior: common.
- CMS/video-style behavior: cms.

Typical module files:

- `src/routes/<module>.routes.ts`
- `src/controllers/<module>.controllers.ts`
- `src/services/<module>.services.ts`
- `src/validations/<module>.validations.ts`
- `src/dto/<module>/index.ts`
- `src/dto/<module>/response/index.ts`
- `src/dto/<module>/response/<module>.response.dto.ts`
- `src/utils/database/db/entity/<module>.entity.ts`
- `src/utils/database/db/repository/<module>/index.ts`
- `src/utils/database/db/repository/<module>/<module>.repo.ts`
- `src/utils/database/db/migration/<timestamp>-<migration-name>.ts`

Do not create folders or layers that are not already part of this architecture unless the user explicitly requests them and they are necessary.

## Registration And Exports

When adding a module, update all required registration points:

- Add route import and `defaultRoutes` entry in `src/routes/index.ts`.
- Export controller in `src/controllers/index.ts`.
- Export service in `src/services/index.ts`.
- Export validation file in `src/validations/index.ts`.
- Export DTO folder from `src/dto/index.ts`.
- Export DTO response files through module-level `index.ts` files.
- Export repository folder from `src/utils/database/db/repository/index.ts`.
- Export repository file from its folder `index.ts`.
- Add repository and service instances to `src/utils/di.ts`.
- Import entity and add it to `entities` array in `src/utils/database/db/entity/index.ts`.
- Export entity from `src/utils/database/db/entity/index.ts`.

Verify every new import path follows existing relative import style.

## Routes

Routes must be thin and match existing patterns:

- Use `Router` from `express`.
- Instantiate controller with service from `src/utils`.
- Define role arrays such as `manageRoles` and `viewRoles` using `Roles` from `src/config`.
- Use `verifyToken(roles)` for protected routes.
- Use `optionalVerifyToken(roles)` only when existing similar behavior allows anonymous access.
- Use `validate(schema)` before `routeHandler`.
- Use `routeHandler(controller.method)` for all async controller actions.
- Keep REST route order consistent: create, list, get by id, update, status patch, delete, then special routes as needed.
- Put fixed routes before `/:id` if they would otherwise conflict.
- Do not place business logic in routes.

Common CRUD route shape:

- `POST /`
- `GET /`
- `GET /:id`
- `PUT /:id`
- `PATCH /:id/status`
- `DELETE /:id`

Only add endpoints required by the task.

## Controllers

Controllers must stay thin:

- Inject the service through the constructor.
- Bind all controller methods in the constructor.
- Type requests with `IAuthenticatedRequest` from `src/config`.
- Use validation payload types from `src/validations`.
- Pass `req.body`, `req.params`, `req.query`, `req.user`, or `req.file` to the service as needed.
- Return `new BaseResponseDto(message, result)` for success responses.
- Return `new BaseResponseDto(message)` for delete or no-data success responses.
- Use messages from `src/lang/api-messages.ts`.
- Do not perform database queries in controllers.
- Do not perform business rule checks in controllers unless an existing equivalent controller already does.

For list and get responses, preserve existing module style. Some current modules use an empty message for read operations; if adding new APIs, prefer the closest module's behavior unless the user specifies message text.

## Services

Services own business logic:

- Inject repositories through the constructor.
- Validate business rules before writes.
- Convert request payload camelCase into entity snake_case.
- Convert numeric database strings when needed through DTOs.
- Use private helper methods for repeated business checks such as `getEntity`, `ensureNameUnique`, `ensureBranchesAllowed`.
- Throw project exceptions such as `BadRequestException`, `NotFoundException`, `ConflictException`, `ForbiddenException`, or `UnauthorizedException`.
- Use messages from `src/lang/api-messages.ts`; do not hardcode user-facing text.
- Return DTOs, not raw entities, unless an existing closest module does otherwise.
- Keep logic scoped to the requested feature.
- Do not add unrelated refactors.
- Do not duplicate repository logic in services.
- Do not bypass validation with `any` unless existing generic request typing requires it and a better local type is not available.

When using authenticated users:

- Pass `req.user` from controller to service.
- Use `IJwtPayload` or existing auth request types.
- Enforce role-specific business rules in service, not route alone.
- Follow existing examples such as `SessionService.ensureBranchesAllowed`.

## Repositories

Repositories own database access:

- Extend `Repository<Entity>`.
- Constructor accepts `DataSource` and calls `super(Entity, dataSource.createEntityManager())`.
- Wrap database operations with `handleError`.
- Use TypeORM repository methods or query builders, not raw SQL, unless migration or complex SQL requires it.
- Use `findOne`, `save`, `createQueryBuilder`, `softDelete`, `manager.delete`, `manager.create`, or transactions according to existing patterns.
- Keep method names explicit, such as `findPackageById`, `createPackage`, `updatePackage`, `softDeletePackage`, `listPackages`.
- Return typed entities or typed object results.
- Do not hide business errors in repositories.
- Do not apply role or permission rules in repositories unless query scoping requires it.

For list methods:

- Use `getOffset(query)` for pagination.
- Return `{ items, total, page, pageSize, offset }` with module-specific item name.
- Use `Brackets` for grouped search conditions.
- Use `ILIKE` for case-insensitive search in PostgreSQL.
- Normalize boolean query filters when existing validations can provide string values.
- Whitelist allowed `orderBy` values in validation before using them in query builder.
- Use module alias names that match table meaning, such as `package`, `session`, `branch`.
- Use `.skip(offset).take(limit)`.
- Use `.getManyAndCount()` for paginated results.
- Provide a safe default result to `handleError` for list methods, matching existing list repos.

## DTOs And Responses

DTOs shape API output:

- Put response DTOs under `src/dto/<module>/response`.
- Export through `response/index.ts`, module `index.ts`, and root `src/dto/index.ts`.
- Use camelCase response fields.
- Map from entity snake_case fields to response camelCase fields.
- Convert numeric strings from PostgreSQL numeric columns to numbers in DTOs.
- Convert nested relation entities into nested DTOs or simple objects based on closest module.
- Include pagination using list response DTOs and `IPaginationMeta`.
- Use `results` and `pagination` for paginated list responses, matching existing modules.
- Avoid exposing internal join entity details unless existing similar DTOs do.
- Do not leak password, token, deleted_at, or internal-only fields.

Controllers must wrap DTOs in `BaseResponseDto`.

## Validation

Validation uses Zod in `src/validations`:

- Define body, params, query, and file schemas in the module validation file.
- Export schema objects such as `createPackageSchema`, `updatePackageSchema`, `packageIdSchema`, `listPackagesSchema`.
- Export inferred payload types using `z.infer`.
- Keep request payloads camelCase.
- Use `.strict()` on object schemas unless the closest module does not.
- Use shared validation helper patterns from existing files before adding new helpers.
- Use `z.coerce.number()` for numeric query/body values that may arrive as strings.
- Use `z.preprocess` for boolean query strings when existing behavior supports `true` and `false`.
- Use UUID validation consistent with existing `uuidRegex` unless a shared UUID schema already exists.
- Use `optionalString` style patterns for optional nullable string payloads.
- Whitelist `orderBy` values with `z.enum`.
- Transform `order` to uppercase as `'ASC' | 'DESC'`.
- Keep validation error messages in `validationMessages` inside `src/lang/api-messages.ts`.
- Do not hardcode validation messages inside schema definitions.

When adding validations, also update `src/validations/index.ts`.

## Messages

All API and user-facing messages must live in `src/lang/api-messages.ts` or the project-designated message file.

Rules:

- Use `messages` for API success and business error messages.
- Use `validationMessages` for validation failures.
- Search existing message keys before adding new ones.
- Reuse existing generic messages where suitable.
- Add new keys near related module messages.
- Keep message style consistent with existing messages.
- Do not hardcode user-facing text in routes, controllers, services, middleware, validations, repositories, or DTOs.
- Do not create a new message file unless existing project structure already uses one for the same purpose.

## Entities

Entities use TypeORM decorators:

- Store entity files in `src/utils/database/db/entity`.
- Use PascalCase entity class names ending in `Entity`.
- Use table names that match existing naming style, currently PascalCase plural names such as `Packages`, `Sessions`, `SessionBranches`.
- Use `@PrimaryGeneratedColumn('uuid')` for primary IDs unless an existing closest module requires another key.
- Use snake_case column names.
- Use camelCase property names only for relation properties or when existing entity does so.
- Use `@CreateDateColumn({ type: 'timestamp' })`.
- Use `@UpdateDateColumn({ type: 'timestamp' })`.
- Use `@DeleteDateColumn({ type: 'timestamp', nullable: true })` for soft-delete modules.
- Add indexes for common filters and sorting: status, deleted_at, created_at, unique fields, foreign keys.
- For unique constraints on soft-delete tables, use partial unique indexes where existing pattern applies, such as `where: '"deleted_at" IS NULL'`.
- Use appropriate PostgreSQL column types: `varchar` with length, `text`, `boolean`, `int`, `numeric` with precision and scale, `timestamp`, `uuid`.
- Mark nullable fields with `nullable: true` and TypeScript `| null`.
- Keep defaults explicit when needed, such as `{ default: true }`.
- Add entity to `entities` array and export it from entity index.

Do not add entity columns that are not required by the user or business rule.

## Relationships, Joins, Foreign Keys, And Delete Behavior

When adding relationships, inspect existing relationship modules first, especially:

- `SessionEntity` and `SessionBranchEntity`.
- `UserEntity` and `UserBranchEntity`.
- Branch relations.
- User performance metric relations.

Relationship decisions must be explicit:

- Determine relation type: `OneToOne`, `OneToMany`, `ManyToOne`, or many-to-many through a join entity.
- Determine owning side.
- Add `@JoinColumn({ name: '<foreign_key>_id' })` only on owning side.
- Add indexes on foreign key relations.
- Add unique indexes for join pairs when duplicates must be prevented.
- Decide `nullable` based on business requirements and existing module behavior.
- Decide `onDelete` based on business requirements and existing module behavior.
- Never add `cascade: true` automatically.
- Never add `onDelete: 'CASCADE'` automatically.
- Use cascade only when child lifecycle is fully owned by parent and closest existing pattern supports it.
- Prefer soft delete for business records when existing module uses `DeleteDateColumn` and `softDelete`.
- Use hard delete for pure join rows only when existing join update patterns do it.
- Avoid circular imports and keep relation imports explicit.

For many-to-many style relationships, prefer explicit join entities as existing modules do, not TypeORM implicit many-to-many decorators, unless the repository already uses implicit many-to-many for the same domain.

For joins in queries:

- Use `leftJoinAndSelect` when response needs related data.
- Use `leftJoin` when filtering by relation but response does not need relation fields.
- Keep aliases clear and consistent.
- Avoid loading large relations unless API response requires them.
- Ensure DTO handles missing nullable relations safely.

## Migrations

Database schema changes require migrations:

- Create migration files in `src/utils/database/db/migration`.
- Use timestamp prefix naming consistent with existing files.
- Implement both `up` and `down`.
- Keep table names, column names, indexes, foreign keys, unique constraints, defaults, nullable behavior, and delete behavior aligned with entity definitions.
- Include join tables and relation constraints when adding relationships.
- Create indexes for common filters, foreign keys, unique constraints, deleted_at, created_at, and status where applicable.
- For soft-delete uniqueness, use partial unique indexes in PostgreSQL when needed.
- Do not modify old migrations unless explicitly required for local unreleased work.
- Prefer creating a new migration for new schema changes.
- Verify migration SQL matches TypeORM entity decorators.
- Ensure down migration reverses up migration in safe order: drop foreign keys and indexes before dropping columns or tables.

Use package scripts when needed:

- `npm run migration:generate`
- `npm run migration:create`
- `npm run migration:up`
- `npm run migration:down`
- `npm run migration:show`

Do not run destructive migration commands against real data without explicit user approval.

## Pagination, Filtering, Sorting, And Search

For list APIs:

- Validate `page` and `pageSize` as positive integers.
- Use max `pageSize` of 100 unless closest module differs.
- Use `getOffset(query)`.
- Return `buildPagination({ totalResults, page, pageSize, offset })`.
- Support `search` only on fields requested or obvious from existing module.
- Group search conditions with `Brackets`.
- Use `ILIKE` for text search.
- Validate `orderBy` with a whitelist.
- Validate `order` as `ASC` or `DESC`, accepting lowercase only if existing pattern does.
- Apply default sort `created_at DESC` unless closest module uses another default.
- Apply status filtering consistent with existing boolean or enum status patterns.
- Avoid exposing arbitrary order fields to query builder.

## Authentication, Authorization, Guards, And Permissions

Use existing auth patterns:

- Import `Roles` from `src/config`.
- Protect routes with `verifyToken`.
- Use role arrays in routes.
- Use `Roles.Admin`, `Roles.SubAdmin`, `Roles.Trainer`, and `Roles.User` exactly as defined.
- Use `allowedRoles` carefully; never use `'*'` unless an existing route pattern or user requirement supports it.
- Put business-specific authorization in service methods.
- Use `req.user` from `IAuthenticatedRequest`.
- Do not trust client-provided user IDs when authenticated user context should determine ownership.
- Preserve current token blacklist and Redis session behavior.
- Do not bypass `verifyToken` for protected APIs.

When adding role behavior, update enums only if a new role is explicitly required and all downstream effects are understood.

## Transactions

Use transactions when a feature performs multiple dependent writes that must succeed or fail together, such as:

- Creating a parent and multiple child rows without cascade ownership.
- Updating join rows and parent state together.
- Booking, payment, inventory, slot, or status workflows where partial writes break business rules.
- Deleting or restoring records across multiple related tables.

Transaction standards:

- Prefer TypeORM `DataSource.transaction` or `this.manager.transaction` based on closest existing repository pattern.
- Keep transaction boundaries in service or repository according to existing module style.
- Use the transaction manager for every read and write inside the transaction.
- Do not mix global repository writes with transaction-manager writes.
- Keep transaction work small and deterministic.
- Throw project exceptions for business failures before or inside transaction as appropriate.

## Error Handling

Use project exception classes:

- `BadRequestException` for invalid business input.
- `UnauthorizedException` for missing or invalid authentication where applicable.
- `ForbiddenException` for permission denial.
- `NotFoundException` for missing resources.
- `ConflictException` for duplicate or conflicting resources.

Rules:

- Use messages from `src/lang/api-messages.ts`.
- Let `routeHandler` pass errors to middleware.
- Do not catch errors in controllers unless existing matching code requires it.
- Repository methods may use `handleError`, matching existing patterns.
- Do not swallow business errors by wrapping service logic in `handleError`.
- Do not return `null` for expected business failures from services; throw the correct exception.

## Configuration, Constants, Enums, Interfaces, And Types

Before adding shared definitions, search for existing ones.

Configuration:

- Put config in `src/config` or existing config subfiles.
- Use existing config export structure.
- Do not read `process.env` directly when an existing config helper should own it.

Constants:

- Put shared constants in `src/config/constant.ts` or the project-designated constants file.
- Do not create module-local constants unless they are only used in that one file and not user-facing.

Enums:

- Put shared enums in `src/config/enum.ts` or the existing enum folder if one is introduced later.
- Reuse existing enums when values match.
- Do not duplicate string literal unions when a project enum already exists.
- Do not add enum values without checking all affected validation, DTO, database, and business logic.

Interfaces and types:

- Put shared interfaces in `src/config/interface.ts` or the existing interface folder if one is introduced later.
- Keep request validation payload types in validation files using `z.infer`.
- Keep DTO-only types near DTOs only when not shared.
- Avoid `any`; use existing generic types such as `IAuthenticatedRequest<P, B, Q>`.
- Export new shared interfaces from `src/config/index.ts` if required by existing export structure.

## Naming Conventions

Follow existing naming:

- Files: kebab-case or existing module pattern, such as `package.services.ts`, `package.controllers.ts`, `package.validations.ts`, `package.entity.ts`, `package.repo.ts`.
- Classes: PascalCase, such as `PackageService`, `PackageController`, `PackageRepository`, `PackageEntity`, `PackageResponseDto`.
- Methods: camelCase with entity name, such as `createPackage`, `updatePackageStatus`, `findPackageById`.
- Variables: camelCase.
- Database columns: snake_case.
- Database tables: existing PascalCase plural style unless closest module differs.
- Route paths: lowercase resource names.
- Validation schema exports: `<action><Module>Schema`.
- Validation payload types: `<Action><Module><Body|Params|Query>Payload`.
- Message keys: camelCase and module-specific.

Do not rename existing APIs, files, classes, columns, or message keys unless explicitly requested.

## File Organization

Keep files in established folders:

- Routes: `src/routes`.
- Controllers: `src/controllers`.
- Services: `src/services`.
- Repositories: `src/utils/database/db/repository/<module>`.
- Entities: `src/utils/database/db/entity`.
- Migrations: `src/utils/database/db/migration`.
- Validations: `src/validations`.
- DTOs: `src/dto/<module>`.
- Shared config: `src/config`.
- Middleware: `src/utils/middleware`.
- Utilities: `src/utils`.
- Messages: `src/lang/api-messages.ts`.

Do not create new top-level folders for ordinary API work.

## Database Operations

Database standards:

- Use TypeORM repository and query builder APIs.
- Use `save` for create and update when matching existing modules.
- Use `softDelete` for entities with `DeleteDateColumn`.
- Use hard delete for join table replacement only if closest module does it.
- Validate existence before update or delete.
- Validate uniqueness before create or rename.
- Use partial unique indexes for unique soft-deleted records.
- Convert numeric request values to fixed precision strings for numeric columns when existing modules do.
- Convert numeric response values back to numbers in DTOs.
- Do not perform database operations in routes or controllers.
- Do not add raw SQL in runtime code unless TypeORM cannot express the operation cleanly.

## Feature Implementation Standards

When implementing a new feature:

- Identify every affected file before editing.
- Keep changes narrow.
- Follow closest existing module first.
- Add validation for every request body, params, query, and file input.
- Add DTOs for every response shape.
- Add service business rules.
- Add repository methods only for needed database operations.
- Add messages and validation messages.
- Add or update enums, interfaces, config, and constants only when needed.
- Add entity relations and migrations only when schema requires them.
- Register all exports.
- Verify imports and no unused code.
- Preserve existing APIs.
- Avoid unrelated formatting churn.
- Avoid speculative abstractions.
- Avoid duplicate helpers.

## Pre-Implementation Checklist

Before editing, answer these from code inspection:

- Which existing module is the closest reference?
- Which route pattern matches?
- Which roles can create, read, update, delete, or perform custom actions?
- Which request fields need validation?
- Which messages already exist and which must be added?
- Which DTO shape matches the response?
- Which repository methods already exist and can be reused?
- Which entities are affected?
- Are relationships needed?
- Is cascade or delete behavior required by business logic?
- Is a migration needed?
- Is a transaction needed?
- Which exports and dependency wiring must be updated?

## Post-Implementation Checklist

After editing, verify:

- Route is registered in `src/routes/index.ts`.
- Controller is exported and all methods are bound.
- Service is exported and dependency-injected in `src/utils/di.ts`.
- Repository is exported and instantiated.
- Entity is exported and added to `entities`.
- Validation is exported.
- DTOs are exported.
- Messages are added to `src/lang/api-messages.ts`.
- Interfaces and enums are in correct config files.
- Constants are in correct constants file.
- Auth and role permissions match requirements.
- Business authorization is enforced in service.
- Relations include correct owning side and `JoinColumn`.
- Foreign keys, indexes, nullable behavior, unique constraints, cascade behavior, and delete strategy are deliberate.
- Migration matches entity schema and has safe `down`.
- Pagination, filtering, sorting, and search are validated and safe.
- Response format uses `BaseResponseDto` and DTOs.
- No unused imports, dead code, duplicate helpers, or unrelated refactoring.
- TypeScript build passes when checks are available.

## Final Response Standard

For every completed coding task, provide a concise summary with:

- Files changed.
- APIs added or modified.
- Database changes and migrations.
- Important business logic.
- Verification performed or not performed.

Keep final response short and focused. Mention blockers or skipped verification clearly.
