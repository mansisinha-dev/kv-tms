package com.kiss.kv_tms.repository;

import com.kiss.kv_tms.entity.SyllabusModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SyllabusModuleRepository extends JpaRepository<SyllabusModule, Long> {
    // Get ordered modules for a specific vocational course
    List<SyllabusModule> findByCourseIdOrderByOrderNoAsc(Long courseId);
}