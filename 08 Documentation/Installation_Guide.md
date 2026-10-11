# SYSTEM INSTALLATION, DEPLOYMENT & OPERATIONS GUIDE
## KISS Vocational Training Management System (KV-TMS) • Production Deployment Manual

---

**Author & Candidate:** Mansi Sinha (Roll No: 2205160, B.Tech CSE)  
**Institution:** School of Computer Science & Engineering, KIIT Deemed to be University  
**Implementation Partner:** Kalinga Institute of Social Sciences (KISS)  
**Document Reference:** `KV-TMS-INST-08` | **Release:** `v1.0.0-RELEASE` | **Date:** October 8, 2026  
**Target Environments:** Local Development Workstation, Campus Staging Server, Enterprise Production Server  

---

## 1. System Architecture & Three-Tier Topology Overview

The KISS Vocational Training Management System (KV-TMS) is engineered upon an enterprise three-tier client-server architectural topology. The platform isolates user interface interactions, core business microservices, and relational transactional persistence into decoupled layers, guaranteeing high availability, data integrity, and strict Role-Based Access Control (RBAC).

> **Tier 1 (Client Presentation):** React 18.2 Single Page Application (SPA) built with Vite 5, styled via Tailwind CSS 3.4, and rendering Recharts 2.12 executive data visualizations.  
> **Tier 2 (Application & Microservices):** Spring Boot 3.3.4 microservices running on Java 17 LTS, leveraging Spring Security 6, stateless JWT token filters, and Spring Data JPA / Hibernate.  
> **Tier 3 (Data Persistence):** MySQL 8.0.x Community Server executing ACID-compliant InnoDB relational transactions, pessimistic inventory locking, and `utf8mb4` Unicode storage.

---

## 2. Hardware Prerequisites & Sizing Matrix

| Infrastructure Layer | Minimum Developer Machine | Recommended Production Server | Operational Sizing Justification |
| :--- | :--- | :--- | :--- |
| **Central Processing Unit (CPU)** | Dual-Core 2.0 GHz (x86_64) | Quad-Core 3.2 GHz or AWS c6i.xlarge | Accommodates concurrent Spring Boot threads, Recharts calculations, and Holt-Winters forecasting. |
| **System Memory (RAM)** | 8 GB Physical Memory | 16 GB DDR4/DDR5 ECC RAM | JVM Heap (2 GB), MySQL InnoDB Buffer Pool (4 GB), Node build cache, and OS kernel buffers. |
| **Solid State Storage (SSD)** | 20 GB Free NVMe/SATA SSD | 100 GB High-IOPS Enterprise SSD | Ensures high-throughput disk I/O for MySQL write-ahead logs (WAL), nightly dumps, and build artifacts. |
| **Network Interface Card** | 100 Mbps Ethernet / Wi-Fi | 1 Gbps Redundant Uplink | Supports concurrent POS transactions, biometric studio sync, and high-resolution certificate generation. |

---

## 3. Software Dependencies & Runtime Environment Matrix

| Software Component | Required Version | Vendor / Source | Verification Command & Expected Output |
| :--- | :--- | :--- | :--- |
| **Java Development Kit (JDK)** | Java 17 LTS (64-bit) | Eclipse Temurin / Oracle JDK | `java -version` → `openjdk version "17.0.x"` |
| **Build Automation Tool** | Apache Maven 3.9+ | Bundled Maven Wrapper (`./mvnw`) | `.\mvnw.cmd -version` → `Apache Maven 3.9.x` |
| **Node.js & NPM** | Node 18.0+ / 20.0+ / 24+ | Node.js Foundation (LTS) | `node -v` → `v24.21.0` • `npm -v` → `10.x.x` |
| **Database Management System** | MySQL Server 8.0.x | Oracle MySQL Community | `mysql --version` → `mysql  Ver 8.0.x for Win64` |
| **Web Browser Engine** | Modern Evergreen | Microsoft Edge, Chrome, Firefox | Microsoft Edge 120+, Chrome 120+, Safari 17+ |

---

