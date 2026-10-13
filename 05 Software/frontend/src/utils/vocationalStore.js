// ============================================================================
// KISS VOCATIONAL TRAINING MANAGEMENT SYSTEM (KV-TMS)
// Synchronized Store for QA Inspections, Defect/Damage Handling, Equipment,
// 360° User Feedback, NSQF Competency Rubrics, Certifications & Placements
// Aligned 100% with Live MySQL Database Entities (DataInitializer.java)
// ============================================================================

const KEYS = {
    QA_INSPECTIONS: 'kvtms_qa_inspections_v3_live',
    DAMAGE_LOGS: 'kvtms_damage_logs_v3_live',
    EQUIPMENT_LOGS: 'kvtms_equipment_logs_v3_live',
    FEEDBACK_LOGS: 'kvtms_feedback_logs_v3_live',
    TRAINER_SKILL_NOTES: 'kvtms_trainer_skill_notes_v3_live',
    PLACEMENTS: 'kvtms_placements_v3_live',
    POS_RETURNS: 'kvtms_pos_returns_v3_live',
    RUBRIC_SCORES: 'kvtms_rubric_scores_v3_live'
};

// Default Seed Data for QA Inspections (Aligned with real batches in DataInitializer.java)
const DEFAULT_QA_INSPECTIONS = [
    {
        id: 'QA-2026-101',
        batchNumber: 'BATCH-2026-SEW-001',
        productName: 'Handcrafted Cotton Kurti',
        trade: 'Sewing & Apparel Manufacturing (VOC-SEW-101)',
        workshopName: 'Workshop Lab #1 (Sewing & Textiles)',
        inspectorName: 'Kavita Priyadarshini Das (KISS-PRD-001)',
        inspectionDate: '2026-10-09',
        targetQty: 15,
        producedQty: 15,
        passedQty: 13,
        reworkQty: 1,
        scrapQty: 1,
        checklist: {
            dimensionalAccuracy: 9,
            craftsmanship: 9,
            surfaceFinish: 8,
            packagingHygiene: 10
        },
        defectCategory: 'Minor Collar Seam Tension Variance (1 unit)',
        correctiveAction: '1 kurti returned to Workshop Lab #1 for collar lockstitch re-hemming; 1 unit logged as pattern-cutting practice scrap.',
        status: 'CLEARED_WITH_PARTIAL_REWORK'
    },
    {
        id: 'QA-2026-102',
        batchNumber: 'BATCH-2026-SAM-001',
        productName: 'Sambalpuri Handloom Stole',
        trade: 'Handicrafts & Tribal Art (VOC-ART-102)',
        workshopName: 'Workshop Lab #2 (Sambalpuri Handloom)',
        inspectorName: 'Kavita Priyadarshini Das (KISS-PRD-001)',
        inspectionDate: '2026-10-10',
        targetQty: 10,
        producedQty: 10,
        passedQty: 10,
        reworkQty: 0,
        scrapQty: 0,
        checklist: {
            dimensionalAccuracy: 10,
            craftsmanship: 10,
            surfaceFinish: 9,
            packagingHygiene: 10
        },
        defectCategory: 'Zero Defects (100% First-Pass Yield)',
        correctiveAction: 'All 10 Sambalpuri stoles certified Grade-A and dispatched to Sales POS showroom rack.',
        status: 'CLEARED_FOR_SALE'
    }
];

// Default Seed Data for Warehouse & Production Damage / Wastage / Breakage
const DEFAULT_DAMAGE_LOGS = [
    {
        id: 'DMG-2026-01',
        date: '2026-10-08',
        itemType: 'RAW_MATERIAL',
        itemName: 'Pure Cotton Fabric',
        batchOrSku: 'BATCH-2026-SEW-001',
        quantityDamaged: 2.5,
        unit: 'Meters',
        damageStage: 'Pattern Cutting Practice (Workshop Lab #1)',
        reason: 'Initial sleeve pattern misalignment during beginner scholar practice session',
        disposition: 'RECYCLED_FOR_PATCHWORK',
        reportedBy: 'Kavita Priyadarshini Das (KISS-PRD-001)',
        estimatedLoss: 300,
        preventionNote: 'Added mandatory brown-paper template check before cutting Pure Cotton Fabric.'
    },
    {
        id: 'DMG-2026-02',
        date: '2026-10-09',
        itemType: 'FINISHED_GOOD',
        itemName: 'Handcrafted Cotton Kurti',
        batchOrSku: 'BATCH-2026-SEW-001',
        quantityDamaged: 1,
        unit: 'Units',
        damageStage: 'QA Inspection (Workshop Lab #1)',
        reason: 'Needle oil stain & seam tear on 1 practice garment',
        disposition: 'SCRAP_WRITE_OFF',
        reportedBy: 'Kavita Priyadarshini Das (KISS-PRD-001)',
        estimatedLoss: 315,
        preventionNote: 'Wipe sewing machine presser foot and run scrap cloth strip after oiling.'
    },
    {
        id: 'DMG-2026-03',
        date: '2026-10-10',
        itemType: 'RAW_MATERIAL',
        itemName: 'Seasoned Bamboo Stalks',
        batchOrSku: 'PRD-BAM-03',
        quantityDamaged: 2,
        unit: 'Stalks',
        damageStage: 'Warehouse Storage & Seasoning Audit',
        reason: 'Natural node splitting found during pre-production moisture check',
        disposition: 'RECYCLED_FOR_PATCHWORK',
        reportedBy: 'Kavita Priyadarshini Das (KISS-PRD-001)',
        estimatedLoss: 180,
        preventionNote: 'Segregated split stalks for small bamboo pen-stand carving exercises by trainees.'
    }
];

