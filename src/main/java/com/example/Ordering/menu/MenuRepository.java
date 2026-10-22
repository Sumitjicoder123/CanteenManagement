package com.example.Ordering.menu;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Integer> {
    List<Menu> findByCategory_Id(Long categoryId);
    List<Menu> findByAvailableTrue();

    @Query("SELECT m FROM Menu m WHERE " +
           "LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Menu> searchMenu(@Param("query") String query);

    @Query("SELECT COALESCE(MAX(m.menu_id), 0) FROM Menu m")
    Integer findMaxId();

    @Modifying
    @Transactional
    @Query("UPDATE Menu m SET m.category = null WHERE m.category.id = :categoryId")
    void unlinkCategoryFromMenus(@Param("categoryId") Long categoryId);
}