## 4. Database Server Installation, Setup & Configuration

KV-TMS requires MySQL Server 8.0 configured with the InnoDB storage engine and case-insensitive Unicode character collation to ensure robust entity relationships across tribal student rosters, academic syllabi, and commercial transactions.

### 4.1 Service Startup & Health Verification
Verify that the local MySQL service is active and listening on standard port `3306`:

```powershell
# Windows PowerShell (Administrative):
Get-Service -Name "MySQL80" | Select-Object Status, DisplayName

# Linux / Ubuntu Daemon:
sudo systemctl status mysql
```

### 4.2 Database Creation & User Privileges Provisioning
Log in as root user via MySQL CLI and execute institutional schema initialization directives:

```sql
mysql -u root -p
-- Enter MySQL Administrator Master Password

-- 1. Create Dedicated University Relational Schema
CREATE DATABASE kvtms_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- 2. Configure Dedicated Database Account with Full Administrative Rights
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY 'mansi@123';
GRANT ALL PRIVILEGES ON kvtms_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;

-- 3. Verify Database Existence
SHOW DATABASES LIKE 'kvtms_db';
EXIT;
```

---

## 5. Schema Migration & Core Entity Tables Verification

The backend application utilizes Hibernate automatic DDL management (`spring.jpa.hibernate.ddl-auto=update`) supplemented by the official institutional schema definitions located at `04 Database\SQL\schema.sql`.

| Table Name | Primary Key & Foreign Keys | Transactional Purpose | Key Attributes & Constraints |
| :--- | :--- | :--- | :--- |
| `users` | `id` (PK, BIGINT) | Central RBAC authentication table | `college_id` (Unique), `email` (Unique), `password` (BCrypt), `role` (Enum). |
| `courses` | `id` (PK, BIGINT) | Vocational trade curriculum master | `trade_code` (VOC-ART-102), `title`, `duration_months`, `active` (bit). |
| `trainees` | `id` (PK, BIGINT) • FK: `user_id` | Tribal student academic profile | `roll_number` (KISS-TRN-2026-003), `category`, `dbt_account_number`. |
| `trainers` | `id` (PK, BIGINT) • FK: `user_id` | Faculty instructor directory | `faculty_id` (KISS-FAC-002), `specialization`, `department`. |
| `attendance_records` | `id` (PK, BIGINT) • FK: `trainee_id` | Daily practical studio logs | `session_date`, `status` (PRESENT/ABSENT), 7-day retrospective lock. |
| `production_runs` | `id` (PK, BIGINT) • FK: `course_id` | Artisan manufacturing batches | `batch_number` (BATCH-2026-SEW-003), `target_qty`, `status`. |
| `raw_materials` | `id` (PK, BIGINT) | Dual-warehouse raw material store | `material_code`, `current_stock`, `unit`, `min_reorder_level`. |
| `finished_goods` | `id` (PK, BIGINT) • FK: `product_id` | Cleared artisan retail inventory | `sku` (PRD-KURTI-01), `available_stock` (38), `mrp` (₹650.00). |
| `sales_orders` | `id` (PK, BIGINT) • FK: `customer_id` | POS commercial transactions | `order_number` (ORD-1791010251290), `total_amount`, `dispatch_date`. |

> **Database Schema Verification Command:**  
> Execute via PowerShell: `& 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe' -u root -pmansi@123 kvtms_db -e "SHOW TABLES;"` to confirm all 9 primary relational tables are active.

---

## 6. Backend Application Configuration (Spring Boot 3)

The backend microservice is encapsulated within `05 Software\kv-tms`. Application parameters, database pooling, and JWT cryptographic tokens are configured in `src\main\resources\application.properties`.

```properties
# ===============================
# 1. Server Configuration
# ===============================
spring.application.name=kv-tms
server.port=8080

# ===============================
# 2. MySQL Database Connection Pool (HikariCP)
# ===============================
spring.datasource.url=jdbc:mysql://localhost:3306/kvtms_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=mansi@123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# ===============================
# 3. Hibernate JPA / DDL Auto Management
# ===============================
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# ===============================
# 4. JWT Authentication Security Settings
# ===============================
kvtms.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
kvtms.jwt.expiration-ms=86400000
```

