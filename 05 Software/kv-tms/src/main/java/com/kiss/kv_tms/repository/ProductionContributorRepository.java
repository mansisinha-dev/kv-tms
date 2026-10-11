package com.kiss.kv_tms.repository;

import com.kiss.kv_tms.entity.ProductionContributor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductionContributorRepository extends JpaRepository<ProductionContributor, Long> {
    List<ProductionContributor> findByProductionRunId(Long runId);
    List<ProductionContributor> findByTraineeId(Long traineeId);
}