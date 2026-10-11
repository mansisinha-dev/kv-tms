package com.kiss.kv_tms.repository;

import com.kiss.kv_tms.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {

    // All active notices sorted with pinned first, then newest
    List<Notice> findByActiveTrueOrderByPinnedDescCreatedAtDesc();

    // Notices targeted to a specific audience or ALL
    @Query("SELECT n FROM Notice n WHERE n.active = true AND (UPPER(n.targetAudience) = UPPER(:audience) OR UPPER(n.targetAudience) = 'ALL') ORDER BY n.pinned DESC, n.createdAt DESC")
    List<Notice> findNoticesForAudience(@Param("audience") String audience);
}
