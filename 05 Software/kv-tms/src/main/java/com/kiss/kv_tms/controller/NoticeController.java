package com.kiss.kv_tms.controller;

import com.kiss.kv_tms.entity.Notice;
import com.kiss.kv_tms.service.NoticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notices")
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    // 1. Get all active notices
    @GetMapping
    public ResponseEntity<List<Notice>> getAllNotices() {
        return ResponseEntity.ok(noticeService.getAllActiveNotices());
    }

    // 2. Get notices for a specific target audience
    @GetMapping("/audience/{audience}")
    public ResponseEntity<List<Notice>> getNoticesForAudience(@PathVariable String audience) {
        return ResponseEntity.ok(noticeService.getNoticesForAudience(audience));
    }

    // 3. Post a new notice (Admin)
    @PostMapping
    public ResponseEntity<Notice> createNotice(@RequestBody Notice notice) {
        return ResponseEntity.ok(noticeService.createNotice(notice));
    }

    // 4. Delete notice (Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.ok("Notice " + id + " deleted successfully.");
    }

    // 5. Toggle Pinned status
    @PutMapping("/{id}/pin")
    public ResponseEntity<Notice> togglePin(@PathVariable Long id) {
        return ResponseEntity.ok(noticeService.togglePin(id));
    }
}
