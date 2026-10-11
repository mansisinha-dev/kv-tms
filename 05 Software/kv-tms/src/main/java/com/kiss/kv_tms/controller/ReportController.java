package com.kiss.kv_tms.controller;

import com.kiss.kv_tms.dto.SystemAnalyticsDTO;
import com.kiss.kv_tms.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // Global Executive Analytics Dashboard
    @GetMapping("/executive-dashboard")
    public ResponseEntity<SystemAnalyticsDTO> getExecutiveDashboard() {
        return ResponseEntity.ok(reportService.getExecutiveAnalytics());
    }
}