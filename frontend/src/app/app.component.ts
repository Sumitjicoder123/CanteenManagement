import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { ApiService } from './services/api.service';
import {
  AuthResponseDTO,
  CartItem,
  CategoryDTO,
  ContactRequestDTO,
  CouponDTO,
  CouponValidationResponse,
  DiscountType,
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
  TableBookingDTO
} from './models/api.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewChecked {
  // Authentication & Session
  token: string | null = localStorage.getItem('canteen_token');
  user: { id: number; name: string; phone: string; email?: string; role: Role } | null =
    JSON.parse(localStorage.getItem('canteen_user') || 'null');

  // Active Navigation
  activeTab: 'menu' | 'orders' | 'bookings' | 'reviews' | 'kitchen' | 'waiter' | 'admin' = 'menu';
  orderSubTab: 'active' | 'history' = 'active';
  adminSubTab: 'orders' | 'dishes' | 'categories' | 'tables' | 'coupons' | 'bookings' | 'payments' = 'orders';
  bookingFilter: 'all' | 'active' | 'completed' | 'cancelled' = 'all';

  // Loading & Progress Indicators
  isLoading = false;
  busyActionId: string | null = null;

  // Data Collections Mapped from Backend
  categories: CategoryDTO[] = [];
  menus: MenuDTO[] = [];
  tables: RestaurantTableDTO[] = [];
  activeCoupons: CouponDTO[] = [];
  allCoupons: CouponDTO[] = [];
  feedbacks: FeedbackDTO[] = [];

  // Orders & Bookings
  userOrders: OrderDetailsResponseDTO[] = [];
  kitchenOrders: OrderDetailsResponseDTO[] = [];
  waiterOrders: OrderDetailsResponseDTO[] = [];
  adminOrders: OrderDetailsResponseDTO[] = [];
  userBookings: TableBookingDTO[] = [];
  adminBookings: TableBookingDTO[] = [];
  adminPayments: PaymentDTO[] = [];
  adminRefunds: RefundDTO[] = [];

  // Menu Filters
  selectedCategoryId: number | null = null;
  vegOnly = false;
  searchQuery = '';

  // Cart & Checkout State
  cart: CartItem[] = JSON.parse(localStorage.getItem('canteen_cart') || '[]');
  isCartOpen = false;
  deliveryType: 'DINE_IN' | 'TAKEAWAY' | 'HOME_DELIVERY' = 'DINE_IN';
  tableNumber = 'Table 1';
  deliveryAddress = 'Campus Hostel Room 204';
  paymentMethod: PaymentMethod = 'UPI';
  couponCodeInput = '';
  appliedCoupon: CouponValidationResponse | null = null;
  couponMessage = '';
  couponError = false;

  // Modals State
  isAuthModalOpen = false;
  authView: 'login' | 'register' | 'forgot' = 'login';
  isBookingModalOpen = false;
  trackingOrder: OrderDetailsResponseDTO | null = null;
  billOrder: OrderDetailsResponseDTO | null = null;

  // Admin Modals State
  isDishModalOpen = false;
  editingDishId: number | null = null;
  isCategoryModalOpen = false;
  editingCategoryId: number | null = null;
  isCouponModalOpen = false;
  isTableModalOpen = false;

  // Forms
  loginForm = { phoneNumber: '', password: '' };
  registerForm = { name: '', phoneNumber: '', email: '', password: '', role: 'USER' as Role };
  forgotForm = { phoneNumber: '', otp: '123456', newPassword: '', otpSent: false };

  bookingForm = {
    tableId: 0,
    bookingDate: '',
    guestCount: 2,
    startTime: '13:00',
    durationPreset: 60,
    endTime: '14:00',
    specialRequest: ''
  };

  dishForm: MenuRequestDTO = {
    name: '',
    description: '',
    price: 180,
    quantity: 100,
    imageUrl: '',
    categoryId: 1,
    available: true,
    veg: true,
    preparationTimeMinutes: 15
  };

  categoryForm = {
    name: '',
    description: '',
    imageUrl: ''
  };

  couponForm: CouponDTO = {
    couponCode: '',
    discountType: 'PERCENTAGE' as DiscountType,
    discountValue: 20,
    minimumOrder: 150,
    upto: 100,
    active: true
  };

  tableForm: RestaurantTableDTO = {
    tableNumber: '',
    capacity: 4,
    section: 'Indoor',
    active: true
  };

  feedbackForm: FeedbackDTO = {
    userName: '',
    message: '',
    star_by_user: 5
  };

  contactForm: ContactRequestDTO = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  trackTokenQuery = '';
  private pollingInterval: any;

  constructor(private api: ApiService) {}

  async ngOnInit(): Promise<void> {
    this.initDefaultBookingDate();
    await this.loadInitialData();

    // Auto-polling every 3 seconds for live kitchen/waiter/order updates
    this.pollingInterval = setInterval(() => {
      this.silentRefreshActiveTab();
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  ngAfterViewChecked(): void {
    const win = window as any;
    if (win.lucide) {
      win.lucide.createIcons();
    }
  }

  initDefaultBookingDate(): void {
    const today = new Date().toISOString().split('T')[0];
    this.bookingForm.bookingDate = today;
    this.updateBookingEndTime();
  }

  async loadInitialData(): Promise<void> {
    this.isLoading = true;
    try {
      const [cats, menus, tables, coupons, feedbacks] = await Promise.all([
        firstValueFrom(this.api.getCategories()).catch(() => []),
        firstValueFrom(this.api.getMenus()).catch(() => []),
        firstValueFrom(this.api.getTables()).catch(() => []),
        firstValueFrom(this.api.getActiveCoupons()).catch(() => []),
        firstValueFrom(this.api.getFeedback()).catch(() => [])
      ]);
      this.categories = cats || [];
      this.menus = menus || [];
      this.tables = tables || [];
      this.activeCoupons = coupons || [];
      this.feedbacks = (feedbacks || []).slice().reverse();

      if (this.tables.length > 0 && !this.bookingForm.tableId) {
        this.bookingForm.tableId = this.tables[0].id!;
        this.tableNumber = this.tables[0].tableNumber;
      }
      if (this.categories.length > 0) {
        this.dishForm.categoryId = this.categories[0].id;
      }

      if (this.token && this.user) {
        if (this.user.role === 'CHEF') {
          await this.switchTab('kitchen');
        } else if (this.user.role === 'WAITER') {
          await this.switchTab('waiter');
        } else if (this.user.role === 'ADMIN') {
          await this.switchTab('admin');
        } else {
          await this.loadMyOrders();
        }
      }
    } finally {
      this.isLoading = false;
    }
  }

  async silentRefreshActiveTab(): Promise<void> {
    try {
      if (this.trackingOrder?.token_number) {
        this.trackingOrder = await firstValueFrom(this.api.trackOrderByToken(this.trackingOrder.token_number)).catch(
          () => this.trackingOrder
        );
      }
      if (!this.token) return;
      if (this.activeTab === 'orders') {
        this.userOrders = await firstValueFrom(this.api.getMyOrders());
      } else if (this.activeTab === 'bookings') {
        this.userBookings = await firstValueFrom(this.api.getMyBookings());
      } else if (this.activeTab === 'kitchen' && (this.user?.role === 'CHEF' || this.user?.role === 'ADMIN')) {
        this.kitchenOrders = await firstValueFrom(this.api.getKitchenOrders());
      } else if (this.activeTab === 'waiter' && (this.user?.role === 'WAITER' || this.user?.role === 'ADMIN')) {
        this.waiterOrders = await firstValueFrom(this.api.getWaiterOrders());
      } else if (this.activeTab === 'admin' && this.user?.role === 'ADMIN') {
        this.adminOrders = await firstValueFrom(this.api.getAllOrders());
      }
    } catch {
      // ignore silent polling errors
    }
  }

  // ==========================================
  // HELPERS & GETTERS
  // ==========================================
  getOrderTotal(o: OrderDetailsResponseDTO | null | undefined): number {
    if (!o) return 0;
    if (o.Total !== undefined && o.Total !== null) return o.Total;
    if (o.total !== undefined && o.total !== null) return o.total;
    if (o.items && o.items.length > 0) {
      const sub = o.items.reduce((acc, it) => acc + (it.subTotal || it.price * it.quantity), 0);
      return Math.max(0, sub - (o.discountAmount || 0));
    }
    return 0;
  }

  get filteredMenus(): MenuDTO[] {
    let list = this.menus;
    if (this.selectedCategoryId !== null) {
      list = list.filter((m) => m.category_id === this.selectedCategoryId);
    }
    if (this.vegOnly) {
      list = list.filter((m) => m.veg === true);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q)) ||
          (m.category_name && m.category_name.toLowerCase().includes(q))
      );
    }
    return list;
  }

  get selectedCategoryName(): string {
    if (this.searchQuery.trim()) {
      return `Search results for "${this.searchQuery}"`;
    }
    if (this.selectedCategoryId === null) return 'All Specialties';
    const cat = this.categories.find((c) => c.id === this.selectedCategoryId);
    return cat ? cat.name : 'All Specialties';
  }

  getCategoryDishCount(catId: number): number {
    return this.menus.filter((m) => m.category_id === catId).length;
  }

  getCartQty(menuId: number): number {
    const item = this.cart.find((c) => c.menu_id === menuId);
    return item ? item.quantity : 0;
  }

  get totalCartItems(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get cartSubtotal(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get cartDiscount(): number {
    return this.appliedCoupon ? this.appliedCoupon.discountAmount : 0;
  }

  get cartTotal(): number {
    return Math.max(0, this.cartSubtotal - this.cartDiscount);
  }

  get activeUserOrders(): OrderDetailsResponseDTO[] {
    return this.userOrders.filter(
      (o) => !o.refund_status && o.orderStatus !== 'Collected' && o.orderStatus !== 'Refunded' && o.orderStatus !== 'Cancelled'
    );
  }

  get historyUserOrders(): OrderDetailsResponseDTO[] {
    return this.userOrders.filter(
      (o) => o.refund_status || o.orderStatus === 'Collected' || o.orderStatus === 'Refunded' || o.orderStatus === 'Cancelled'
    );
  }

  get filteredUserBookings(): TableBookingDTO[] {
    const now = new Date();
    if (this.bookingFilter === 'active') {
      return this.userBookings.filter((b) => b.status === 'CONFIRMED' && new Date(`${b.bookingDate}T${b.endTime}`) >= now);
    }
    if (this.bookingFilter === 'completed') {
      return this.userBookings.filter(
        (b) => b.status === 'COMPLETED' || (b.status === 'CONFIRMED' && new Date(`${b.bookingDate}T${b.endTime}`) < now)
      );
    }
    if (this.bookingFilter === 'cancelled') {
      return this.userBookings.filter((b) => b.status === 'CANCELLED');
    }
    return this.userBookings;
  }

  get bookingMetrics() {
    const now = new Date();
    let active = 0;
    let completed = 0;
    let cancelled = 0;
    this.userBookings.forEach((b) => {
      if (b.status === 'CANCELLED') cancelled++;
      else if (b.status === 'COMPLETED' || new Date(`${b.bookingDate}T${b.endTime}`) < now) completed++;
      else active++;
    });
    return { total: this.userBookings.length, active, completed, cancelled };
  }

  get adminTotalSales(): number {
    return this.adminOrders
      .filter((o) => o.paid && !o.refund_status)
      .reduce((sum, o) => sum + this.getOrderTotal(o), 0);
  }

  isBookingUpcoming(b: TableBookingDTO): boolean {
    return b.status === 'CONFIRMED' && new Date(`${b.bookingDate}T${b.endTime}`) >= new Date();
  }

  extractErrorMessage(err: any, fallback = 'Something went wrong. Please try again.'): string {
    if (!err) return fallback;
    if (err.error) {
      if (typeof err.error === 'string') return err.error;
      if (err.error.message) return err.error.message;
      if (err.error.error) return err.error.error;
    }
    return err.message || fallback;
  }

  // ==========================================
  // NAVIGATION & TAB SWITCHING
  // ==========================================
  async switchTab(tab: 'menu' | 'orders' | 'bookings' | 'reviews' | 'kitchen' | 'waiter' | 'admin'): Promise<void> {
    const role = this.user?.role || 'GUEST';
    if (tab === 'kitchen' && role !== 'CHEF' && role !== 'ADMIN') {
      Swal.fire('Access Denied', 'Kitchen Display System is restricted to Chefs & Admins.', 'warning');
      return;
    }
    if (tab === 'waiter' && role !== 'WAITER' && role !== 'ADMIN') {
      Swal.fire('Access Denied', 'Waiter Desk is restricted to Waiters & Admins.', 'warning');
      return;
    }
    if (tab === 'admin' && role !== 'ADMIN') {
      Swal.fire('Access Denied', 'Admin Control Hub requires Administrator role.', 'warning');
      return;
    }

    this.activeTab = tab;
    if (tab === 'menu') {
      await Promise.all([this.refreshMenuAndCategories()]);
    } else if (tab === 'orders') {
      await this.loadMyOrders();
    } else if (tab === 'bookings') {
      await this.loadMyBookings();
    } else if (tab === 'reviews') {
      this.feedbacks = (await firstValueFrom(this.api.getFeedback()).catch(() => [])).slice().reverse();
    } else if (tab === 'kitchen') {
      await this.loadKitchenOrders();
    } else if (tab === 'waiter') {
      await this.loadWaiterOrders();
    } else if (tab === 'admin') {
      await this.loadAdminDashboard();
    }
  }

  async refreshMenuAndCategories(): Promise<void> {
    this.isLoading = true;
    try {
      const [cats, menus, coupons] = await Promise.all([
        firstValueFrom(this.api.getCategories()),
        firstValueFrom(this.api.getMenus()),
        firstValueFrom(this.api.getActiveCoupons()).catch(() => [])
      ]);
      this.categories = cats;
      this.menus = menus;
      this.activeCoupons = coupons;
    } finally {
      this.isLoading = false;
    }
  }

  // ==========================================
  // CART & COUPON ACTIONS
  // ==========================================
  addToCart(dish: MenuDTO): void {
    if (!dish.available || dish.quantity <= 0) {
      Swal.fire('Unavailable', `"${dish.name}" is currently out of stock.`, 'warning');
      return;
    }
    const existing = this.cart.find((c) => c.menu_id === dish.menu_id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({
        menu_id: dish.menu_id,
        name: dish.name,
        price: dish.price,
        imageUrl: dish.imageUrl,
        quantity: 1,
        veg: dish.veg
      });
    }
    this.saveCart();
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      icon: 'success',
      title: `Added "${dish.name}" to cart`,
      showConfirmButton: false,
      timer: 1100
    });
  }

  updateCartQty(menuId: number, delta: number): void {
    const idx = this.cart.findIndex((c) => c.menu_id === menuId);
    if (idx === -1) return;
    this.cart[idx].quantity += delta;
    if (this.cart[idx].quantity <= 0) {
      this.cart.splice(idx, 1);
    }
    this.saveCart();
    if (this.appliedCoupon) {
      this.validateAndApplyCoupon(this.appliedCoupon.couponCode);
    }
  }

  saveCart(): void {
    localStorage.setItem('canteen_cart', JSON.stringify(this.cart));
  }

  async validateAndApplyCoupon(code?: string): Promise<void> {
    const codeToUse = (code || this.couponCodeInput || '').trim().toUpperCase();
    if (!codeToUse) return;
    this.couponCodeInput = codeToUse;

    if (this.cartSubtotal <= 0) {
      this.couponError = true;
      this.couponMessage = 'Add items to cart before applying a coupon';
      return;
    }

    try {
      const res = await firstValueFrom(this.api.validateCoupon(codeToUse, this.cartSubtotal));
      if (res.valid) {
        this.appliedCoupon = res;
        this.couponError = false;
        this.couponMessage = `Coupon ${res.couponCode} applied! You saved ₹${res.discountAmount}`;
      } else {
        this.appliedCoupon = null;
        this.couponError = true;
        this.couponMessage = res.message || 'Invalid coupon code';
      }
    } catch (err) {
      this.appliedCoupon = null;
      this.couponError = true;
      this.couponMessage = this.extractErrorMessage(err, 'Invalid or inapplicable coupon');
    }
  }

  removeCoupon(): void {
    this.appliedCoupon = null;
    this.couponCodeInput = '';
    this.couponMessage = '';
    this.couponError = false;
  }

  async submitOrder(): Promise<void> {
    if (this.cart.length === 0) {
      Swal.fire('Empty Cart', 'Please add dishes to your cart first.', 'info');
      return;
    }
    if (!this.token) {
      this.isCartOpen = false;
      this.openAuthModal('login');
      Swal.fire('Sign In Required', 'Please sign in or create an account to place your order.', 'info');
      return;
    }

    // Build repeating menuIds list as required by backend OrderService
    const repeatingMenuIds: number[] = [];
    this.cart.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        repeatingMenuIds.push(item.menu_id);
      }
    });

    const payload: OrderDetailsRequestDTO = {
      menuIds: repeatingMenuIds,
      deliveryType: this.deliveryType,
      tableNumber: this.deliveryType === 'DINE_IN' ? this.tableNumber : null,
      deliveryAddress: this.deliveryType === 'HOME_DELIVERY' ? this.deliveryAddress : null,
      couponCode: this.appliedCoupon ? this.appliedCoupon.couponCode : this.couponCodeInput.trim() || null,
      paymentMethod: this.paymentMethod,
      autoPay: true
    };

    this.isLoading = true;
    try {
      const order = await firstValueFrom(this.api.placeOrder(payload));
      this.cart = [];
      this.appliedCoupon = null;
      this.couponCodeInput = '';
      this.couponMessage = '';
      this.saveCart();
      this.isCartOpen = false;

      const totalPaid = this.getOrderTotal(order);
      await Swal.fire({
        icon: 'success',
        title: 'Order Placed & Paid!',
        html: `
          <div class="text-xs text-left space-y-2 mt-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <p><b>Order Token:</b> <span class="text-amber-700 font-bold font-mono text-sm">${order.token_number}</span></p>
            ${
              order.deliveryType === 'HOME_DELIVERY' || order.deliveryType === 'TAKEAWAY'
                ? `<p><b>${order.deliveryType === 'TAKEAWAY' ? 'Takeaway Pickup OTP' : 'Doorstep Delivery OTP'}:</b> <span class="bg-indigo-100 text-indigo-900 font-mono px-2 py-0.5 rounded font-bold">${order.otp_verify}</span></p>`
                : `<p><b>Service Mode:</b> <span class="text-emerald-700 font-semibold">${order.deliveryType} (Direct Table Service)</span></p>`
            }
            <p><b>Total Paid (${this.paymentMethod}):</b> <span class="font-bold">₹${totalPaid}</span></p>
          </div>
        `,
        confirmButtonText: 'Track Live Order',
        confirmButtonColor: '#d97706'
      });

      this.trackingOrder = order;
      await this.switchTab('orders');
    } catch (err) {
      Swal.fire('Order Failed', this.extractErrorMessage(err, 'Could not place order'), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // ==========================================
  // ORDERS, TRACKING, RE-ORDER & REFUNDS
  // ==========================================
  async loadMyOrders(): Promise<void> {
    if (!this.token) {
      this.userOrders = [];
      return;
    }
    this.isLoading = true;
    try {
      this.userOrders = await firstValueFrom(this.api.getMyOrders());
      if (this.activeUserOrders.length === 0 && this.historyUserOrders.length > 0) {
        this.orderSubTab = 'history';
      } else if (this.activeUserOrders.length > 0) {
        this.orderSubTab = 'active';
      }
    } catch (err) {
      console.error('Error loading user orders:', err);
    } finally {
      this.isLoading = false;
    }
  }

  async trackOrderByToken(): Promise<void> {
    let raw = this.trackTokenQuery.trim().toUpperCase().replace(/^#/, '').trim();
    if (!raw) {
      Swal.fire('Enter Token Number', 'Please enter a valid token number (e.g. TKN-1001 or 1001).', 'info');
      return;
    }
    if (raw.startsWith('TKN') && !raw.startsWith('TKN-')) {
      raw = 'TKN-' + raw.substring(3).replace(/^[\s-]+/, '');
    } else if (/^\d+$/.test(raw)) {
      raw = 'TKN-' + raw;
    }
    this.trackTokenQuery = raw;
    this.isLoading = true;
    try {
      const order = await firstValueFrom(this.api.trackOrderByToken(raw));
      this.trackingOrder = order;
    } catch (err) {
      Swal.fire('Order Not Found', `No order found matching token "${raw}"`, 'warning');
    } finally {
      this.isLoading = false;
    }
  }

  reorderItems(order: OrderDetailsResponseDTO): void {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach((it) => {
      const menuDish = this.menus.find((m) => m.menu_id === it.menuId);
      const existing = this.cart.find((c) => c.menu_id === it.menuId);
      if (existing) {
        existing.quantity += it.quantity;
      } else {
        this.cart.push({
          menu_id: it.menuId,
          name: it.dishName,
          price: it.price || Math.round(it.subTotal / it.quantity),
          imageUrl: it.dishImageUrl || menuDish?.imageUrl || '',
          quantity: it.quantity
        });
      }
    });
    this.saveCart();
    this.isCartOpen = true;
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Order items added to your cart!',
      showConfirmButton: false,
      timer: 1500
    });
  }

  async cancelAndRefundOrder(order: OrderDetailsResponseDTO): Promise<void> {
    const total = this.getOrderTotal(order);
    const { value: reason } = await Swal.fire({
      title: 'Cancel Order & Instant Refund',
      input: 'text',
      inputLabel: `Refund ₹${total} for ${order.token_number}`,
      inputValue: 'Customer requested cancellation',
      showCancelButton: true,
      confirmButtonText: 'Process Instant Refund',
      confirmButtonColor: '#dc2626'
    });
    if (!reason) return;

    this.isLoading = true;
    try {
      const updated = await firstValueFrom(this.api.cancelOrder(order.id, reason));
      if (this.trackingOrder?.id === order.id) {
        this.trackingOrder = updated;
      }
      Swal.fire('Refund Processed!', `Full refund of ₹${total} completed and inventory restored.`, 'success');
      await this.loadMyOrders();
      if (this.user?.role === 'ADMIN') {
        await this.loadAdminDashboard();
      }
    } catch (err) {
      Swal.fire('Refund Failed', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  getOrderStepIndex(status: string | undefined): number {
    const s = (status || '').toLowerCase();
    const map: Record<string, number> = { placed: 0, preparing: 1, ready: 2, collected: 3 };
    return map[s] !== undefined ? map[s] : -1;
  }

  printBill(): void {
    window.print();
  }

  // ==========================================
  // TABLE RESERVATIONS (15m to 2h)
  // ==========================================
  updateBookingEndTime(): void {
    if (!this.bookingForm.startTime) return;
    const [hours, mins] = this.bookingForm.startTime.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, mins, 0, 0);
    const end = new Date(d.getTime() + Number(this.bookingForm.durationPreset) * 60000);
    const eh = String(end.getHours()).padStart(2, '0');
    const em = String(end.getMinutes()).padStart(2, '0');
    this.bookingForm.endTime = `${eh}:${em}`;
  }

  openBookingModal(): void {
    if (!this.token) {
      this.openAuthModal('login');
      Swal.fire('Sign In Required', 'Please sign in to reserve a dining table.', 'info');
      return;
    }
    this.initDefaultBookingDate();
    this.isBookingModalOpen = true;
  }

  async submitTableBooking(): Promise<void> {
    this.isLoading = true;
    try {
      const res = await firstValueFrom(
        this.api.bookTable({
          tableId: Number(this.bookingForm.tableId),
          bookingDate: this.bookingForm.bookingDate,
          guestCount: Number(this.bookingForm.guestCount),
          startTime: this.bookingForm.startTime.length === 5 ? `${this.bookingForm.startTime}:00` : this.bookingForm.startTime,
          endTime: this.bookingForm.endTime.length === 5 ? `${this.bookingForm.endTime}:00` : this.bookingForm.endTime,
          specialRequest: this.bookingForm.specialRequest
        })
      );
      this.isBookingModalOpen = false;
      await Swal.fire({
        icon: 'success',
        title: 'Table Reserved!',
        html: `
          <div class="text-xs text-left space-y-1.5 mt-2 bg-amber-50 p-3 rounded-xl border border-amber-200">
            <p><b>Booking Ref:</b> #TB-${res.id}</p>
            <p><b>Table:</b> ${res.table?.tableNumber} (${res.table?.section})</p>
            <p><b>Date & Slot:</b> ${res.bookingDate} • ${res.startTime} to ${res.endTime} (${res.durationMinutes} mins)</p>
            <p><b>Party Size:</b> ${res.guestCount} Guests</p>
          </div>
        `,
        confirmButtonColor: '#d97706'
      });
      await this.switchTab('bookings');
    } catch (err) {
      Swal.fire('Booking Conflict / Error', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async loadMyBookings(): Promise<void> {
    if (!this.token) {
      this.userBookings = [];
      return;
    }
    this.isLoading = true;
    try {
      this.userBookings = await firstValueFrom(this.api.getMyBookings());
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      this.isLoading = false;
    }
  }

  async cancelBooking(bookingId: number): Promise<void> {
    const confirm = await Swal.fire({
      title: 'Cancel Table Reservation?',
      text: `Cancel reservation #TB-${bookingId}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Cancel'
    });
    if (!confirm.isConfirmed) return;

    this.isLoading = true;
    try {
      await firstValueFrom(this.api.cancelBooking(bookingId));
      Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Reservation cancelled', showConfirmButton: false, timer: 1500 });
      await this.loadMyBookings();
      if (this.user?.role === 'ADMIN' || this.user?.role === 'WAITER') {
        this.adminBookings = await firstValueFrom(this.api.getAllBookings()).catch(() => []);
      }
    } catch (err) {
      Swal.fire('Error', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // ==========================================
  // KITCHEN DISPLAY SYSTEM (CHEF)
  // ==========================================
  async loadKitchenOrders(): Promise<void> {
    this.isLoading = true;
    try {
      this.kitchenOrders = await firstValueFrom(this.api.getKitchenOrders());
    } catch (err) {
      console.error('Error loading kitchen orders:', err);
    } finally {
      this.isLoading = false;
    }
  }

  async chefAssignOrder(orderId: number): Promise<void> {
    this.isLoading = true;
    try {
      await firstValueFrom(this.api.assignChef(orderId));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Order claimed for preparation!', showConfirmButton: false, timer: 1300 });
      await this.loadKitchenOrders();
    } catch (err) {
      Swal.fire('Error', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async chefMarkReady(orderId: number): Promise<void> {
    this.isLoading = true;
    try {
      await firstValueFrom(this.api.updateOrderStatus(orderId, 'Ready'));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Order marked Ready for Waiter!', showConfirmButton: false, timer: 1300 });
      await this.loadKitchenOrders();
    } catch (err) {
      Swal.fire('Error', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // ==========================================
  // WAITER SERVICE DESK
  // ==========================================
  async loadWaiterOrders(): Promise<void> {
    this.isLoading = true;
    try {
      const [orders, bookings] = await Promise.all([
        firstValueFrom(this.api.getWaiterOrders()),
        firstValueFrom(this.api.getAllBookings()).catch(() => [])
      ]);
      this.waiterOrders = orders;
      this.adminBookings = bookings;
    } catch (err) {
      console.error('Error loading waiter orders:', err);
    } finally {
      this.isLoading = false;
    }
  }

  async waiterVerifyOtp(order: OrderDetailsResponseDTO): Promise<void> {
    const isTakeaway = order.deliveryType === 'TAKEAWAY';
    const { value: otp } = await Swal.fire({
      title: `Verify ${isTakeaway ? 'Takeaway Pickup' : 'Doorstep'} OTP (${order.token_number})`,
      input: 'text',
      inputLabel: `Enter customer 4-digit ${isTakeaway ? 'Takeaway Pickup' : 'Home Delivery'} OTP`,
      inputPlaceholder: '4-digit OTP code',
      showCancelButton: true,
      confirmButtonText: isTakeaway ? 'Verify & Handover Takeaway' : 'Verify & Complete Delivery',
      confirmButtonColor: '#4f46e5'
    });
    if (!otp) return;

    this.isLoading = true;
    try {
      await firstValueFrom(this.api.verifyOtpAndDeliver(order.id, otp));
      Swal.fire('Completed!', `Order ${order.token_number} OTP verified and handed over.`, 'success');
      await this.loadWaiterOrders();
    } catch (err) {
      Swal.fire('OTP Verification Failed', this.extractErrorMessage(err, 'Invalid OTP code'), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async waiterServeDirect(order: OrderDetailsResponseDTO): Promise<void> {
    this.isLoading = true;
    try {
      await firstValueFrom(this.api.serveOrderDirect(order.id));
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `${order.token_number} served to customer!`,
        showConfirmButton: false,
        timer: 1500
      });
      await this.loadWaiterOrders();
    } catch (err) {
      Swal.fire('Error', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // ==========================================
  // ADMIN CONTROL HUB (FULL CRUD)
  // ==========================================
  async loadAdminDashboard(): Promise<void> {
    this.isLoading = true;
    try {
      const [orders, bookings, coupons, payments, refunds, cats, menus, tables] = await Promise.all([
        firstValueFrom(this.api.getAllOrders()).catch(() => []),
        firstValueFrom(this.api.getAllBookings()).catch(() => []),
        firstValueFrom(this.api.getAllCoupons()).catch(() => []),
        firstValueFrom(this.api.getAllPayments()).catch(() => []),
        firstValueFrom(this.api.getAllRefunds()).catch(() => []),
        firstValueFrom(this.api.getCategories()).catch(() => []),
        firstValueFrom(this.api.getMenus()).catch(() => []),
        firstValueFrom(this.api.getTables()).catch(() => [])
      ]);
      this.adminOrders = orders;
      this.adminBookings = bookings;
      this.allCoupons = coupons;
      this.adminPayments = payments;
      this.adminRefunds = refunds;
      this.categories = cats;
      this.menus = menus;
      this.tables = tables;
    } finally {
      this.isLoading = false;
    }
  }

  // Admin Dish CRUD
  openAddDishModal(): void {
    this.editingDishId = null;
    this.dishForm = {
      name: '',
      description: '',
      price: 180,
      quantity: 100,
      imageUrl: '',
      categoryId: this.categories[0]?.id || 1,
      available: true,
      veg: true,
      preparationTimeMinutes: 15
    };
    this.isDishModalOpen = true;
  }

  openEditDishModal(dish: MenuDTO): void {
    this.editingDishId = dish.menu_id;
    this.dishForm = {
      name: dish.name,
      description: dish.description || '',
      price: dish.price,
      quantity: dish.quantity,
      imageUrl: dish.imageUrl || '',
      categoryId: dish.category_id || this.categories[0]?.id || 1,
      available: dish.available,
      veg: dish.veg,
      preparationTimeMinutes: dish.preparationTimeMinutes || 15
    };
    this.isDishModalOpen = true;
  }

  async saveDish(): Promise<void> {
    this.isLoading = true;
    try {
      const payload: MenuRequestDTO = {
        ...this.dishForm,
        price: Number(this.dishForm.price),
        quantity: Number(this.dishForm.quantity),
        categoryId: Number(this.dishForm.categoryId),
        preparationTimeMinutes: Number(this.dishForm.preparationTimeMinutes),
        imageUrl: this.dishForm.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500'
      };
      if (this.editingDishId !== null) {
        await firstValueFrom(this.api.updateMenu(this.editingDishId, payload));
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Dish updated!', showConfirmButton: false, timer: 1400 });
      } else {
        await firstValueFrom(this.api.createMenu(payload));
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Dish added to menu!', showConfirmButton: false, timer: 1400 });
      }
      this.isDishModalOpen = false;
      this.menus = await firstValueFrom(this.api.getMenus());
    } catch (err) {
      Swal.fire('Error Saving Dish', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async toggleDishAvailability(dish: MenuDTO): Promise<void> {
    try {
      await firstValueFrom(this.api.updateMenu(dish.menu_id, { available: !dish.available }));
      dish.available = !dish.available;
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: `"${dish.name}" marked ${dish.available ? 'Available' : 'Unavailable'}`,
        showConfirmButton: false,
        timer: 1200
      });
    } catch (err) {
      Swal.fire('Error', this.extractErrorMessage(err), 'error');
    }
  }

  async deleteDish(dish: MenuDTO): Promise<void> {
    const confirm = await Swal.fire({
      title: `Delete "${dish.name}"?`,
      text: 'This will remove the dish from the menu.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Delete Dish'
    });
    if (!confirm.isConfirmed) return;

    this.isLoading = true;
    try {
      await firstValueFrom(this.api.deleteMenu(dish.menu_id));
      this.menus = await firstValueFrom(this.api.getMenus());
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Dish deleted', showConfirmButton: false, timer: 1200 });
    } catch (err) {
      Swal.fire('Cannot Delete Dish', this.extractErrorMessage(err, 'Dish is linked to existing orders. Toggle availability instead.'), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Admin Category CRUD
  openAddCategoryModal(): void {
    this.editingCategoryId = null;
    this.categoryForm = { name: '', description: '', imageUrl: '' };
    this.isCategoryModalOpen = true;
  }

  openEditCategoryModal(cat: CategoryDTO): void {
    this.editingCategoryId = cat.id;
    this.categoryForm = { name: cat.name, description: cat.description || '', imageUrl: cat.imageUrl || '' };
    this.isCategoryModalOpen = true;
  }

  async saveCategory(): Promise<void> {
    this.isLoading = true;
    try {
      const payload = {
        name: this.categoryForm.name.trim(),
        description: this.categoryForm.description.trim(),
        imageUrl: this.categoryForm.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500'
      };
      if (this.editingCategoryId !== null) {
        await firstValueFrom(this.api.updateCategory(this.editingCategoryId, payload));
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Category updated!', showConfirmButton: false, timer: 1400 });
      } else {
        await firstValueFrom(this.api.createCategory(payload));
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Category created!', showConfirmButton: false, timer: 1400 });
      }
      this.isCategoryModalOpen = false;
      this.categories = await firstValueFrom(this.api.getCategories());
    } catch (err) {
      Swal.fire('Error Saving Category', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async deleteCategory(cat: CategoryDTO): Promise<void> {
    const confirm = await Swal.fire({
      title: `Delete Category "${cat.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Delete'
    });
    if (!confirm.isConfirmed) return;

    this.isLoading = true;
    try {
      await firstValueFrom(this.api.deleteCategory(cat.id));
      if (this.selectedCategoryId === cat.id) {
        this.selectedCategoryId = null;
      }
      const [cats, menus] = await Promise.all([
        firstValueFrom(this.api.getCategories()),
        firstValueFrom(this.api.getMenus())
      ]);
      this.categories = cats;
      this.menus = menus;
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Category deleted', showConfirmButton: false, timer: 1200 });
    } catch (err) {
      Swal.fire('Cannot Delete Category', this.extractErrorMessage(err, 'Category has linked menu items.'), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Admin Coupon CRUD
  openAddCouponModal(): void {
    this.couponForm = {
      couponCode: '',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minimumOrder: 150,
      upto: 100,
      active: true
    };
    this.isCouponModalOpen = true;
  }

  async saveCoupon(): Promise<void> {
    this.isLoading = true;
    try {
      await firstValueFrom(
        this.api.createCoupon({
          ...this.couponForm,
          couponCode: this.couponForm.couponCode.trim().toUpperCase(),
          discountValue: Number(this.couponForm.discountValue),
          minimumOrder: Number(this.couponForm.minimumOrder),
          upto: Number(this.couponForm.upto)
        })
      );
      this.isCouponModalOpen = false;
      const [all, active] = await Promise.all([
        firstValueFrom(this.api.getAllCoupons()),
        firstValueFrom(this.api.getActiveCoupons())
      ]);
      this.allCoupons = all;
      this.activeCoupons = active;
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Coupon created!', showConfirmButton: false, timer: 1400 });
    } catch (err) {
      Swal.fire('Error Creating Coupon', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async deleteCoupon(id: number | undefined): Promise<void> {
    if (!id) return;
    this.isLoading = true;
    try {
      await firstValueFrom(this.api.deleteCoupon(id));
      this.allCoupons = await firstValueFrom(this.api.getAllCoupons());
      this.activeCoupons = await firstValueFrom(this.api.getActiveCoupons());
      Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Coupon deleted', showConfirmButton: false, timer: 1200 });
    } catch (err) {
      Swal.fire('Error', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Admin Table CRUD
  openAddTableModal(): void {
    this.tableForm = { tableNumber: '', capacity: 4, section: 'Indoor', active: true };
    this.isTableModalOpen = true;
  }

  async saveTable(): Promise<void> {
    this.isLoading = true;
    try {
      await firstValueFrom(
        this.api.createTable({
          ...this.tableForm,
          capacity: Number(this.tableForm.capacity)
        })
      );
      this.isTableModalOpen = false;
      this.tables = await firstValueFrom(this.api.getTables());
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Dining Table added!', showConfirmButton: false, timer: 1400 });
    } catch (err) {
      Swal.fire('Error Adding Table', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async completeBooking(bookingId: number): Promise<void> {
    this.isLoading = true;
    try {
      await firstValueFrom(this.api.completeBooking(bookingId));
      this.adminBookings = await firstValueFrom(this.api.getAllBookings());
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Booking marked completed', showConfirmButton: false, timer: 1300 });
    } catch (err) {
      Swal.fire('Error', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async onFileSelected(event: Event, target: 'dish' | 'category'): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isLoading = true;
    try {
      const res = await firstValueFrom(this.api.uploadImage(file));
      if (res.url) {
        if (target === 'dish') this.dishForm.imageUrl = res.url;
        else this.categoryForm.imageUrl = res.url;
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Image uploaded!', showConfirmButton: false, timer: 1300 });
      }
    } catch (err) {
      Swal.fire('Upload Failed', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // ==========================================
  // FEEDBACK & CONTACT US
  // ==========================================
  async submitFeedback(): Promise<void> {
    if (!this.feedbackForm.message.trim()) return;
    this.isLoading = true;
    try {
      await firstValueFrom(
        this.api.submitFeedback({
          userName: this.user ? this.user.name : this.feedbackForm.userName || 'Guest Customer',
          message: this.feedbackForm.message.trim(),
          star_by_user: Number(this.feedbackForm.star_by_user)
        })
      );
      this.feedbackForm.message = '';
      this.feedbacks = (await firstValueFrom(this.api.getFeedback())).slice().reverse();
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Thank you for your review!', showConfirmButton: false, timer: 1500 });
    } catch (err) {
      Swal.fire('Error', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async submitContact(): Promise<void> {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) return;
    this.isLoading = true;
    try {
      const res = await firstValueFrom(this.api.submitContact(this.contactForm));
      this.contactForm = { name: '', email: '', subject: '', message: '' };
      Swal.fire('Message Sent', res.message || 'Thank you for contacting us!', 'success');
    } catch (err) {
      Swal.fire('Error', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // ==========================================
  // AUTHENTICATION & PASSWORD STRENGTH
  // ==========================================
  openAuthModal(view: 'login' | 'register' | 'forgot' = 'login'): void {
    this.authView = view;
    this.forgotForm.otpSent = false;
    this.isAuthModalOpen = true;
  }

  evaluatePassword(pass: string) {
    if (!pass) {
      return {
        hasLen: false,
        hasUpper: false,
        hasLower: false,
        hasDigit: false,
        hasSpecial: false,
        score: 0,
        label: 'Empty',
        color: 'bg-slate-200',
        width: '0%',
        valid: false,
        reason: 'Password is required'
      };
    }
    const hasLen = (pass || '').length >= 8;
    const hasUpper = /[A-Z]/.test(pass || '');
    const hasLower = /[a-z]/.test(pass || '');
    const hasDigit = /\d/.test(pass || '');
    const hasSpecial = /[@$!%*?&_#^~+=\-(){}[\]:;"'<>,.\/\\|]/.test(pass || '');
    const score = [hasLen, hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
    const valid = score === 5;

    let label = 'Weak';
    let color = 'bg-rose-500';
    let width = '25%';
    if (valid) {
      label = 'Strong';
      color = 'bg-emerald-500';
      width = '100%';
    } else if (score >= 3) {
      label = 'Moderate';
      color = 'bg-amber-500';
      width = '60%';
    }

    let reason = '';
    if (!hasLen) reason = 'Min 8 characters';
    else if (!hasUpper) reason = 'Add uppercase letter';
    else if (!hasLower) reason = 'Add lowercase letter';
    else if (!hasDigit) reason = 'Add number';
    else if (!hasSpecial) reason = 'Add symbol (@$!%*?&)';

    return { hasLen, hasUpper, hasLower, hasDigit, hasSpecial, score, label, color, width, valid, reason };
  }

  async submitLogin(): Promise<void> {
    this.isLoading = true;
    try {
      const res = await firstValueFrom(this.api.login(this.loginForm.phoneNumber.trim(), this.loginForm.password));
      await this.handleAuthSuccess(res);
    } catch (err) {
      Swal.fire('Login Failed', this.extractErrorMessage(err, 'Invalid phone number or password'), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async quickDemoLogin(phone: string, pass: string): Promise<void> {
    this.isLoading = true;
    try {
      const res = await firstValueFrom(this.api.login(phone, pass));
      await this.handleAuthSuccess(res);
    } catch (err) {
      Swal.fire('Demo Login Failed', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async submitRegister(): Promise<void> {
    const check = this.evaluatePassword(this.registerForm.password);
    if (!check.valid) {
      Swal.fire(
        'Strong Password Required',
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
        'warning'
      );
      return;
    }

    this.isLoading = true;
    try {
      this.registerForm.role = 'USER';
      const res = await firstValueFrom(this.api.register(this.registerForm));
      await this.handleAuthSuccess(res);
    } catch (err) {
      Swal.fire('Registration Failed', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async submitForgot(): Promise<void> {
    this.isLoading = true;
    try {
      if (!this.forgotForm.otpSent) {
        const res = await firstValueFrom(this.api.forgotPassword(this.forgotForm.phoneNumber.trim()));
        this.forgotForm.otpSent = true;
        this.forgotForm.otp = res.demoOtp || '123456';
        Swal.fire('OTP Sent', res.message, 'info');
      } else {
        const check = this.evaluatePassword(this.forgotForm.newPassword);
        if (!check.valid) {
          Swal.fire('Weak Password', 'New password must be 8+ chars with uppercase, lowercase, digit, and special symbol.', 'warning');
          return;
        }
        const res = await firstValueFrom(
          this.api.resetPassword(this.forgotForm.phoneNumber.trim(), this.forgotForm.otp.trim(), this.forgotForm.newPassword)
        );
        Swal.fire('Password Updated', res.message, 'success');
        this.authView = 'login';
      }
    } catch (err) {
      Swal.fire('Error', this.extractErrorMessage(err), 'error');
    } finally {
      this.isLoading = false;
    }
  }

  private async handleAuthSuccess(data: AuthResponseDTO): Promise<void> {
    this.token = data.token;
    this.user = {
      id: data.userId,
      name: data.name,
      phone: data.phoneNumber,
      email: data.email,
      role: data.role
    };
    localStorage.setItem('canteen_token', this.token);
    localStorage.setItem('canteen_user', JSON.stringify(this.user));
    this.isAuthModalOpen = false;

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Signed in as ${data.name} (${data.role})`,
      showConfirmButton: false,
      timer: 1800
    });

    if (data.role === 'CHEF') await this.switchTab('kitchen');
    else if (data.role === 'WAITER') await this.switchTab('waiter');
    else if (data.role === 'ADMIN') await this.switchTab('admin');
    else await this.switchTab('menu');
  }

  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('canteen_token');
    localStorage.removeItem('canteen_user');
    this.switchTab('menu');
    Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Signed out', showConfirmButton: false, timer: 1200 });
  }
}
