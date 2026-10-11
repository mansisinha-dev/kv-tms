# 06. SUBSYSTEM DECOMPOSITION & MODULE DESIGN
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Core Functional Subsystems Breakdown
The platform encapsulates eight specialized modular subsystems:
1. **Identity & Governance Subsystem (`auth`):** Manages user credentials, BCrypt salt-hashing, and JWT token issuance/validation.
2. **Academic Curriculum Subsystem (`academic`):** Governs course master data, trade tracks (Tailoring, Carpentry, Craft), and trainee batch schedules.
3. **Attendance & EWYL Subsystem (`attendance`):** Logs daily student presence, enforces the 75% attendance threshold, and tracks cumulative hours.
4. **Workshop Manufacturing Subsystem (`production`):** Creates production work orders, allocates artisan teams, and logs fabrication milestones.
5. **Two-Tier Inventory Subsystem (`inventory`):** Isolates raw materials in Warehouse 1 (WH1) from retail finished goods in Warehouse 2 (WH2).
6. **Point-of-Sale (POS) Retail Subsystem (`pos`):** Handles barcode lookup, cart aggregation, cash/UPI reconciliation, and GST tax invoice generation.
7. **Predictive AI Forecasting Subsystem (`forecasting`):** Computes Ordinary Least Squares (OLS) regression over sales trends to advise reorder points.
8. **Direct Benefit Transfer Subsystem (`dbt`):** Aggregates student bank details and exports formatted NEFT/NACH payment files.