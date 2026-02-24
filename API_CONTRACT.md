# StockPilot POS — API Contract

All endpoints except `POST /auth/login` require `Authorization: Bearer <token>` header.

## Error Response Shape
```json
{
  "message": "Validation failed",
  "errors": { "field": ["Reason..."] }
}
```

---

## Authentication

### POST /auth/login
**Request:**
```json
{ "email": "admin@stockpilot.com", "password": "password" }
```
**Response 200:**
```json
{ "token": "dummy-jwt-token", "user": { "id": 1, "name": "Admin User", "email": "admin@stockpilot.com", "role": "ADMIN" } }
```

### GET /auth/me
**Response 200:**
```json
{ "user": { "id": 1, "name": "Admin User", "email": "admin@stockpilot.com", "role": "ADMIN" } }
```

---

## POS

### GET /pos/products?search=&categoryId=&page=
**Response 200:**
```json
{
  "data": [
    { "id": 101, "sku": "SKU-001", "barcode": "480000000001", "name": "Iced Coffee", "price": 90, "categoryId": 1, "active": true }
  ],
  "meta": { "page": 1, "perPage": 10, "total": 20 }
}
```

### POST /pos/cart/price-preview
**Request:**
```json
{
  "locationId": 1,
  "items": [{ "productId": 101, "qty": 2, "price": 90 }],
  "discount": { "type": "PERCENT", "value": 10 },
  "taxRate": 0.12
}
```
**Response 200:**
```json
{ "subtotal": 180, "discountTotal": 18, "taxTotal": 19.44, "grandTotal": 181.44 }
```

### POST /sales
**Request:**
```json
{
  "locationId": 1, "cashierId": 3,
  "items": [{ "productId": 101, "qty": 2, "unitPrice": 90 }],
  "discount": { "type": "PERCENT", "value": 10 },
  "taxRate": 0.12,
  "payment": { "type": "SPLIT", "cash": 100, "card": 81.44 }
}
```
**Response 201:**
```json
{ "id": 9001, "saleNo": "SALE-2026-0001", "createdAt": "2026-02-22T10:15:00Z", "grandTotal": 181.44, "status": "PAID" }
```

### GET /sales/:id/receipt
**Response 200:**
```json
{
  "saleNo": "SALE-2026-0001",
  "location": { "id": 1, "name": "Main Branch" },
  "cashier": { "id": 3, "name": "Cashier One" },
  "items": [{ "productId": 101, "name": "Iced Coffee", "qty": 2, "unitPrice": 90, "lineTotal": 180 }],
  "subtotal": 180, "discountTotal": 18, "taxTotal": 19.44, "grandTotal": 181.44,
  "payment": { "type": "SPLIT", "cash": 100, "card": 81.44 },
  "createdAt": "2026-02-22T10:15:00Z"
}
```

---

## Products

### GET /products?search=&categoryId=&status=&page=
**Response 200:**
```json
{
  "data": [{ "id": 101, "sku": "SKU-001", "barcode": "480000000001", "name": "Iced Coffee", "price": 90, "cost": 45, "categoryId": 1, "active": true }],
  "meta": { "page": 1, "perPage": 10, "total": 20 }
}
```

### POST /products
**Request:**
```json
{ "sku": "SKU-010", "barcode": "480000000010", "name": "Fries Large", "price": 80, "cost": 35, "categoryId": 2, "active": true }
```
**Response 201:**
```json
{ "id": 110, "sku": "SKU-010", "barcode": "480000000010", "name": "Fries Large", "price": 80, "cost": 35, "categoryId": 2, "active": true }
```

### PUT /products/:id
**Response 200:** Updated product object

### GET /products/:id
**Response 200:** Product object with `stockByLocation` array

### GET /categories
**Response 200:**
```json
{ "data": [{ "id": 1, "name": "Drinks" }, { "id": 2, "name": "Food" }] }
```

### POST /categories
**Response 201:**
```json
{ "id": 3, "name": "Dessert" }
```

