package com.kiss.kv_tms.repository;

import com.kiss.kv_tms.entity.BillOfMaterials;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillOfMaterialsRepository extends JpaRepository<BillOfMaterials, Long> {
    // Get recipe items for a specific product
    List<BillOfMaterials> findByProductId(Long productId);
}