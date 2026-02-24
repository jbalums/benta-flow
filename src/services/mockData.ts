import type {
  User, Product, ProductDetail, Category, Location, StockItem,
  LowStockItem, InventoryMovement, Supplier, PurchaseOrder, TopProduct, SaleRecord
} from '@/types';

export const mockUsers: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@stockpilot.com', role: 'ADMIN' },
  { id: 2, name: 'Manager Jane', email: 'manager@stockpilot.com', role: 'MANAGER' },
  { id: 3, name: 'Cashier One', email: 'cashier@stockpilot.com', role: 'CASHIER' },
];

export const mockCategories: Category[] = [
  { id: 1, name: 'Drinks' },
  { id: 2, name: 'Food' },
  { id: 3, name: 'Dessert' },
];

export const mockLocations: Location[] = [
  { id: 1, name: 'Main Branch' },
  { id: 2, name: 'Warehouse' },
];

export const mockSuppliers: Supplier[] = [
  { id: 201, name: 'FreshGoods Supplier' },
  { id: 202, name: 'Metro Distributors' },
];

export const mockProducts: Product[] = [
  { id: 101, sku: 'SKU-001', barcode: '480000000001', name: 'Iced Coffee', brand: 'BentaFlow House', unit: 'Cup', description: 'Fresh brewed arabica served over ice.', price: 90, cost: 45, categoryId: 1, locationId: 1, reorderLevel: 18, taxRate: 12, active: true },
  { id: 102, sku: 'SKU-002', barcode: '480000000002', name: 'Burger Classic', brand: 'BentaFlow Grill', unit: 'Piece', description: 'Single patty burger with signature sauce.', price: 120, cost: 55, categoryId: 2, locationId: 1, reorderLevel: 14, taxRate: 12, active: true },
  { id: 103, sku: 'SKU-003', barcode: '480000000003', name: 'Hot Latte', brand: 'BentaFlow House', unit: 'Cup', description: 'Steamed milk and espresso blend.', price: 110, cost: 40, categoryId: 1, locationId: 1, reorderLevel: 16, taxRate: 12, active: true },
  { id: 104, sku: 'SKU-004', barcode: '480000000004', name: 'Chicken Wrap', brand: 'BentaFlow Grill', unit: 'Piece', description: 'Tortilla wrap with grilled chicken strips.', price: 95, cost: 42, categoryId: 2, locationId: 1, reorderLevel: 12, taxRate: 12, active: true },
  { id: 105, sku: 'SKU-005', barcode: '480000000005', name: 'Mango Shake', brand: 'BentaFlow House', unit: 'Cup', description: 'Fresh mango puree and milk blend.', price: 85, cost: 35, categoryId: 1, locationId: 1, reorderLevel: 12, taxRate: 12, active: true },
  { id: 106, sku: 'SKU-006', barcode: '480000000006', name: 'French Fries', brand: 'BentaFlow Grill', unit: 'Pack', description: 'Crispy seasoned fries.', price: 65, cost: 25, categoryId: 2, locationId: 2, reorderLevel: 20, taxRate: 12, active: true },
  { id: 107, sku: 'SKU-007', barcode: '480000000007', name: 'Cheesecake Slice', brand: 'BentaFlow Bakery', unit: 'Slice', description: 'Creamy baked cheesecake slice.', price: 140, cost: 60, categoryId: 3, locationId: 2, reorderLevel: 10, taxRate: 12, active: true },
  { id: 108, sku: 'SKU-008', barcode: '480000000008', name: 'Green Tea', brand: 'BentaFlow House', unit: 'Cup', description: 'Premium green tea infusion.', price: 75, cost: 30, categoryId: 1, locationId: 2, reorderLevel: 12, taxRate: 12, active: true },
  { id: 109, sku: 'SKU-009', barcode: '480000000009', name: 'Pasta Carbonara', brand: 'BentaFlow Kitchen', unit: 'Bowl', description: 'Creamy carbonara with bacon bits.', price: 160, cost: 70, categoryId: 2, locationId: 2, reorderLevel: 9, taxRate: 12, active: true },
  { id: 110, sku: 'SKU-010', barcode: '480000000010', name: 'Brownie', brand: 'BentaFlow Bakery', unit: 'Piece', description: 'Fudge brownie with dark chocolate.', price: 80, cost: 30, categoryId: 3, locationId: 1, reorderLevel: 15, taxRate: 12, active: true },
  { id: 111, sku: 'SKU-011', barcode: '480000000011', name: 'Americano', brand: 'BentaFlow House', unit: 'Cup', description: 'Strong espresso and hot water.', price: 70, cost: 25, categoryId: 1, locationId: 1, reorderLevel: 12, taxRate: 12, active: false },
  { id: 112, sku: 'SKU-012', barcode: '480000000012', name: 'Club Sandwich', brand: 'BentaFlow Kitchen', unit: 'Piece', description: 'Triple-layer toasted sandwich.', price: 130, cost: 55, categoryId: 2, locationId: 2, reorderLevel: 10, taxRate: 12, active: true },
];

