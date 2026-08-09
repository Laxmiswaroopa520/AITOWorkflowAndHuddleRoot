# AITO Workflow Generator
# Responsibility Matrix

**Document Version:** 1.0

**Last Updated:** July 2026

---

# Purpose

This document defines the ownership and responsibilities of every layer in the application.

Its purpose is to ensure:

- Clear separation of concerns
- Clean Architecture compliance
- Easier maintenance
- Parallel frontend and backend development
- Better onboarding for new developers

---

# Overall Architecture

```text
                    User
                      │
                      ▼
             React Frontend (SPA)
                      │
             HTTPS + Access Token
                      │
                      ▼
          ASP.NET Core Web API
                      │
        Application Business Layer
                      │
                      ▼
         Infrastructure Layer
                      │
                      ▼
        Entity Framework Core
                      │
                      ▼
         SQL Server / Azure SQL
```

---

# Responsibility Summary

| Layer | Responsibility |
|---------|---------------|
| React | UI & User Interaction |
| ASP.NET Core API | Business Logic |
| SQL Server | Data Persistence |
| Azure | Hosting |
| Microsoft Entra ID | Authentication |
| Microsoft Graph | People Search |

---

# Frontend Responsibilities

The React application is responsible only for presentation and user interaction.

It should NEVER contain business logic or direct database access.

## Responsibilities

✔ Rendering UI

✔ Navigation

✔ Form Validation

✔ React Query

✔ Calling Backend APIs

✔ Loading Indicators

✔ Error Messages

✔ State Management

✔ PowerPoint Export

✔ HTML Export

✔ User Notifications

✔ Authentication UI

---

## Frontend DOES NOT

❌ Connect to SQL

❌ Use EF Core

❌ Execute Business Rules

❌ Verify Ownership

❌ Validate Security Rules

❌ Access Microsoft Graph directly

❌ Know Database Schema

❌ Store Secrets

---

# Backend Responsibilities

The ASP.NET Core API is responsible for implementing the complete business layer.

---

## Responsibilities

✔ Authentication

✔ Authorization

✔ Business Validation

✔ Workflow Ownership

✔ Workflow Sharing

✔ SQL Operations

✔ Logging

✔ Exception Handling

✔ Microsoft Graph Integration

✔ DTO Mapping

✔ CQRS

✔ Entity Framework

✔ Dependency Injection

---

## Backend DOES NOT

❌ Render UI

❌ Handle HTML Styling

❌ Manage React State

❌ Store Client UI Settings

---

# Database Responsibilities

The SQL Database is responsible only for storing persistent data.

---

## Responsibilities

✔ Roles

✔ Activities

✔ Workflow Buckets

✔ AI Tools

✔ Saved Workflows

✔ Workflow Shares

✔ Audit Information

✔ Relationships

✔ Indexes

---

## Database DOES NOT

❌ Execute Business Logic

❌ Authenticate Users

❌ Generate PowerPoints

❌ Generate HTML

---

# Authentication Responsibilities

Microsoft Entra ID is responsible for:

✔ Login

✔ Logout

✔ Identity

✔ Access Tokens

✔ Token Validation

✔ User Identity

---

React Responsibilities

✔ Redirect User

✔ Acquire Token

✔ Store Token in Memory

---

Backend Responsibilities

✔ Validate JWT

✔ Extract Claims

✔ Build Current User

✔ Authorize Endpoints

---

# Microsoft Graph Responsibilities

Graph is used ONLY for:

✔ People Search

✔ User Display Names

✔ User Emails

✔ User Object IDs

---

Graph SHOULD NOT

❌ Store Workflows

❌ Store Activities

❌ Store Roles

---

# Workflow Builder Responsibilities

## Frontend

✔ Display Roles

✔ Display Activities

✔ Display AI Tools

✔ Display Buckets

✔ Select Activities

✔ Calculate Temporary Duration

✔ Show Summary

---

## Backend

✔ Load Activities

✔ Filter Activities

✔ Validate Activity Requests

✔ Return DTOs

---

## Database

✔ Store Activities

✔ Store AI Tool Mapping

✔ Store Buckets

---

# Workflow History Responsibilities

## Frontend

✔ Save Dialog

✔ History Page

✔ Restore Workflow UI

✔ Favorite Icon

---

## Backend

✔ Save Workflow

✔ Update Workflow

✔ Delete Workflow

✔ Favorite Workflow

✔ Ownership Validation

---

## Database

✔ Persist Workflow

✔ Persist Activity Mapping

---

# Workflow Sharing Responsibilities

