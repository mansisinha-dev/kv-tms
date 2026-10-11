# UML SEQUENCE DIAGRAM SPECIFICATION
## KISS Vocational Training Management System (KV-TMS)

**Document Identifier:** KV-TMS-SEQ-v1.0  
**System Name:** KISS Vocational Training Management System  
**Document Version:** 1.0 (Dynamic Interaction Model)  
**Date:** October 8, 2026  
**Author:** Mansi Sinha  
**Academic Program:** B.Tech. Computer Science & Engineering  
**Department:** School of Computer Science and Engineering, KIIT Deemed to be University  
**Host Institution:** Kalinga Institute of Social Sciences (KISS), Bhubaneswar, Odisha  

---

## 1. INTRODUCTION & RUNTIME INTERACTION ARCHITECTURE

### 1.1 Purpose of Dynamic Sequence Diagrams
The **UML Sequence Diagram Specification** models the runtime chronological message exchanges, operational invocations, data transformations, and transactional boundaries across the multi-tier architecture of **KV-TMS**.

While Use Case diagrams model actor-system boundaries and Class diagrams model static structural properties, Sequence diagrams specify **how objects collaborate over time** across the React SPA client, Spring Boot REST controllers, transactional service beans, Spring Data JPA repositories, PostgreSQL persistence, and external banking gateways.

### 1.2 Enterprise Architectural Lifelines
Each sequence model maps across standardized system layers:
1. **Actor Lifeline:** Human role initiating the interaction (`Trainee`, `Trainer / Faculty`, `Production Manager`, `Cashier`, `Administrator`).
2. **Client UI Lifeline (React 19 SPA):** Component view capturing inputs, managing local state, and dispatching Axios REST calls.
3. **API Controller Lifeline (@RestController):** Spring MVC endpoint handling HTTP requests, performing DTO deserialization, and enforcing Spring Security filters.
4. **Business Service Lifeline (@Service):** Transactional business orchestration (`@Transactional`), implementing business logic and algorithms.
5. **Data Access Lifeline (Spring Data JPA):** ORM repository executing query generation, entity hydration, and pessimistic row locking (`FOR UPDATE`).
6. **Persistence Lifeline (D1 PostgreSQL):** Relational database executing atomic SQL operations and enforcing constraints.
7. **External Service Lifeline:** Specialized auxiliary actors, such as the `JwtTokenProvider`, `Thermal Receipt Engine`, or the `PFMS / NPCI DBT Banking Gateway`.

---

## 2. SEQUENCE 01: USER AUTHENTICATION & ROLE-BASED AUTHORIZATION

Models client-side credential dispatch, Spring Security filter interception, BCrypt password hash verification, and signed JWT token issuance:

![Sequence Diagram 01: User Authentication](KV-TMS%20Sequence%2001%20-%20Authentication.png)  
*Figure 2.1: KV-TMS Sequence Diagram 01 — User Authentication & Role-Based Authorization*

### Chronological Message Catalog

| Seq | Source &rarr; Target | Operation / Message Signature | Architectural Logic & Payload Description |
| :---: | :--- | :--- | :--- |
| **1-2** | User &rarr; AuthUI &rarr; AuthCtrl | `POST /api/auth/login { username, password }` | User inputs credentials into React LoginForm; Axios client dispatches JSON payload. |
| **3-5** | AuthCtrl &rarr; Service &rarr; Repo &rarr; DB | `findByUsername(username)` | Controller delegates to AuthService; JPA repository executes SQL query on `users` table. |
| **6-7** | DB &rarr; Repo &rarr; Service | `<<return>> Optional<UserEntity>` | Database returns persisted user entity containing BCrypt password hash and assigned role set. |
| **8** | AuthService (Self) | `BCrypt.checkpw(password, user.passwordHash)` | Executes salted cryptographic match. If mismatch, branches to `alt [invalid]` throwing 401 error. |
| **9b-10b** | AuthService &harr; JwtProvider | `generateToken(user.id, roles, claims)` | Branches to `alt [valid]`; JwtProvider signs HMAC-SHA256 token embedding role authorities and 24h expiration. |
| **11b-13b** | Service &rarr; Ctrl &rarr; UI &rarr; User | `200 OK { token, expiresAt, roleList }` | Returns AuthResponseDto; React stores JWT in LocalStorage and routes to role dashboard. |

---

## 3. SEQUENCE 02: DAILY ATTENDANCE MARKING & 75% STATUTORY FLOOR CHECK

