// ============================================================================
// KISS VOCATIONAL TRAINING MANAGEMENT SYSTEM (KV-TMS)
// Synchronized Store for QA Inspections, Defect/Damage Handling, Equipment,
// 360° User Feedback, NSQF Competency Rubrics, Certifications & Placements
// ============================================================================

const KEYS = {
    QA_INSPECTIONS: 'kvtms_qa_inspections_v1',
    DAMAGE_LOGS: 'kvtms_damage_logs_v1',
    EQUIPMENT_LOGS: 'kvtms_equipment_logs_v1',
    FEEDBACK_LOGS: 'kvtms_feedback_logs_v1',
    TRAINER_SKILL_NOTES: 'kvtms_trainer_skill_notes_v1',
    PLACEMENTS: 'kvtms_placements_v1',
    POS_RETURNS: 'kvtms_pos_returns_v1',
    RUBRIC_SCORES: 'kvtms_rubric_scores_v1'
};

// Default Seed Data for QA Inspections (Unit-level split: Passed, Rework, Scrap)
const DEFAULT_QA_INSPECTIONS = [
    {
        id: 'QA-2026-101',
        batchNumber: 'BATCH-2026-001',
        productName: 'Tribal Motif Handwoven Cotton Kurta',
        trade: 'Apparels & Tailoring',
        workshopName: 'Tailoring Studio Lab-1',
        inspectorName: 'Dr. Prashanta Kumar Routray (QA Directorate)',
        inspectionDate: '2026-10-08',
        targetQty: 25,
        producedQty: 25,
        passedQty: 22,
        reworkQty: 2,
        scrapQty: 1,
        checklist: {
            dimensionalAccuracy: 9,
            craftsmanship: 9,
            surfaceFinish: 8,
            packagingHygiene: 10
        },
        defectCategory: 'Minor Collar Seam Tension Variance (2 units)',
        correctiveAction: '2 kurtas sent back to Tailoring Studio Lab-1 for collar re-stitching; 1 unit logged as fabric cutting practice scrap.',
        status: 'CLEARED_WITH_PARTIAL_REWORK'
    },
    {
        id: 'QA-2026-102',
        batchNumber: 'BATCH-2026-002',
        productName: 'Terracotta Painted Tribal Lamp Set',
        trade: 'Terracotta & Pottery',
        workshopName: 'Ceramics & Kiln Studio-2',
        inspectorName: 'Prof. S. Sinha (Master Artisan & QA)',
        inspectionDate: '2026-10-09',
        targetQty: 30,
        producedQty: 30,
        passedQty: 27,
        reworkQty: 1,
        scrapQty: 2,
        checklist: {
            dimensionalAccuracy: 9,
            craftsmanship: 9,
            surfaceFinish: 9,
            packagingHygiene: 9
        },
        defectCategory: 'Kiln Thermal Hairline Crack (2 units) & Glaze Touch-up (1 unit)',
        correctiveAction: '2 cracked lamps written off to kiln breakage log; 1 lamp recoated with natural ochre glaze.',
        status: 'CLEARED_FOR_SALE'
    },
    {
        id: 'QA-2026-103',
        batchNumber: 'BATCH-2026-003',
        productName: 'Carved Bamboo Desk Organizer',
        trade: 'Bamboo & Wood Crafts',
        workshopName: 'Bamboo Craft Workshop-3',
        inspectorName: 'Quality Assurance Cell',
        inspectionDate: '2026-10-10',
        targetQty: 20,
        producedQty: 20,
        passedQty: 20,
        reworkQty: 0,
        scrapQty: 0,
        checklist: {
            dimensionalAccuracy: 10,
            craftsmanship: 10,
            surfaceFinish: 9,
            packagingHygiene: 10
        },
        defectCategory: 'Zero Defects (100% First-Pass Yield)',
        correctiveAction: 'All 20 units cleared for showroom display and DBT stipend disbursement.',
        status: 'CLEARED_FOR_SALE'
    }
];

