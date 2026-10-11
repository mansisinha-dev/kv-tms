package com.kiss.kv_tms.service;

import com.kiss.kv_tms.dto.*;
import com.kiss.kv_tms.entity.*;
import com.kiss.kv_tms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductionService {

    @Autowired private RawMaterialRepository rawMaterialRepo;
    @Autowired private ProductRepository productRepo;
    @Autowired private BillOfMaterialsRepository bomRepo;
    @Autowired private ProductionRunRepository runRepo;
    @Autowired private ProductionContributorRepository contributorRepo;
    @Autowired private CourseRepository courseRepo;
    @Autowired private TraineeRepository traineeRepo;
    @Autowired private FinishedGoodsStockRepository stockRepo;
    @Autowired private WorkshopRepository workshopRepo;

    // ==========================================
    // 1. Raw Materials Operations
    // ==========================================
    @Transactional
    public RawMaterial addRawMaterial(RawMaterialDTO dto) {
        RawMaterial material = RawMaterial.builder()
                .name(dto.getName())
                .unitOfMeasure(dto.getUnitOfMeasure())
                .currentStock(dto.getCurrentStock())
                .reorderLevel(dto.getReorderLevel())
                .unitCost(dto.getUnitCost())
                .build();
        return rawMaterialRepo.save(material);
    }

    public List<RawMaterial> getAllRawMaterials() {
        return rawMaterialRepo.findAll();
    }

    @Transactional
    public RawMaterial restockRawMaterial(Long id, Double quantityToAdd, Double unitCost) {
        RawMaterial material = rawMaterialRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Raw Material not found: " + id));
        material.setCurrentStock((material.getCurrentStock() != null ? material.getCurrentStock() : 0.0) + quantityToAdd);
        if (unitCost != null && unitCost > 0) {
            material.setUnitCost(unitCost);
        }
        return rawMaterialRepo.save(material);
    }

    public List<RawMaterial> getLowStockAlerts() {
        return rawMaterialRepo.findLowStockMaterials();
    }

    // ==========================================
    // 2. Product & BOM Creation
    // ==========================================
    @Transactional
    public Product createProduct(ProductCreateDTO dto) {
        Course course = courseRepo.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found: " + dto.getCourseId()));

        Product product = Product.builder()
                .course(course)
                .name(dto.getName())
                .sku(dto.getSku())
                .description(dto.getDescription())
                .sellingPrice(dto.getSellingPrice())
                .incentiveRatePerUnit(dto.getIncentiveRatePerUnit())
                .active(true)
                .build();
        Product savedProduct = productRepo.save(product);

        // Save BOM Recipe Items if provided
        if (dto.getBomList() != null && !dto.getBomList().isEmpty()) {
            List<BillOfMaterials> bomEntities = new ArrayList<>();
            for (ProductCreateDTO.BOMItemDTO item : dto.getBomList()) {
                RawMaterial material = rawMaterialRepo.findById(item.getRawMaterialId())
                        .orElseThrow(() -> new RuntimeException("Raw Material not found: " + item.getRawMaterialId()));

                BillOfMaterials bom = BillOfMaterials.builder()
                        .product(savedProduct)
                        .rawMaterial(material)
                        .quantityPerUnit(item.getQuantityPerUnit())
                        .build();
                bomEntities.add(bom);
            }
            bomRepo.saveAll(bomEntities);
        }

        return savedProduct;
    }

    public List<Product> getAllProducts() {
        return productRepo.findByActiveTrue();
    }

    public List<BillOfMaterials> getProductBOM(Long productId) {
        return bomRepo.findByProductId(productId);
    }

    // ==========================================
    // 3. Start Production Batch (Deducts Raw Materials!)
    // ==========================================
    @Transactional
    public ProductionRun startProductionRun(ProductionRunCreateDTO dto, User supervisor) {
        if (runRepo.findByBatchNumber(dto.getBatchNumber()).isPresent()) {
            throw new RuntimeException("Batch number already exists: " + dto.getBatchNumber());
        }

        Product product = productRepo.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + dto.getProductId()));

        // Check and deduct raw materials based on BOM recipe
        List<BillOfMaterials> bomList = bomRepo.findByProductId(product.getId());
        for (BillOfMaterials bom : bomList) {
            double requiredQty = bom.getQuantityPerUnit() * dto.getTargetQuantity();
            RawMaterial material = bom.getRawMaterial();

            if (material.getCurrentStock() < requiredQty) {
                throw new RuntimeException("Insufficient stock for raw material: " + material.getName() +
                        ". Required: " + requiredQty + " " + material.getUnitOfMeasure() +
                        ", Available: " + material.getCurrentStock() + " " + material.getUnitOfMeasure());
            }

            // Deduct stock
            material.setCurrentStock(material.getCurrentStock() - requiredQty);
            rawMaterialRepo.save(material);
        }

        ProductionRun run = ProductionRun.builder()
                .batchNumber(dto.getBatchNumber())
                .product(product)
                .targetQuantity(dto.getTargetQuantity())
                .completedQuantity(0)
                .status(ProductionStatus.IN_PROGRESS)
                .startDate(LocalDate.now())
                .supervisor(supervisor)
                .remarks(dto.getRemarks())
                .build();

        return runRepo.save(run);
    }

    // ==========================================
    // 4. Complete Production Batch & Log Student Crafts
    // ==========================================
    @Transactional
    public ProductionRun completeProductionRun(Long runId, ProductionCompleteDTO dto) {
        ProductionRun run = runRepo.findById(runId)
                .orElseThrow(() -> new RuntimeException("Production batch not found: " + runId));

        if (run.getStatus() == ProductionStatus.COMPLETED) {
            throw new RuntimeException("Production batch is already completed!");
        }

        run.setCompletedQuantity(dto.getCompletedQuantity());
        // Enters PENDING_APPROVAL so Admin must approve before commercial sale / POS
        run.setStatus(ProductionStatus.PENDING_APPROVAL);
        run.setCompletionDate(LocalDate.now());

        // Save individual student contributions for "Earn While Learn"
        if (dto.getContributors() != null && !dto.getContributors().isEmpty()) {
            List<ProductionContributor> contributors = new ArrayList<>();
            for (ProductionCompleteDTO.ContributorItem item : dto.getContributors()) {
                Trainee trainee = traineeRepo.findById(item.getTraineeId())
                        .orElseThrow(() -> new RuntimeException("Trainee not found: " + item.getTraineeId()));

                ProductionContributor pc = ProductionContributor.builder()
                        .productionRun(run)
                        .trainee(trainee)
                        .unitsCrafted(item.getUnitsCrafted())
                        .build();
                contributors.add(pc);
            }
            contributorRepo.saveAll(contributors);
        }

        return runRepo.save(run);
    }

    // ==========================================
    // 5. Admin Approval & Clearance for Sale (POS)
    // ==========================================
    @Transactional
    public ProductionRun approveBatchForSale(Long runId) {
        ProductionRun run = runRepo.findById(runId)
                .orElseThrow(() -> new RuntimeException("Production batch not found: " + runId));
        run.setStatus(ProductionStatus.APPROVED_FOR_SALE);
        ProductionRun savedRun = runRepo.save(run);

        // Auto-increment Finished Goods inventory stock for POS and Warehouse
        if (run.getProduct() != null && run.getCompletedQuantity() != null && run.getCompletedQuantity() > 0) {
            FinishedGoodsStock stock = stockRepo.findByProductId(run.getProduct().getId())
                    .orElseGet(() -> FinishedGoodsStock.builder()
                            .product(run.getProduct())
                            .availableStock(0)
                            .reorderLevel(5)
                            .build());
            int currentStock = stock.getAvailableStock() != null ? stock.getAvailableStock() : 0;
            stock.setAvailableStock(currentStock + run.getCompletedQuantity());
            stockRepo.save(stock);
        }

        return savedRun;
    }

    @Transactional
    public ProductionRun rejectBatch(Long runId, String remarks) {
        ProductionRun run = runRepo.findById(runId)
                .orElseThrow(() -> new RuntimeException("Production batch not found: " + runId));
        run.setStatus(ProductionStatus.REJECTED);
        if (remarks != null && !remarks.isBlank()) {
            run.setRemarks(remarks);
        }
        return runRepo.save(run);
    }

    public List<ProductionRun> getPendingApprovalRuns() {
        return runRepo.findAll().stream()
                .filter(r -> r.getStatus() == ProductionStatus.PENDING_APPROVAL)
                .toList();
    }

    public Map<String, Object> getProductionSummaryReport() {
        List<ProductionRun> allRuns = runRepo.findAll();
        long totalBatches = allRuns.size();
        long inProgress = allRuns.stream().filter(r -> r.getStatus() == ProductionStatus.IN_PROGRESS).count();
        long pendingApproval = allRuns.stream().filter(r -> r.getStatus() == ProductionStatus.PENDING_APPROVAL).count();
        long approvedForSale = allRuns.stream().filter(r -> r.getStatus() == ProductionStatus.APPROVED_FOR_SALE).count();
        int totalUnitsProduced = allRuns.stream()
                .filter(r -> r.getStatus() == ProductionStatus.APPROVED_FOR_SALE || r.getStatus() == ProductionStatus.COMPLETED)
                .mapToInt(ProductionRun::getCompletedQuantity)
                .sum();

        Map<String, Object> report = new HashMap<>();
        report.put("totalBatches", totalBatches);
        report.put("inProgress", inProgress);
        report.put("pendingApproval", pendingApproval);
        report.put("approvedForSale", approvedForSale);
        report.put("totalUnitsProduced", totalUnitsProduced);
        return report;
    }

    public List<ProductionRun> getAllProductionRuns() {
        return runRepo.findAll();
    }

    public List<ProductionContributor> getBatchContributors(Long runId) {
        return contributorRepo.findByProductionRunId(runId);
    }

    // ==========================================
    // 6. Active Workshop Management & Proposals
    // ==========================================
    @Transactional
    public Workshop proposeWorkshop(WorkshopProposeDTO dto, User supervisor) {
        Course course = null;
        if (dto.getCourseId() != null) {
            course = courseRepo.findById(dto.getCourseId()).orElse(null);
        }

        Workshop ws = Workshop.builder()
                .name(dto.getName())
                .shortName(dto.getShortName() != null && !dto.getShortName().isBlank() ? dto.getShortName() : dto.getName())
                .category(dto.getCategory() != null && !dto.getCategory().isBlank() ? dto.getCategory() : "Vocational Artisan Workshop")
                .course(course)
                .productName(dto.getProductName())
                .sku(dto.getSku())
                .batchPrefix(dto.getBatchPrefix() != null && !dto.getBatchPrefix().isBlank() ? dto.getBatchPrefix() : "BATCH-2026-WS")
                .sellingPrice(dto.getSellingPrice())
                .incentiveRate(dto.getIncentiveRate())
                .status(ProductionStatus.PENDING_APPROVAL)
                .proposedBy(supervisor != null ? supervisor.getEmail() : "production@kiss.ac.in")
                .approvalRemarks(dto.getProposalRemarks())
                .bomSummary(dto.getBomSummary())
                .build();

        return workshopRepo.save(ws);
    }

    @Transactional
    public Workshop approveWorkshop(Long workshopId, String remarks) {
        Workshop ws = workshopRepo.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Workshop not found: " + workshopId));

        ws.setStatus(ProductionStatus.APPROVED_FOR_SALE);
        ws.setApprovedAt(LocalDateTime.now());
        if (remarks != null && !remarks.isBlank()) {
            ws.setApprovalRemarks(remarks);
        }
        Workshop saved = workshopRepo.save(ws);

        // Auto-create product in product catalog if SKU is provided and does not exist yet
        if (ws.getSku() != null && !ws.getSku().isBlank()) {
            if (productRepo.findBySku(ws.getSku()).isEmpty()) {
                Product product = productRepo.save(Product.builder()
                        .name(ws.getProductName() != null && !ws.getProductName().isBlank() ? ws.getProductName() : ws.getName())
                        .sku(ws.getSku())
                        .description(ws.getName() + " - handcrafted artisanal vocational product")
                        .course(ws.getCourse())
                        .sellingPrice(ws.getSellingPrice() != null ? ws.getSellingPrice() : 600.0)
                        .incentiveRatePerUnit(ws.getIncentiveRate() != null ? ws.getIncentiveRate() : 80.0)
                        .active(true)
                        .build());

                stockRepo.save(FinishedGoodsStock.builder()
                        .product(product)
                        .availableStock(0)
                        .reorderLevel(5)
                        .build());
            }
        }

        // Auto-provision initial raw materials from BOM summary if provided
        if (ws.getBomSummary() != null && !ws.getBomSummary().isBlank()) {
            String[] parts = ws.getBomSummary().split("[+,;]");
            for (String part : parts) {
                String clean = part.trim();
                if (clean.isEmpty()) continue;
                String matName = clean.replaceAll("\\(.*\\)", "").trim();
                if (!matName.isEmpty() && rawMaterialRepo.findByName(matName).isEmpty()) {
                    String uom = "Kg";
                    if (clean.toLowerCase().contains("litre") || clean.toLowerCase().contains(" l)") || clean.toLowerCase().contains("liters")) {
                        uom = "Litres";
                    } else if (clean.toLowerCase().contains("meter") || clean.toLowerCase().contains("m)")) {
                        uom = "Meters";
                    } else if (clean.toLowerCase().contains("piece") || clean.toLowerCase().contains("pcs") || clean.toLowerCase().contains("units")) {
                        uom = "Pieces";
                    } else if (clean.toLowerCase().contains("stalk")) {
                        uom = "Stalks";
                    }
                    rawMaterialRepo.save(RawMaterial.builder()
                            .name(matName)
                            .unitOfMeasure(uom)
                            .currentStock(50.0)
                            .reorderLevel(15.0)
                            .unitCost(150.0)
                            .build());
                }
            }
        }

        return saved;
    }

    @Transactional
    public Workshop rejectWorkshop(Long workshopId, String remarks) {
        Workshop ws = workshopRepo.findById(workshopId)
                .orElseThrow(() -> new RuntimeException("Workshop not found: " + workshopId));

        ws.setStatus(ProductionStatus.REJECTED);
        if (remarks != null && !remarks.isBlank()) {
            ws.setApprovalRemarks(remarks);
        }
        return workshopRepo.save(ws);
    }

    public List<Workshop> getActiveWorkshops() {
        return workshopRepo.findByStatus(ProductionStatus.APPROVED_FOR_SALE);
    }

    public List<Workshop> getPendingWorkshops() {
        return workshopRepo.findByStatus(ProductionStatus.PENDING_APPROVAL);
    }

    public List<Workshop> getAllWorkshops() {
        return workshopRepo.findAll();
    }
}