// Default Seed Data for Workshop Machinery & Student Toolkit Register
const DEFAULT_EQUIPMENT_LOGS = [
    {
        id: 'EQP-TAIL-01',
        equipmentName: 'Juki Industrial Lockstitch Sewing Machines (#01–#15)',
        category: 'WORKSHOP_MACHINERY',
        workshopLab: 'Workshop Lab #1 (Sewing & Textiles)',
        trade: 'Sewing & Apparel Manufacturing (VOC-SEW-101)',
        totalUnits: 15,
        workingUnits: 14,
        damagedUnits: 1,
        status: 'NEEDS_MAINTENANCE',
        issueReported: 'Machine #09 bobbin tension spring requires calibration for thick embroidery thread',
        reportedBy: 'Laxman Majhi (KISS-TRN-2026-001)',
        assignedTechnician: 'Campus Mechanical Maintenance Cell',
        lastServiced: '2026-10-08'
    },
    {
        id: 'EQP-LOOM-02',
        equipmentName: 'Traditional Sambalpuri Ikat Pit-Looms & Warp Frames',
        category: 'WORKSHOP_MACHINERY',
        workshopLab: 'Workshop Lab #2 (Sambalpuri Handloom)',
        trade: 'Handicrafts & Tribal Art (VOC-ART-102)',
        totalUnits: 8,
        workingUnits: 8,
        damagedUnits: 0,
        status: 'OPERATIONAL',
        issueReported: 'All warp beams, shuttles, and reed frames calibrated and 100% operational',
        reportedBy: 'Prof. Sanatan Marndi (KISS-FAC-001)',
        assignedTechnician: 'Handloom Master Technician',
        lastServiced: '2026-10-09'
    },
    {
        id: 'EQP-KIT-03',
        equipmentName: 'Scholar Bamboo Carving Chisel Toolkit & Protective Aprons',
        category: 'STUDENT_TOOLKIT',
        workshopLab: 'Workshop Lab #3 (Bamboo & Handicraft Studio)',
        trade: 'Handicrafts & Tribal Art (VOC-ART-102)',
        totalUnits: 25,
        workingUnits: 25,
        damagedUnits: 0,
        status: 'OPERATIONAL',
        issueReported: 'All 25 student carving toolkits sharpened and safety PPE verified',
        reportedBy: 'Kavita Priyadarshini Das (KISS-PRD-001)',
        assignedTechnician: 'Workshop Tool Storekeeper',
        lastServiced: '2026-10-10'
    }
];

// Default Seed Data for 360° User Feedback & Grievances
const DEFAULT_FEEDBACK_LOGS = [
    {
        id: 'FDB-2026-01',
        date: '2026-10-09',
        sourceRole: 'TRAINEE',
        submittedById: 'KISS-TRN-2026-001',
        submittedBy: 'Laxman Majhi (KISS-TRN-2026-001)',
        tradeOrProduct: 'Sewing & Apparel Manufacturing (VOC-SEW-101)',
        category: 'TRAINING_AND_LAB_FEEDBACK',
        rating: 5,
        subject: 'Practical Pattern-Making & Kurti Embroidery Sessions',
        message: 'The hands-on demonstration on tribal motif border alignment helped me complete my kurti batch without seam puckering. Requesting extra bobbin cases for Machine #09 in Workshop Lab #1.',
        status: 'RESOLVED',
        adminResponse: 'Thank you Laxman! Spare bobbin cases have been issued to Workshop Lab #1 and Machine #09 is scheduled for tension calibration.'
    },
    {
        id: 'FDB-2026-02',
        date: '2026-10-10',
        sourceRole: 'CUSTOMER_BUYER',
        submittedById: 'BUYER-POS',
        submittedBy: 'Showroom Exhibition Visitor (POS Invoice #INV-2026-001)',
        tradeOrProduct: 'Sambalpuri Handloom Stole (PRD-SAM-02)',
        category: 'PRODUCT_QUALITY_REVIEW',
        rating: 5,
        subject: 'Authentic Sambalpuri Ikat Weave & Natural Dye Finish',
        message: 'Purchased the Sambalpuri Handloom Stole and Handcrafted Cotton Kurti from the KISS Showroom. The intricate tribal ikat weave and fabric quality are outstanding!',
        status: 'RESOLVED',
        adminResponse: 'Appreciation shared with Workshop Lab #1 & #2 scholars and faculty!'
    }
];

