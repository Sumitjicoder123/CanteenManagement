package com.example.Ordering.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

@Entity(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class User {
    @Id
    private Integer id;
    // OAUTH2
    @Column(unique = true)
    private String email;
    private String name;
    private String password;
    private Role role;
    @Transient
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PrePersist
    @PreUpdate
    private void pre(){
        this.password = passwordEncoder.encode(password);
    }


}
