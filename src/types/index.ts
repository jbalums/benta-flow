// Auth
export type Role = 'ADMIN' | 'MANAGER' | 'CASHIER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Pagination
export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Categories
export interface Category {
  id: number;
  name: string;
}

// Products
export interface Product {
  id: number;
  sku: string;
  barcode: string;
  name: string;
  price: number;
  cost: number;
  categoryId: number;
  locationId?: number;
  brand?: string;
  unit?: string;
  description?: string;
  reorderLevel?: number;
  taxRate?: number;
  active: boolean;
}

export interface ProductDetail extends Product {
  stockByLocation: StockByLocation[];
}

export interface StockByLocation {
  locationId: number;
  locationName: string;
  onHand: number;
  reserved: number;
}

// Locations
export interface Location {
  id: number;
  name: string;
}

// Inventory
export interface StockItem {
  productId: number;
  sku: string;
  name: string;
  onHand: number;
  reorderLevel: number;
}

export interface LowStockItem {
  productId: number;
  sku: string;
  name: string;
  onHand: number;
  reorderLevel: number;
}

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE' | 'PURCHASE_RECEIVE';

export interface InventoryMovement {
  id: number;
  type: MovementType;
  referenceNo: string;
  locationId: number;
  locationName: string;
  productId: number;
  productName: string;
  qtyChange: number;
  performedBy: { id: number; name: string };
  createdAt: string;
}

// Adjustments
export interface AdjustmentRequest {
  locationId: number;
  productId: number;
  qtyChange: number;
  reason: string;
  notes?: string;
}

export interface AdjustmentResponse {
  id: number;
  type: string;
  referenceNo: string;
  locationId: number;
  productId: number;
  qtyChange: number;
  reason: string;
  createdAt: string;
}

// Suppliers
export interface Supplier {
  id: number;
  name: string;
}

// Purchase Orders
export type POStatus = 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderLineItem {
  productId: number;
  productName?: string;
  qty: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: number;
  poNo: string;
  status: POStatus;
  supplierName?: string;
  supplier?: Supplier;
  locationName?: string;
  location?: Location;
  locationId?: number;
  supplierId?: number;
  expectedDate: string;
  items?: PurchaseOrderLineItem[];
  createdAt: string;
}

export interface CreatePORequest {
  supplierId: number;
  locationId: number;
  expectedDate: string;
  items: { productId: number; qty: number; unitCost: number }[];
}

export interface ReceivePORequest {
  receivedAt: string;
  items: { productId: number; qtyReceived: number }[];
}

// POS / Sales
export interface CartItem {
  productId: number;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
}

export interface Discount {
  type: 'PERCENT' | 'FIXED';
  value: number;
}

export interface PricePreviewRequest {
  locationId: number;
  items: { productId: number; qty: number; price: number }[];
  discount?: Discount;
  taxRate: number;
}

export interface PricePreview {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
}

export type PaymentType = 'CASH' | 'CARD' | 'SPLIT';

export interface Payment {
  type: PaymentType;
  cash?: number;
  card?: number;
}

export interface CreateSaleRequest {
  locationId: number;
  cashierId: number;
  items: { productId: number; qty: number; unitPrice: number }[];
  discount?: Discount;
  taxRate: number;
  payment: Payment;
}

export interface SaleResponse {
  id: number;
  saleNo: string;
  createdAt: string;
  grandTotal: number;
  status: string;
}

export interface Receipt {
  saleNo: string;
  location: Location;
  cashier: { id: number; name: string };
  items: { productId: number; name: string; qty: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  payment: Payment;
  createdAt: string;
}

// Reports
export interface ReportSummary {
  dateFrom: string;
  dateTo: string;
  locationId: number;
  salesTotal: number;
  ordersCount: number;
  avgOrderValue: number;
}

export interface SaleRecord {
  id: number;
  saleNo: string;
  cashierName: string;
  locationName: string;
  grandTotal: number;
  createdAt: string;
}

export interface TopProduct {
  productId: number;
  productName: string;
  qtySold: number;
  revenue: number;
}

// API Error
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
