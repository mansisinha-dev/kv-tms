# 07. UNIFIED MODELING LANGUAGE (UML) MODELS
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. UML Behavioral Modeling (Use Case Model)
* **Actors:** Administrator, Trainer, Trainee, Production Manager, POS Cashier.
* **12 Primary Use Cases:** Authenticate User, Manage Trades, Mark Attendance, Check 75% Rule, Schedule Work Order, Deduct BOM (`<<include>>`), Perform QA Audit, Transfer Finished Goods (`<<include>>`), Retail Checkout, Predict Demand, Export DBT.

### 2. Static Object-Oriented Domain Architecture (Class Model)
* **Domain Classes:** `User`, `Trainee`, `Trainer`, `Course`, `Training`, `Attendance`, `InventoryItem`, `ProductionOrder`, `SalesOrder`, `DemandForecast`.
* **Design Patterns Applied:**
  - **Repository Pattern:** Spring Data JPA abstractions isolating SQL persistence.
  - **Service Layer Pattern:** Encapsulates business logic and transaction boundaries.
  - **DTO Pattern:** Decouples internal database entities from external REST JSON payloads.

### 3. Dynamic Workflow Sequences
* **Authentication Handshake:** Credential verification $\to$ BCrypt match $\to$ JWT token issued.
* **Atomic BOM Deduction:** Manager creates batch $\to$ `SELECT ... FOR UPDATE` locks raw inventory $\to$ stock decremented $\to$ order released.
* **POS Retail Checkout:** Barcode scan $\to$ stock verification $\to$ payment settlement $\to$ WH2 stock decremented $\to$ invoice printed.
* **AI Demand & DBT:** Scheduled regression calculates 30-day demand curves; monthly DBT engine aggregates student bank credits.