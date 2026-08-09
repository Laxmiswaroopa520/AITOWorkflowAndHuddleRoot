\
# AITO Workflow Generator
# dependency-rules.md

**Document Version:** 1.0  
**Last Updated:** July 2026

---

# Purpose

This document defines the dependency rules for the AITO Workflow Generator solution based on **Clean Architecture**. These rules ensure low coupling, high cohesion, maintainability, testability, and scalability.

---

# Clean Architecture Overview

```text
                  ┌────────────────────┐
                  │        API         │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │    Application     │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │      Domain        │
                  └────────────────────┘

                  ▲
                  │
          ┌────────────────────┐
          │  Infrastructure    │
          └────────────────────┘
```

**Dependency Direction:** All dependencies point inward toward the Domain.

---

# Dependency Principle

- Inner layers never depend on outer layers.
- Outer layers may depend on inner layers.
- Domain is independent of all frameworks and infrastructure.
- Infrastructure implements abstractions defined by the Application layer.

---

# Allowed Project References

| Project | Can Reference |
|----------|---------------|
| API | Application, Infrastructure, Contracts |
| Application | Domain, Contracts |
| Infrastructure | Application, Domain |
| Domain | None |
| Contracts | None |

---

# Forbidden Project References

| Project | Must NOT Reference |
|----------|--------------------|
| Domain | API, Infrastructure, EF Core, SQL, ASP.NET Core |
| Application | API, React, SQL, Controllers |
| Infrastructure | API |
| Contracts | Domain, Infrastructure |

---

# Layer Responsibilities

## Domain

Responsible for:

- Entities
- Enums
- Value Objects
- Domain Rules
- Domain Exceptions
- Constants

Must never contain:

- DbContext
- Controllers
- Repositories
- EF Core
- Azure SDK
- Microsoft Graph
- HTTP calls

---

## Application

Responsible for:

- Use Cases
- Commands
- Queries
- CQRS Handlers
- Validators
- Interfaces
- DTO Mapping

Depends on:

- Domain
- Contracts

Must never contain:

- SQL
- HTTP
- Controllers
- UI Logic

---

## Infrastructure

Responsible for:

- Entity Framework Core
- DbContext
- Repository Implementations
- Microsoft Graph
- Authentication Services
- External Integrations
- File Storage
- Logging

Depends on:

- Domain
- Application

---

## API

Responsible for:

- Controllers
- Authentication
- Authorization
- Middleware
- Dependency Injection
- Swagger
- Exception Handling

Depends on:

- Application
- Infrastructure
- Contracts

---

## Contracts

Responsible for:

- Request DTOs
- Response DTOs
- Shared API Models

Must not contain business logic.

---

# Folder Dependency Rules

## Frontend

```text
components
     ▲
features
     ▲
pages
     ▲
app
```

Rules:

- Components must be reusable.
- Features may use components.
- Pages compose features.
- API calls are centralized in the API layer.
- UI never communicates directly with SQL or Microsoft Graph.

---

## Backend

```text
API
 ↓
Application
 ↓
Domain

Infrastructure
 ↓
Application
 ↓
Domain
```

---

# Database Access Rules

Allowed:

```text
Controller
    ↓
Command / Query
    ↓
Handler
    ↓
Repository Interface
    ↓
Repository
    ↓
DbContext
    ↓
SQL Server
```

Not Allowed:

```text
Controller
      ↓
DbContext
```

---

# Interface Rules

Interfaces belong in the Application layer.

Implementations belong in Infrastructure.

Example:

```text
Application
 └── Interfaces
      └── IWorkflowRepository

Infrastructure
 └── Repositories
      └── WorkflowRepository
```

---

# DTO Rules

- DTOs are exchanged between frontend and backend.
- Entities are never exposed directly.
- Mapping is performed inside the Application layer.

---

# Entity Rules

Entities:

- Represent business data.
- Do not depend on EF Core attributes where avoidable.
- Contain business behavior and invariants.

---

# Dependency Injection Rules

Register services only in:

- API (Program.cs)
- Infrastructure (DependencyInjection.cs)
- Application (DependencyInjection.cs)

Never register services inside Domain.

---

# Validation Rules

Frontend:

- Required field validation
- UX validation

Backend:

- Business validation
- Authorization
- Duplicate checks
- Ownership validation

---

# Repository Rules

Repositories:

- Hide EF Core implementation.
- Expose business-friendly methods.
- Return entities or aggregates.

Repositories must not contain UI logic.

---

# Controller Rules

Controllers should:

- Receive requests.
- Validate model state.
- Call Application.
- Return HTTP responses.

Controllers should not:

- Contain business logic.
- Access DbContext directly.

---

# Security Rules

- Authentication via Microsoft Entra ID.
- Authorization enforced in the API.
- Secrets stored outside source code.
- Frontend never stores connection strings.

---

# Testing Rules

Unit Tests:

- Domain
- Application

Integration Tests:

- API
- Infrastructure
- Database

Frontend:

- Component tests
- API integration tests

---

# Dependency Checklist

Before adding a new dependency, verify:

- [ ] Does it respect Clean Architecture?
- [ ] Does it point inward?
- [ ] Does Domain remain independent?
- [ ] Is Infrastructure implementing an Application interface?
- [ ] Are DTOs used instead of entities?
- [ ] Is database access through repositories?
- [ ] Is business logic outside controllers?

---

# Definition of Done

Dependency rules are satisfied when:

- Every project references only permitted projects.
- No circular dependencies exist.
- Domain has zero infrastructure dependencies.
- Business logic resides only in the Application/Domain layers.
- Controllers remain thin.
- Infrastructure contains all external integrations.