---

## 7. Compiling, Packaging & Executing the Backend Service

KV-TMS includes the official Apache Maven Wrapper (`mvnw.cmd`), eliminating the need for a separate system Maven installation.

### 7.1 Compiling and Packaging the Production JAR
Open a terminal, navigate to the backend directory, and clean package the project:

```cmd
cd "C:\Users\hp\OneDrive\Desktop\KISS Vocational Training Management System\05 Software\kv-tms"
.\mvnw.cmd clean package -DskipTests
:: Expected Artifact: target\kv-tms-0.0.1-SNAPSHOT.jar (Approx. 48.5 MB)
```

### 7.2 Executing the Backend Service

```powershell
# Option A: Interactive Development Mode (Auto-Reload):
.\mvnw.cmd spring-boot:run

# Option B: Production Standalone Execution with Tuned JVM Heap:
java -Xms512m -Xmx2048m -XX:+UseG1GC -jar target\kv-tms-0.0.1-SNAPSHOT.jar
```

---

## 8. Backend Health Check & REST API Verification

Once started, Spring Boot initializes HikariCP connections to `kvtms_db` on port 8080. Verify the service status using PowerShell or curl:

```powershell
# Test Executive Dashboard Endpoint:
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/reports/executive-dashboard" | ConvertTo-Json

# Expected JSON Response (HTTP 200 OK):
{
  "totalStudentsEnrolled": 5,
  "totalVocationalCourses": 5,
  "completedProductionBatches": 0,
  "activeRawMaterials": 10,
  "totalFinishedGoodsInStock": 55,
  "totalSalesOrders": 2,
  "totalRevenueGenerated": 0.0,
  "totalStudentIncentivesPaid": 0.0
}
```

---

## 9. Frontend Web Application Setup & Deployment (React 18 + Vite)

The client presentation tier is situated in `05 Software\frontend`. Powered by Vite 5, it compiles modern ES Modules into an optimized production single-page application bundle.

### 9.1 Dependency Installation & Client Configuration
Navigate to the frontend folder and install all locked npm dependencies:

```cmd
cd "C:\Users\hp\OneDrive\Desktop\KISS Vocational Training Management System\05 Software\frontend"
npm install
:: Installs React 18, Vite 5, Tailwind CSS 3.4, Lucide-React, Axios, and Recharts
```

### 9.2 Development Execution & Production Compilation

```cmd
:: Mode A: Hot-Module Replacement (HMR) Development Server:
npm run dev
:: Running at: http://localhost:5173/

:: Mode B: Production Minified Compilation:
npm run build
:: Compiles 1,956 modules in ~650ms. Outputs optimized static bundles to dist/:
:: - dist/index.html (0.45 kB)
:: - dist/assets/index-CEYQtydY.css (88.56 kB)
:: - dist/assets/index-CH_pnKqu.js (862.70 kB)

:: Mode C: Serve Production Dist Bundle via Node.js Daemon:
node serve_dist.js
:: Serving production build on http://127.0.0.1:4173
```

---

## 10. End-to-End System Sanity Verification Checklist

Execute this systematic sanity checklist across all six operational modules to ensure complete hardware and software convergence:

