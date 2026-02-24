import type {
	LoginRequest,
	LoginResponse,
	RegisterRequest,
	User,
	Product,
	ProductDetail,
	Category,
	Location,
	StockItem,
	LowStockItem,
	InventoryMovement,
	AdjustmentRequest,
	AdjustmentResponse,
	Supplier,
	PurchaseOrder,
	CreatePORequest,
	ReceivePORequest,
	PricePreviewRequest,
	PricePreview,
	CreateSaleRequest,
	SaleResponse,
	Receipt,
	ReportSummary,
	SaleRecord,
	TopProduct,
	PaginatedResponse,
} from "@/types";

const getBaseUrl = () =>
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const isMockEnabled = () => import.meta.env.VITE_USE_MOCK_API === "true";
let authToken: string | null = localStorage.getItem("sp_token");

export const setToken = (token: string | null) => {
	authToken = token;
	if (token) localStorage.setItem("sp_token", token);
	else localStorage.removeItem("sp_token");
};

export const getToken = () => authToken;

async function request<T>(
	method: string,
	path: string,
	body?: unknown,
	params?: Record<string, string>,
): Promise<T> {
	if (isMockEnabled()) {
		const { handleMockRequest } = await import("./mockServer");
		const mockPath = path.replace(/^\/api(?=\/)/, "");
		return handleMockRequest<T>(method, mockPath, body, params);
	}

	const url = new URL("/api" + path, getBaseUrl());
	console.log("url", url, path, getBaseUrl());
	if (params)
		Object.entries(params).forEach(
			([k, v]) => v && url.searchParams.set(k, v),
		);

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

	const res = await fetch(url.toString(), {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!res.ok) {
		const err = await res
			.json()
			.catch(() => ({ message: "Request failed" }));
		throw err;
	}
	return res.json();
}

// Auth
export const authApi = {
	login: (data: LoginRequest) =>
		request<LoginResponse>("POST", "/auth/login", data),
	register: (data: RegisterRequest) =>
		request<LoginResponse>("POST", "/auth/register", data),
	me: () => request<{ user: User }>("GET", "/auth/me"),
};

// Products
export const productsApi = {
	list: (params?: Record<string, string>) =>
		request<PaginatedResponse<Product>>(
			"GET",
			"/products",
			undefined,
			params,
		),
	get: (id: number) => request<ProductDetail>("GET", `/products/${id}`),
	create: (data: Partial<Product>) =>
		request<Product>("POST", "/products", data),
	update: (id: number, data: Partial<Product>) =>
		request<Product>("PUT", `/products/${id}`, data),
	delete: (id: number) => request<void>("DELETE", `/products/${id}`),
};

// Categories
export const categoriesApi = {
	list: () => request<{ data: Category[] }>("GET", "/categories"),
	create: (data: { name: string }) =>
		request<Category>("POST", "/categories", data),
	update: (id: number, data: { name: string }) =>
		request<Category>("PUT", `/categories/${id}`, data),
	delete: (id: number) => request<void>("DELETE", `/categories/${id}`),
};

// Users
export const usersApi = {
	list: () => request<{ data: User[] }>("GET", "/users"),
	create: (data: {
		name: string;
		email: string;
		role: string;
		password: string;
	}) => request<User>("POST", "/users", data),
	update: (
		id: number,
		data: Partial<{
			name: string;
			email: string;
			role: string;
			password: string;
		}>,
	) => request<User>("PUT", `/users/${id}`, data),
	delete: (id: number) => request<void>("DELETE", `/users/${id}`),
};

// POS
export const posApi = {
	products: (params?: Record<string, string>) =>
		request<PaginatedResponse<Product>>(
			"GET",
			"/pos/products",
			undefined,
			params,
		),
	pricePreview: (data: PricePreviewRequest) =>
		request<PricePreview>("POST", "/pos/cart/price-preview", data),
	createSale: (data: CreateSaleRequest) =>
		request<SaleResponse>("POST", "/sales", data),
	receipt: (id: number) => request<Receipt>("GET", `/sales/${id}/receipt`),
};

// Locations
export const locationsApi = {
	list: () => request<{ data: Location[] }>("GET", "/locations"),
};

// Inventory
export const inventoryApi = {
	stocks: (params?: Record<string, string>) =>
		request<PaginatedResponse<StockItem>>(
			"GET",
			"/inventory/stocks",
			undefined,
			params,
		),
	lowStock: (params?: Record<string, string>) =>
		request<{ data: LowStockItem[] }>(
			"GET",
			"/inventory/low-stock",
			undefined,
			params,
		),
	movements: (params?: Record<string, string>) =>
		request<PaginatedResponse<InventoryMovement>>(
			"GET",
			"/inventory/movements",
			undefined,
			params,
		),
	adjust: (data: AdjustmentRequest) =>
		request<AdjustmentResponse>("POST", "/inventory/adjustments", data),
};

// Suppliers
export const suppliersApi = {
	list: () => request<{ data: Supplier[] }>("GET", "/suppliers"),
};

// Purchase Orders
export const purchaseOrdersApi = {
	list: (params?: Record<string, string>) =>
		request<PaginatedResponse<PurchaseOrder>>(
			"GET",
			"/purchase-orders",
			undefined,
			params,
		),
	get: (id: number) =>
		request<PurchaseOrder>("GET", `/purchase-orders/${id}`),
	create: (data: CreatePORequest) =>
		request<PurchaseOrder>("POST", "/purchase-orders", data),
	receive: (id: number, data: ReceivePORequest) =>
		request<PurchaseOrder>("POST", `/purchase-orders/${id}/receive`, data),
};

// Reports
export const reportsApi = {
	summary: (params?: Record<string, string>) =>
		request<ReportSummary>("GET", "/reports/summary", undefined, params),
	sales: (params?: Record<string, string>) =>
		request<PaginatedResponse<SaleRecord>>(
			"GET",
			"/reports/sales",
			undefined,
			params,
		),
	topProducts: (params?: Record<string, string>) =>
		request<{ data: TopProduct[] }>(
			"GET",
			"/reports/top-products",
			undefined,
			params,
		),
};
