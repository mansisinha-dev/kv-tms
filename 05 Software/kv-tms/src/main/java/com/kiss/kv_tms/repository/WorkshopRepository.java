package com.kiss.kv_tms.repository;

import com.kiss.kv_tms.entity.ProductionStatus;
import com.kiss.kv_tms.entity.Workshop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkshopRepository extends JpaRepository<Workshop, Long> {
    Optional<Workshop> findByName(String name);
    List<Workshop> findByStatus(ProductionStatus status);
}
