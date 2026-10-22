export type Role = 'USER' | 'CHEF' | 'WAITER' | 'ADMIN';
export type OrderStatus = 'Added_to_Cart' | 'Placed' | 'Preparing' | 'Ready' | 'Collected' | 'Cancelled' | 'Refunded';
export type PaymentMethod = 'UPI' | 'CASH' | 'CARD';
export type DiscountType = 'FLAT' | 'PERCENTAGE';

export interface AuthResponseDTO {
  token: string;
  tokenType: string;
  userId: number;
  phoneNumber: string;
  name: string;
  email?: string;
  role: Role;
  message: string;
}

export interface UserResponseDTO {
  id: number;
  phoneNumber: string;
  email?: string;
  name: string;
  role: Role;
}

export interface CategoryDTO {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  updatedAt?: string;
}

export interface MenuDTO {
  menu_id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
  category_id: number;
  category_name: string;
  available: boolean;
  veg: boolean;
  preparationTimeMinutes: number;
  last_update?: string;
}

export interface MenuRequestDTO {
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
  categoryId: number;
  available: boolean;
  veg: boolean;
  preparationTimeMinutes: number;
}

export interface CouponDTO {
  couponId?: number;
  couponCode: string;
  discountType: DiscountType;
  discountValue: number;
  upto?: number;
  minimumOrder?: number;
  startAt?: string;
  expiry?: string;
  active: boolean;
  count?: number;
  numberOfToken?: number;
}

export interface CouponValidationResponse {
  valid: boolean;
  couponCode: string;
  discountAmount: number;
  finalAmount: number;
  discountType: DiscountType;
  message?: string;
}

export interface OrderItemDTO {
  menuId: number;
  dishName: string;
  dishImageUrl?: string;
  quantity: number;
  price: number;
  subTotal: number;
}

export interface OrderTrackDTO {
  status: OrderStatus;
  updatedBy: string;
  remarks: string;
  timestamp: string;
}

export interface OrderDetailsRequestDTO {
  menuIds: number[];
  couponCode?: string | null;
  deliveryType: 'DINE_IN' | 'TAKEAWAY' | 'HOME_DELIVERY';
  deliveryAddress?: string | null;
  tableNumber?: string | null;
  paymentMethod: PaymentMethod;
  autoPay: boolean;
}

export interface OrderDetailsResponseDTO {
  id: number;
  token_number: string;
  qr_data: string;
  Total?: number;
  total?: number;
  discountAmount: number;
  number_of_times_user_tried_payment: number;
  created_at: string;
  orderStatus: OrderStatus;
  deliveryType: string;
  deliveryAddress?: string;
  tableNumber?: string;
  paid: boolean;
  otp_verify?: string;
  chefName?: string;
  waiterName?: string;
  couponCode?: string;
  refund_status: boolean;
  refund_reason?: string;
  items: OrderItemDTO[];
  menuIds: number[];
  tracking: OrderTrackDTO[];
}

export interface RestaurantTableDTO {
  id?: number;
  tableNumber: string;
  capacity: number;
  section: string;
  active: boolean;
}

export interface TableBookingRequestDTO {
  tableId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  specialRequest?: string;
}

export interface TableBookingDTO {
  id: number;
  user?: UserResponseDTO;
  table: RestaurantTableDTO;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  guestCount: number;
  specialRequest?: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
}

export interface PaymentDTO {
  id: number;
  total_amount: number;
  transaction_id: string;
  paid_at: string;
  paymentMethod: PaymentMethod;
  status: string;
}

export interface RefundDTO {
  id: number;
  orderId: number;
  amount: number;
  reason: string;
  refundStatus: string;
  transactionId: string;
  requested_at: string;
  processed_at: string;
}

export interface FeedbackDTO {
  feedback_id?: number;
  userName?: string;
  message: string;
  star_by_user: number;
  createdAt?: string;
}

export interface ContactRequestDTO {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface CartItem {
  menu_id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  veg?: boolean;
}