---

## Inventory

### GET /locations
**Response 200:**
```json
{ "data": [{ "id": 1, "name": "Main Branch" }, { "id": 2, "name": "Warehouse" }] }
```

### GET /inventory/stocks?locationId=&search=
**Response 200:**
```json
{
  "data": [{ "productId": 101, "sku": "SKU-001", "name": "Iced Coffee", "onHand": 50, "reorderLevel": 10 }],
  "meta": { "page": 1, "perPage": 20, "total": 50 }
}
```

### GET /inventory/low-stock?locationId=
**Response 200:**
```json
{ "data": [{ "productId": 102, "sku": "SKU-002", "name": "Burger Classic", "onHand": 8, "reorderLevel": 10 }] }
```

### GET /inventory/movements?locationId=&type=&dateFrom=&dateTo=&page=
**Response 200:**
```json
{
  "data": [{
    "id": 5001, "type": "SALE", "referenceNo": "SALE-2026-0001",
    "locationId": 1, "locationName": "Main Branch",
    "productId": 101, "productName": "Iced Coffee", "qtyChange": -2,
    "performedBy": { "id": 3, "name": "Cashier One" },
    "createdAt": "2026-02-22T10:15:00Z"
  }],
  "meta": { "page": 1, "perPage": 20, "total": 200 }
}
```

### POST /inventory/adjustments
**Request:**
```json
{ "locationId": 1, "productId": 101, "qtyChange": -1, "reason": "DAMAGED", "notes": "Cup spilled" }
```
**Response 201:**
```json
{ "id": 7001, "type": "ADJUSTMENT", "referenceNo": "ADJ-2026-0001", "locationId": 1, "productId": 101, "qtyChange": -1, "reason": "DAMAGED", "createdAt": "2026-02-22T11:00:00Z" }
```

---

## Purchase Orders

### GET /suppliers
**Response 200:**
```json
{ "data": [{ "id": 201, "name": "FreshGoods Supplier" }, { "id": 202, "name": "Metro Distributors" }] }
```

### POST /purchase-orders
**Request:**
```json
{ "supplierId": 201, "locationId": 2, "expectedDate": "2026-02-25", "items": [{ "productId": 101, "qty": 50, "unitCost": 45 }] }
```
**Response 201:**
```json
{ "id": 8001, "poNo": "PO-2026-0001", "status": "DRAFT", "supplierId": 201, "locationId": 2, "expectedDate": "2026-02-25", "createdAt": "2026-02-22T12:00:00Z" }
```

### GET /purchase-orders
**Response 200:** Paginated list of PO summaries

### GET /purchase-orders/:id
**Response 200:** Full PO with supplier, location, and line items

### POST /purchase-orders/:id/receive
**Request:**
```json
{ "receivedAt": "2026-02-25T09:00:00Z", "items": [{ "productId": 101, "qtyReceived": 50 }] }
```
**Response 200:**
```json
{ "id": 8001, "poNo": "PO-2026-0001", "status": "RECEIVED", "receivedAt": "2026-02-25T09:00:00Z" }
```

---

## Reports

### GET /reports/summary?dateFrom=&dateTo=&locationId=
**Response 200:**
```json
{ "dateFrom": "2026-02-16", "dateTo": "2026-02-22", "locationId": 1, "salesTotal": 52340.50, "ordersCount": 342, "avgOrderValue": 153.04 }
```

### GET /reports/sales?dateFrom=&dateTo=&locationId=&cashierId=&page=
**Response 200:** Paginated sales records

### GET /reports/top-products?dateFrom=&dateTo=&locationId=
**Response 200:**
```json
{ "data": [{ "productId": 101, "productName": "Iced Coffee", "qtySold": 120, "revenue": 10800 }] }
```

---

## Notes
- Roles: ADMIN, MANAGER, CASHIER
- CASHIER can only access POS
- All responses use `data` + `meta` pattern for lists
- Mock mode enabled with `VITE_USE_MOCK_API=true`
