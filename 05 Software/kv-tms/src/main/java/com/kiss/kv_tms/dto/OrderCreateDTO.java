package com.kiss.kv_tms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class OrderCreateDTO {

    @NotBlank(message = "Customer name is mandatory")
    private String customerName;

    @NotBlank(message = "Customer contact number is mandatory")
    private String customerContact;

    private String customerEmail;
    private String customerAddress;
    private String dispatchDate;

    @NotEmpty(message = "Order must contain at least one product item")
    private List<OrderItemDTO> items;

    @Data
    public static class OrderItemDTO {
        private Long productId;
        private Integer quantity;
    }
}