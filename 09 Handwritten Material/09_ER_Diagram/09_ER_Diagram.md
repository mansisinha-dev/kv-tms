# 09. ENTITY-RELATIONSHIP (ER) DATA MODELING
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Entity Classification & Relational Clustering
The conceptual data model connects 13 domain entities organized across four functional clusters:
1. **Governance & Identity Cluster:** `USER`, `TRAINER`, `TRAINEE`.
2. **Academic Curriculum Cluster:** `COURSE_TRADE`, `TRAINING`, `ATTENDANCE`.
3. **Workshop Fabrication Cluster:** `PRODUCT`, `PRODUCTION_ORDER`, `BILL_OF_MATERIAL`, `QUALITY_AUDIT`.
4. **Commercial & Welfare Cluster:** `INVENTORY`, `SALES_ORDER`, `DEMAND_FORECAST`, `STIPEND_RECORD`.

### 2. Cardinality Ratios & Multiplicity Rules
* `USER` to `TRAINEE` / `TRAINER`: $1 : 1$ mandatory relationship with foreign key cascade.
* `TRAINEE` to `ATTENDANCE`: $1 : N$ with composite unique constraint on `(trainee_id, attendance_date)`.
* `COURSE` to `TRAINING`: $1 : N$; each training batch maps to exactly one parent course curriculum.
* `PRODUCT` to `PRODUCTION_ORDER`: $1 : N$; multiple work orders can be released for a product.
* `SALES_ORDER` to `ORDER_ITEM`: $1 : N$; each retail receipt comprises multiple scanned line items.