// Default Seed Data for Warehouse & Production Damage / Wastage / Breakage
const DEFAULT_DAMAGE_LOGS = [
    {
        id: 'DMG-2026-01',
        date: '2026-10-07',
        itemType: 'FINISHED_GOOD',
        itemName: 'Terracotta Painted Tribal Lamp Set',
        batchOrSku: 'BATCH-2026-002',
        quantityDamaged: 2,
        unit: 'Units',
        damageStage: 'Kiln Firing & Cooling (Workshop)',
        reason: 'Thermal shock hairline crack during kiln cooling phase by beginner trainees',
        disposition: 'SCRAP_WRITE_OFF',
        reportedBy: 'Rahul Verma (KISS-PRD-001)',
        estimatedLoss: 450,
        preventionNote: 'Instructed trainees to reduce kiln cooling vent opening rate below 15°C/hr.'
    },
    {
        id: 'DMG-2026-02',
        date: '2026-10-08',
        itemType: 'RAW_MATERIAL',
        itemName: 'Organic Handloom Cotton Fabric',
        batchOrSku: 'RM-COT-01',
        quantityDamaged: 3.5,
        unit: 'Meters',
        damageStage: 'Pattern Cutting Practice (Training Lab)',
        reason: 'Misaligned pattern cutting by newly enrolled semester-1 trainees',
        disposition: 'RECYCLED_FOR_PATCHWORK',
        reportedBy: 'Prof. S. Sinha (KISS-FAC-001)',
        estimatedLoss: 385,
        preventionNote: 'Added paper-template dry run before cutting actual handloom fabric.'
    },
    {
        id: 'DMG-2026-03',
        date: '2026-10-10',
        itemType: 'RAW_MATERIAL',
        itemName: 'Raw Forest Honey & Spices',
        batchOrSku: 'RM-FOOD-04',
        quantityDamaged: 1.5,
        unit: 'Kg',
        damageStage: 'Warehouse Storage Inspection',
        reason: 'Seal moisture ingress in 1 storage jar during monsoon humidity spike',
        disposition: 'DISPOSED_SAFETY_PROTOCOL',
        reportedBy: 'Warehouse Supervisor',
        estimatedLoss: 320,
        preventionNote: 'Transferred all food processing raw stock to airtight food-grade HDPE drums.'
    }
];

// Default Seed Data for Workshop Machinery & Student Toolkit Register
const DEFAULT_EQUIPMENT_LOGS = [
    {
        id: 'EQP-TAIL-01',
        equipmentName: 'Juki DDL-8700 Industrial Sewing Machine (#01–#15)',
        category: 'WORKSHOP_MACHINERY',
        workshopLab: 'Tailoring Studio Lab-1',
        trade: 'Apparels & Tailoring',
        totalUnits: 15,
        workingUnits: 14,
        damagedUnits: 1,
        status: 'NEEDS_MAINTENANCE',
        issueReported: 'Machine #09 bobbin tension assembly jammed during heavy denim practice',
        reportedBy: 'Laxman Majhi (KISS-TRN-2026-001)',
        assignedTechnician: 'Campus Mechanical Maintenance Cell',
        lastServiced: '2026-10-05'
    },
    {
        id: 'EQP-POT-02',
        equipmentName: 'Electric Digital Pottery Kiln (1200°C Capacity)',
        category: 'WORKSHOP_MACHINERY',
        workshopLab: 'Ceramics & Kiln Studio-2',
        trade: 'Terracotta & Pottery',
        totalUnits: 4,
        workingUnits: 4,
        damagedUnits: 0,
        status: 'OPERATIONAL',
        issueReported: 'All heating elements & thermocouples calibrated and healthy',
        reportedBy: 'Prof. S. Sinha (KISS-FAC-001)',
        assignedTechnician: 'Electrical Lab Engineer',
        lastServiced: '2026-10-08'
    },
    {
        id: 'EQP-KIT-03',
        equipmentName: 'Trainee Personal Bamboo Carving & Chisel Toolkit + Safety Gloves',
        category: 'STUDENT_TOOLKIT',
        workshopLab: 'Bamboo Craft Workshop-3',
        trade: 'Bamboo & Wood Crafts',
        totalUnits: 30,
        workingUnits: 28,
        damagedUnits: 2,
        status: 'TOOL_REPLACEMENT_ISSUED',
        issueReported: '2 bevel chisels blunted/chipped during knot-carving session; replacement blades issued',
        reportedBy: 'Bikash Soren (KISS-TRN-2026-003)',
        assignedTechnician: 'Workshop Tool Storekeeper',
        lastServiced: '2026-10-09'
    },
    {
        id: 'EQP-FOOD-04',
        equipmentName: 'Solar-Assisted Food Dehydrator & Vacuum Sealer Unit',
        category: 'WORKSHOP_MACHINERY',
        workshopLab: 'Agro & Food Processing Lab-4',
        trade: 'Food Processing',
        totalUnits: 6,
        workingUnits: 6,
        damagedUnits: 0,
        status: 'OPERATIONAL',
        issueReported: 'Operating at optimal thermal efficiency; FSSAI hygiene cleared',
        reportedBy: 'Production Supervisor',
        assignedTechnician: 'Food Tech Lab Assistant',
        lastServiced: '2026-10-10'
    }
];