export const mockStocks: StockItem[] = mockProducts.map(p => ({
  productId: p.id,
  sku: p.sku,
  name: p.name,
  onHand: Math.floor(Math.random() * 80) + 5,
  reorderLevel: p.reorderLevel ?? 10,
}));

// Make some items low stock
mockStocks[1].onHand = 8;
mockStocks[5].onHand = 3;
mockStocks[9].onHand = 7;

export const getProductDetail = (id: number): ProductDetail | undefined => {
  const p = mockProducts.find(x => x.id === id);
  if (!p) return undefined;
  return {
    ...p,
    stockByLocation: [
      { locationId: 1, locationName: 'Main Branch', onHand: mockStocks.find(s => s.productId === id)?.onHand ?? 0, reserved: 0 },
      { locationId: 2, locationName: 'Warehouse', onHand: Math.floor(Math.random() * 120) + 20, reserved: 0 },
    ],
  };
};

export const mockMovements: InventoryMovement[] = [
  { id: 5001, type: 'SALE', referenceNo: 'SALE-2026-0001', locationId: 1, locationName: 'Main Branch', productId: 101, productName: 'Iced Coffee', qtyChange: -2, performedBy: { id: 3, name: 'Cashier One' }, createdAt: '2026-02-22T10:15:00Z' },
  { id: 5002, type: 'PURCHASE_RECEIVE', referenceNo: 'PO-2026-0001', locationId: 2, locationName: 'Warehouse', productId: 101, productName: 'Iced Coffee', qtyChange: 50, performedBy: { id: 2, name: 'Manager Jane' }, createdAt: '2026-02-21T14:00:00Z' },
  { id: 5003, type: 'ADJUSTMENT', referenceNo: 'ADJ-2026-0001', locationId: 1, locationName: 'Main Branch', productId: 107, productName: 'Cheesecake Slice', qtyChange: -1, performedBy: { id: 1, name: 'Admin User' }, createdAt: '2026-02-20T09:30:00Z' },
  { id: 5004, type: 'SALE', referenceNo: 'SALE-2026-0002', locationId: 1, locationName: 'Main Branch', productId: 102, productName: 'Burger Classic', qtyChange: -3, performedBy: { id: 3, name: 'Cashier One' }, createdAt: '2026-02-20T11:45:00Z' },
  { id: 5005, type: 'IN', referenceNo: 'MAN-2026-0001', locationId: 2, locationName: 'Warehouse', productId: 106, productName: 'French Fries', qtyChange: 100, performedBy: { id: 2, name: 'Manager Jane' }, createdAt: '2026-02-19T08:00:00Z' },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 8001, poNo: 'PO-2026-0001', status: 'DRAFT', supplierName: 'FreshGoods Supplier', supplierId: 201, locationName: 'Warehouse', locationId: 2, expectedDate: '2026-02-25', items: [{ productId: 101, productName: 'Iced Coffee', qty: 50, unitCost: 45 }], createdAt: '2026-02-22T12:00:00Z' },
  { id: 8002, poNo: 'PO-2026-0002', status: 'SENT', supplierName: 'Metro Distributors', supplierId: 202, locationName: 'Main Branch', locationId: 1, expectedDate: '2026-02-26', items: [{ productId: 102, productName: 'Burger Classic', qty: 30, unitCost: 55 }], createdAt: '2026-02-21T09:00:00Z' },
  { id: 8003, poNo: 'PO-2026-0003', status: 'RECEIVED', supplierName: 'FreshGoods Supplier', supplierId: 201, locationName: 'Warehouse', locationId: 2, expectedDate: '2026-02-20', items: [{ productId: 105, productName: 'Mango Shake', qty: 40, unitCost: 35 }], createdAt: '2026-02-18T10:00:00Z' },
];

export const mockSalesRecords: SaleRecord[] = Array.from({ length: 20 }, (_, i) => ({
  id: 9001 + i,
  saleNo: `SALE-2026-${String(i + 1).padStart(4, '0')}`,
  cashierName: i % 2 === 0 ? 'Cashier One' : 'Manager Jane',
  locationName: 'Main Branch',
  grandTotal: Math.round((Math.random() * 500 + 50) * 100) / 100,
  createdAt: new Date(2026, 1, 22 - Math.floor(i / 3), 8 + i, 0).toISOString(),
}));

export const mockTopProducts: TopProduct[] = [
  { productId: 101, productName: 'Iced Coffee', qtySold: 120, revenue: 10800 },
  { productId: 102, productName: 'Burger Classic', qtySold: 85, revenue: 10200 },
  { productId: 103, productName: 'Hot Latte', qtySold: 70, revenue: 7700 },
  { productId: 109, productName: 'Pasta Carbonara', qtySold: 45, revenue: 7200 },
  { productId: 105, productName: 'Mango Shake', qtySold: 60, revenue: 5100 },
];

export const mockDailySales = [
  { date: 'Feb 16', sales: 6200 },
  { date: 'Feb 17', sales: 7800 },
  { date: 'Feb 18', sales: 5400 },
  { date: 'Feb 19', sales: 8900 },
  { date: 'Feb 20', sales: 7200 },
  { date: 'Feb 21', sales: 9100 },
  { date: 'Feb 22', sales: 7640 },
];
