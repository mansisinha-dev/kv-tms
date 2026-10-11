package com.kiss.kv_tms.dto;

import lombok.Data;

@Data
public class OrderUpdateDTO {
    private String customerName;
    private String customerContact;
    private String customerAddress;
    private String customerEmail;
    private String dispatchDate;
    private Integer quantity;
}
