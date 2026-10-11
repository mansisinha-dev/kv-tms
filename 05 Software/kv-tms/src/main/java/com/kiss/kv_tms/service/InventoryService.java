package com.kiss.kv_tms.service;

import com.kiss.kv_tms.dto.StockAdjustmentDTO;
import com.kiss.kv_tms.entity.FinishedGoodsStock;
import com.kiss.kv_tms.entity.Product;
import com.kiss.kv_tms.repository.FinishedGoodsStockRepository;
import com.kiss.kv_tms.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private FinishedGoodsStockRepository stockRepo;

    @Autowired
    private ProductRepository productRepo;

    // 1. Manually initialize or adjust finished goods stock
    @Transactional
    public FinishedGoodsStock setStock(StockAdjustmentDTO dto) {
        Product product = productRepo.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + dto.getProductId()));

        FinishedGoodsStock stock = stockRepo.findByProductId(dto.getProductId())
                .orElse(FinishedGoodsStock.builder()
                        .product(product)
                        .availableStock(0)
                        .reorderLevel(dto.getReorderLevel())
                        .build());

        stock.setAvailableStock(dto.getAvailableStock());
        stock.setReorderLevel(dto.getReorderLevel());
        return stockRepo.save(stock);
    }

    // 2. Add completed batch units to finished goods inventory
    @Transactional
    public FinishedGoodsStock addStock(Long productId, Integer quantityToAdd, Integer defaultReorderLevel) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        FinishedGoodsStock stock = stockRepo.findByProductId(productId)
                .orElse(FinishedGoodsStock.builder()
                        .product(product)
                        .availableStock(0)
                        .reorderLevel(defaultReorderLevel != null ? defaultReorderLevel : 5)
                        .build());

        stock.setAvailableStock(stock.getAvailableStock() + quantityToAdd);
        return stockRepo.save(stock);
    }

    public List<FinishedGoodsStock> getAllFinishedGoodsStock() {
        return stockRepo.findAll();
    }

    public List<FinishedGoodsStock> getLowStockAlerts() {
        return stockRepo.findLowStockFinishedGoods();
    }
}