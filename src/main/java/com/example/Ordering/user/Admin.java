package com.example.Ordering.user;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.MapsId;

@Entity
public class Admin {
    @Id
    private Integer id;
    @MapsId
    private User user;

}
