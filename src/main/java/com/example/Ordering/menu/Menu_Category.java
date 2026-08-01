package com.example.Ordering.menu;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class Menu_Category {
    @Id
    private Long id;
    @Column(unique = true)
    private String category_name;

    @OneToMany(mappedBy = "menuCategory",fetch = FetchType.LAZY,targetEntity = Menu.class,orphanRemoval = true,cascade = CascadeType.ALL)
    private List<Menu> getAllMenu;
}