// Default Seed Data for 360° User Feedback & Grievances (Trainees, Buyers, Trainers)
const DEFAULT_FEEDBACK_LOGS = [
    {
        id: 'FDB-2026-01',
        date: '2026-10-08',
        sourceRole: 'TRAINEE',
        submittedBy: 'Laxman Majhi (KISS-TRN-2026-001)',
        tradeOrProduct: 'Apparels & Tailoring (VOC-SEW-101)',
        category: 'TRAINING_AND_LAB_FEEDBACK',
        rating: 5,
        subject: 'Practical Pattern-Making & Industrial Sewing Sessions',
        message: 'The hands-on demonstration on tribal ikat border alignment helped me complete 5 kurtas without seam puckering. Requesting extra bobbin cases for Machine #09.',
        status: 'RESOLVED',
        adminResponse: 'Thank you Laxman! Spare bobbin cases have been issued to Tailoring Lab-1 and Machine #09 is scheduled for tension calibration.'
    },
    {
        id: 'FDB-2026-02',
        date: '2026-10-09',
        sourceRole: 'CUSTOMER_BUYER',
        submittedBy: 'Dr. Ananya Mohanty (Exhibition Buyer - Order #ORD-1002)',
        tradeOrProduct: 'Terracotta Painted Tribal Lamp Set',
        category: 'PRODUCT_QUALITY_REVIEW',
        rating: 5,
        subject: 'Authentic Saura Tribal Motif Finishing & Packaging',
        message: 'Purchased 2 terracotta lamp sets from the KISS Showroom. The intricate hand-painted tribal geometry and eco-friendly cushioning were outstanding!',
        status: 'PUBLISHED',
        adminResponse: 'Shared buyer appreciation with Ceramics Studio trainees! Credited bonus quality points to the artisan batch.'
    },
    {
        id: 'FDB-2026-03',
        date: '2026-10-10',
        sourceRole: 'TRAINEE',
        submittedBy: 'Bikash Soren (KISS-TRN-2026-003)',
        tradeOrProduct: 'Bamboo & Wood Crafts (VOC-BAM-103)',
        category: 'WORKSHOP_TOOL_GRIEVANCE',
        rating: 4,
        subject: 'Request for Finer Sanding Grit & Chisel Sharpening Stone',
        message: 'During final finishing of bamboo desk organizers, we need 320-grit sandpaper for smoother lacquer polishing.',
        status: 'OPEN',
        adminResponse: ''
    },
    {
        id: 'FDB-2026-04',
        date: '2026-10-10',
        sourceRole: 'CUSTOMER_BUYER',
        submittedBy: 'Rajesh Pattnaik (Campus Visitor)',
        tradeOrProduct: 'Tribal Motif Handwoven Cotton Kurta',
        category: 'PRODUCT_QUALITY_REVIEW',
        rating: 4,
        subject: 'Great Handloom Fabric — Minor Button Stitching Suggestion',
        message: 'Fabric comfort and tribal embroidery are top-notch. Wooden buttons could be double-knotted for extra durability.',
        status: 'RESOLVED',
        adminResponse: 'Updated QA Checklist in Tailoring Lab-1 to mandate double-cross thread reinforcement on all wooden buttons.'
    }
];

// Default Seed Data for Trainer-to-Trainee Constructive Skill & Defect Prevention Notes
const DEFAULT_TRAINER_SKILL_NOTES = [
    {
        id: 'SKN-101',
        date: '2026-10-09',
        traineeId: 'KISS-TRN-2026-001',
        traineeName: 'Laxman Majhi',
        trainerName: 'Prof. S. Sinha (KISS-FAC-001)',
        trade: 'Apparels & Tailoring',
        competencyArea: 'Seam Tension & Collar Symmetry',
        skillObservation: 'Demonstrates strong control on straight lockstitch. While stitching thick ikat borders, reduce presser-foot speed by 15% around collar corners to eliminate thread bunching.',
        defectPreventionTip: 'Always test stitch tension on a 10cm scrap swatch before starting the final garment batch.',
        practicalHoursLogged: 156,
        requiredHours: 180
    },
    {
        id: 'SKN-102',
        date: '2026-10-10',
        traineeId: 'KISS-TRN-2026-003',
        traineeName: 'Bikash Soren',
        trainerName: 'Prof. S. Sinha (KISS-FAC-001)',
        trade: 'Bamboo & Wood Crafts',
        competencyArea: 'Joint Mortising & Natural Lacquer Polish',
        skillObservation: 'Excellent precision in bamboo node splitting and bevel joinery. Achieved zero-defect pass rate in Batch-2026-003.',
        defectPreventionTip: 'Ensure bamboo strips are seasoned below 12% moisture content prior to lacquer coating.',
        practicalHoursLogged: 168,
        requiredHours: 180
    }
];