// Default Seed Data for Trainer-to-Trainee Constructive Skill & Defect Prevention Notes
const DEFAULT_TRAINER_SKILL_NOTES = [
    {
        id: 'SKN-101',
        date: '2026-10-10',
        traineeId: 'KISS-TRN-2026-001',
        traineeName: 'Laxman Majhi',
        trainerName: 'Prof. Sanatan Marndi (KISS-FAC-001)',
        trade: 'Sewing & Apparel Manufacturing (VOC-SEW-101)',
        competencyArea: 'Seam Tension, Collar Symmetry & Wooden Button Reinforcement',
        skillObservation: 'Demonstrates strong control on straight lockstitch during Handcrafted Cotton Kurti production (BATCH-2026-SEW-001). Maintained high precision on tribal neckline embroidery.',
        defectPreventionTip: 'Always test stitch tension on a 10cm cotton scrap swatch before stitching the final garment collar, and double-knot all 4 wooden handicraft buttons.',
        practicalHoursLogged: 164,
        requiredHours: 180
    }
];

// Default Seed Data for Placements, Apprenticeships (OJT) & Trade Certification
const DEFAULT_PLACEMENTS = [
    {
        id: 'PLC-2026-01',
        traineeId: 'KISS-TRN-2026-001',
        traineeName: 'Laxman Majhi',
        tribeAndDistrict: 'Scheduled Tribe (KISS Scholar) • Odisha',
        trade: 'Sewing & Apparel Manufacturing (VOC-SEW-101)',
        nsqfLevel: 'NSQF Level 4 (Master Sewing & Apparel Technician)',
        attendancePct: 91.5,
        examScore: 90,
        certificateNo: 'KISS-NSDC-2026-SEW-001',
        pathwayType: 'APPRENTICESHIP_OJT',
        partnerOrganization: 'Boyanika / Odisha State Handloom & Apparel Cooperative',
        roleOffered: 'Apprentice Garment Quality & Production Technician',
        monthlyStipendOrIncome: 14500,
        status: 'PLACED_AND_CERTIFIED'
    }
];

// Default POS Customer Return / Defective Replacement Claims
const DEFAULT_POS_RETURNS = [
    {
        id: 'RET-2026-01',
        date: '2026-10-09',
        invoiceNumber: 'INV-KISS-2026-001',
        customerName: 'Showroom Walk-in Customer',
        productName: 'Handcrafted Cotton Kurti (PRD-KURTI-01)',
        quantity: 1,
        defectReported: 'Loose wooden handicraft button stitching on sleeve cuff',
        resolutionAction: 'INSTANT_EXCHANGE_AND_SENT_FOR_REWORK',
        refundOrExchangeValue: 650,
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
    deleteQAInspection: (id) => {
        const list = readStore(KEYS.QA_INSPECTIONS, DEFAULT_QA_INSPECTIONS).filter(i => i.id !== id);
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
    deleteDamageLog: (id) => {
        const list = readStore(KEYS.DAMAGE_LOGS, DEFAULT_DAMAGE_LOGS).filter(i => i.id !== id);
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
    deleteEquipmentLog: (id) => {
        const list = readStore(KEYS.EQUIPMENT_LOGS, DEFAULT_EQUIPMENT_LOGS).filter(i => i.id !== id);
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
    deleteFeedback: (id) => {
        const list = readStore(KEYS.FEEDBACK_LOGS, DEFAULT_FEEDBACK_LOGS).filter(i => i.id !== id);
        writeStore(KEYS.FEEDBACK_LOGS, list);
        return list;
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
    deleteTrainerSkillNote: (id) => {
        const list = readStore(KEYS.TRAINER_SKILL_NOTES, DEFAULT_TRAINER_SKILL_NOTES).filter(i => i.id !== id);
        writeStore(KEYS.TRAINER_SKILL_NOTES, list);
        return list;
    },

    getPlacements: () => readStore(KEYS.PLACEMENTS, DEFAULT_PLACEMENTS),
    addPlacement: (record) => {
        const list = readStore(KEYS.PLACEMENTS, DEFAULT_PLACEMENTS);
        const existingIdx = list.findIndex(p => p.traineeId === record.traineeId);
        if (existingIdx >= 0) {
            list[existingIdx] = { ...list[existingIdx], ...record };
        } else {
            const newRec = {
                id: `PLC-2026-0${list.length + 1}`,
                certificateNo: `KISS-NSDC-2026-CERT-00${list.length + 1}`,
                ...record
            };
            list.unshift(newRec);
        }
        writeStore(KEYS.PLACEMENTS, list);
        return list;
    },
    deletePlacement: (id) => {
        const list = readStore(KEYS.PLACEMENTS, DEFAULT_PLACEMENTS).filter(i => i.id !== id);
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
    deletePosReturn: (id) => {
        const list = readStore(KEYS.POS_RETURNS, DEFAULT_POS_RETURNS).filter(i => i.id !== id);
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
