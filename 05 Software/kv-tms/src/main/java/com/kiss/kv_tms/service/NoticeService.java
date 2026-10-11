package com.kiss.kv_tms.service;

import com.kiss.kv_tms.entity.Notice;
import com.kiss.kv_tms.repository.NoticeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    // 1. Get all active notices
    public List<Notice> getAllActiveNotices() {
        return noticeRepository.findByActiveTrueOrderByPinnedDescCreatedAtDesc();
    }

    // 2. Get notices filtered for audience ("TRAINEES", "TRAINERS", "PRODUCTION", "ALL")
    public List<Notice> getNoticesForAudience(String audience) {
        if (audience == null || audience.equalsIgnoreCase("ALL") || audience.isBlank()) {
            return getAllActiveNotices();
        }
        return noticeRepository.findNoticesForAudience(audience);
    }

    // 3. Post a new notice
    @Transactional
    public Notice createNotice(Notice notice) {
        if (notice.getCreatedAt() == null) {
            notice.setCreatedAt(LocalDateTime.now());
        }
        if (notice.getPinned() == null) {
            notice.setPinned(false);
        }
        notice.setActive(true);
        return noticeRepository.save(notice);
    }

    // 4. Soft delete notice
    @Transactional
    public void deleteNotice(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found with ID: " + id));
        notice.setActive(false);
        noticeRepository.save(notice);
    }

    // 5. Toggle Pinned status
    @Transactional
    public Notice togglePin(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found with ID: " + id));
        notice.setPinned(!notice.isPinned());
        return noticeRepository.save(notice);
    }
}