Models workshop trade cohort marking, atomic persistence, cumulative attendance computation, and statutory 75% warning alerts:

![Sequence Diagram 02: Attendance](KV-TMS%20Sequence%2002%20-%20Attendance.png)  
*Figure 3.1: KV-TMS Sequence Diagram 02 — Attendance Marking & 75% Floor Compliance*

### Chronological Message Catalog

| Seq | Source &rarr; Target | Operation / Message Signature | Architectural Logic & Payload Description |
| :---: | :--- | :--- | :--- |
| **1-3** | Trainer &rarr; UI &rarr; Ctrl &rarr; Service | `POST /api/attendance/batch { tradeId, marks }` | Faculty marks daily roster; dispatches batch DTO containing trainee IDs and statuses. |
| **4-7** | Service &harr; Repo &harr; Database | `loop [for each student]: save(RecordEntity)` | Iteratively executes `INSERT INTO attendance_records` with trade cohort session context. |
| **8-10** | Service &harr; Repo &harr; Database | `calculateCumulativeStats(traineeId)` | Queries total trade sessions and attended days (e.g., attended: 41 out of 60 total). |
| **11** | AttendanceService (Self) | `percentage = (attended / total) * 100` | Computes exact percentage (68.3%). Evaluates whether statutory 75.0% threshold is violated. |
| **12-15** | Service &harr; TraineeRepo &harr; DB | `opt [percentage < 75%]: flagAtRiskStatus()` | Updates `trainees.is_at_risk = true`; logs alert timestamp and triggers in-app notification. |
| **16-18** | Service &rarr; Ctrl &rarr; UI &rarr; Trainer | `200 OK { processed: 35, atRiskCount: 3 }` | Returns BatchSummaryDto; React roster highlights at-risk trainees in Amber with warning badge. |

---

## 4. SEQUENCE 03: WORKSHOP PRODUCTION WORK ORDER & DUAL-WAREHOUSE TRANSFER

Models BOM raw stock reservation from Warehouse 1, workshop fabrication, QC inspection audit, and WH-2 finished goods intake:

![Sequence Diagram 03: Production](KV-TMS%20Sequence%2003%20-%20Production.png)  
*Figure 4.1: KV-TMS Sequence Diagram 03 — Production Work Order & Dual-Warehouse Transfer*

### Chronological Message Catalog

| Seq | Source &rarr; Target | Operation / Message Signature | Architectural Logic & Payload Description |
| :---: | :--- | :--- | :--- |
| **1-3** | ProdMgr &rarr; UI &rarr; Ctrl &rarr; Service | `POST /api/work-orders/launch { sku, targetQty }` | Supervisor creates job order (e.g. 50 Tribal Shawls); initiates manufacturing run. |
| **4-9** | Service &harr; Inventory &harr; DB | `verifyAndDeductBOMMaterials(skuId, target)` | Fetches BOM recipe; verifies WH-1 raw stock; atomically decrements raw silk (25kg) and dye (2kg). |
| **10-12** | Service &harr; DB &rarr; Ctrl &rarr; UI | `201 Created { workOrderId: 'WO-4402', IN_PROGRESS }` | Persists work order in `IN_PROGRESS` state; UI displays active workshop batch tracker. |
| **13-15** | ProdMgr &rarr; UI &rarr; Ctrl &rarr; QCService | `POST /api/work-orders/WO-4402/qc-audit` | Post-fabrication audit submission reporting 48 passed units and 2 rejected defect units. |
| **16-18** | QCService &harr; Inventory &harr; DB | `transferToWarehouse2(skuId, passedQty: 48)` | Atomically increments Warehouse 2 finished goods stock (+48) with barcode SKU mapping. |
| **19-20** | QCService &harr; DB | `triggerEWYLStipendLedgerAccrual(artisanBatch, 48)` | Calculates output-linked piece rate for student artisans; inserts records into `dbt_stipend_ledgers`. |
| **21-23** | QCService &rarr; Ctrl &rarr; UI | `200 OK { COMPLETED, yieldRate: '96%' }` | Closes work order; UI refreshes dual-warehouse balance indicators and defect waste metrics. |

---

## 5. SEQUENCE 04: BARCODE POS RETAIL SALE & REAL-TIME STOCK DECREMENT

Models retail checkout, pessimistic stock locking, sequential GST tax invoice generation, and real-time AI stream notification:

