package com.example.Ordering.order_details;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderDetailsRepository extends JpaRepository<Orders, Long> {
    Optional<Orders> findByTokenNumber(String tokenNumber);
    Optional<Orders> findBytokenNumber(String tokenNumber);

    @Query("SELECT DISTINCT o FROM Orders o LEFT JOIN FETCH o.orderItems " +
           "WHERE UPPER(o.tokenNumber) = UPPER(:exactToken) " +
           "OR UPPER(o.tokenNumber) = UPPER(:prefixedToken) " +
           "ORDER BY o.createdAt DESC")
    List<Orders> findByTokenFlexible(@Param("exactToken") String exactToken,
                                     @Param("prefixedToken") String prefixedToken);

    List<Orders> findByUser_PhoneNumberOrderByCreatedAtDesc(String phoneNumber);
    List<Orders> findByOrderByCreatedAtDesc();

    // Fast batch-joined queries to eliminate N+1 queries and accelerate DB performance
    @Query("SELECT DISTINCT o FROM Orders o LEFT JOIN FETCH o.orderItems WHERE o.user.phoneNumber = :phone ORDER BY o.createdAt DESC")
    List<Orders> findUserOrdersWithItems(@Param("phone") String phoneNumber);

    @Query("SELECT DISTINCT o FROM Orders o LEFT JOIN FETCH o.orderItems ORDER BY o.createdAt DESC")
    List<Orders> findAllOrdersWithItems();

    @Query("SELECT DISTINCT o FROM Orders o LEFT JOIN FETCH o.orderItems " +
           "WHERE o.order_status IN (:s1, :s2) AND o.refund_status = false AND o.createdAt >= :since " +
           "ORDER BY o.createdAt DESC")
    List<Orders> findKitchenOrdersWithItems(@Param("s1") Order_Status s1,
                                            @Param("s2") Order_Status s2,
                                            @Param("since") LocalDateTime since);

    @Query("SELECT DISTINCT o FROM Orders o LEFT JOIN FETCH o.orderItems " +
           "WHERE o.order_status = :s AND o.refund_status = false " +
           "ORDER BY o.createdAt DESC")
    List<Orders> findReadyOrdersWithItems(@Param("s") Order_Status s);

    @Query("SELECT o FROM Orders o WHERE o.order_status = :status ORDER BY o.createdAt ASC")
    List<Orders> findByOrderStatus(@Param("status") Order_Status status);

    @Query("SELECT o FROM Orders o WHERE o.order_status IN (:s1, :s2) ORDER BY o.createdAt ASC")
    List<Orders> findActiveKitchenOrders(@Param("s1") Order_Status s1, @Param("s2") Order_Status s2);

    @Query("SELECT o FROM Orders o WHERE o.order_status = :s ORDER BY o.createdAt ASC")
    List<Orders> findReadyOrdersForWaiter(@Param("s") Order_Status s);

    @Query("SELECT COALESCE(MAX(o.id), 0) FROM Orders o")
    Long findMaxId();
}