| Module Area | Target URL / Endpoint | Expected Screen Elements | Verification Method & Passing Criteria |
| :--- | :--- | :--- | :--- |
| **Public Portal** | `http://localhost:4173/?view=home` | University banner, founder welcome, 5 trade cards, portal CTA buttons. | Page loads in <1.5s; all trade credit hours render correctly. Status: **PASS**. |
| **Authentication** | `http://localhost:4173/?view=login` | Role tabs (Admin, Trainer, Trainee, Production), College ID input, login CTA. | Click demo auto-fill; successful redirect to authorized dashboard. Status: **PASS**. |
| **Executive Admin** | `/?view=portal&tab=dashboard` | 8 live KPI cards, Recharts visualizations, stock levels, sales figures. | API returns HTTP 200; cards display 5 scholars, 10 raw materials. Status: **PASS**. |
| **Trainer Console** | `/?view=portal&role=trainer&tab=trainer-attendance` | Date picker, scholar roster (5 students), Present/Absent toggles, Save button. | Toggle student state; click Save; records written to MySQL. Status: **PASS**. |
| **Production & BOM** | `/?view=portal&role=production&tab=production` | 5 workshop labs, BOM recipe card (2.5m cotton, 4 buttons), batch launch form. | Batch BATCH-2026-SEW-003 scheduled with 18h duration calculation. Status: **PASS**. |
| **POS & Invoicing** | `/?view=portal&tab=sales&invoice=1` | Retail counter, stock available (38 units), modal invoice with ₹3600.00 total. | Order ref ORD-1791010251290 rendered with Print Receipt button. Status: **PASS**. |

---

## 11. Production Server Hardening & Nginx Reverse Proxy

For enterprise university deployment, place KV-TMS behind an Nginx reverse proxy to handle SSL/TLS certificate termination, static asset compression (Gzip/Brotli), and API proxying.

```nginx
server {
    listen 80;
    server_name kvtms.kiss.ac.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kvtms.kiss.ac.in;

    ssl_certificate     /etc/ssl/certs/kvtms.crt;
    ssl_certificate_key /etc/ssl/private/kvtms.key;
    ssl_protocols       TLSv1.2 TLSv1.3;

    # Serve Compiled Frontend SPA
    location / {
        root  /var/www/kvtms/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy REST API Requests to Spring Boot Tier
    location /api/v1/ {
        proxy_pass         http://127.0.0.1:8080/api/v1/;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto https;
    }
}
```

---

## 12. Operational Troubleshooting & Diagnostic Procedures

| Observed Fault | Root Operational Cause | Prescribed Step-by-Step Resolution |
| :--- | :--- | :--- |
| **Port 8080 / 3306 Conflict** | Another service is bound to port 8080 or port 3306. | Execute `netstat -ano \| findstr :8080`, identify PID, and terminate conflicting process or update `server.port` in `application.properties`. |
| **Database Connection Refused** | MySQL service stopped or invalid password in `application.properties`. | Start MySQL via `net start MySQL80`; verify credentials using `mysql -u root -pmansi@123`. |
| **CORS Origin Blocked** | Frontend domain not permitted in Spring Security filter chain. | Verify `SecurityConfig.java` has `http://localhost:5173` and `http://127.0.0.1:4173` registered in `CorsConfiguration`. |
| **Node Build Memory Limit** | Vite bundling exceeds default V8 JavaScript heap size. | Execute build with expanded heap: `set NODE_OPTIONS="--max-old-space-size=4096" && npm run build`. |

---

## 13. Routine Maintenance, Backups & Academic Sign-Off

Perform scheduled nightly database backups using standard mysqldump:  
`mysqldump -u root -pmansi@123 kvtms_db > backup_YYYYMMDD.sql`  
Maintain rolling 30-day offsite archive backups.

### 13.1 Formal Academic Certification & Sign-Off Block

I hereby certify that this Installation, Deployment & Operations Guide accurately documents the complete setup, configuration, and verification procedures for the KISS Vocational Training Management System (KV-TMS) developed for my B.Tech CSE capstone project.

| Academic Role | Name & Affiliation | Approval Signature | Sign-Off Date |
| :--- | :--- | :--- | :--- |
| **Project Candidate & Developer** | Mansi Sinha, B.Tech CSE (Roll: 2205160) | ____________________________ | October 8, 2026 |
| **Faculty Project Guide** | School of Computer Science & Engg, KIIT | ____________________________ | ____________________________ |
| **Project Review Committee** | KIIT Deemed to be University | ____________________________ | ____________________________ |

---
*KV-TMS v1.0.0-RELEASE • School of Computer Science & Engineering, KIIT Deemed to be University • Kalinga Institute of Social Sciences (KISS)*
