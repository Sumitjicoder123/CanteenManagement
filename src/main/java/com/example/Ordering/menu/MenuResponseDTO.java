package com.example.Ordering.menu;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuResponseDTO {
    private Integer menu_id;
    private String description;
    private Long price;
    private long quantity;
    private LocalDateTime last_update;
    private String category_name;   // from Menu_Category
    private Byte[] image;           // from Menu_image
}