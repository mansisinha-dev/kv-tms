package com.kiss.kv_tms.controller;

import com.kiss.kv_tms.dto.StockAdjustmentDTO;
import com.kiss.kv_tms.entity.FinishedGoodsStock;
import com.kiss.kv_tms.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    // 1. Manually initialize or adjust finished goods stock
    @PostMapping("/stock")
    public ResponseEntity<FinishedGoodsStock> setStock(@Valid @RequestBody StockAdjustmentDTO dto) {
        return ResponseEntity.ok(inventoryService.setStock(dto));
    }

    // 2. View all finished goods inventory
    @GetMapping("/finished-goods")
    public ResponseEntity<List<FinishedGoodsStock>> getAllStock() {
        return ResponseEntity.ok(inventoryService.getAllFinishedGoodsStock());
    }

    // 3. View low-stock finished goods alerts
    @GetMapping("/alerts/low-stock")
    public ResponseEntity<List<FinishedGoodsStock>> getLowStockAlerts() {
        return ResponseEntity.ok(inventoryService.getLowStockAlerts());
    }
}