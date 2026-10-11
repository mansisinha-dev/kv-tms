package com.kiss.kv_tms.repository;

import com.kiss.kv_tms.entity.FinishedGoodsStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FinishedGoodsStockRepository extends JpaRepository<FinishedGoodsStock, Long> {
    Optional<FinishedGoodsStock> findByProductId(Long productId);

    @Query("SELECT f FROM FinishedGoodsStock f WHERE f.availableStock <= f.reorderLevel")
    List<FinishedGoodsStock> findLowStockFinishedGoods();
}