package com.kiss.kv_tms.repository;

import com.kiss.kv_tms.entity.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RawMaterialRepository extends JpaRepository<RawMaterial, Long> {
    Optional<RawMaterial> findByName(String name);

    // Find materials that have dropped below their reorder threshold
    @Query("SELECT r FROM RawMaterial r WHERE r.currentStock <= r.reorderLevel")
    List<RawMaterial> findLowStockMaterials();
}