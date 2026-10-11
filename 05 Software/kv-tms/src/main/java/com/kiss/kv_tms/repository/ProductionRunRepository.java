package com.kiss.kv_tms.repository;

import com.kiss.kv_tms.entity.ProductionRun;
import com.kiss.kv_tms.entity.ProductionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductionRunRepository extends JpaRepository<ProductionRun, Long> {
    Optional<ProductionRun> findByBatchNumber(String batchNumber);
    List<ProductionRun> findByStatus(ProductionStatus status);
    List<ProductionRun> findByProductId(Long productId);
}