// Default Seed Data for Placements, Apprenticeships (OJT) & Self-Employment Outcomes
const DEFAULT_PLACEMENTS = [
    {
        id: 'PLC-2026-01',
        traineeId: 'KISS-TRN-2026-001',
        traineeName: 'Laxman Majhi',
        tribeAndDistrict: 'Kondh Tribe • Kandhamal, Odisha',
        trade: 'Apparels & Tailoring',
        nsqfLevel: 'NSQF Level 4 (Master Sewing Operator)',
        attendancePct: 91.5,
        examScore: 88,
        certificateNo: 'KISS-NSDC-2026-SEW-001',
        pathwayType: 'APPRENTICESHIP_OJT',
        partnerOrganization: 'Boyanika / Odisha State Handloom Cooperative & Apparel Park',
        roleOffered: 'Apprentice Garment Quality & Production Technician',
        monthlyStipendOrIncome: 14500,
        status: 'PLACED_AND_CERTIFIED'
    },
    {
        id: 'PLC-2026-02',
        traineeId: 'KISS-TRN-2026-002',
        traineeName: 'Subhashree Murmu',
        tribeAndDistrict: 'Santal Tribe • Mayurbhanj, Odisha',
        trade: 'Terracotta & Pottery',
        nsqfLevel: 'NSQF Level 4 (Ceramics & Tribal Craft Artisan)',
        attendancePct: 86.0,
        examScore: 91,
        certificateNo: 'KISS-NSDC-2026-POT-002',
        pathwayType: 'SELF_EMPLOYED_SHG',
        partnerOrganization: 'Tribal Co-operative Marketing Development Federation (TRIFED)',
        roleOffered: 'Registered Artisan Entrepreneur (Pehchan Card & Mudra Grant)',
        monthlyStipendOrIncome: 16000,
        status: 'ENTREPRENEURSHIP_GRANT_APPROVED'
    },
    {
        id: 'PLC-2026-03',
        traineeId: 'KISS-TRN-2026-003',
        traineeName: 'Bikash Soren',
        tribeAndDistrict: 'Saura Tribe • Rayagada, Odisha',
        trade: 'Bamboo & Wood Crafts',
        nsqfLevel: 'NSQF Level 3 (Bamboo Utility & Furniture Craftsman)',
        attendancePct: 84.2,
        examScore: 85,
        certificateNo: 'KISS-NSDC-2026-BAM-003',
        pathwayType: 'INDUSTRY_PLACEMENT',
        partnerOrganization: 'Odisha Bamboo Development Agency (OBDA) Partner Unit',
        roleOffered: 'Junior Craft Fabrication Supervisor',
        monthlyStipendOrIncome: 15200,
        status: 'PLACED_AND_CERTIFIED'
    }
];

// Default POS Customer Return / Defective Replacement Claims
const DEFAULT_POS_RETURNS = [
    {
        id: 'RET-2026-01',
        date: '2026-10-09',
        invoiceNumber: 'INV-KISS-2026-001',
        customerName: 'Smt. Pratibha Das',
        productName: 'Tribal Motif Handwoven Cotton Kurta',
        quantity: 1,
        defectReported: 'Loose wooden button stitching on cuff',
        resolutionAction: 'INSTANT_EXCHANGE_AND_SENT_FOR_REWORK',
        refundOrExchangeValue: 850,
        status: 'RESOLVED_EXCHANGED'
    }
];

function readStore(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) {
            localStorage.setItem(key, JSON.stringify(fallback));
            return fallback;
        }
        return JSON.parse(raw);
    } catch (e) {
        return fallback;
    }
}

function writeStore(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        window.dispatchEvent(new Event('kvtms_vocational_sync'));
    } catch (e) {}
}