## Frontend

✔ Share Dialog

✔ Recipient Selection

✔ Shared By Me

✔ Shared With Me

---

## Backend

✔ Share Workflow

✔ Validate Ownership

✔ Revoke Sharing

✔ Duplicate Validation

---

## Database

✔ Store Sharing Records

---

# Huddle Generator Responsibilities

## Frontend

✔ Required Huddles

✔ Other Huddles

✔ Audience Selection

✔ Preview Tabs

✔ Prompt Copy

✔ Scenarios

✔ Reflection

✔ MCEM Stages

---

## Backend

✔ Provide Activity Data

✔ Provide AI Tool Data

✔ Provide Workflow Data

---

## Database

✔ Activities

✔ Roles

✔ AI Tools

---

# PowerPoint Export Responsibilities

## Frontend

✔ Generate PPT

✔ Format Slides

✔ Download PPT

---

## Backend

No responsibility

---

## Database

No responsibility

---

# HTML Export Responsibilities

## Frontend

✔ Generate HTML

✔ Styling

✔ Copy Buttons

✔ Responsive Layout

---

## Backend

No responsibility

---

# Logging Responsibilities

## Backend

✔ Exceptions

✔ SQL Errors

✔ Authorization Failures

✔ Graph Errors

✔ API Requests

---

## Frontend

✔ Optional UI Error Logging

---

# Validation Responsibilities

## Frontend

✔ Required Fields

✔ User Experience Validation

✔ Input Formatting

---

## Backend

✔ Business Rules

✔ Authorization Rules

✔ Ownership

✔ Duplicate Checks

✔ SQL Validation

---

# Azure Responsibilities

## App Service

Hosts React

Hosts API

---

## Azure SQL

Stores Data

---

## Application Insights

Logs

Performance

Exceptions

---

## Azure DevOps

CI

CD

Deployments

---

# Clean Architecture Responsibilities

## Domain

Responsible For

✔ Entities

✔ Enums

✔ Business Rules

---

Never Contains

❌ SQL

❌ Controllers

❌ Azure

---

## Application

Responsible For

✔ Commands

✔ Queries

✔ Interfaces

✔ Validators

✔ DTO Mapping

---

Never Contains

❌ SQL

❌ Controllers

❌ HTTP

---

## Infrastructure

Responsible For

✔ EF Core

✔ SQL

✔ Graph

✔ Identity

---

## API

Responsible For

✔ Controllers

✔ Middleware

✔ Authentication

✔ Swagger

---

# Responsibility Matrix

| Feature | Frontend | Backend | Database |
|----------|----------|----------|-----------|
| Login | ✓ | ✓ | ✗ |
| Logout | ✓ | ✓ | ✗ |
| Role Selection | ✓ | ✓ | ✓ |
| Activity List | ✓ | ✓ | ✓ |
| Activity Selection | ✓ | ✗ | ✗ |
| Workflow Duration | ✓ | ✗ | ✗ |
| Save Workflow | ✓ | ✓ | ✓ |
| Update Workflow | ✓ | ✓ | ✓ |
| Delete Workflow | ✓ | ✓ | ✓ |
| Favorite Workflow | ✓ | ✓ | ✓ |
| Restore Workflow | ✓ | ✓ | ✓ |
| Share Workflow | ✓ | ✓ | ✓ |
| People Search | ✓ | ✓ | ✗ |
| Required Huddles | ✓ | ✓ | ✓ |
| Other Huddles | ✓ | ✓ | ✓ |
| PPT Export | ✓ | ✗ | ✗ |
| HTML Export | ✓ | ✗ | ✗ |
| Authentication | ✓ | ✓ | ✗ |
| Authorization | ✗ | ✓ | ✗ |
| Logging | ✗ | ✓ | ✗ |

---

# Responsibility Principles

The following principles must always be followed:

1. Frontend is responsible for presentation only.
2. Backend owns all business logic.
3. SQL stores only persistent data.
4. React never accesses SQL directly.
5. Controllers never access DbContext directly.
6. Business logic never exists in React components.
7. Domain layer never depends on Infrastructure.
8. DTOs are the only objects exchanged between frontend and backend.
9. Authentication is handled by Microsoft Entra ID.
10. Workflow ownership is always validated in the backend.

---

# Definition of Done

The Responsibility Matrix is considered complete when:

- Every feature has a clearly identified owner.
- No responsibility overlaps unnecessarily.
- Frontend and Backend teams can work independently.
- Clean Architecture principles are preserved.
- All future features follow this ownership model.
