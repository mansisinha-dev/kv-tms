package com.kiss.kv_tms.service;

import com.kiss.kv_tms.dto.*;
import com.kiss.kv_tms.entity.*;
import com.kiss.kv_tms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SalesService {

    @Autowired private OrderRepository orderRepo;
    @Autowired private CustomerRepository customerRepo;
    @Autowired private ProductRepository productRepo;
    @Autowired private FinishedGoodsStockRepository stockRepo;
    @Autowired private ProductionRunRepository runRepo;

    // 1. Process Point-of-Sale (POS) Order (Strict Stock Validation Enforced!)
    @Transactional
    public Order processOrder(OrderCreateDTO dto) {
        // Find existing customer or register new customer by contact number
        Customer customer = customerRepo.findByContactNumber(dto.getCustomerContact())
                .orElseGet(() -> customerRepo.save(Customer.builder()
                        .name(dto.getCustomerName())
                        .contactNumber(dto.getCustomerContact())
                        .email(dto.getCustomerEmail())
                        .address(dto.getCustomerAddress())
                        .build()));

        String orderNumber = "ORD-" + System.currentTimeMillis();
        double totalAmount = 0.0;
        List<OrderItem> orderItems = new ArrayList<>();

        LocalDate schedDispatch = null;
        if (dto.getDispatchDate() != null && !dto.getDispatchDate().isBlank()) {
            try {
                schedDispatch = LocalDate.parse(dto.getDispatchDate());
            } catch (Exception e) {
                schedDispatch = LocalDate.now();
            }
        } else {
            schedDispatch = LocalDate.now();
        }

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .customer(customer)
                .totalAmount(0.0)
                .status(OrderStatus.CONFIRMED)
                .dispatchDate(schedDispatch)
                .orderDate(LocalDateTime.now())
                .build();

        // Validate stock availability and deduct finished goods
        for (OrderCreateDTO.OrderItemDTO itemDto : dto.getItems()) {
            Product product = productRepo.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemDto.getProductId()));

            FinishedGoodsStock stock = stockRepo.findByProductId(product.getId())
                    .orElseThrow(() -> new RuntimeException("Product has no inventory record: " + product.getName()));

            // Strict SRS Business Rule: Cannot sell more than available stock!
            if (stock.getAvailableStock() < itemDto.getQuantity()) {
                throw new RuntimeException("Insufficient stock for " + product.getName() +
                        ". Available: " + stock.getAvailableStock() + ", Requested: " + itemDto.getQuantity());
            }

            // Deduct finished goods stock
            stock.setAvailableStock(stock.getAvailableStock() - itemDto.getQuantity());
            stockRepo.save(stock);

            double subtotal = product.getSellingPrice() * itemDto.getQuantity();
            totalAmount += subtotal;

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .unitPrice(product.getSellingPrice())
                    .subtotal(subtotal)
                    .build();
            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);

        return orderRepo.save(order);
    }

    // 2. Edit Order (Allowed only before dispatch)
    @Transactional
    public Order updateOrder(Long orderId, OrderUpdateDTO dto) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        if (order.getStatus() == OrderStatus.DISPATCHED) {
            throw new RuntimeException("Cannot edit an order that has already been dispatched.");
        }

        // Update customer details if provided
        Customer customer = order.getCustomer();
        if (dto.getCustomerName() != null && !dto.getCustomerName().isBlank()) {
            customer.setName(dto.getCustomerName());
        }
        if (dto.getCustomerContact() != null && !dto.getCustomerContact().isBlank()) {
            customer.setContactNumber(dto.getCustomerContact());
        }
        if (dto.getCustomerAddress() != null) {
            customer.setAddress(dto.getCustomerAddress());
        }
        if (dto.getCustomerEmail() != null) {
            customer.setEmail(dto.getCustomerEmail());
        }
        customerRepo.save(customer);

        // Update dispatch date
        if (dto.getDispatchDate() != null && !dto.getDispatchDate().isBlank()) {
            try {
                order.setDispatchDate(LocalDate.parse(dto.getDispatchDate()));
            } catch (Exception ignored) {}
        }

        // Update quantity if single item order and quantity changed
        if (dto.getQuantity() != null && dto.getQuantity() > 0 && order.getItems() != null && !order.getItems().isEmpty()) {
            OrderItem item = order.getItems().get(0);
            int oldQty = item.getQuantity();
            int newQty = dto.getQuantity();
            int diff = newQty - oldQty;

            if (diff != 0) {
                FinishedGoodsStock stock = stockRepo.findByProductId(item.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Stock record not found for product: " + item.getProduct().getName()));

                if (diff > 0 && stock.getAvailableStock() < diff) {
                    throw new RuntimeException("Insufficient stock to increase quantity. Extra required: " + diff + ", Available: " + stock.getAvailableStock());
                }

                // Adjust stock: if diff > 0, deduct stock. If diff < 0, return stock.
                stock.setAvailableStock(stock.getAvailableStock() - diff);
                stockRepo.save(stock);

                item.setQuantity(newQty);
                item.setSubtotal(item.getUnitPrice() * newQty);

                double newTotal = order.getItems().stream().mapToDouble(OrderItem::getSubtotal).sum();
                order.setTotalAmount(newTotal);
            }
        }

        return orderRepo.save(order);
    }

    // 3. Mark Order as Dispatched
    @Transactional
    public Order dispatchOrder(Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        if (order.getStatus() == OrderStatus.DISPATCHED) {
            throw new RuntimeException("Order is already dispatched.");
        }

        order.setStatus(OrderStatus.DISPATCHED);
        order.setDispatchedAt(LocalDateTime.now());
        return orderRepo.save(order);
    }

    // 4. Cancel & Delete Order (Allowed only before dispatch, restores warehouse stock)
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        if (order.getStatus() == OrderStatus.DISPATCHED) {
            throw new RuntimeException("Cannot cancel an order that has already been dispatched.");
        }

        // Return finished goods stock back to warehouse
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null && item.getQuantity() != null && item.getQuantity() > 0) {
                    stockRepo.findByProductId(item.getProduct().getId()).ifPresent(stock -> {
                        stock.setAvailableStock(stock.getAvailableStock() + item.getQuantity());
                        stockRepo.save(stock);
                    });
                }
            }
        }

        // Permanently remove from database
        orderRepo.delete(order);
    }

    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

    // 4. Financial & Operational Summary for Admin Dashboard
    public RevenueSummaryDTO getRevenueSummary() {
        Double totalRevenue = orderRepo.getTotalRevenue();
        long totalOrders = orderRepo.count();
        long completedBatches = runRepo.findByStatus(ProductionStatus.COMPLETED).size();
        long activeProducts = productRepo.count();

        return RevenueSummaryDTO.builder()
                .totalRevenue(totalRevenue)
                .totalOrdersCount(totalOrders)
                .completedBatchesCount(completedBatches)
                .activeProductsCount(activeProducts)
                .build();
    }
}