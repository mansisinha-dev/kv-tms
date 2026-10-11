package com.kiss.kv_tms.controller;

import com.kiss.kv_tms.dto.*;
import com.kiss.kv_tms.entity.*;
import com.kiss.kv_tms.repository.UserRepository;
import com.kiss.kv_tms.service.ProductionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/production")
public class ProductionController {

    @Autowired
    private ProductionService productionService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String collegeId = (auth != null) ? auth.getName() : null;
        if (collegeId != null && !collegeId.equalsIgnoreCase("anonymousUser")) {
            java.util.Optional<User> userOpt = userRepository.findByCollegeId(collegeId);
            if (userOpt.isPresent()) return userOpt.get();
        }
        return userRepository.findByCollegeId("KISS-PRD-001")
                .or(() -> userRepository.findByCollegeId("KISS-ADM-001"))
                .orElse(null);
    }

    // ==========================================
    // Raw Materials Endpoints
    // ==========================================
    @PostMapping("/raw-materials")
    public ResponseEntity<RawMaterial> addRawMaterial(@Valid @RequestBody RawMaterialDTO dto) {
        return ResponseEntity.ok(productionService.addRawMaterial(dto));
    }

    @GetMapping("/raw-materials")
    public ResponseEntity<List<RawMaterial>> getAllRawMaterials() {
        return ResponseEntity.ok(productionService.getAllRawMaterials());
    }

    @GetMapping("/raw-materials/low-stock")
    public ResponseEntity<List<RawMaterial>> getLowStockAlerts() {
        return ResponseEntity.ok(productionService.getLowStockAlerts());
    }

    @PostMapping("/raw-materials/{id}/restock")
    public ResponseEntity<RawMaterial> restockRawMaterial(
            @PathVariable Long id,
            @RequestParam Double quantity,
            @RequestParam(required = false) Double unitCost) {
        return ResponseEntity.ok(productionService.restockRawMaterial(id, quantity, unitCost));
    }

    @PutMapping("/raw-materials/{id}/restock")
    public ResponseEntity<RawMaterial> restockRawMaterialPut(
            @PathVariable Long id,
            @RequestParam Double quantity,
            @RequestParam(required = false) Double unitCost) {
        return ResponseEntity.ok(productionService.restockRawMaterial(id, quantity, unitCost));
    }

    // ==========================================
    // Product & BOM Endpoints
    // ==========================================
    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductCreateDTO dto) {
        return ResponseEntity.ok(productionService.createProduct(dto));
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productionService.getAllProducts());
    }

    @GetMapping("/products/{productId}/bom")
    public ResponseEntity<List<BillOfMaterials>> getProductBOM(@PathVariable Long productId) {
        return ResponseEntity.ok(productionService.getProductBOM(productId));
    }

    // ==========================================
    // Production Run (Batch) Endpoints
    // ==========================================
    @PostMapping("/runs/start")
    public ResponseEntity<ProductionRun> startProductionRun(@Valid @RequestBody ProductionRunCreateDTO dto) {
        User supervisor = getCurrentUser();
        return ResponseEntity.ok(productionService.startProductionRun(dto, supervisor));
    }

    @PutMapping("/runs/{runId}/complete")
    public ResponseEntity<ProductionRun> completeProductionRun(
            @PathVariable Long runId,
            @Valid @RequestBody ProductionCompleteDTO dto) {
        return ResponseEntity.ok(productionService.completeProductionRun(runId, dto));
    }

    @GetMapping("/runs")
    public ResponseEntity<List<ProductionRun>> getAllRuns() {
        return ResponseEntity.ok(productionService.getAllProductionRuns());
    }

    @GetMapping("/runs/{runId}/contributors")
    public ResponseEntity<List<ProductionContributor>> getRunContributors(@PathVariable Long runId) {
        return ResponseEntity.ok(productionService.getBatchContributors(runId));
    }

    // ==========================================
    // Admin Approval & Reporting Endpoints
    // ==========================================
    @GetMapping("/runs/pending-approval")
    public ResponseEntity<List<ProductionRun>> getPendingApprovalRuns() {
        return ResponseEntity.ok(productionService.getPendingApprovalRuns());
    }

    @PutMapping("/runs/{runId}/approve")
    public ResponseEntity<ProductionRun> approveBatchForSale(@PathVariable Long runId) {
        return ResponseEntity.ok(productionService.approveBatchForSale(runId));
    }

    @PutMapping("/runs/{runId}/reject")
    public ResponseEntity<ProductionRun> rejectBatch(
            @PathVariable Long runId,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(productionService.rejectBatch(runId, remarks));
    }

    @GetMapping("/reports/summary")
    public ResponseEntity<java.util.Map<String, Object>> getProductionSummaryReport() {
        return ResponseEntity.ok(productionService.getProductionSummaryReport());
    }

    // ==========================================
    // Workshop Management Endpoints
    // ==========================================
    @PostMapping("/workshops/propose")
    public ResponseEntity<Workshop> proposeWorkshop(@Valid @RequestBody WorkshopProposeDTO dto) {
        User supervisor = getCurrentUser();
        return ResponseEntity.ok(productionService.proposeWorkshop(dto, supervisor));
    }

    @GetMapping("/workshops/active")
    public ResponseEntity<List<Workshop>> getActiveWorkshops() {
        return ResponseEntity.ok(productionService.getActiveWorkshops());
    }

    @GetMapping("/workshops/pending")
    public ResponseEntity<List<Workshop>> getPendingWorkshops() {
        return ResponseEntity.ok(productionService.getPendingWorkshops());
    }

    @GetMapping("/workshops")
    public ResponseEntity<List<Workshop>> getAllWorkshops() {
        return ResponseEntity.ok(productionService.getAllWorkshops());
    }

    @PutMapping("/workshops/{id}/approve")
    public ResponseEntity<Workshop> approveWorkshop(
            @PathVariable Long id,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(productionService.approveWorkshop(id, remarks));
    }

    @PutMapping("/workshops/{id}/reject")
    public ResponseEntity<Workshop> rejectWorkshop(
            @PathVariable Long id,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(productionService.rejectWorkshop(id, remarks));
    }
}