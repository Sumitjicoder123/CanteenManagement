import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AuthResponseDTO,
  CategoryDTO,
  ContactRequestDTO,
  CouponDTO,
  CouponValidationResponse,
  FeedbackDTO,
  MenuDTO,
  MenuRequestDTO,
  OrderDetailsRequestDTO,
  OrderDetailsResponseDTO,
  PaymentDTO,
  PaymentMethod,
  RefundDTO,
  RestaurantTableDTO,
  Role,
  TableBookingDTO,
  TableBookingRequestDTO,
  UserResponseDTO
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  // ==========================================
  // 1. AUTH CONTROLLER (/api/auth)
  // ==========================================
  login(phoneNumber: string, password: string): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>('/api/auth/login', { phoneNumber, password });
  }

  register(payload: { name: string; phoneNumber: string; email?: string; password: string; role: Role }): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>('/api/auth/register', payload);
  }

  forgotPassword(phoneNumber: string): Observable<{ message: string; phoneNumber: string; demoOtp: string }> {
    return this.http.post<{ message: string; phoneNumber: string; demoOtp: string }>('/api/auth/forgot-password', { phoneNumber });
  }

  resetPassword(phoneNumber: string, otp: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/auth/reset-password', { phoneNumber, otp, newPassword });
  }

  getCurrentUser(): Observable<UserResponseDTO> {
    return this.http.get<UserResponseDTO>('/api/auth/me');
  }

  // ==========================================
  // 2. CATEGORY CONTROLLER (/v1/api/category)
  // ==========================================
  getCategories(): Observable<CategoryDTO[]> {
    return this.http.get<CategoryDTO[]>('/v1/api/category');
  }

  createCategory(payload: { name: string; description: string; imageUrl: string }): Observable<CategoryDTO> {
    return this.http.post<CategoryDTO>('/v1/api/category', payload);
  }

  updateCategory(id: number, payload: { name: string; description: string; imageUrl: string }): Observable<CategoryDTO> {
    return this.http.put<CategoryDTO>(`/v1/api/category/${id}`, payload);
  }

  deleteCategory(id: number): Observable<string> {
    return this.http.delete(`/v1/api/category/${id}`, { responseType: 'text' });
  }

  // ==========================================
  // 3. MENU CONTROLLER (/v1/api/menu)
  // ==========================================
  getMenus(): Observable<MenuDTO[]> {
    return this.http.get<MenuDTO[]>('/v1/api/menu');
  }

  getMenusByCategory(categoryId: number): Observable<MenuDTO[]> {
    return this.http.get<MenuDTO[]>(`/v1/api/menu/category/${categoryId}`);
  }

  searchMenus(query: string): Observable<MenuDTO[]> {
    return this.http.get<MenuDTO[]>(`/v1/api/menu/search?query=${encodeURIComponent(query)}`);
  }

  createMenu(payload: MenuRequestDTO): Observable<MenuDTO> {
    return this.http.post<MenuDTO>('/v1/api/menu', payload);
  }

  updateMenu(id: number, payload: Partial<MenuRequestDTO>): Observable<MenuDTO> {
    return this.http.put<MenuDTO>(`/v1/api/menu/${id}`, payload);
  }

  deleteMenu(id: number): Observable<string> {
    return this.http.delete(`/v1/api/menu/${id}`, { responseType: 'text' });
  }

  // ==========================================
  // 4. COUPON CONTROLLER (/api/coupons)
  // ==========================================
  getAllCoupons(): Observable<CouponDTO[]> {
    return this.http.get<CouponDTO[]>('/api/coupons');
  }

  getActiveCoupons(): Observable<CouponDTO[]> {
    return this.http.get<CouponDTO[]>('/api/coupons/active');
  }

  createCoupon(payload: CouponDTO): Observable<CouponDTO> {
    return this.http.post<CouponDTO>('/api/coupons', payload);
  }

  deleteCoupon(id: number): Observable<string> {
    return this.http.delete(`/api/coupons/${id}`, { responseType: 'text' });
  }

  validateCoupon(couponCode: string, orderAmount: number): Observable<CouponValidationResponse> {
    return this.http.post<CouponValidationResponse>('/api/coupons/validate', { couponCode, orderAmount });
  }

  // ==========================================
  // 5. ORDER DETAILS CONTROLLER (/api/orders)
  // ==========================================
  placeOrder(payload: OrderDetailsRequestDTO): Observable<OrderDetailsResponseDTO> {
    return this.http.post<OrderDetailsResponseDTO>('/api/orders/place', payload);
  }

  getOrderById(id: number): Observable<OrderDetailsResponseDTO> {
    return this.http.get<OrderDetailsResponseDTO>(`/api/orders/${id}`);
  }

  trackOrderByToken(token: string): Observable<OrderDetailsResponseDTO> {
    return this.http.get<OrderDetailsResponseDTO>(`/api/orders/track/${encodeURIComponent(token)}`);
  }

  getMyOrders(): Observable<OrderDetailsResponseDTO[]> {
    return this.http.get<OrderDetailsResponseDTO[]>('/api/orders/my-orders');
  }

  getAllOrders(): Observable<OrderDetailsResponseDTO[]> {
    return this.http.get<OrderDetailsResponseDTO[]>('/api/orders/all');
  }

  getKitchenOrders(): Observable<OrderDetailsResponseDTO[]> {
    return this.http.get<OrderDetailsResponseDTO[]>('/api/orders/kitchen');
  }

  assignChef(orderId: number): Observable<OrderDetailsResponseDTO> {
    return this.http.put<OrderDetailsResponseDTO>(`/api/orders/${orderId}/assign-chef`, {});
  }

  updateOrderStatus(orderId: number, status: string): Observable<OrderDetailsResponseDTO> {
    return this.http.put<OrderDetailsResponseDTO>(`/api/orders/${orderId}/status`, { status });
  }

  getWaiterOrders(): Observable<OrderDetailsResponseDTO[]> {
    return this.http.get<OrderDetailsResponseDTO[]>('/api/orders/waiter');
  }

  verifyOtpAndDeliver(orderId: number, otp: string): Observable<OrderDetailsResponseDTO> {
    return this.http.post<OrderDetailsResponseDTO>(`/api/orders/${orderId}/verify-otp`, { otp });
  }

  serveOrderDirect(orderId: number): Observable<OrderDetailsResponseDTO> {
    return this.http.put<OrderDetailsResponseDTO>(`/api/orders/${orderId}/serve`, {});
  }

  cancelOrder(orderId: number, reason: string): Observable<OrderDetailsResponseDTO> {
    return this.http.put<OrderDetailsResponseDTO>(`/api/orders/${orderId}/cancel`, { reason });
  }

  // ==========================================
  // 6. PAYMENT CONTROLLER (/api/payments)
  // ==========================================
  payOrder(orderId: number, total_amount: number, paymentMethod: PaymentMethod): Observable<OrderDetailsResponseDTO> {
    return this.http.post<OrderDetailsResponseDTO>('/api/payments/pay', { orderId, total_amount, paymentMethod });
  }

  refundOrder(orderId: number, amount: number, reason: string): Observable<OrderDetailsResponseDTO> {
    return this.http.post<OrderDetailsResponseDTO>('/api/payments/refund', { orderId, amount, reason });
  }

  getAllPayments(): Observable<PaymentDTO[]> {
    return this.http.get<PaymentDTO[]>('/api/payments/all');
  }

  getAllRefunds(): Observable<RefundDTO[]> {
    return this.http.get<RefundDTO[]>('/api/payments/refunds');
  }

  // ==========================================
  // 7. TABLE BOOKING CONTROLLER (/api/tables & /api/table-bookings)
  // ==========================================
  getTables(): Observable<RestaurantTableDTO[]> {
    return this.http.get<RestaurantTableDTO[]>('/api/tables');
  }

  createTable(payload: RestaurantTableDTO): Observable<RestaurantTableDTO> {
    return this.http.post<RestaurantTableDTO>('/api/tables', payload);
  }

  bookTable(payload: TableBookingRequestDTO): Observable<TableBookingDTO> {
    return this.http.post<TableBookingDTO>('/api/table-bookings/book', payload);
  }

  getMyBookings(): Observable<TableBookingDTO[]> {
    return this.http.get<TableBookingDTO[]>('/api/table-bookings/my-bookings');
  }

  getAllBookings(): Observable<TableBookingDTO[]> {
    return this.http.get<TableBookingDTO[]>('/api/table-bookings/all');
  }

  cancelBooking(bookingId: number): Observable<TableBookingDTO> {
    return this.http.put<TableBookingDTO>(`/api/table-bookings/${bookingId}/cancel`, {});
  }

  completeBooking(bookingId: number): Observable<TableBookingDTO> {
    return this.http.put<TableBookingDTO>(`/api/table-bookings/${bookingId}/complete`, {});
  }

  // ==========================================
  // 8. FILE UPLOAD CONTROLLER (/api/upload/image)
  // ==========================================
  uploadImage(file: File): Observable<{ url: string; filename: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string; filename: string; message: string }>('/api/upload/image', formData);
  }

  // ==========================================
  // 9. FEEDBACK CONTROLLER (/api/feedback)
  // ==========================================
  getFeedback(): Observable<FeedbackDTO[]> {
    return this.http.get<FeedbackDTO[]>('/api/feedback');
  }

  submitFeedback(payload: FeedbackDTO): Observable<FeedbackDTO> {
    return this.http.post<FeedbackDTO>('/api/feedback', payload);
  }

  // ==========================================
  // 10. PROJECT DETAILS CONTROLLER (/api/project)
  // ==========================================
  submitContact(payload: ContactRequestDTO): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/project/contact', payload);
  }

  getPrivacyPolicies(): Observable<any[]> {
    return this.http.get<any[]>('/api/project/privacy');
  }

  getTermsAndConditions(): Observable<any[]> {
    return this.http.get<any[]>('/api/project/terms');
  }
}