![Sequence Diagram 04: POS Retail](KV-TMS%20Sequence%2004%20-%20POS%20Retail.png)  
*Figure 5.1: KV-TMS Sequence Diagram 04 — Barcode POS Retail Sale & Real-Time Stock Decrement*

### Chronological Message Catalog

| Seq | Source &rarr; Target | Operation / Message Signature | Architectural Logic & Payload Description |
| :---: | :--- | :--- | :--- |
| **1-3** | Cashier &rarr; UI &rarr; Ctrl &rarr; Service | `POST /api/pos/checkout { items, tender, mobile }` | Cashier scans barcode, collects payment (UPI/Cash/Card), and triggers transactional checkout. |
| **4-9** | Service &harr; Inventory &harr; DB | `loop: lockAndVerifyWH2Stock(skuId, qty)` | Executes `SELECT ... FOR UPDATE` on WH-2; verifies stock sufficiency; decrements stock atomically. |
| **10** | SalesService (Self) | `calculateTotalsAndTaxes(subtotal, gst, total)` | Applies statutory 5% handloom craft GST, computes taxable breakdown and net payable amount. |
| **11-14** | Service &harr; InvoiceEngine &harr; DB | `generateTaxInvoice(salesPayload)` | Mints sequential invoice number (`INV-20261008-0142`); persists sale, items, and tax breakdown. |
| **15** | SalesService (Self) | `publishAsync(SaleCompletedEvent)` | Publishes asynchronous event feeding real-time sales velocity into Holt-Winters forecasting engine. |
| **16-18** | Service &rarr; Ctrl &rarr; UI &rarr; Cashier | `201 Created { invoiceNo: 'INV-...', total: 3150 }` | Thermal receipt printer triggers; cash drawer opens; POS terminal resets cart for next customer. |

---

## 6. SEQUENCE 05: AI DEMAND FORECASTING & EWYL DIRECT BENEFIT TRANSFER

Models Holt-Winters triple exponential demand curves, auto-reorder triggers, and government-standard PFMS/NPCI DBT stipend payouts:

![Sequence Diagram 05: AI & DBT](KV-TMS%20Sequence%2005%20-%20AI%20Forecasting%20&%20DBT.png)  
*Figure 6.1: KV-TMS Sequence Diagram 05 — AI Demand Forecasting Engine & EWYL DBT Payout*

### Chronological Message Catalog

| Seq | Source &rarr; Target | Operation / Message Signature | Architectural Logic & Payload Description |
| :---: | :--- | :--- | :--- |
| **1-5** | Admin &rarr; UI &rarr; Ctrl &rarr; AIEngine &harr; DB | `GET /api/forecast/demand?skuId=...&horizon=30` | Queries 90-day daily sales history from `pos_sale_items`; extracts historical velocity vector. |
| **6-7** | AI_ForecastEngine (Self) | `executeTripleExponentialSmoothing(α, β, γ)` | Smooths level (α=0.35), trend (β=0.15), seasonality (γ=0.20); computes Safety Stock & ROP (85 units). |
| **8-10** | AIEngine &rarr; Ctrl &rarr; UI | `200 OK { projectedUnits: 340, ROP: 85 }` | Renders interactive 30-day forecast curve; highlights auto-reorder trigger if WH-2 stock &le; ROP. |
| **11-15** | Admin &rarr; UI &rarr; Ctrl &rarr; DBTService &harr; DB | `POST /api/dbt/disburse-batch { batchId, authAmount }` | Admin authorizes piece stipend payout; locks pending ledger records via `FOR UPDATE`. |
| **16-19** | DBTService &harr; BankGateway &harr; DB | `POST /pfms/v1/dbt-bulk-transfer` | Dispatches NPCI/PFMS batch; receives banking UTR; updates 120 ledger records to `DISBURSED`. |
| **20-22** | DBTService &rarr; Ctrl &rarr; UI &rarr; Admin | `200 OK { disbursedCount: 120, utrReference }` | Renders payment success alert; dispatches push credit notifications to Trainee Passbooks. |

---

## 7. SPECIFICATION VERIFICATION & SIGN-OFF

This Sequence Diagram Specification accurately reflects the dynamic interaction architecture and transactional message flows of the KISS Vocational Training Management System (KV-TMS).

**Prepared By:** Mansi Sinha  
**Signature:** ____________________________  
**Date:** October 8, 2026  

**Faculty Guide Review:**  
**Department:** School of Computer Science & Engineering, KIIT Deemed to be University  
**Signature:** ____________________________  
**Date:** ____________________________  
