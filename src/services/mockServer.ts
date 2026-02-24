import {
  mockUsers, mockProducts, mockCategories, mockLocations, mockSuppliers,
  mockStocks, mockMovements, mockPurchaseOrders, mockSalesRecords,
  mockTopProducts, getProductDetail,
} from './mockData';

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

// Simple route matcher
function matchRoute(method: string, path: string, pattern: string, expectedMethod: string) {
  if (method !== expectedMethod) return null;
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

export async function handleMockRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string>
): Promise<T> {
  await delay(200 + Math.random() * 300);

  let m: Record<string, string> | null;

  // Auth
  if (method === 'POST' && path === '/auth/login') {
    const b = body as { email: string; password: string };
    const user = mockUsers.find(u => u.email === b.email);
    if (!user) throw { message: 'Invalid credentials', errors: { email: ['User not found'] } };
    return { token: 'mock-jwt-token-' + user.id, user } as T;
  }

  if (method === 'POST' && path === '/auth/register') {
    const b = body as { name: string; email: string; password: string };
    const existing = mockUsers.find(u => u.email.toLowerCase() === b.email.toLowerCase());
    if (existing) throw { message: 'Email already exists', errors: { email: ['Email already exists'] } };

    const newUser = {
      id: mockUsers.length + 10,
      name: b.name,
      email: b.email,
      role: 'CASHIER' as const,
    };

    mockUsers.push(newUser);
    return { token: 'mock-jwt-token-' + newUser.id, user: newUser } as T;
  }

  if (method === 'GET' && path === '/auth/me') {
    return { user: mockUsers[0] } as T;
  }

  // Categories
  if (method === 'GET' && path === '/categories') {
    return { data: mockCategories } as T;
  }
  if (method === 'POST' && path === '/categories') {
    const b = body as { name: string };
    const newCat = { id: mockCategories.length + 10, name: b.name };
    mockCategories.push(newCat);
    return newCat as T;
  }
  m = matchRoute(method, path, '/categories/:id', 'PUT');
  if (m) {
    const cat = mockCategories.find(c => c.id === Number(m!.id));
    if (!cat) throw { message: 'Not found' };
    const b = body as { name: string };
    cat.name = b.name;
    return cat as T;
  }
  m = matchRoute(method, path, '/categories/:id', 'DELETE');
  if (m) {
    const idx = mockCategories.findIndex(c => c.id === Number(m!.id));
    if (idx >= 0) mockCategories.splice(idx, 1);
    return undefined as T;
  }

  // Users
  if (method === 'GET' && path === '/users') {
    return { data: mockUsers } as T;
  }
  if (method === 'POST' && path === '/users') {
    const b = body as { name: string; email: string; role: string };
    const newUser = { id: mockUsers.length + 10, name: b.name, email: b.email, role: b.role as any };
    mockUsers.push(newUser);
    return newUser as T;
  }
  m = matchRoute(method, path, '/users/:id', 'PUT');
  if (m) {
    const u = mockUsers.find(u => u.id === Number(m!.id));
    if (!u) throw { message: 'Not found' };
    Object.assign(u, body);
    return u as T;
  }
  m = matchRoute(method, path, '/users/:id', 'DELETE');
  if (m) {
    const idx = mockUsers.findIndex(u => u.id === Number(m!.id));
    if (idx >= 0) mockUsers.splice(idx, 1);
    return undefined as T;
  }

  // Products
  if (method === 'GET' && path === '/products') {
    let filtered = [...mockProducts];
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        p.barcode.toLowerCase().includes(s) ||
        (p.brand || '').toLowerCase().includes(s)
      );
    }
    if (params?.categoryId) filtered = filtered.filter(p => p.categoryId === Number(params.categoryId));
    if (params?.locationId) filtered = filtered.filter(p => p.locationId === Number(params.locationId));
    if (params?.status === 'active') filtered = filtered.filter(p => p.active);
    if (params?.status === 'inactive') filtered = filtered.filter(p => !p.active);
    const page = Number(params?.page || 1);
    const perPage = 10;
    return { data: filtered.slice((page - 1) * perPage, page * perPage), meta: { page, perPage, total: filtered.length } } as T;
  }

  m = matchRoute(method, path, '/products/:id', 'GET');
  if (m) {
    const detail = getProductDetail(Number(m.id));
    if (!detail) throw { message: 'Not found' };
    return detail as T;
  }

  if (method === 'POST' && path === '/products') {
    const b = body as {
      sku: string;
      barcode: string;
      name: string;
      brand?: string;
      unit?: string;
      description?: string;
      price: number;
      cost: number;
      categoryId: number;
      locationId?: number;
      reorderLevel?: number;
      taxRate?: number;
      active: boolean;
    };
    const nextId = mockProducts.length ? Math.max(...mockProducts.map(p => p.id)) + 1 : 101;
    const newProduct = {
      id: nextId,
      sku: b.sku,
      barcode: b.barcode || `48000000${String(nextId).padStart(4, '0')}`,
      name: b.name,
      brand: b.brand || '',
      unit: b.unit || 'Piece',
      description: b.description || '',
      price: Number(b.price),
      cost: Number(b.cost),
      categoryId: Number(b.categoryId),
      locationId: b.locationId ? Number(b.locationId) : 1,
      reorderLevel: Number(b.reorderLevel ?? 10),
      taxRate: Number(b.taxRate ?? 12),
      active: Boolean(b.active),
    };

    mockProducts.push(newProduct);
    mockStocks.push({
      productId: newProduct.id,
      sku: newProduct.sku,
      name: newProduct.name,
      onHand: 0,
      reorderLevel: newProduct.reorderLevel,
    });
    return newProduct as T;
  }

  m = matchRoute(method, path, '/products/:id', 'PUT');
  if (m) {
    const product = mockProducts.find(p => p.id === Number(m.id));
    if (!product) throw { message: 'Not found' };
    const updates = body as Partial<typeof product>;
    Object.assign(product, updates);

    const stock = mockStocks.find(s => s.productId === product.id);
    if (stock) {
      stock.sku = product.sku;
      stock.name = product.name;
      stock.reorderLevel = product.reorderLevel ?? stock.reorderLevel;
    }

    return product as T;
  }

  m = matchRoute(method, path, '/products/:id', 'DELETE');
  if (m) {
    const id = Number(m.id);
    const idx = mockProducts.findIndex(p => p.id === id);
    if (idx === -1) throw { message: 'Not found' };
    mockProducts.splice(idx, 1);
    const stockIdx = mockStocks.findIndex(s => s.productId === id);
    if (stockIdx >= 0) mockStocks.splice(stockIdx, 1);
    return undefined as T;
  }

  // POS products
  if (method === 'GET' && path === '/pos/products') {
    let filtered = mockProducts.filter(p => p.active);
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s) || p.barcode.includes(s));
    }
    if (params?.categoryId) filtered = filtered.filter(p => p.categoryId === Number(params.categoryId));
    if (params?.locationId) filtered = filtered.filter(p => p.locationId === Number(params.locationId));
    return { data: filtered, meta: { page: 1, perPage: 50, total: filtered.length } } as T;
  }

  // Price preview
  if (method === 'POST' && path === '/pos/cart/price-preview') {
    const b = body as { items: { qty: number; price: number }[]; discount?: { type: string; value: number }; taxRate: number };
    const subtotal = b.items.reduce((s, i) => s + i.qty * i.price, 0);
    let discountTotal = 0;
    if (b.discount) {
      discountTotal = b.discount.type === 'PERCENT' ? subtotal * b.discount.value / 100 : b.discount.value;
    }
    const afterDiscount = subtotal - discountTotal;
    const taxTotal = Math.round(afterDiscount * b.taxRate * 100) / 100;
    return { subtotal, discountTotal, taxTotal, grandTotal: Math.round((afterDiscount + taxTotal) * 100) / 100 } as T;
  }

  // Create sale
  if (method === 'POST' && path === '/sales') {
    return {
      id: 9000 + Math.floor(Math.random() * 1000),
      saleNo: `SALE-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
      grandTotal: 181.44,
      status: 'PAID',
    } as T;
  }

  // Receipt
  m = matchRoute(method, path, '/sales/:id/receipt', 'GET');
  if (m) {
    return {
      saleNo: 'SALE-2026-0001',
      location: { id: 1, name: 'Main Branch' },
      cashier: { id: 3, name: 'Cashier One' },
      items: [{ productId: 101, name: 'Iced Coffee', qty: 2, unitPrice: 90, lineTotal: 180 }],
      subtotal: 180, discountTotal: 18, taxTotal: 19.44, grandTotal: 181.44,
      payment: { type: 'SPLIT', cash: 100, card: 81.44 },
      createdAt: '2026-02-22T10:15:00Z',
    } as T;
  }

  // Locations
  if (method === 'GET' && path === '/locations') {
    return { data: mockLocations } as T;
  }

  // Inventory stocks
  if (method === 'GET' && path === '/inventory/stocks') {
    let filtered = [...mockStocks];
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(i => i.name.toLowerCase().includes(s) || i.sku.toLowerCase().includes(s));
    }
    return { data: filtered, meta: { page: 1, perPage: 20, total: filtered.length } } as T;
  }

  // Low stock
  if (method === 'GET' && path === '/inventory/low-stock') {
    return { data: mockStocks.filter(s => s.onHand <= s.reorderLevel) } as T;
  }

  // Movements
  if (method === 'GET' && path === '/inventory/movements') {
    let filtered = [...mockMovements];
    if (params?.type) filtered = filtered.filter(m => m.type === params.type);
    return { data: filtered, meta: { page: 1, perPage: 20, total: filtered.length } } as T;
  }

  // Adjustments
  if (method === 'POST' && path === '/inventory/adjustments') {
    const b = body as { locationId: number; productId: number; qtyChange: number; reason: string };
    return {
      id: 7000 + Math.floor(Math.random() * 1000),
      type: 'ADJUSTMENT',
      referenceNo: `ADJ-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      locationId: b.locationId,
      productId: b.productId,
      qtyChange: b.qtyChange,
      reason: b.reason,
      createdAt: new Date().toISOString(),
    } as T;
  }

  // Suppliers
  if (method === 'GET' && path === '/suppliers') {
    return { data: mockSuppliers } as T;
  }

  // Purchase orders
  if (method === 'GET' && path === '/purchase-orders') {
    return { data: mockPurchaseOrders, meta: { page: 1, perPage: 10, total: mockPurchaseOrders.length } } as T;
  }

  m = matchRoute(method, path, '/purchase-orders/:id', 'GET');
  if (m) {
    const po = mockPurchaseOrders.find(p => p.id === Number(m!.id));
    if (!po) throw { message: 'Not found' };
    return {
      ...po,
      supplier: mockSuppliers.find(s => s.id === po.supplierId),
      location: mockLocations.find(l => l.id === po.locationId),
    } as T;
  }

  if (method === 'POST' && path === '/purchase-orders') {
    return {
      id: 8000 + Math.floor(Math.random() * 1000),
      poNo: `PO-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      ...body as object,
    } as T;
  }

  m = matchRoute(method, path, '/purchase-orders/:id/receive', 'POST');
  if (m) {
    return { id: Number(m.id), poNo: `PO-2026-0001`, status: 'RECEIVED', receivedAt: new Date().toISOString() } as T;
  }

  // Reports
  if (method === 'GET' && path === '/reports/summary') {
    return {
      dateFrom: params?.dateFrom || '2026-02-16',
      dateTo: params?.dateTo || '2026-02-22',
      locationId: Number(params?.locationId || 1),
      salesTotal: 52340.50,
      ordersCount: 342,
      avgOrderValue: 153.04,
    } as T;
  }

  if (method === 'GET' && path === '/reports/sales') {
    const page = Number(params?.page || 1);
    return {
      data: mockSalesRecords.slice((page - 1) * 10, page * 10),
      meta: { page, perPage: 10, total: mockSalesRecords.length },
    } as T;
  }

  if (method === 'GET' && path === '/reports/top-products') {
    return { data: mockTopProducts } as T;
  }

  throw { message: `Mock: No handler for ${method} ${path}` };
}
