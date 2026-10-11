# 05. USER ROLES & RESPONSIBILITIES (RBAC MATRIX)
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Stakeholder Personas & Authorization Matrix
KV-TMS establishes four distinct user roles, each isolated by Spring Security `@PreAuthorize` annotations.

| Role Identifier | Security Authority | Primary Responsibilities & Functional Scope | Allowed UI Views |
| :--- | :--- | :--- | :--- |
| **Administrator** | `ROLE_ADMIN` | System administration, trade masters, user account provisioning, executive revenue analytics, DBT banking approvals. | `/admin`, `/analytics`, `/dbt` |
| **Trainer / Faculty** | `ROLE_TRAINER` | Daily batch attendance recording, practical skill grading, trade syllabus tracking, at-risk trainee alerts. | `/trainer`, `/attendance`, `/courses` |
| **Trainee / Student** | `ROLE_TRAINEE` | Self-service attendance percentage viewing, EWYL stipend status checking, course curriculum queries, certificates. | `/student`, `/stipend`, `/profile` |
| **Production Staff** | `ROLE_PROD` | Workshop work orders, BOM raw stock allocations, QA inspection pass/scrap logs, retail POS billing, AI forecasts. | `/production`, `/inventory`, `/pos` |

### 2. Privilege Escalation Prevention
* Method-level security guards REST API endpoints against unauthorized calls.
* Trainee tokens attempting administrative routes (`/api/v1/users`) receive instant **HTTP 403 Forbidden** responses with security audit logging.