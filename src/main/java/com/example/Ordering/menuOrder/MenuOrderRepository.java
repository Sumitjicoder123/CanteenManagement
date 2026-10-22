package com.example.Ordering.menuOrder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface MenuOrderRepository extends JpaRepository<Order_Items, Long> {
    @Query("SELECT COALESCE(MAX(i.id), 0) FROM Order_Items i")
    Long findMaxId();

    @Modifying
    @Transactional
    @Query("UPDATE Order_Items i SET i.menu = null WHERE i.menu.menu_id = :menuId")
    void unlinkMenuFromOrderItems(@Param("menuId") Integer menuId);
}
