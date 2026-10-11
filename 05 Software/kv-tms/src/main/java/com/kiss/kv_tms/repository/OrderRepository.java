package com.kiss.kv_tms.repository;

import com.kiss.kv_tms.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);

    // Total sales revenue collected
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Order o WHERE o.status = 'COMPLETED'")
    Double getTotalRevenue();

    // Past sales counts for a product (used for AI Demand Forecasting)
    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM OrderItem i WHERE i.product.id = :productId")
    Integer getTotalUnitsSoldByProductId(@Param("productId") Long productId);
}