export const VocationalStore = {
    getQAInspections: () => readStore(KEYS.QA_INSPECTIONS, DEFAULT_QA_INSPECTIONS),
    saveQAInspection: (record) => {
        const list = readStore(KEYS.QA_INSPECTIONS, DEFAULT_QA_INSPECTIONS);
        const existingIdx = list.findIndex(i => i.batchNumber === record.batchNumber || i.id === record.id);
        if (existingIdx >= 0) {
            list[existingIdx] = { ...list[existingIdx], ...record };
        } else {
            list.unshift({
                id: `QA-2026-${100 + list.length + 1}`,
                inspectionDate: new Date().toISOString().slice(0, 10),
                ...record
            });
        }
        writeStore(KEYS.QA_INSPECTIONS, list);
        return list;
    },

    getDamageLogs: () => readStore(KEYS.DAMAGE_LOGS, DEFAULT_DAMAGE_LOGS),
    addDamageLog: (log) => {
        const list = readStore(KEYS.DAMAGE_LOGS, DEFAULT_DAMAGE_LOGS);
        const newEntry = {
            id: `DMG-2026-0${list.length + 1}`,
            date: new Date().toISOString().slice(0, 10),
            ...log
        };
        list.unshift(newEntry);
        writeStore(KEYS.DAMAGE_LOGS, list);
        return list;
    },

    getEquipmentLogs: () => readStore(KEYS.EQUIPMENT_LOGS, DEFAULT_EQUIPMENT_LOGS),
    addOrUpdateEquipment: (item) => {
        const list = readStore(KEYS.EQUIPMENT_LOGS, DEFAULT_EQUIPMENT_LOGS);
        const idx = list.findIndex(e => e.id === item.id);
        if (idx >= 0) {
            list[idx] = { ...list[idx], ...item };
        } else {
            list.unshift({
                id: `EQP-LAB-0${list.length + 1}`,
                lastServiced: new Date().toISOString().slice(0, 10),
                ...item
            });
        }
        writeStore(KEYS.EQUIPMENT_LOGS, list);
        return list;
    },

    getFeedbackLogs: () => readStore(KEYS.FEEDBACK_LOGS, DEFAULT_FEEDBACK_LOGS),
    addFeedback: (entry) => {
        const list = readStore(KEYS.FEEDBACK_LOGS, DEFAULT_FEEDBACK_LOGS);
        const newEntry = {
            id: `FDB-2026-0${list.length + 1}`,
            date: new Date().toISOString().slice(0, 10),
            status: 'OPEN',
            adminResponse: '',
            ...entry
        };
        list.unshift(newEntry);
        writeStore(KEYS.FEEDBACK_LOGS, list);
        return list;
    },
    resolveFeedback: (id, adminResponse) => {
        const list = readStore(KEYS.FEEDBACK_LOGS, DEFAULT_FEEDBACK_LOGS);
        const updated = list.map(f => f.id === id ? { ...f, status: 'RESOLVED', adminResponse } : f);
        writeStore(KEYS.FEEDBACK_LOGS, updated);
        return updated;
    },

    getTrainerSkillNotes: () => readStore(KEYS.TRAINER_SKILL_NOTES, DEFAULT_TRAINER_SKILL_NOTES),
    addTrainerSkillNote: (note) => {
        const list = readStore(KEYS.TRAINER_SKILL_NOTES, DEFAULT_TRAINER_SKILL_NOTES);
        const newNote = {
            id: `SKN-${100 + list.length + 1}`,
            date: new Date().toISOString().slice(0, 10),
            ...note
        };
        list.unshift(newNote);
        writeStore(KEYS.TRAINER_SKILL_NOTES, list);
        return list;
    },

    getPlacements: () => readStore(KEYS.PLACEMENTS, DEFAULT_PLACEMENTS),
    addPlacement: (record) => {
        const list = readStore(KEYS.PLACEMENTS, DEFAULT_PLACEMENTS);
        const newRec = {
            id: `PLC-2026-0${list.length + 1}`,
            certificateNo: `KISS-NSDC-2026-CERT-00${list.length + 1}`,
            ...record
        };
        list.unshift(newRec);
        writeStore(KEYS.PLACEMENTS, list);
        return list;
    },

    getPosReturns: () => readStore(KEYS.POS_RETURNS, DEFAULT_POS_RETURNS),
    addPosReturn: (claim) => {
        const list = readStore(KEYS.POS_RETURNS, DEFAULT_POS_RETURNS);
        const newClaim = {
            id: `RET-2026-0${list.length + 1}`,
            date: new Date().toISOString().slice(0, 10),
            status: 'RESOLVED_EXCHANGED',
            ...claim
        };
        list.unshift(newClaim);
        writeStore(KEYS.POS_RETURNS, list);
        return list;
    },

    getRubricScores: () => readStore(KEYS.RUBRIC_SCORES, {}),
    saveRubricScore: (collegeId, rubricObj) => {
        const map = readStore(KEYS.RUBRIC_SCORES, {});
        map[collegeId] = {
            ...rubricObj,
            updatedAt: new Date().toISOString().slice(0, 10)
        };
        writeStore(KEYS.RUBRIC_SCORES, map);
        return map[collegeId];
    }
};
