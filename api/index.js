/**
 * Vercel Serverless API Handler for Grand Royale — Smart Canteen & Dining Hub
 *
 * - If process.env.BACKEND_URL is set (e.g. an external Spring Boot deployment on Render/Railway),
 *   requests to /api/* and /v1/api/* are proxied directly to BACKEND_URL.
 * - Otherwise, this serverless function handles all 10 REST controller routes natively on Vercel
 *   so the full Angular application works out-of-the-box on *.vercel.app.
 */

const state = globalThis.__GRAND_ROYALE_STATE__ || (globalThis.__GRAND_ROYALE_STATE__ = {
  users: [
    { id: 1, name: 'Admin Manager', phoneNumber: '9999999999', email: 'admin@grandroyale.com', password: 'admin123', role: 'ADMIN' },
    { id: 2, name: 'Head Chef Viktor', phoneNumber: '8888888888', email: 'chef@grandroyale.com', password: 'chef123', role: 'CHEF' },
    { id: 3, name: 'Senior Waiter Kabir', phoneNumber: '7777777777', email: 'waiter@grandroyale.com', password: 'waiter123', role: 'WAITER' },
    { id: 4, name: 'Sumit Dubey', phoneNumber: '9876543210', email: 'customer@grandroyale.com', password: 'user123', role: 'USER' }
  ],
  categories: [
    { id: 1, name: 'Starter', description: 'Mouth Watering royal appetizers & tandoori kebabs', imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500' },
    { id: 2, name: 'Main Course', description: 'Rich signature curries & slow-simmered gravies', imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500' },
    { id: 3, name: 'Biryani & Rice', description: 'Authentic aromatic basmati rice specialties', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500' },
    { id: 4, name: 'Artisan Breads', description: 'Freshly baked tandoori naans, kulchas & rotis', imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500' },
    { id: 5, name: 'Desserts & Drinks', description: 'Traditional sweets & refreshing beverages', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500' }
  ],
  menus: [
    {
      menu_id: 1,
      name: 'Paneer Tikka Angara',
      description: 'Charcoal-grilled cottage cheese cubes marinated in hung curd and smoky tandoori spices',
      price: 220,
      quantity: 50,
      imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500',
      category_id: 1,
      category_name: 'Starter',
      available: true,
      veg: true,
      preparationTimeMinutes: 15,
      last_update: new Date().toISOString()
    },
    {
      menu_id: 2,
      name: 'Hyderabadi Dum Biryani',
      description: 'Fragrant basmati rice layered with marinated spices, saffron and caramelized onions',
      price: 280,
      quantity: 45,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
      category_id: 3,
      category_name: 'Biryani & Rice',
      available: true,
      veg: true,
      preparationTimeMinutes: 20,
      last_update: new Date().toISOString()
    },
    {
      menu_id: 3,
      name: 'Paneer Lababdar Royale',
      description: 'Velvety tomato-cashew gravy simmered with cottage cheese, cream and kasturi methi',
      price: 260,
      quantity: 40,
      imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500',
      category_id: 2,
      category_name: 'Main Course',
      available: true,
      veg: true,
      preparationTimeMinutes: 18,
      last_update: new Date().toISOString()
    },
    {
      menu_id: 4,
      name: 'Old Delhi Butter Chicken',
      description: 'Tandoori chicken tikka simmered in rich buttery makhani sauce',
      price: 320,
      quantity: 35,
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500',
      category_id: 2,
      category_name: 'Main Course',
      available: true,
      veg: false,
      preparationTimeMinutes: 20,
      last_update: new Date().toISOString()
    },
    {
      menu_id: 5,
      name: 'Garlic Butter Naan Basket',
      description: 'Soft leavened clay-oven flatbread brushed with roasted garlic butter & cilantro',
      price: 75,
      quantity: 80,
      imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500',
      category_id: 4,
      category_name: 'Artisan Breads',
      available: true,
      veg: true,
      preparationTimeMinutes: 10,
      last_update: new Date().toISOString()
    },
    {
      menu_id: 6,
      name: 'Saffron Rasmalai & Pistachio',
      description: 'Soft cottage cheese dumplings soaked in chilled saffron-cardamom milk',
      price: 140,
      quantity: 40,
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500',
      category_id: 5,
      category_name: 'Desserts & Drinks',
      available: true,
      veg: true,
      preparationTimeMinutes: 8,
      last_update: new Date().toISOString()
    }
  ],
  tables: [
    { id: 1, tableNumber: 'T-1 (Cozy Corner)', capacity: 2, section: 'Indoor', active: true },
    { id: 2, tableNumber: 'T-2 (Family Booth)', capacity: 4, section: 'Indoor', active: true },
    { id: 3, tableNumber: 'T-3 (Grand Table)', capacity: 6, section: 'Indoor', active: true },
    { id: 4, tableNumber: 'W-1 (Window City View)', capacity: 2, section: 'Window View', active: true },
    { id: 5, tableNumber: 'W-2 (Window Sunset)', capacity: 4, section: 'Window View', active: true },
    { id: 6, tableNumber: 'R-1 (Rooftop Starlight)', capacity: 4, section: 'Rooftop Garden', active: true },
    { id: 7, tableNumber: 'R-2 (Rooftop Gazebo)', capacity: 8, section: 'Rooftop Garden', active: true },
    { id: 8, tableNumber: 'P-1 (Garden Patio)', capacity: 4, section: 'Outdoor Patio', active: true }
  ],
  coupons: [
    { couponId: 1, couponCode: 'WELCOME20', discountType: 'PERCENTAGE', discountValue: 20, upto: 100, minimumOrder: 150, active: true, count: 3, numberOfToken: 1000 },
    { couponId: 2, couponCode: 'FLAT50', discountType: 'FLAT', discountValue: 50, upto: null, minimumOrder: 200, active: true, count: 0, numberOfToken: 1000 },
    { couponId: 3, couponCode: 'SUPER100', discountType: 'FLAT', discountValue: 100, upto: null, minimumOrder: 400, active: true, count: 0, numberOfToken: 1000 }
  ],
  orders: [
    {
      id: 13,
      userId: 4,
      token_number: 'TKN-6505',
      qr_data: 'ORD-DFDBAF9C',
      Total: 224,
      total: 224,
      discountAmount: 56,
      number_of_times_user_tried_payment: 0,
      created_at: new Date().toISOString(),
      orderStatus: 'Placed',
      deliveryType: 'TAKEAWAY',
      deliveryAddress: null,
      tableNumber: null,
      paid: true,
      otp_verify: '4947',
      chefName: null,
      waiterName: null,
      couponCode: 'WELCOME20',
      refund_status: false,
      refund_reason: null,
      items: [
        {
          menuId: 2,
          dishName: 'Hyderabadi Dum Biryani',
          dishImageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
          quantity: 1,
          price: 280,
          subTotal: 280
        }
      ],
      menuIds: [2],
      tracking: [
        { status: 'Placed', updatedBy: 'Customer (Sumit Dubey)', remarks: 'Order placed with 1 items', timestamp: new Date().toISOString() },
        { status: 'Placed', updatedBy: 'Payment Gateway', remarks: 'Payment of Rs 224 completed successfully via UPI', timestamp: new Date().toISOString() }
      ]
    }
  ],
  bookings: [],
  payments: [],
  refunds: [],
  feedbacks: [
    { id: 1, userName: 'Aarav Sharma', message: 'Loved the Hyderabadi Dum Biryani and contactless table ordering!', star_by_user: 5, createdAt: new Date().toISOString() }
  ]
});

function parseUserFromHeader(req) {
  const auth = req.headers['authorization'] || req.headers['Authorization'] || '';
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  try {
    if (token.startsWith('vtok:')) {
      const decoded = JSON.parse(Buffer.from(token.slice(5), 'base64').toString('utf8'));
      return state.users.find((u) => u.id === decoded.userId || u.phoneNumber === decoded.phoneNumber) || decoded;
    }
    // Also support JWT payload decoding if token was issued by Spring Boot
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      return {
        id: payload.userId || 4,
        phoneNumber: payload.sub || '9876543210',
        name: payload.name || 'Customer',
        role: payload.role || 'USER'
      };
    }
  } catch {
    return null;
  }
  return null;
}

function makeToken(user) {
  const payload = {
    userId: user.id,
    phoneNumber: user.phoneNumber,
    name: user.name,
    role: user.role
  };
  return 'vtok:' + Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function sendText(res, status, text) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(text);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const rawUrl = req.url || '/';
  const [pathname, queryString] = rawUrl.split('?');
  const searchParams = new URLSearchParams(queryString || '');

  // Optional proxy to an external Spring Boot backend if BACKEND_URL is configured
  if (process.env.BACKEND_URL) {
    try {
      const targetUrl = process.env.BACKEND_URL.replace(/\/$/, '') + rawUrl;
      const bodyObj = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await readBody(req) : undefined;
      const upstream = await fetch(targetUrl, {
        method: req.method,
        headers: {
          'Content-Type': req.headers['content-type'] || 'application/json',
          ...(req.headers['authorization'] ? { Authorization: req.headers['authorization'] } : {})
        },
        body: bodyObj ? JSON.stringify(bodyObj) : undefined
      });
      const text = await upstream.text();
      res.statusCode = upstream.status;
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
      return res.end(text);
    } catch (err) {
      return sendJson(res, 502, { message: 'Upstream backend error: ' + err.message });
    }
  }

  const method = req.method || 'GET';
  const currentUser = parseUserFromHeader(req);

  // ==========================================
  // 1. AUTH (/api/auth/*)
  // ==========================================
  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = await readBody(req);
    const phone = String(body.phoneNumber || '').trim();
    const pass = String(body.password || '');
    const user = state.users.find((u) => (u.phoneNumber === phone || u.email === phone) && u.password === pass);
    if (!user) {
      return sendJson(res, 400, { message: 'Invalid phone number or password' });
    }
    return sendJson(res, 200, {
      token: makeToken(user),
      tokenType: 'Bearer',
      userId: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      email: user.email,
      role: user.role,
      message: 'Login successful.'
    });
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    const body = await readBody(req);
    const phone = String(body.phoneNumber || '').trim();
    if (!phone) return sendJson(res, 400, { message: 'Phone number is required' });
    if (state.users.some((u) => u.phoneNumber === phone)) {
      return sendJson(res, 400, { message: 'Phone number is already registered. Please login.' });
    }
    const newUser = {
      id: state.users.reduce((m, u) => Math.max(m, u.id), 0) + 1,
      name: body.name || `User ${phone.slice(-4)}`,
      phoneNumber: phone,
      email: body.email || '',
      password: body.password || '',
      role: 'USER'
    };
    state.users.push(newUser);
    return sendJson(res, 200, {
      token: makeToken(newUser),
      tokenType: 'Bearer',
      userId: newUser.id,
      phoneNumber: newUser.phoneNumber,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      message: 'Registration successful.'
    });
  }

  if (pathname === '/api/auth/forgot-password' && method === 'POST') {
    const body = await readBody(req);
    const phone = String(body.phoneNumber || '').trim();
    return sendJson(res, 200, {
      message: `Password reset OTP sent successfully to ${phone}. (Use demo OTP: 123456)`,
      phoneNumber: phone,
      demoOtp: '123456'
    });
  }

  if (pathname === '/api/auth/reset-password' && method === 'POST') {
    const body = await readBody(req);
    const phone = String(body.phoneNumber || '').trim();
    const user = state.users.find((u) => u.phoneNumber === phone);
    if (!user) return sendJson(res, 404, { message: 'No account found with phone number: ' + phone });
    if (body.otp !== '123456') return sendJson(res, 400, { message: 'Invalid or expired OTP' });
    user.password = body.newPassword;
    return sendJson(res, 200, { message: 'Password has been successfully updated.' });
  }

  // ==========================================
  // 2. CATEGORIES (/v1/api/category)
  // ==========================================
  if (pathname === '/v1/api/category' && method === 'GET') {
    return sendJson(res, 200, state.categories);
  }

  if (pathname === '/v1/api/category' && method === 'POST') {
    const body = await readBody(req);
    const nextId = state.categories.reduce((m, c) => Math.max(m, c.id), 0) + 1;
    const cat = {
      id: nextId,
      name: body.name,
      description: body.description || '',
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500'
    };
    state.categories.push(cat);
    return sendJson(res, 201, cat);
  }

  const catMatch = pathname.match(/^\/v1\/api\/category\/(\d+)$/);
  if (catMatch) {
    const catId = Number(catMatch[1]);
    const idx = state.categories.findIndex((c) => c.id === catId);
    if (idx === -1) return sendJson(res, 404, { message: 'Category not found' });

    if (method === 'PUT') {
      const body = await readBody(req);
      state.categories[idx] = {
        ...state.categories[idx],
        name: body.name ?? state.categories[idx].name,
        description: body.description ?? state.categories[idx].description,
        imageUrl: body.imageUrl ?? state.categories[idx].imageUrl
      };
      state.menus.forEach((m) => {
        if (m.category_id === catId) m.category_name = state.categories[idx].name;
      });
      return sendJson(res, 200, state.categories[idx]);
    }

    if (method === 'DELETE') {
      state.menus.forEach((m) => {
        if (m.category_id === catId) {
          m.category_id = null;
          m.category_name = null;
        }
      });
      state.categories.splice(idx, 1);
      return sendText(res, 200, 'Category deleted successfully');
    }
  }

  // ==========================================
  // 3. MENU (/v1/api/menu)
  // ==========================================
  if (pathname === '/v1/api/menu' && method === 'GET') {
    return sendJson(res, 200, state.menus);
  }

  if (pathname === '/v1/api/menu' && method === 'POST') {
    const body = await readBody(req);
    const nextId = state.menus.reduce((m, d) => Math.max(m, d.menu_id), 0) + 1;
    const cat = state.categories.find((c) => c.id === Number(body.categoryId));
    const dish = {
      menu_id: nextId,
      name: body.name,
      description: body.description || '',
      price: Number(body.price) || 180,
      quantity: Number(body.quantity ?? 100),
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500',
      category_id: cat ? cat.id : Number(body.categoryId) || null,
      category_name: cat ? cat.name : null,
      available: body.available !== false,
      veg: body.veg !== false,
      preparationTimeMinutes: Number(body.preparationTimeMinutes) || 15,
      last_update: new Date().toISOString()
    };
    state.menus.push(dish);
    return sendJson(res, 201, dish);
  }

  const menuMatch = pathname.match(/^\/v1\/api\/menu\/(\d+)$/);
  if (menuMatch) {
    const menuId = Number(menuMatch[1]);
    const idx = state.menus.findIndex((m) => m.menu_id === menuId);
    if (idx === -1) return sendJson(res, 404, { message: 'Dish not found' });

    if (method === 'PUT') {
      const body = await readBody(req);
      const current = state.menus[idx];
      const catId = body.categoryId !== undefined ? Number(body.categoryId) : current.category_id;
      const cat = state.categories.find((c) => c.id === catId);
      state.menus[idx] = {
        ...current,
        name: body.name !== undefined ? body.name : current.name,
        description: body.description !== undefined ? body.description : current.description,
        price: body.price !== undefined ? Number(body.price) : current.price,
        quantity: body.quantity !== undefined ? Number(body.quantity) : current.quantity,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : current.imageUrl,
        category_id: catId,
        category_name: cat ? cat.name : current.category_name,
        available: body.available !== undefined ? Boolean(body.available) : current.available,
        veg: body.veg !== undefined ? Boolean(body.veg) : current.veg,
        preparationTimeMinutes:
          body.preparationTimeMinutes !== undefined ? Number(body.preparationTimeMinutes) : current.preparationTimeMinutes,
        last_update: new Date().toISOString()
      };
      return sendJson(res, 200, state.menus[idx]);
    }

    if (method === 'DELETE') {
      state.menus.splice(idx, 1);
      return sendText(res, 200, 'Menu item deleted successfully');
    }
  }

  // ==========================================
  // 4. COUPONS (/api/coupons)
  // ==========================================
  if (pathname === '/api/coupons' && method === 'GET') {
    return sendJson(res, 200, state.coupons);
  }
  if (pathname === '/api/coupons/active' && method === 'GET') {
    return sendJson(res, 200, state.coupons.filter((c) => c.active));
  }
  if (pathname === '/api/coupons' && method === 'POST') {
    const body = await readBody(req);
    const nextId = state.coupons.reduce((m, c) => Math.max(m, c.couponId || 0), 0) + 1;
    const coupon = {
      couponId: nextId,
      couponCode: String(body.couponCode || '').toUpperCase(),
      discountType: body.discountType || 'PERCENTAGE',
      discountValue: Number(body.discountValue) || 10,
      minimumOrder: Number(body.minimumOrder) || 0,
      upto: body.upto ? Number(body.upto) : null,
      active: true
    };
    state.coupons.push(coupon);
    return sendJson(res, 201, coupon);
  }
  if (pathname === '/api/coupons/validate' && method === 'POST') {
    const body = await readBody(req);
    const code = String(body.couponCode || '').trim().toUpperCase();
    const amount = Number(body.orderAmount) || 0;
    const c = state.coupons.find((x) => x.couponCode === code && x.active);
    if (!c) {
      return sendJson(res, 200, { valid: false, couponCode: code, discountAmount: 0, finalAmount: amount, message: 'Invalid coupon code' });
    }
    if (c.minimumOrder && amount < c.minimumOrder) {
      return sendJson(res, 200, {
        valid: false,
        couponCode: code,
        discountAmount: 0,
        finalAmount: amount,
        message: `Minimum order of ₹${c.minimumOrder} required`
      });
    }
    let disc = c.discountType === 'PERCENTAGE' ? Math.round((amount * c.discountValue) / 100) : c.discountValue;
    if (c.upto && disc > c.upto) disc = c.upto;
    disc = Math.min(disc, amount);
    return sendJson(res, 200, {
      valid: true,
      couponCode: code,
      discountAmount: disc,
      finalAmount: amount - disc,
      message: 'Coupon applied!'
    });
  }

  const couponDelMatch = pathname.match(/^\/api\/coupons\/(\d+)$/);
  if (couponDelMatch && method === 'DELETE') {
    const cid = Number(couponDelMatch[1]);
    state.coupons = state.coupons.filter((c) => c.couponId !== cid);
    return sendText(res, 200, 'Coupon deleted');
  }

  // ==========================================
  // 5. ORDERS (/api/orders/*)
  // ==========================================
  if (pathname === '/api/orders/place' && method === 'POST') {
    const body = await readBody(req);
    const counts = {};
    (body.menuIds || []).forEach((id) => {
      counts[id] = (counts[id] || 0) + 1;
    });

    const items = [];
    let subtotal = 0;
    Object.keys(counts).forEach((idStr) => {
      const mid = Number(idStr);
      const qty = counts[mid];
      const dish = state.menus.find((m) => m.menu_id === mid);
      if (dish) {
        const sub = dish.price * qty;
        subtotal += sub;
        items.push({
          menuId: dish.menu_id,
          dishName: dish.name,
          dishImageUrl: dish.imageUrl,
          quantity: qty,
          price: dish.price,
          subTotal: sub
        });
      }
    });

    let discountAmount = 0;
    if (body.couponCode) {
      const c = state.coupons.find((x) => x.couponCode === String(body.couponCode).toUpperCase() && x.active);
      if (c && (!c.minimumOrder || subtotal >= c.minimumOrder)) {
        discountAmount = c.discountType === 'PERCENTAGE' ? Math.round((subtotal * c.discountValue) / 100) : c.discountValue;
        if (c.upto && discountAmount > c.upto) discountAmount = c.upto;
      }
    }

    const netTotal = Math.max(0, subtotal - discountAmount);
    const nextId = state.orders.reduce((m, o) => Math.max(m, o.id), 0) + 1;
    const tokenNum = `TKN-${1000 + Math.floor(Math.random() * 9000)}`;
    const deliveryType = body.deliveryType || 'DINE_IN';
    const requiresOtp = deliveryType === 'HOME_DELIVERY' || deliveryType === 'TAKEAWAY';
    const otp = requiresOtp ? String(1000 + Math.floor(Math.random() * 9000)) : null;

    const order = {
      id: nextId,
      userId: currentUser?.id || 4,
      token_number: tokenNum,
      qr_data: `ORD-${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
      Total: netTotal,
      total: netTotal,
      discountAmount,
      number_of_times_user_tried_payment: 0,
      created_at: new Date().toISOString(),
      orderStatus: 'Placed',
      deliveryType,
      deliveryAddress: deliveryType === 'HOME_DELIVERY' ? body.deliveryAddress : null,
      tableNumber: deliveryType === 'DINE_IN' ? body.tableNumber || 'Table 1' : null,
      paid: true,
      otp_verify: otp,
      chefName: null,
      waiterName: null,
      couponCode: body.couponCode || null,
      refund_status: false,
      refund_reason: null,
      items,
      menuIds: body.menuIds || [],
      tracking: [
        { status: 'Placed', updatedBy: currentUser?.name || 'Customer', remarks: 'Order placed & paid', timestamp: new Date().toISOString() }
      ]
    };
    state.orders.unshift(order);
    return sendJson(res, 201, order);
  }

  if (pathname === '/api/orders/my-orders' && method === 'GET') {
    const uid = currentUser?.id;
    const list = uid ? state.orders.filter((o) => !o.userId || o.userId === uid) : state.orders;
    return sendJson(res, 200, list);
  }

  if (pathname === '/api/orders/all' && method === 'GET') {
    return sendJson(res, 200, state.orders);
  }

  if (pathname === '/api/orders/kitchen' && method === 'GET') {
    const cutoff = Date.now() - 30 * 60 * 1000;
    const activeKitchen = state.orders.filter(
      (o) =>
        !o.refund_status &&
        (o.orderStatus === 'Placed' || o.orderStatus === 'Preparing') &&
        new Date(o.created_at).getTime() >= cutoff
    );
    return sendJson(res, 200, activeKitchen);
  }

  if (pathname === '/api/orders/waiter' && method === 'GET') {
    const readyList = state.orders.filter((o) => !o.refund_status && o.orderStatus === 'Ready');
    return sendJson(res, 200, readyList);
  }

  const trackMatch = pathname.match(/^\/api\/orders\/track\/(.+)$/);
  if (trackMatch && method === 'GET') {
    const raw = decodeURIComponent(trackMatch[1]).trim().toUpperCase().replace(/^#/, '');
    const prefixed = raw.startsWith('TKN-') ? raw : `TKN-${raw.replace(/^TKN[\s-]*/, '')}`;
    const order = state.orders.find(
      (o) => o.token_number.toUpperCase() === raw || o.token_number.toUpperCase() === prefixed
    );
    if (!order) return sendJson(res, 404, { message: `Order not found with token: ${raw}` });
    return sendJson(res, 200, order);
  }

  const assignChefMatch = pathname.match(/^\/api\/orders\/(\d+)\/assign-chef$/);
  if (assignChefMatch && method === 'PUT') {
    const order = state.orders.find((o) => o.id === Number(assignChefMatch[1]));
    if (!order) return sendJson(res, 404, { message: 'Order not found' });
    order.orderStatus = 'Preparing';
    order.chefName = currentUser?.name || 'Head Chef Viktor';
    return sendJson(res, 200, order);
  }

  const statusMatch = pathname.match(/^\/api\/orders\/(\d+)\/status$/);
  if (statusMatch && method === 'PUT') {
    const order = state.orders.find((o) => o.id === Number(statusMatch[1]));
    if (!order) return sendJson(res, 404, { message: 'Order not found' });
    const body = await readBody(req);
    order.orderStatus = body.status || 'Ready';
    return sendJson(res, 200, order);
  }

  const verifyOtpMatch = pathname.match(/^\/api\/orders\/(\d+)\/verify-otp$/);
  if (verifyOtpMatch && method === 'POST') {
    const order = state.orders.find((o) => o.id === Number(verifyOtpMatch[1]));
    if (!order) return sendJson(res, 404, { message: 'Order not found' });
    const body = await readBody(req);
    if (String(body.otp || '').trim() !== String(order.otp_verify || '').trim()) {
      return sendJson(res, 400, { message: 'Invalid OTP! Please verify the 4-digit OTP from the customer.' });
    }
    order.orderStatus = 'Collected';
    order.waiterName = currentUser?.name || 'Senior Waiter Kabir';
    return sendJson(res, 200, order);
  }

  const serveMatch = pathname.match(/^\/api\/orders\/(\d+)\/serve$/);
  if (serveMatch && method === 'PUT') {
    const order = state.orders.find((o) => o.id === Number(serveMatch[1]));
    if (!order) return sendJson(res, 404, { message: 'Order not found' });
    order.orderStatus = 'Collected';
    order.waiterName = currentUser?.name || 'Senior Waiter Kabir';
    return sendJson(res, 200, order);
  }

  const cancelOrderMatch = pathname.match(/^\/api\/orders\/(\d+)\/cancel$/);
  if (cancelOrderMatch && method === 'PUT') {
    const order = state.orders.find((o) => o.id === Number(cancelOrderMatch[1]));
    if (!order) return sendJson(res, 404, { message: 'Order not found' });
    const body = await readBody(req);
    order.refund_status = true;
    order.refund_reason = body.reason || 'Customer cancelled';
    order.orderStatus = 'Refunded';
    return sendJson(res, 200, order);
  }

  // ==========================================
  // 6. TABLES & TABLE BOOKINGS
  // ==========================================
  if (pathname === '/api/tables' && method === 'GET') {
    return sendJson(res, 200, state.tables);
  }
  if (pathname === '/api/tables' && method === 'POST') {
    const body = await readBody(req);
    const nextId = state.tables.reduce((m, t) => Math.max(m, t.id), 0) + 1;
    const t = { id: nextId, tableNumber: body.tableNumber, capacity: Number(body.capacity) || 4, section: body.section || 'Indoor', active: true };
    state.tables.push(t);
    return sendJson(res, 201, t);
  }

  if (pathname === '/api/table-bookings/book' && method === 'POST') {
    const body = await readBody(req);
    const table = state.tables.find((t) => t.id === Number(body.tableId)) || state.tables[0];
    const nextId = state.bookings.reduce((m, b) => Math.max(m, b.id), 0) + 1;
    const booking = {
      id: nextId,
      table,
      user: currentUser || { id: 4, name: 'Customer', phoneNumber: '9876543210' },
      bookingDate: body.bookingDate,
      startTime: body.startTime,
      endTime: body.endTime,
      durationMinutes: 60,
      guestCount: Number(body.guestCount) || 2,
      specialRequest: body.specialRequest || '',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };
    state.bookings.unshift(booking);
    return sendJson(res, 201, booking);
  }

  if ((pathname === '/api/table-bookings/my-bookings' || pathname === '/api/table-bookings/all') && method === 'GET') {
    return sendJson(res, 200, state.bookings);
  }

  const bookingActionMatch = pathname.match(/^\/api\/table-bookings\/(\d+)\/(cancel|complete)$/);
  if (bookingActionMatch && method === 'PUT') {
    const b = state.bookings.find((x) => x.id === Number(bookingActionMatch[1]));
    if (!b) return sendJson(res, 404, { message: 'Booking not found' });
    b.status = bookingActionMatch[2] === 'cancel' ? 'CANCELLED' : 'COMPLETED';
    return sendJson(res, 200, b);
  }

  // ==========================================
  // 7. PAYMENTS, FEEDBACK, UPLOAD & PROJECT
  // ==========================================
  if (pathname === '/api/payments/all' && method === 'GET') return sendJson(res, 200, state.payments);
  if (pathname === '/api/payments/refunds' && method === 'GET') return sendJson(res, 200, state.refunds);

  if (pathname === '/api/feedback' && method === 'GET') return sendJson(res, 200, state.feedbacks);
  if (pathname === '/api/feedback' && method === 'POST') {
    const body = await readBody(req);
    const fb = {
      id: state.feedbacks.length + 1,
      userName: body.userName || 'Guest',
      message: body.message || '',
      star_by_user: Number(body.star_by_user) || 5,
      createdAt: new Date().toISOString()
    };
    state.feedbacks.push(fb);
    return sendJson(res, 201, fb);
  }

  if (pathname === '/api/project/contact' && method === 'POST') {
    return sendJson(res, 200, { message: 'Thank you for contacting Grand Royale! Our team will reach out shortly.' });
  }

  if (pathname === '/api/upload/image' && method === 'POST') {
    return sendJson(res, 200, {
      url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500',
      filename: 'uploaded-dish.jpg',
      message: 'Image uploaded successfully'
    });
  }

  return sendJson(res, 404, { message: `Endpoint not found: ${method} ${pathname}`, search: Object.fromEntries(searchParams) });
};
