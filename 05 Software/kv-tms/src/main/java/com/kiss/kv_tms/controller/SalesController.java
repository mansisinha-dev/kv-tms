package com.kiss.kv_tms.controller;

import com.kiss.kv_tms.dto.OrderCreateDTO;
import com.kiss.kv_tms.dto.OrderUpdateDTO;
import com.kiss.kv_tms.dto.RevenueSummaryDTO;
import com.kiss.kv_tms.entity.Order;
import com.kiss.kv_tms.service.SalesService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sales")
public class SalesController {

    @Autowired
    private SalesService salesService;

    // 1. Point-of-Sale (POS) Order Booking (Deducts stock automatically!)
    @PostMapping("/orders")
    public ResponseEntity<Order> processOrder(@Valid @RequestBody OrderCreateDTO dto) {
        return ResponseEntity.ok(salesService.processOrder(dto));
    }

    // 2. View All Sales Orders
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(salesService.getAllOrders());
    }

    // 3. Edit Order (Allowed only before dispatch)
    @PutMapping("/orders/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable Long id, @RequestBody OrderUpdateDTO dto) {
        return ResponseEntity.ok(salesService.updateOrder(id, dto));
    }

    // 4. Mark Order as Dispatched
    @PutMapping("/orders/{id}/dispatch")
    public ResponseEntity<Order> dispatchOrder(@PathVariable Long id) {
        return ResponseEntity.ok(salesService.dispatchOrder(id));
    }

    // 5. Cancel & Delete Order (Allowed only before dispatch, restores warehouse stock)
    @DeleteMapping("/orders/{id}")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
        salesService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }

    // 6. Financial & Revenue Summary for Dashboard
    @GetMapping("/summary")
    public ResponseEntity<RevenueSummaryDTO> getRevenueSummary() {
        return ResponseEntity.ok(salesService.getRevenueSummary());
    }
}