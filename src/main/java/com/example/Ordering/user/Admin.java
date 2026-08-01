package com.example.Ordering.user;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;

@Entity
public class Admin {
    @Id
    private Integer id;
    @MapsId
    @OneToOne
    private User user;

}
