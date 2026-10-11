package com.kiss.kv_tms.controller;

import com.kiss.kv_tms.dto.ForecastResponseDTO;
import com.kiss.kv_tms.service.ProductionForecastingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/forecast")
public class ForecastController {

    @Autowired
    private ProductionForecastingService forecastingService;

    // Run AI Demand Prediction & Recommended Production for a product
    @GetMapping("/products/{productId}")
    public ResponseEntity<ForecastResponseDTO> getProductForecast(@PathVariable Long productId) {
        return ResponseEntity.ok(forecastingService.generateForecast(productId));
    }
}