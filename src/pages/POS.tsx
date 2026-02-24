import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { posApi, categoriesApi } from '@/services/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { CartItem, Discount, Payment, PricePreview, Product } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Minus, Trash2, Receipt, Printer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function POSPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [discountInput, setDiscountInput] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [paymentType, setPaymentType] = useState<'CASH' | 'CARD' | 'SPLIT'>('CASH');
  const [cashAmount, setCashAmount] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<number | null>(null);

  const taxRate = 0.12;

  const { data: categories } = useQuery({
    queryKey: ['posCategories'],
    queryFn: () => categoriesApi.list(),
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['posProducts', search, categoryFilter],
    queryFn: () => posApi.products({
      search,
      ...(categoryFilter !== 'all' ? { categoryId: categoryFilter } : {}),
    }),
  });

  const saleMutation = useMutation({
    mutationFn: posApi.createSale,
    onSuccess: (res) => {
      toast({ title: 'Sale completed!', description: `${res.saleNo} — ₱${res.grandTotal}` });
      setLastSaleId(res.id);
      setShowReceipt(true);
      setCart([]);
      setDiscount(null);
      setDiscountInput('');
      setCashAmount('');
    },
    onError: () => toast({ title: 'Sale failed', variant: 'destructive' }),
  });

  const { data: receipt } = useQuery({
    queryKey: ['receipt', lastSaleId],
    queryFn: () => posApi.receipt(lastSaleId!),
    enabled: !!lastSaleId && showReceipt,
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.productId === product.id);
      if (existing) return prev.map(c => c.productId === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { productId: product.id, name: product.name, sku: product.sku, qty: 1, unitPrice: product.price }];
    });
  };

  const updateQty = (productId: number, delta: number) => {
    setCart(prev => prev.map(c => c.productId === productId ? { ...c, qty: Math.max(1, c.qty + delta) } : c));
  };

  const removeFromCart = (productId: number) => setCart(prev => prev.filter(c => c.productId !== productId));

  const totals = useMemo<PricePreview>(() => {
    const subtotal = cart.reduce((s, c) => s + c.qty * c.unitPrice, 0);
    const disc = discount ? (discount.type === 'PERCENT' ? subtotal * discount.value / 100 : discount.value) : 0;
    const afterDiscount = subtotal - disc;
    const tax = Math.round(afterDiscount * taxRate * 100) / 100;
    return { subtotal, discountTotal: disc, taxTotal: tax, grandTotal: Math.round((afterDiscount + tax) * 100) / 100 };
  }, [cart, discount]);

  const applyDiscount = () => {
    const val = parseFloat(discountInput);
    if (!val || val <= 0) return;
    setDiscount({ type: discountType, value: val });
  };

  const checkout = () => {
    if (cart.length === 0) return;
    const payment: Payment = paymentType === 'SPLIT'
      ? { type: 'SPLIT', cash: parseFloat(cashAmount) || 0, card: totals.grandTotal - (parseFloat(cashAmount) || 0) }
      : { type: paymentType };

    saleMutation.mutate({
      locationId: 1,
      cashierId: user?.id ?? 3,
      items: cart.map(c => ({ productId: c.productId, qty: c.qty, unitPrice: c.unitPrice })),
      discount: discount ?? undefined,
      taxRate,
      payment,
    });
  };

  const printReceipt = () => window.print();

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-3rem)] gap-5 animate-slide-in">
      {/* Product grid */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, SKU, barcode..." className="pl-9" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-28 md:w-36">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories?.data.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-auto flex-1">
          {isLoading ? Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          )) : products?.data.map(p => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="flex flex-col items-start gap-1.5 rounded-2xl border border-border/60 bg-card p-3 md:p-4 text-left shadow-[var(--shadow-xs)] hover:border-primary/40 hover:shadow-[var(--shadow-sm)] transition-all duration-150 active:scale-[0.97]"
            >
              <span className="text-sm font-medium text-foreground truncate w-full">{p.name}</span>
              <span className="text-xs text-muted-foreground">{p.sku}</span>
              <span className="text-base font-semibold text-primary tabular-nums">₱{p.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <Card className="w-full md:w-80 lg:w-96 flex flex-col shrink-0 max-h-[50vh] md:max-h-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Cart
            {cart.length > 0 && <Badge variant="secondary" className="rounded-lg ml-1">{cart.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 space-y-2 overflow-auto mb-4">
            {cart.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">Add products to start</p>
            ) : cart.map(item => (
              <div key={item.productId} className="flex items-center gap-2 rounded-xl border border-border/60 p-2.5 transition-colors hover:bg-secondary/30">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">₱{item.unitPrice} × {item.qty}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => updateQty(item.productId, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-7 text-center text-sm font-medium tabular-nums">{item.qty}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => updateQty(item.productId, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => removeFromCart(item.productId)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Discount */}
          <div className="flex gap-2 mb-3">
            <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'PERCENT' | 'FIXED')}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENT">%</SelectItem>
                <SelectItem value="FIXED">₱ Fixed</SelectItem>
              </SelectContent>
            </Select>
            <Input value={discountInput} onChange={e => setDiscountInput(e.target.value)} placeholder="Discount" className="flex-1" type="number" />
            <Button variant="outline" size="sm" onClick={applyDiscount}>Apply</Button>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 border-t border-border/60 pt-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">₱{totals.subtotal.toFixed(2)}</span></div>
            {totals.discountTotal > 0 && <div className="flex justify-between text-success"><span>Discount</span><span className="tabular-nums">-₱{totals.discountTotal.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Tax (12%)</span><span className="tabular-nums">₱{totals.taxTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-lg font-bold border-t border-border/60 pt-2"><span>Total</span><span className="tabular-nums">₱{totals.grandTotal.toFixed(2)}</span></div>
          </div>

          {/* Payment */}
          <div className="mt-3 space-y-2">
            <Select value={paymentType} onValueChange={(v) => setPaymentType(v as 'CASH' | 'CARD' | 'SPLIT')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="SPLIT">Split Payment</SelectItem>
              </SelectContent>
            </Select>
            {paymentType === 'SPLIT' && (
              <Input value={cashAmount} onChange={e => setCashAmount(e.target.value)} placeholder="Cash amount" type="number" />
            )}
            <Button className="w-full" onClick={checkout} disabled={cart.length === 0 || saleMutation.isPending}>
              {saleMutation.isPending ? 'Processing...' : `Charge ₱${totals.grandTotal.toFixed(2)}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Receipt dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md print:shadow-none">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          {receipt && (
            <div className="space-y-4 text-sm" id="receipt-content">
              <div className="text-center border-b border-border/60 pb-3">
                <p className="font-bold text-lg tracking-tight">StockPilot POS</p>
                <p className="text-muted-foreground">{receipt.location.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{receipt.saleNo}</p>
              </div>
              <div className="space-y-1.5">
                {receipt.items.map(item => (
                  <div key={item.productId} className="flex justify-between">
                    <span>{item.name} ×{item.qty}</span>
                    <span className="tabular-nums">₱{item.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/60 pt-3 space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">₱{receipt.subtotal.toFixed(2)}</span></div>
                {receipt.discountTotal > 0 && <div className="flex justify-between"><span>Discount</span><span className="tabular-nums">-₱{receipt.discountTotal.toFixed(2)}</span></div>}
                <div className="flex justify-between"><span>Tax</span><span className="tabular-nums">₱{receipt.taxTotal.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-border/60 pt-2"><span>Total</span><span className="tabular-nums">₱{receipt.grandTotal.toFixed(2)}</span></div>
              </div>
              <div className="text-center text-xs text-muted-foreground pt-2">
                <p>Cashier: {receipt.cashier.name}</p>
                <p>{new Date(receipt.createdAt).toLocaleString()}</p>
              </div>
              <Button onClick={printReceipt} variant="outline" className="w-full">
                <Printer className="mr-2 h-4 w-4" /> Print Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
