package com.example.Ordering.menu;

//import com.example.Ordering.entity.Dish_Category;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Menu {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Integer menu_id;
    private String description;
    private Long price;
    private long quantity;
    private LocalDateTime last_update;
    @ManyToOne(fetch = FetchType.EAGER,cascade = CascadeType.PERSIST,targetEntity = Menu_Category.class)
    private Menu_Category menuCategory;
}

