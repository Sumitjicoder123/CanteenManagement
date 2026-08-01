package com.example.Ordering.menu;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface Menu_CategoryRepository extends JpaRepository<Menu_Category,Long> {


}
